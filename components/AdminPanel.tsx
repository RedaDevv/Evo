import React, { useState, useEffect } from 'react';
import { ThemeType, UserData } from '../types';
import { THEMES } from '../constants';
import { firebaseService } from '../services/firebaseService';
import { Shield, User as UserIcon, Crown, Search, RefreshCw, CheckCircle2, AlertCircle, Sparkles, LogIn } from 'lucide-react';

interface AdminPanelProps {
  theme: ThemeType;
  currentUserEmail?: string;
}

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  isPremium?: boolean;
  theme?: string;
  role?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ theme, currentUserEmail }) => {
  const currentTheme = THEMES[theme];
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'premium' | 'basic'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await firebaseService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Erreur de récupération des utilisateurs:", error);
      setMessage({
        text: "Impossible de charger la liste des utilisateurs. Vérifie tes permissions.",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTogglePremium = async (targetUserId: string, currentStatus: boolean) => {
    setActionLoadingId(targetUserId);
    setMessage(null);
    try {
      await firebaseService.setUserPremiumStatus(targetUserId, !currentStatus);
      
      // Update local state
      setUsers(prev => 
        prev.map(u => u.id === targetUserId ? { ...u, isPremium: !currentStatus } : u)
      );

      setMessage({
        text: `Statut mis à jour avec succès pour l'utilisateur.`,
        type: 'success'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Erreur lors du changement de statut premium:", error);
      setMessage({
        text: "Erreur lors du changement de statut premium.",
        type: 'error'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats Calculations
  const stats = {
    total: users.length,
    premium: users.filter(u => u.isPremium).length,
    basic: users.filter(u => !u.isPremium).length,
  };

  // Filter & Search Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'premium') return matchesSearch && u.isPremium;
    if (statusFilter === 'basic') return matchesSearch && !u.isPremium;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Banner / Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
              <Shield size={32} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Console d'Administration</h2>
                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-sm opacity-60 font-medium leading-relaxed max-w-xl mt-1">
                Gère les accès et les abonnements des utilisateurs d'Evo en tant que superviseur principal.
              </p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Raîchir
          </button>
        </div>
      </section>

      {/* Info Message */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className={`${currentTheme.card} border ${currentTheme.accent} rounded-[2rem] p-6 shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserIcon size={72} />
          </div>
          <span className="text-[10px] uppercase font-bold opacity-45 tracking-wider">Total Utilisateurs</span>
          <h3 className="text-4xl font-black mt-2 font-mono tracking-tight text-white">
            {loading ? '...' : stats.total}
          </h3>
          <p className="text-[10px] opacity-40 mt-1">Profils synchronisés</p>
        </div>

        <div className={`bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 text-amber-500 opacity-10">
            <Crown size={72} />
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">Membres Premium</span>
          <h3 className="text-4xl font-black text-amber-400 mt-2 font-mono tracking-tight">
            {loading ? '...' : stats.premium}
          </h3>
          <p className="text-[10px] opacity-40 mt-1">Accès complet débloqué</p>
        </div>

        <div className={`${currentTheme.card} border ${currentTheme.accent} rounded-[2rem] p-6 shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={72} />
          </div>
          <span className="text-[10px] uppercase font-bold opacity-45 tracking-wider">Utilisateurs Basic</span>
          <h3 className="text-4xl font-black mt-2 font-mono tracking-tight text-white">
            {loading ? '...' : stats.basic}
          </h3>
          <p className="text-[10px] opacity-40 mt-1">Version par défaut</p>
        </div>
      </div>

      {/* Main Console Area */}
      <div className={`${currentTheme.card} border ${currentTheme.accent} rounded-[2.5rem] p-6 lg:p-8 shadow-2xl`}>
        {/* Search and filter header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-6 border-b border-white/5 mb-6">
          <div className="w-full md:max-w-md relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointing-none opacity-40">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium focus:ring-2 focus:ring-amber-400/50 outline-none transition-all"
            />
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-auto">
            {(['all', 'premium', 'basic'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`flex-1 md:flex-initial px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  statusFilter === filter 
                    ? 'bg-amber-400 text-black font-black shadow-md' 
                    : 'opacity-50 hover:opacity-100 text-white'
                }`}
              >
                {filter === 'all' && 'Tous'}
                {filter === 'premium' && 'Premium ✨'}
                {filter === 'basic' && 'Basic 🛡️'}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider opacity-40">Chargement de la base d'utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mx-auto">
              <UserIcon size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base">Aucun utilisateur trouvé</h4>
              <p className="text-xs opacity-40">Essaie une autre recherche ou change le filtre.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-wider opacity-45">
                  <th className="pb-4 pt-1">Utilisateur</th>
                  <th className="pb-4 pt-1">Email</th>
                  <th className="pb-4 pt-1">Abonnement</th>
                  <th className="pb-4 pt-1">ID Unique</th>
                  <th className="pb-4 pt-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isCurrent = u.email === currentUserEmail;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-black font-black text-xs ${
                            u.isPremium 
                              ? 'bg-gradient-to-tr from-amber-400 to-amber-600' 
                              : 'bg-white/10 text-white'
                          }`}>
                            {u.isPremium ? <Crown size={14} className="fill-black/20" /> : <UserIcon size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold flex items-center gap-1.5 text-white">
                              {u.name || 'Utilisateur Anonyme'}
                              {isCurrent && (
                                <span className="text-[8px] bg-white/15 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                  MOI
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] opacity-40 font-semibold uppercase">{u.role || 'user'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-semibold text-white/70">{u.email || 'Sans email'}</span>
                      </td>
                      <td className="py-4">
                        {u.isPremium ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-amber-400/15 text-amber-400 uppercase">
                            <Crown size={10} className="fill-currentColor" /> PREMIUM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-white/5 text-white/55 uppercase border border-white/5">
                            BASIC
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <code className="text-[10px] font-mono opacity-30 select-all">{u.id}</code>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTogglePremium(u.id, !!u.isPremium)}
                          disabled={actionLoadingId === u.id}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            u.isPremium
                              ? 'bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white border border-white/10'
                              : 'bg-amber-400 hover:scale-[1.02] active:scale-95 text-black font-black hover:bg-amber-300'
                          } disabled:opacity-50`}
                        >
                          {actionLoadingId === u.id ? (
                            <span className="flex items-center gap-1 justify-center">
                              <RefreshCw size={10} className="animate-spin" /> ...
                            </span>
                          ) : u.isPremium ? (
                            'Downgrader à Basic 🥶'
                          ) : (
                            'Promouvoir Premium 👑'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
