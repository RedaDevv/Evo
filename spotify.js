/**
 * EVO - Gestionnaire de Tokens Spotify API via le flux sécurisé OAuth 2.0 PKCE.
 * 
 * Fichier unique, modulaire et hautement sécurisé pour l'intégration Spotify
 * dans une architecture Frontend Serverless (idéal pour un déploiement Vercel).
 */

// =========================================================================
// IMPORTATIONS DE FIREBASE FIRESTORE
// =========================================================================
// COMMENTAIRE : Importez ici votre instance Firestore configurée ('db').
// Par défaut, nous l'importons de './firebase' au même niveau de dossier. Modifiez selon votre arborescence.
import { db } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

// =========================================================================
// CONFIGURATION DE LA CLÉ CLIENT & REDIRECTION SPOTIFY
// =========================================================================
const SPOTIFY_CLIENT_ID = '021e6df7a0fe4cc190fc491e5a8293a4';

// COMMENTAIRE : C'est ici que l'URI de redirection finale s'adapte à votre déploiement Vercel.
// Pour supporter simultanément le développement local et la production Vercel de manière fluide :
// - En local (ex. http://localhost:3000/), window.location.origin renverra l'URL du dev server.
// - En prod Vercel (ex. https://mon-projet-evo.vercel.app/), il utilisera l'adresse de prod.
// Si vous souhaitez utiliser une adresse statique fixe de production, remplacez-la par :
// const SPOTIFY_REDIRECT_URI = 'https://mon-projet-evo.vercel.app/'; 
export const SPOTIFY_REDIRECT_URI = window.location.origin + '/';

// =========================================================================
// MODULE CRYPTO UTILS (PKCE)
// =========================================================================

/**
 * Génère une chaîne aléatoire sécurisée de caractères d'une longueur spécifiée.
 * Utilisée comme "code_verifier" pour le flux PKCE.
 * 
 * @param {number} length - Longueur de la chaîne (recommandé entre 43 et 128)
 * @returns {string} Chaîne cryptographiquement aléatoire
 */
function generateCodeVerifier(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map((x) => possible[x % possible.length]).join('');
}

/**
 * Calcule le "code_challenge" en hachant le "code_verifier" à l'aide de l'algorithme SHA-256
 * et en encodant le résultat au format Base64URL.
 * 
 * @param {string} verifier - Le code_verifier de départ
 * @returns {Promise<string>} Promesse contenant le code_challenge
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashed);
  
  // Encodage Base64Url compatible avec les navigateurs
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// =========================================================================
// FONCTIONS PRINCIPALES EXPORTÉES (ASYNC/AWAIT)
// =========================================================================

/**
 * 1. Redirige l'utilisateur vers la page d'authentification de Spotify.
 * Génère de manière sécurisée le code_verifier et le code_challenge,
 * sauvegarde le verifier dans le localStorage, et configure la redirection.
 * Intègre la gestion des iframes pour l'aperçu AI Studio en ouvrant un popup sécurisé.
 */
