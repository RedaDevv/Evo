import React from 'react';
import { X, Shield, Scale, FileText, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-10"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${type === 'privacy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {type === 'privacy' ? <Shield size={20} /> : <Scale size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {type === 'privacy' ? 'Politique de Confidentialité & Sécurité' : 'Conditions Générales d\'Utilisation'}
              </h3>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                Dernière mise à jour : Juillet 2026
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm text-white/70 leading-relaxed scrollbar-thin">
          {type === 'privacy' ? (
            <>
              <section className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2"><Lock size={16} className="text-emerald-400" /> 1. Protection de Vos Données</h4>
                <p>
                  Chez Evo, la confidentialité et la sécurité de vos données académiques sont notre priorité absolue. Nous mettons en œuvre des mesures de sécurité de pointe basées sur les infrastructures sécurisées de Google Cloud et Firebase.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">2. Informations Collectées</h4>
                <p>
                  Dans le cadre de votre utilisation de l'application, nous collectons uniquement les données strictement nécessaires à son bon fonctionnement :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Identifiants de compte :</strong> Votre adresse email, mot de passe chiffré et votre nom d'utilisateur afin de sécuriser l'accès.</li>
                  <li><strong>Tâches et organisation :</strong> Titre des devoirs, matières, quadrants d'Eisenhower et dates de rendu pour générer vos plannings.</li>
                  <li><strong>Indisponibilités d'agenda :</strong> Heures de cours ou contraintes personnelles pour éviter les conflits d'emploi du temps.</li>
                  <li><strong>Données de paiement :</strong> Transactions PayPal sécurisées gérées directement par PayPal, sans stockage de vos coordonnées bancaires de notre côté.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">3. Hébergement & Partage</h4>
                <p>
                  Vos données sont chiffrées en transit et au repos via Google Firestore et Firebase Auth. Aucune donnée n'est revendue, cédée à des tiers ou utilisée à des fins de profilage publicitaire hors de l'écosystème consenti (comme Google AdSense pour les utilisateurs gratuits).
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">4. Utilisation de l'IA (Gemini)</h4>
                <p>
                  Lorsque vous demandez à l'Assistant IA d'élaborer un planning d'études sur-mesure, vos contraintes d'agenda et les titres de vos tâches lui sont transmis de manière anonyme et éphémère. L'IA de Google (Gemini) ne conserve pas vos données pour l'entraînement public de ses modèles.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">5. Vos Droits (RGPD)</h4>
                <p>
                  Conformément au RGPD, vous disposez d'un droit permanent d'accès, de rectification et d'effacement complet de vos données. Vous pouvez supprimer l'intégralité de votre compte et de vos données d'un simple clic depuis vos paramètres personnels.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2"><FileText size={16} className="text-blue-400" /> 1. Objet et Acceptation</h4>
                <p>
                  Les présentes Conditions Générales d'Utilisation régissent l'accès et l'usage de l'application d'études Evo. En créant un compte sur Evo, vous déclarez accepter sans réserve l'intégralité des présentes conditions.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">2. Services Offerts</h4>
                <p>
                  Evo fournit des outils d'organisation d'études incluant : une Matrice d'Eisenhower interactive, un minuteur de concentration Pomodoro enrichi d'ondes sonores, un calendrier d'indisponibilités et un algorithme d'aide à la planification d'études (par IA ou par heuristique déterministe).
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">3. Formule Gratuite et Premium</h4>
                <p>
                  L'application propose :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Une version gratuite :</strong> Financée par des blocs d'annonces Google AdSense et des suggestions de playlists. Certaines options avancées sont bridées.</li>
                  <li><strong>Une version Premium :</strong> Accessible via un paiement unique de 4.99$. Elle retire définitivement toutes les publicités, débloque l'intégralité des ondes binaurales de concentration, et active la planification complète basée sur l'intelligence artificielle (Gemini).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">4. Comportement de l'Utilisateur</h4>
                <p>
                  Vous vous engagez à ne pas utiliser l'application à des fins malveillantes, à ne pas tenter de contourner les restrictions d'API, à ne pas introduire de scripts ou robots automatisés, et à fournir des informations de compte exactes.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">5. Limitation de Responsabilité</h4>
                <p>
                  Evo est un outil d'accompagnement scolaire. Bien qu'il optimise l'organisation, l'éditeur ne saurait être tenu responsable de l'évolution des notes académiques de l'étudiant, de la réussite ou de l'échec à ses examens. Les plannings générés sont indicatifs.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-white/5 border-t border-white/5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Fermer et revenir
          </button>
        </div>
      </motion.div>
    </div>
  );
};
