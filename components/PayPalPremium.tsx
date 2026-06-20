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
    <div className={`p-8 rounded-[2.5rem] border ${currentTheme.accent} ${currentTheme.card} shadow-xl overflow-hidden relative`}>
      {/* Background Decorative Sparkles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
      
      {/* 1. HEADER DU PLAN PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20 animate-pulse">
            <Crown size={28} className="fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Plan EVO study Premium
              {isPremium && (
                <span className="text-xs font-black bg-gradient-to-r from-amber-400 to-amber-600 text-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-bounce">
                  Actif ✨
                </span>
              )}
            </h3>
            <p className="text-xs opacity-50 font-bold uppercase tracking-wider mt-0.5">Offre-toi les super-pouvoirs de la réussite universitaire</p>
          </div>
        </div>

        {!isPremium && (
          <div className="text-left md:text-right">
            <div className="flex items-baseline gap-2 md:justify-end">
              <span className="text-xs opacity-40 line-through font-bold">14.99 USD</span>
              <span className="text-3xl font-black text-amber-400 font-mono">{FIXED_PRICE} USD</span>
            </div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-0.5">Abonnement unique • Accès à vie</p>
          </div>
        )}
      </div>

      {/* 2. ÉTAT DU COMPTE : PREMIUM ACTIF */}
      {isPremium ? (
        <div className="mt-8 space-y-6 relative z-10 animate-in zoom-in-95 duration-500">
          <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-amber-400">Te voilà Membre d'Élite !</h4>
                <p className="text-xs opacity-60 font-medium">Vous bénéficiez de toutes les fonctionnalités de manière illimitée.</p>
                {premiumSinceDate && (
                  <p className="text-[10px] opacity-40 font-bold flex items-center gap-1.5 mt-2">
                    <Clock size={12} /> Premium depuis le {premiumSinceDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={cancelPremiumStatus}
              disabled={isProcessing}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs transition-all uppercase tracking-wider"
            >
              Réinitialiser le statut (DÉMO)
            </button>
          </div>

          {/* Liste des modules débloqués */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 w-fit">
                <Calendar size={18} />
              </div>
              <h5 className="font-bold text-sm">Planification Génétique IA</h5>
              <p className="text-xs opacity-50 leading-relaxed font-medium">L'IA réorganise tes journées automatiquement selon tes imprévus, sans conflits d'horaires.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                <Music size={18} />
              </div>
              <h5 className="font-bold text-sm">Intégration Playlists Illimitée</h5>
              <p className="text-xs opacity-50 leading-relaxed font-medium">Configure jusqu'à 8 playlists Spotify personnalisées qui restent sauvegardées de manière permanente.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 w-fit">
                <Layers size={18} />
              </div>
              <h5 className="font-bold text-sm">Ambiance Cognitive</h5>
              <p className="text-xs opacity-50 leading-relaxed font-medium">Débloque l'accès aux thèmes exclusifs (Midnight, Neon, Emerald) et aux notifications système intelligentes.</p>
            </div>
          </div>
        </div>
      ) : (
        /* 3. INVITATION À PASSER PREMIUM (AVANT COMMANDE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 relative z-10 transition-all">
          
          {/* AVANTAGES LIST */}
          <div className="lg:col-span-7 space-y-6">
            <h4 className="text-lg font-black tracking-tight">Ce qui est inclus dans le Plan Premium :</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "Planification Intelligente IA sans restriction", desc: "Algorithme génétique d'organisation des études de haut niveau. Calcule les créneaux parfaits.", color: "text-amber-500 bg-amber-500/10", icon: Zap },
                { title: "Sauvegarde éternelle des suggestions de playlists", desc: "Ajoutez vos liens Spotify préférés dans vos réglages, ils restent sauvegardés dans le Cloud à chaque connexion.", color: "text-emerald-500 bg-emerald-500/10", icon: Music },
                { title: "Statistiques d'apprentissage ultra développées", desc: "Analyse avancée de tes heures passées, ratios d'efficience d'Eisenhower, répartition par matières.", color: "text-sky-400 bg-sky-400/10", icon: BarChart3 },
                { title: "Zéro Publicité & Thèmes de Productivité d'Elite", desc: "Personnalise EVO Study avec nos thèmes exclusifs à haut rendement cognitif et profite d'une interface épurée.", color: "text-indigo-400 bg-indigo-400/10", icon: Layers }
              ].map((av, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className={`p-2.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${av.color} group-hover:scale-110 transition-all`}>
                    <av.icon size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black flex items-center gap-1.5">{av.title}</h5>
                    <p className="text-xs opacity-50 mt-1 leading-relaxed font-medium">{av.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 items-center p-4 rounded-xl bg-sky-500/5 border border-sky-500/10 text-sky-400">
              <HeartHandshake size={20} className="shrink-0" />
              <p className="text-[10px] font-bold leading-relaxed">
                Achat unique de soutien. 100% sécurisé et géré par PayPal, le leader mondial du paiement. Aucun prélèvement caché ni réabonnement mensuel.
              </p>
            </div>
          </div>

          {/* COLONNE COMMANDE PAYPAL INTERACTIVE */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5 relative z-10">
            <div className="space-y-6">
              
              {/* CONFIGURATEUR RÉEL PAYPAL */}
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4 text-xs">
                <span className="font-black text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
                  <CreditCard size={14} /> Passerelle de Paiement Réelle
                </span>
                <p className="text-[10.5px] opacity-70 leading-relaxed font-semibold">
                  Cette passerelle charge le SDK d'origine de PayPal avec ton Client ID pour effectuer un paiement 100% réel sécurisé.
                </p>
                
                <div className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest opacity-55 mb-1.5">Identifiant Client PayPal (Client ID) :</label>
                    <input 
                      type="text" 
                      value={paypalClientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaypalClientId(val);
                        localStorage.setItem('evo_paypal_client_id', val);
                      }}
                      placeholder="Saisis ton Client ID Sandbox (ex: sb) ou Live"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-[10.5px] font-mono outline-none focus:border-amber-400 transition-colors text-white"
                    />
                    <p className="text-[9px] opacity-40 mt-1 font-semibold leading-normal">
                      Saisis "sb" pour utiliser l'environnement d'essai Sandbox, ou colle le Client ID réel (Production) provenant de ton compte PayPal Developer. (Sauvegardé automatiquement d'une session à l'autre)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest opacity-55 mb-1.5">Montant de la transaction (Sécurisé & Verrouillé) :</label>
                    <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 text-[11px] font-bold outline-none text-amber-400 flex justify-between items-center">
                      <span>EVO Study Premium - Accès à vie</span>
                      <span className="font-mono text-xs">{FIXED_PRICE} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Paiement Sécurisé via Smart Buttons</span>
                
                {isLoadingSDK ? (
                  <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-center gap-3 border border-white/5">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold opacity-60">Initialisation du SDK PayPal réel...</span>
                  </div>
                ) : sdkError ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{sdkError}</p>
                  </div>
                ) : null}

                {/* CONTAINER D'INJECTION DU SDK PAYPAL RÉEL */}
                <div className="relative">
                  <div ref={paypalButtonRef} className="w-full min-h-[48px] rounded-xl overflow-hidden" />
                  {isProcessing && (
                    <div className="absolute inset-x-0 -bottom-8 flex items-center justify-center gap-2 animate-pulse text-amber-500 text-[10px] font-black uppercase tracking-wider">
                      <div className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Traitement de la transaction...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MESSAGE DE RÉSULTAT */}
            {paymentStatus && (
              <div className={`mt-6 p-4 rounded-xl animate-in zoom-in-95 duration-300 border ${
                paymentStatus.success 
                  ? 'bg-green-500/15 border-green-500/20 text-green-400' 
                  : 'bg-red-500/15 border-red-500/20 text-red-500'
              }`}>
                <div className="flex gap-2 text-xs">
                  {paymentStatus.success ? (
                    <Check className="shrink-0 w-4 h-4 mt-0.5 text-green-400" />
                  ) : (
                    <AlertCircle className="shrink-0 w-4 h-4 mt-0.5 text-red-400" />
                  )}
                  <p className="font-bold flex-1">{paymentStatus.message}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-1.5 opacity-35 text-[10px] font-bold">
              <Lock size={12} />
              <span>Paiement crypté et validé directement par PayPal Inc.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