export async function redirectToSpotifyAuth() {
  try {
    const verifier = generateCodeVerifier(64);
    localStorage.setItem('spotify_code_verifier', verifier);

    const challenge = await generateCodeChallenge(verifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge
    });

    const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

    // IMPORTANT : Si l'application tourne dans une iframe (comme dans Google AI Studio),
    // Spotify refuse la connexion directe à l'intérieur de l'iframe pour des raisons de sécurité (X-Frame-Options: DENY).
    // On ouvre donc un popup sécurisé externe.
    const isInsideIframe = window.self !== window.top;

    if (isInsideIframe) {
      const popupWidth = 600;
      const popupHeight = 700;
      const left = window.screen.width / 2 - popupWidth / 2;
      const top = window.screen.height / 2 - popupHeight / 2;

      const popup = window.open(
        authorizeUrl,
        'spotify_oauth_popup',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,status=no`
      );

      if (!popup) {
        alert("⚠️ Le bloqueur de popups a empêché la connexion Spotify. Veuillez autoriser les popups pour lier votre compte ou utilisez le bouton d'ouverture dans un nouvel onglet.");
      }
    } else {
      window.location.href = authorizeUrl;
    }
  } catch (error) {
    console.error("Erreur lors de la préparation de l'autorisation Spotify PKCE:", error);
    throw error;
  }
}

/**
 * 2. Gère le callback de redirection de Spotify sur Vercel/Localhost.
 * Intercepte le paramètre '?code=' injecté dans l'URL, échange ce code avec le
 * verifier du localStorage pour obtenir l'access_token et le refresh_token.
 * Calcule l'expiration exacte et enregistre ces infos dans Firestore sous users/{userId}/spotifyTokens/data.
 * Nettoie proprement l'URL du navigateur.
 * 
 * @param {string} userId - L'identifiant de l'utilisateur Firebase connecté
 * @returns {Promise<string|null>} L'access_token valide récupéré, ou null si pas au bon URL de retour
 */
export async function handleSpotifyCallback(userId) {
  if (!userId) {
    throw new Error("L'identifiant utilisateur (userId) est requis pour enregistrer les tokens.");
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  // Si l'URI ne contient pas de paramètre 'code', on n'exécute pas l'échange
  if (!code) {
    return null;
  }

  const verifier = localStorage.getItem('spotify_code_verifier');
  if (!verifier) {
    throw new Error("Code verifier absent du localStorage. Impossible de finaliser l'autorisation PKCE.");
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`L'API Spotify a répondu avec l'erreur: ${errorText}`);
    }

    const data = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    // Sauvegarde sécurisée dans Firestore sous users/{userId}/spotifyTokens/data
    const tokenDocRef = doc(db, 'users', userId, 'spotifyTokens', 'data');
    await setDoc(tokenDocRef, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiresAt: expiresAt
    });

    // Nettoyage esthétique de l'URL du navigateur pour masquer ?code=... et redonner une URL propre
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('code');
    cleanUrl.searchParams.delete('state');
    window.history.replaceState({}, document.title, cleanUrl.pathname + cleanUrl.search);

    // Suppression sécurisée du code_verifier utilisé
    localStorage.removeItem('spotify_code_verifier');

    // SI nous sommes dans un popup ouvert, on envoie le message de succès au parent et on ferme l'onglet
    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS', token: data.access_token }, '*');
      } catch (e) {
        console.error("Impossible de notifier la fenêtre parente :", e);
      }
      window.close();
    }

    return data.access_token;
  } catch (error) {
    console.error("Erreur lors de la capture et d'enregistrement du callback Spotify:", error);
    throw error;
  }
}

/**
 * 3. Récupère un token d'accès Spotify valide dans Firestore pour un utilisateur donné.
 * Si le token actuel est expiré ou va expirer d'ici 5 minutes, demande un nouvel access_token
 * à Spotify via le refresh_token, synchronise Firestore, et renvoie la nouvelle clé.
 * 
 * @param {string} userId - L'identifiant de l'utilisateur Firebase connecté
 * @returns {Promise<string>} Un access_token Spotify fonctionnel
 */
export async function getValidAccessToken(userId) {
  if (!userId) {
    throw new Error("L'identifiant utilisateur (userId) est requis pour lire ses tokens.");
  }

  const tokenDocRef = doc(db, 'users', userId, 'spotifyTokens', 'data');
  const docSnap = await getDoc(tokenDocRef);

  if (!docSnap.exists()) {
    throw new Error("Aucun jeton d'accès Spotify trouvé pour cet utilisateur dans Firestore.");
  }

  const tokenData = docSnap.data();
  const now = Date.now();
  // Tampon de sécurité de 5 minutes (300 000 ms) pour éviter l'expiration en cours de réquête
  const fiveMinutesBuffer = 5 * 60 * 1000;

  // Si le token actuel est toujours solide, on le retourne directement
  if (now + fiveMinutesBuffer < tokenData.expiresAt) {
    return tokenData.access_token;
  }

  // Sinon, lancement de la procédure de rafraîchissement avec le refresh_token
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Échec du renouvellement du token via l'API Spotify: ${errorText}`);
    }

    const data = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    // Mise à jour de Firestore avec le nouveau token d'accès et d'expiration
    // Note : si Spotify renvoie un nouveau refresh_token, on le met à jour, sinon on conserve l'ancien
    const updatedTokenData = {
      access_token: data.access_token,
      expiresAt: expiresAt,
      refresh_token: data.refresh_token || tokenData.refresh_token
    };

    await setDoc(tokenDocRef, updatedTokenData);

    return data.access_token;
  } catch (error) {
    console.error("Erreur critique survenue lors du rafraîchissement du token Spotify:", error);
    throw error;
  }
}
