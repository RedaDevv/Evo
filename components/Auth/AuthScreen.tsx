
import React, { useState } from 'react';
import { User } from '../../types';
import { mockAuthService } from '../../services/mockBackend';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await mockAuthService.login(formData.email, formData.password);
        onLogin(user);
      } else {
        const user = await mockAuthService.signup(formData.email, formData.name, formData.password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fefce8]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-200/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-2xl relative z-10 transition-all duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-lime-400 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-lime-200">
            <Sparkles size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-lime-950 mb-2">Evo</h1>
          <p className="text-sm font-bold text-lime-800/50 uppercase tracking-widest">
            {isLogin ? 'Bon retour parmi nous' : 'Commence ton aventure'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-900/30" size={20} />
              <input
                required
                type="text"
                placeholder="Ton petit nom"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 ring-lime-400/20 outline-none transition-all shadow-sm"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-900/30" size={20} />
            <input
              required
              type="email"
              placeholder="Email académique"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 ring-lime-400/20 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-900/30" size={20} />
            <input
              required
              type="password"
              placeholder="Mot de passe secret"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 ring-lime-400/20 outline-none transition-all shadow-sm"
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-lime-400 text-lime-950 font-black py-5 rounded-2xl shadow-xl shadow-lime-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} strokeWidth={3} />}
            <span className="uppercase text-xs tracking-widest">{isLogin ? 'Se Connecter' : 'Créer mon compte'}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black text-lime-800/40 hover:text-lime-800 transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
