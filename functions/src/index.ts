import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

// Initialisation de Firebase Admin SDK pour interagir avec Firestore
admin.initializeApp();
const db = admin.firestore();

/**
 * CONFIGURATION PAYPAL
 * Remplacer ces valeurs ou configurer les variables d'environnement distantes via :
 * firebase functions:config:set paypal.client_id="VOTRE_CLIENT_ID" paypal.secret="VOTRE_SECRET" paypal.sandbox=true
 */
const getPayPalConfig = () => {
  // Récupération des variables d'environnement configurées sur Firebase
  const config = functions.config().paypal || {};
  
  const clientId = config.client_id || 'sb'; // 'sb' est le client-id par défaut pour le Sandbox PayPal
  const secret = config.secret || 'sb-secret'; // Remplacer par votre Secret PayPal réel
  const isSandbox = config.sandbox !== 'false'; // Par défaut en mode sandbox pour éviter les frais réels en dev
  
  const apiBase = isSandbox
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  return { clientId, secret, apiBase };
};

/**
 * 1. OBTENIR UN ACCÈS TOKEN OAUTH2 DE PAYPAL
 * Cette fonction interne génère un token d'accès temporaire pour s'authentifier auprès de l'API de PayPal.
 */
async function getPayPalAccessToken(): Promise<string> {
  const { clientId, secret, apiBase } = getPayPalConfig();
  
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');
  
  try {
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur PayPal OAuth: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    functions.logger.error("Impossible de récupérer le token d'accès PayPal", error);
    throw new functions.https.HttpsError(
      'internal',
      'Erreur lors de la connexion sécurisée avec le serveur de paiement PayPal.'
    );
  }
}

/**
 * 2. CRÉER UNE COMMANDE PAYPAL (createPayPalOrder)
 * Fonction HTTPS onCall sécurisée : initie la commande auprès de l'API REST v2 de PayPal.
 */
export const createPayPalOrder = functions.https.onCall(async (data, context) => {
  // Étape de sécurité cruciale : Vérifier si l'utilisateur est bien authentifié sur l'application
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vous devez vous connecter à votre compte EVO pour effectuer un achat.'
    );
  }

  const { apiBase } = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();
  
  // Montant du produit Premium (ex: 4.99 USD)
  const premiumPrice = "4.99";

  try {
    const response = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: premiumPrice
            },
            description: 'EVO Study - Accès Premium Illimité (Abonnement à vie / Lifetime Plan)',
            custom_id: context.auth.uid // Associe l'UID Firestore à la commande PayPal pour traçabilité
          }
        ],
        application_context: {
          brand_name: 'EVO Study',
          locale: 'fr-FR',
          shipping_preference: 'NO_SHIPPING', // Pas d'adresse de livraison requise
          user_action: 'PAY_NOW'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Création de commande échouée: ${response.status} - ${errorText}`);
    }

    const order = await response.json();
    functions.logger.info(`Commande PayPal créée avec succès pour l'utilisateur ${context.auth.uid}. OrderID: ${order.id}`);
    
    return { orderID: order.id };
  } catch (error: any) {
    functions.logger.error("Erreur lors de la création de la commande PayPal", error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Erreur interne lors de l\'initialisation de la commande PayPal.'
    );
  }
});

/**
 * 3. VALIDER ET CAPTURER UN PAIEMENT (capturePayPalOrder)
 * Fonction HTTPS onCall sécurisée : valide la transaction auprès de PayPal, 
 * puis accorde le statut Premium à l'utilisateur ciblé dans sa fiche Firestore.
 */
export const capturePayPalOrder = functions.https.onCall(async (data, context) => {
  // Étape de sécurité cruciale : l'utilisateur doit être connecté sur l'application
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Session expirée. Veuillez vous reconnecter pour valider votre transaction.'
    );
  }

  const { orderID } = data;
  if (!orderID) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Le paramètre indispensable orderID est absent.'
    );
  }

  const { apiBase } = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();
  const userId = context.auth.uid;

  try {
    // Appel à l'API PayPal pour capturer les fonds de l'orderID spécifié
    const response = await fetch(`${apiBase}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Capture PayPal échouée: ${response.status} - ${errorText}`);
    }

    const captureDetails = await response.json();
    
    // Vérifier si le statut PayPal est bien "COMPLETED"
    if (captureDetails.status === 'COMPLETED') {
      functions.logger.info(`Paiement PayPal capturé de manière valide. Statut: COMPLETED. OrderID: ${orderID}`);
      
      // Mettre à jour le document correspondant à l'UID de l'utilisateur dans la collection Firestore 'users'
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        isPremium: true,
        premiumSince: admin.firestore.FieldValue.serverTimestamp()
      });
      
      functions.logger.info(`Statut PREMIUM accordé avec succès dans Firestore pour l'UID: ${userId}`);
      
      return { 
        status: 'SUCCESS',
        message: 'Abonnement Premium activé avec succès ! Merci de votre confiance.',
        isPremium: true
      };
    } else {
      functions.logger.warn(`Paiement capturé mais statut non-complété chez PayPal. Statut: ${captureDetails.status}`);
      return { 
        status: 'FAILED',
        message: `Le paiement n'a pas pu être honoré. Statut PayPal: ${captureDetails.status}`
      };
    }

  } catch (error: any) {
    functions.logger.error("Erreur critique d'intégration lors de la capture de l'ordre PayPal", error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'La transaction n\'a pas pu être validée. Veuillez contacter le support.'
    );
  }
});
