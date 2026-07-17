import React, { useState } from 'react';
import { User } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles, Chrome, ArrowLeft, ShieldCheck, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './LandingPage';
import { LegalModal } from './LegalModal';

interface AuthScreenProps {
  onLogin: (user: User, emailVerified: boolean) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Terms & Privacy checkbox for signup
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleStartAuth = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setShowLanding(false);
    setError('');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await firebaseService.loginWithGoogle();
      if (user) {
        onLogin({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'Utilisateur'
        }, user.emailVerified);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If signing up, validate legal terms checkbox
    if (!isLogin && !acceptedTerms) {
      setError("Veuillez accepter les Conditions d'Utilisation et la Politique de Confidentialité & Sécurité pour continuer.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const user = await firebaseService.login(formData.email, formData.password);
        onLogin({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'Utilisateur'
        }, user.emailVerified);
      } else {
        const user = await firebaseService.signup(formData.email, formData.name, formData.password);
        onLogin({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'Utilisateur'
        }, user.emailVerified);
      }
    } catch (err: any) {
      // Human-friendly Firebase messages in French
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = "Cette adresse email est déjà associée à un compte.";
      } else if (err.code === 'auth/weak-password') {
        friendlyError = "Le mot de passe doit faire au moins 6 caractères.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = "L'adresse email saisie est incorrecte.";
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyError = "Identifiants incorrects. Veuillez réessayer.";
      }
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white">
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <LandingPage onStartAuth={handleStartAuth} />
          </motion.div>
        ) : (
          <motion.div
            key="auth-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative"
          >
            {/* Dynamic Ambient Background Beams */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/5 rounded-full blur-[120px]" />
            </div>

            {/* Back Button */}
            <button
              onClick={() => setShowLanding(true)}
              className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> Retour à la présentation
            </button>

            {/* Auth card */}
            <div className="w-full max-w-md bg-[#0e1324] border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-black mx-auto mb-6 shadow-xl shadow-amber-400/20">
                  <Sparkles size={32} className="fill-black/10 animate-pulse" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-2">Evo</h1>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  {isLogin ? 'Bon retour parmi nous' : 'Commence ton aventure d\'excellence'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-semibold leading-relaxed animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-white" size={20} />
                    <input
                      required
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:ring-4 ring-amber-400/20 outline-none transition-all shadow-sm"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-white" size={20} />
                  <input
                    required
                    type="email"
                    placeholder="Adresse email étudiante"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:ring-4 ring-amber-400/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-white" size={20} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe confidentiel"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-white focus:ring-4 ring-amber-400/20 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Terms Acceptance Checkbox (Sign up only) */}
                {!isLogin && (
                  <div className="p-1.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 mt-4 text-left select-none">
                    <button
                      type="button"
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                      className="mt-0.5 text-amber-400 hover:scale-105 active:scale-95 transition-transform"
                    >
                      {acceptedTerms ? (
                        <div className="w-5 h-5 bg-amber-400 text-black rounded-md flex items-center justify-center">
                          <CheckSquare size={16} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border border-white/35 rounded-md flex items-center justify-center text-white/20 hover:border-amber-400">
                          <Square size={16} />
                        </div>
                      )}
                    </button>
                    <p className="text-[11px] leading-snug text-white/60">
                      J'accepte les{' '}
                      <button
                        type="button"
                        onClick={() => setLegalModalType('terms')}
                        className="text-amber-400 hover:underline font-bold cursor-pointer"
                      >
                        Conditions d'Utilisation
                      </button>{' '}
                      et la{' '}
                      <button
                        type="button"
                        onClick={() => setLegalModalType('privacy')}
                        className="text-amber-400 hover:underline font-bold cursor-pointer"
                      >
                        Politique de Confidentialité & Sécurité
                      </button>{' '}
                      de l'application Evo.
                    </p>
                  </div>
                )}

                <button
                  disabled={isLoading || (!isLogin && !acceptedTerms)}
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-400 disabled:scale-100 text-black font-black py-5 rounded-2xl shadow-xl shadow-amber-400/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="animate-spin text-black" /> : <ArrowRight size={20} strokeWidth={3} className="text-black" />}
                  <span className="uppercase text-xs tracking-widest text-black">{isLogin ? 'Se Connecter' : 'Créer mon compte'}</span>
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#0e1324] px-3 opacity-40 font-bold tracking-widest">Ou continuer avec</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white/5 text-white font-black py-4 rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                >
                  <Chrome size={18} className="text-amber-400" />
                  <span className="uppercase text-[10px] tracking-widest">Compte Google</span>
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-xs font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest"
                >
                  {isLogin ? "Nouveau ? Créer un compte" : "Déjà membre ? Se connecter"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Modals */}
      <AnimatePresence>
        {legalModalType && (
          <LegalModal
            isOpen={!!legalModalType}
            onClose={() => setLegalModalType(null)}
            type={legalModalType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthScreen;
