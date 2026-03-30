
import React, { useState } from 'react';
import { User } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles, Chrome } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User, emailVerified: boolean) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

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
    setIsLoading(true);
    setError('');

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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--secondary)]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[var(--card)] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 transition-all duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-black mx-auto mb-6 shadow-xl shadow-[var(--primary)]/20">
            <Sparkles size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--text)] mb-2">Evo</h1>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest">
            {isLogin ? 'Bon retour parmi nous' : 'Commence ton aventure'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2 overflow-auto max-h-64 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
              <input
                required
                type="text"
                placeholder="Ton petit nom"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 ring-[var(--primary)]/20 outline-none transition-all shadow-sm"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <input
              required
              type="email"
              placeholder="Email académique"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 ring-[var(--primary)]/20 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <input
              required
              type="password"
              placeholder="Mot de passe secret"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 ring-[var(--primary)]/20 outline-none transition-all shadow-sm"
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-[var(--primary)] text-black font-black py-5 rounded-2xl shadow-xl shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} strokeWidth={3} />}
            <span className="uppercase text-xs tracking-widest">{isLogin ? 'Se Connecter' : 'Créer mon compte'}</span>
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--bg)] px-2 opacity-40 font-black tracking-widest">Ou continuer avec</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white/5 text-[var(--text)] font-black py-4 rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Chrome size={20} className="text-[var(--primary)]" />
            <span className="uppercase text-[10px] tracking-widest">Google</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black opacity-40 hover:opacity-100 transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
