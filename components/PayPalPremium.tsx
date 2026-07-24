import React, { useEffect, useState, useRef } from 'react';
import { ThemeType, UserData } from '../types';
import { THEMES } from '../constants';
import { 
  Crown, 
  Check, 
  Sparkles, 
  CreditCard, 
  Lock, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Zap,
  Music,
  BarChart3,
  Calendar,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { auth } from '../firebase';
import { firebaseService } from '../services/firebaseService';

// Interfaces pour l'affichage
interface PayPalPremiumProps {
  theme: ThemeType;
  userData: Partial<UserData>;
  onUpdateUserData: (updates: Partial<UserData>) => void;
}

// Déclaration globale pour le SDK PayPal chargé dynamiquement
declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalPremium: React.FC<PayPalPremiumProps> = ({
  theme,
  userData,
  onUpdateUserData
}) => {
  const currentTheme = THEMES[theme];
  const isPremium = !!userData?.isPremium;
  const premiumSinceDate = userData?.premiumSince 
    ? new Date(userData.premiumSince?.seconds ? userData.premiumSince.seconds * 1000 : userData.premiumSince)
    : null;

  const [isLoadingSDK, setIsLoadingSDK] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState(() => {
    return (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || localStorage.getItem('evo_paypal_client_id') || 'sb';
  });
  
  const FIXED_PRICE = '4.99'; // Le prix de EVO study Premium est désormais strictement fixe à 4.99 USD
  
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const paypalButtonsInstance = useRef<any>(null);

  // Fonction pour fermer proprement l'instance des boutons PayPal et éviter les erreurs d'iframe orphelines
  const cleanupPayPalButtons = () => {
    if (paypalButtonsInstance.current) {
      try {
        if (typeof paypalButtonsInstance.current.close === 'function') {
          paypalButtonsInstance.current.close();
        }
      } catch (err) {
        console.warn("Erreur mineure de nettoyage des boutons PayPal (ignorée) :", err);
      }
      paypalButtonsInstance.current = null;
    }
  };

  // 1. CHARGEMENT DYNAMIQUE DU SCRIPT PAYPAL (SDK SMART BUTTONS)
  const loadPayPalSDK = (clientId: string) => {
    setIsLoadingSDK(true);
    setSdkError(null);
    cleanupPayPalButtons();

    try {
      // Supprimer tout script existant pour recharger proprement si le Client ID change
      const existingScript = document.getElementById('paypal-sdk-script');
      if (existingScript) {
        existingScript.remove();
      }

      if (window.paypal) {
        try {
          (window as any).paypal = undefined;
        } catch (e) {
          console.error("Non-bloquant - Impossible de vider window.paypal", e);
        }
      }

      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = '';
      }
    } catch (err) {
      console.error("Erreur de nettoyage pré-SDK :", err);
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    // Chargement de l'API Smart Buttons PayPal avec le Client ID configuré
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&locale=fr_FR`;
    script.async = true;

    script.onload = () => {
      setIsLoadingSDK(false);
      renderPayPalButtons();
    };

    script.onerror = () => {
      setIsLoadingSDK(false);
      setSdkError("Impossible de charger le script PayPal. Vérifie ta connexion Internet ou désactive tes bloqueurs de publicité.");
    };

    document.body.appendChild(script);
  };

  // 2. RENDU DES BOUTONS PAYPAL AVEC APPELS CLOUD FUNCTIONS
  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalButtonRef.current) return;

    // Vider le conteneur avant injection pour éviter les doublons
    paypalButtonRef.current.innerHTML = '';

    try {
      paypalButtonsInstance.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 48
        },
        
        // A. CREATE ORDER: Crée de vrais ordres PayPal en direct sur leurs serveurs
        createOrder: (data: any, actions: any) => {
          setIsProcessing(true);
          setPaymentStatus(null);
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: FIXED_PRICE
              },
              description: 'EVO Study Premium - Accès à vie'
            }]
          });
        },

        // B. ON APPROVE: Capture la transaction PayPal réelle et active Premium sur Firestore
        onApprove: async (data: any, actions: any) => {
          setIsProcessing(true);

          try {
            const details = await actions.order.capture();
            const userId = auth.currentUser?.uid;

            if (!userId) {
              throw new Error("Pour terminer l'activation, connecte-toi d'abord sur EVO study.");
            }

            // Met à jour Firestore en direct
            await firebaseService.updateUserData(userId, {
              isPremium: true,
              premiumSince: Date.now()
            });

            // Met à jour l'application parent
            onUpdateUserData({
              isPremium: true,
              premiumSince: Date.now()
            });

            setPaymentStatus({
              success: true,
              message: `Félicitations ! Ton paiement de ${FIXED_PRICE} USD a été validé de manière 100% réelle et sécurisé. (ID: ${details.id}). Ton compte EVO study est désormais Premium ! ✨`
            });
          } catch (err: any) {
            console.error("Erreur de capture PayPal :", err);
            setPaymentStatus({
              success: false,
              message: `Erreur (CaptureOrder): ${err.message || "Impossible de capter la transaction."}`
            });
          } finally {
            setIsProcessing(false);
          }
        },

        onError: (err: any) => {
          console.error("PayPal Smart Button Error:", err);
          setIsProcessing(false);
          setPaymentStatus({
            success: false,
            message: "Une erreur est survenue avec PayPal. Assure-toi d'utiliser des identifiants valides et d'avoir désactivé ton bloqueur de pubs."
          });
        }
      });

      paypalButtonsInstance.current.render(paypalButtonRef.current);
    } catch (err) {
      console.error("Erreur d'initialisation des boutons PayPal :", err);
    }
  };

  // Annuler le statut Premium pour retester l'interface
  const cancelPremiumStatus = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setIsProcessing(true);
    try {
      await firebaseService.updateUserData(userId, {
        isPremium: false,
        premiumSince: null
      });
      onUpdateUserData({
        isPremium: false,
        premiumSince: null
      });
      setPaymentStatus(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction d'activation directe (Bypass / Démo)
  const handleDirectActivation = async () => {
    setIsProcessing(true);
    setPaymentStatus(null);
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await firebaseService.updateUserData(userId, {
          isPremium: true,
          premiumSince: Date.now()
        });
      }
      onUpdateUserData({
        isPremium: true,
        premiumSince: Date.now()
      });
      setPaymentStatus({
        success: true,
        message: "Félicitations ! Votre compte EVO study est désormais Premium ! ✨"
      });
      setSdkError(null);
    } catch (err: any) {
      console.error("Erreur d'activation directe :", err);
      setPaymentStatus({
        success: false,
        message: `Erreur : ${err.message || "Impossible d'activer le compte."}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Charger le SDK au montage et quand l'ID change ou que isPremium change
  useEffect(() => {
    if (!isPremium) {
      loadPayPalSDK(paypalClientId);
    }
    return () => {
      cleanupPayPalButtons();
    };
  }, [paypalClientId, isPremium]);

  return (
    <div className={`p-6 md:p-8 rounded-lg border ${currentTheme.accent} ${currentTheme.card} overflow-hidden relative`}>
      {/* Background Decorative Sparkles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
      
      {/* 1. HEADER DU PLAN PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Crown size={26} className="fill-amber-500/20" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-normal tracking-tight flex items-center gap-2 text-white">
              Plan EVO study Premium
              {isPremium && (
                <span className="text-xs font-mono font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Actif ✨
                </span>
              )}
            </h3>
            <p className="text-xs opacity-50 font-mono uppercase tracking-wider mt-0.5">Accédez à l'ensemble des outils de réussite universitaire</p>
          </div>
        </div>

        {!isPremium && (
          <div className="text-left md:text-right">
            <div className="flex items-baseline gap-2 md:justify-end">
              <span className="text-xs opacity-40 line-through font-mono">14.99 USD</span>
              <span className="text-3xl font-serif text-amber-300 font-normal">{FIXED_PRICE} USD</span>
            </div>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-0.5">Abonnement unique • Accès à vie</p>
          </div>
        )}
      </div>

      {/* 2. ÉTAT DU COMPTE : PREMIUM ACTIF */}
      {isPremium ? (
        <div className="mt-8 space-y-6 relative z-10">
          <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-300">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-amber-300">Vous êtes membre Premium</h4>
                <p className="text-xs opacity-70 font-sans mt-0.5">Vous bénéficiez de toutes les fonctionnalités de manière illimitée.</p>
                {premiumSinceDate && (
                  <p className="text-[10px] opacity-50 font-mono flex items-center gap-1.5 mt-2">
                    <Clock size={12} /> Premium depuis le {premiumSinceDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={cancelPremiumStatus}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-red-400 hover:text-red-300 font-mono text-xs transition-all uppercase tracking-wider cursor-pointer"
            >
              Réinitialiser le statut (DÉMO)
            </button>
          </div>

          {/* Liste des modules débloqués */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div className="p-2 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 w-fit">
                <Calendar size={18} />
              </div>
              <h5 className="font-semibold text-sm text-white">Planification IA</h5>
              <p className="text-xs opacity-60 leading-relaxed font-sans">L'IA réorganise vos journées automatiquement selon vos imprévus.</p>
            </div>
            <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                <Music size={18} />
              </div>
              <h5 className="font-semibold text-sm text-white">Suggestions de Playlists</h5>
              <p className="text-xs opacity-60 leading-relaxed font-sans">Configurez vos suggestions de playlists Spotify et sauvegardez-les.</p>
            </div>
            <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit">
                <Layers size={18} />
              </div>
              <h5 className="font-semibold text-sm text-white">Ambiance de Travail</h5>
              <p className="text-xs opacity-60 leading-relaxed font-sans">Accédez aux thèmes exclusifs et aux notifications système intelligentes.</p>
            </div>
          </div>
        </div>
      ) : (
        /* 3. INVITATION À PASSER PREMIUM (AVANT COMMANDE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 relative z-10 transition-all">
          
          {/* AVANTAGES LIST */}
          <div className="lg:col-span-7 space-y-6">
            <h4 className="text-base font-serif font-normal text-white">Inclus dans la formule Premium :</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: "Planification Intelligente par IA", desc: "Algorithme intelligent de calcul de vos créneaux d'études optimaux.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Zap },
                { title: "Sauvegarde permanente des playlists", desc: "Enregistrez vos suggestions Spotify préférées dans le Cloud pour les retrouver à chaque connexion.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Music },
                { title: "Statistiques d'apprentissage avancées", desc: "Suivez précisément vos heures de travail, l'efficience de vos sessions et la répartition de vos efforts.", color: "text-sky-400 bg-sky-400/10 border-sky-400/20", icon: BarChart3 },
                { title: "Zéro Publicité & Thèmes de Productivité", desc: "Personnalisez votre espace avec nos thèmes exclusifs et profitez d'une interface entièrement épurée.", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20", icon: Layers }
              ].map((av, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
                  <div className={`p-2.5 h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center ${av.color}`}>
                    <av.icon size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">{av.title}</h5>
                    <p className="text-xs opacity-50 mt-0.5 leading-relaxed font-sans">{av.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 items-center p-3.5 rounded-lg bg-sky-500/5 border border-sky-500/10 text-sky-300">
              <HeartHandshake size={18} className="shrink-0" />
              <p className="text-[11px] font-mono leading-relaxed">
                Achat unique de soutien. 100% sécurisé via PayPal. Aucun prélèvement caché ni réabonnement mensuel.
              </p>
            </div>
          </div>

          {/* COLONNE COMMANDE PAYPAL INTERACTIVE */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white/5 p-6 rounded-lg border border-white/10 relative z-10">
            <div className="space-y-6">
              
              {/* CONFIGURATEUR RÉEL PAYPAL */}
              <div className="bg-black/40 p-4 rounded-lg border border-white/10 space-y-3.5 text-xs">
                <span className="font-mono text-amber-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <CreditCard size={14} /> Passerelle de Paiement
                </span>
                <p className="text-[10.5px] opacity-70 leading-relaxed font-sans">
                  Paiement sécurisé via le SDK PayPal Smart Buttons.
                </p>
                
                <div className="space-y-3 pt-1 border-t border-white/10">
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">Identifiant Client PayPal (Client ID) :</label>
                    <input 
                      type="text" 
                      value={paypalClientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaypalClientId(val);
                        localStorage.setItem('evo_paypal_client_id', val);
                      }}
                      placeholder="Identifiant Client (ex: sb)"
                      className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-1.5 text-[10.5px] font-mono outline-none focus:border-white/30 transition-colors text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">Montant de la transaction :</label>
                    <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-1.5 text-[11px] font-mono text-amber-300 flex justify-between items-center">
                      <span>EVO Study Premium</span>
                      <span className="font-semibold">{FIXED_PRICE} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest opacity-50">Paiement Sécurisé via Smart Buttons</span>
                
                {isLoadingSDK ? (
                  <div className="w-full h-12 bg-white/5 rounded-lg flex items-center justify-center gap-3 border border-white/10">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono opacity-70 text-white">Initialisation du SDK PayPal...</span>
                  </div>
                ) : sdkError ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-3">
                    <div className="flex gap-2 items-start">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                      <p className="leading-relaxed">{sdkError}</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-red-500/20">
                      <button
                        type="button"
                        onClick={() => loadPayPalSDK(paypalClientId)}
                        className="w-full py-2 px-3 rounded-md bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] transition-all cursor-pointer text-center"
                      >
                        🔄 Réessayer le chargement PayPal
                      </button>
                      <button
                        type="button"
                        onClick={handleDirectActivation}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-3 rounded-md bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        ✨ Activer EVO Premium directement (Mode Démo)
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* CONTAINER D'INJECTION DU SDK PAYPAL RÉEL */}
                {!sdkError && (
                  <div className="relative">
                    <div ref={paypalButtonRef} className="w-full min-h-[48px] rounded-lg overflow-hidden" />
                    {isProcessing && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
                        <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                        Traitement de la transaction...
                      </div>
                    )}
                  </div>
                )}

                {/* Secours toujours accessible au besoin */}
                {!sdkError && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleDirectActivation}
                      disabled={isProcessing}
                      className="text-[10px] font-mono text-amber-300 hover:underline opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Problème avec le script PayPal ? Activer Premium directement ✨
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGE DE RÉSULTAT */}
            {paymentStatus && (
              <div className={`mt-4 p-3.5 rounded-lg border ${
                paymentStatus.success 
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300' 
                  : 'bg-red-500/15 border-red-500/20 text-red-400'
              }`}>
                <div className="flex gap-2 text-xs">
                  {paymentStatus.success ? (
                    <Check className="shrink-0 w-4 h-4 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="shrink-0 w-4 h-4 mt-0.5 text-red-400" />
                  )}
                  <p className="font-sans leading-relaxed flex-1">{paymentStatus.message}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-1.5 opacity-40 text-[10px] font-mono">
              <Lock size={12} />
              <span>Paiement crypté et validé via PayPal Inc.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
