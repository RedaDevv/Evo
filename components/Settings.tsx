
import React, { useState, useEffect } from 'react';
import { ThemeType, UserData, NotificationSettings, DisplayMode } from '../types';
import { THEMES } from '../constants';
import { Settings as SettingsIcon, Palette, Shield, Bell, User, Save, BellRing, Check, X, Monitor, Smartphone, Music, Plus, Trash2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface SettingsProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  userData: Partial<UserData>;
  onUpdateUserData: (updates: Partial<UserData>) => void;
  onUpdateProfileName: (name: string) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ 
  theme, 
  onThemeChange, 
  userData, 
  onUpdateUserData,
  onUpdateProfileName
}) => {
  const currentTheme = THEMES[theme];
  const [newName, setNewName] = useState(userData.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Spotify custom suggestions state and handlers
  const defaultPlaylists = [
    { name: '🧘 Lofi Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0EXPn' },
    { name: '🧠 Piano Fluide', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
    { name: '⚡ Dev Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLTE7SAt9g9' },
    { name: '☕ Cafe Jazz', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZOM9CH8Z667' },
  ];

  const [suggestedPlaylists, setSuggestedPlaylists] = useState<Array<{ name: string; url: string }>>(() => {
    return userData.customSuggestions && userData.customSuggestions.length > 0
      ? userData.customSuggestions
      : defaultPlaylists;
  });
  const [isSavingSuggestions, setIsSavingSuggestions] = useState(false);
  const [showSuggestionsSuccess, setShowSuggestionsSuccess] = useState(false);

  useEffect(() => {
    if (userData.customSuggestions && userData.customSuggestions.length > 0) {
      setSuggestedPlaylists(userData.customSuggestions);
    }
  }, [userData?.customSuggestions]);

  useEffect(() => {
    if (userData.name) {
      setNewName(userData.name);
    }
  }, [userData?.name]);

  const handleUpdatePlaylist = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...suggestedPlaylists];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSuggestedPlaylists(updated);
  };

  const handleAddPlaylistField = () => {
    if (suggestedPlaylists.length >= 8) {
      alert("Tu as atteint la limite de 8 suggestions.");
      return;
    }
    setSuggestedPlaylists([...suggestedPlaylists, { name: 'Nouvelle Musique 🎵', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0EXPn' }]);
  };

  const handleRemovePlaylistField = (index: number) => {
    setSuggestedPlaylists(suggestedPlaylists.filter((_, i) => i !== index));
  };

  const handleSavePlaylists = () => {
    setIsSavingSuggestions(true);
    onUpdateUserData({ customSuggestions: suggestedPlaylists });
    setTimeout(() => {
      setIsSavingSuggestions(false);
      setShowSuggestionsSuccess(true);
      setTimeout(() => setShowSuggestionsSuccess(false), 2000);
    }, 600);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === userData.name) return;
    setIsSavingName(true);
    try {
      await onUpdateProfileName(newName);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setIsSavingName(false);
    }
  };

  const toggleNotification = async () => {
    const currentStatus = userData.notificationsEnabled;
    if (!currentStatus) {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        onUpdateUserData({ notificationsEnabled: true });
        notificationService.sendNotification("Notifications activées !", {
          body: "Tu recevras désormais tes rappels et alertes ici."
        });
      } else {
        alert("Tu dois autoriser les notifications dans ton navigateur pour activer cette option.");
      }
    } else {
      onUpdateUserData({ notificationsEnabled: false });
    }
  };

  const updateNotificationPref = (key: keyof NotificationSettings, value: boolean) => {
    const currentPrefs = userData.notificationSettings || {
      taskReminders: true,
      pomodoroAlerts: true,
      smartPlanningUpdates: true
    };
    onUpdateUserData({
      notificationSettings: {
        ...currentPrefs,
        [key]: value
      }
    });
  };

  const handleTestNotification = () => {
    notificationService.testNotification();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Thèmes */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-3 rounded-2xl ${currentTheme.primary} text-white shadow-lg`}>
            <Palette size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Personnalisation</h2>
            <p className="text-sm opacity-50 font-bold uppercase tracking-wider">Choisis ton ambiance de travail</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(Object.keys(THEMES) as ThemeType[]).map((t) => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              className={`group relative p-4 rounded-[2rem] transition-all duration-300 border-2 ${
                theme === t 
                ? 'border-[var(--primary)] scale-105 shadow-xl shadow-[var(--primary)]/10' 
                : 'border-white/5 hover:border-white/20 hover:scale-105'
              }`}
              style={{ backgroundColor: THEMES[t].colors.bg }}
            >
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center"
                  style={{ backgroundColor: THEMES[t].colors.primary }}
                >
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: THEMES[t].colors.secondary }}
                  />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === t ? 'text-[var(--primary)]' : 'opacity-40'}`}>
                  {THEMES[t].name}
                </span>
              </div>
              
              {theme === t && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-black">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Mode d'affichage */}
      <section className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} shadow-xl`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-white/5 text-[var(--primary)]">
            <Monitor size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Mode d'affichage</h3>
            <p className="text-xs font-bold opacity-50 uppercase tracking-wider">Optimise ton interface</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onUpdateUserData({ displayMode: 'computer' })}
            className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
              userData.displayMode === 'computer' || !userData.displayMode
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`p-3 rounded-2xl ${userData.displayMode === 'computer' || !userData.displayMode ? 'bg-[var(--primary)] text-black' : 'bg-white/5 opacity-40'}`}>
              <Monitor size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black">Ordinateur</h4>
              <p className="text-[10px] font-bold opacity-50">Interface complète</p>
            </div>
            {(userData.displayMode === 'computer' || !userData.displayMode) && (
              <div className="ml-auto w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-black">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </button>

          <button
            onClick={() => onUpdateUserData({ displayMode: 'phone' })}
            className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
              userData.displayMode === 'phone'
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`p-3 rounded-2xl ${userData.displayMode === 'phone' ? 'bg-[var(--primary)] text-black' : 'bg-white/5 opacity-40'}`}>
              <Smartphone size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black">Mobile</h4>
              <p className="text-[10px] font-bold opacity-50">Interface épurée</p>
            </div>
            {userData.displayMode === 'phone' && (
              <div className="ml-auto w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-black">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profil & Compte */}
        <section className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} shadow-xl`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-white/5 text-[var(--primary)]">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Profil & Compte</h3>
              <p className="text-xs font-bold opacity-50 uppercase tracking-wider">Tes informations personnelles</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 ml-1">Nom d'utilisateur</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ton nom"
                  className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 font-bold focus:border-[var(--primary)] outline-none transition-all"
                />
                {newName !== userData.name && (
                  <button 
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-[var(--primary)] text-black rounded-xl font-black text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSavingName ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                    ENREGISTRER
                  </button>
                )}
                {showSaveSuccess && (
                  <div className="absolute right-2 top-2 bottom-2 px-4 bg-green-500 text-white rounded-xl font-black text-xs flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <Check size={16} />
                    MODIFIÉ !
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 ml-1">Adresse Email</label>
              <input 
                type="email" 
                value={userData.email || ''} 
                disabled
                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 font-bold opacity-40 cursor-not-allowed"
              />
              <p className="mt-2 text-[10px] font-bold opacity-40 italic ml-1">* L'email ne peut pas être modifié pour le moment.</p>
            </div>

            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-red-400">Zone de danger</h4>
                  <p className="text-[10px] font-bold opacity-50">Suppression définitive du compte</p>
                </div>
                <button className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all">
                  SUPPRIMER
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} shadow-xl`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-white/5 text-[var(--primary)]">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Notifications</h3>
              <p className="text-xs font-bold opacity-50 uppercase tracking-wider">Alertes et rappels</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${userData.notificationsEnabled ? 'bg-green-500/20 text-green-500' : 'bg-white/5 opacity-40'}`}>
                  <BellRing size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black">Notifications Navigateur</h4>
                  <p className="text-[10px] font-bold opacity-50">Activer les alertes système</p>
                </div>
              </div>
              <button 
                onClick={toggleNotification}
                className={`w-12 h-6 rounded-full transition-all relative ${userData.notificationsEnabled ? 'bg-green-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${userData.notificationsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {userData.notificationsEnabled && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'taskReminders', label: 'Rappels de tâches', desc: 'Alertes quand une tâche approche de son échéance' },
                    { key: 'pomodoroAlerts', label: 'Alertes Pomodoro', desc: 'Notifications à la fin de chaque session de focus' },
                    { key: 'smartPlanningUpdates', label: 'Mises à jour Planning', desc: 'Notifications quand ton planning IA est recalculé' }
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <div>
                        <h5 className="text-xs font-black">{pref.label}</h5>
                        <p className="text-[9px] font-bold opacity-40">{pref.desc}</p>
                      </div>
                      <button 
                        onClick={() => updateNotificationPref(pref.key as keyof NotificationSettings, !((userData.notificationSettings as any)?.[pref.key]))}
                        className={`w-10 h-5 rounded-full transition-all relative ${(userData.notificationSettings as any)?.[pref.key] !== false ? 'bg-[var(--primary)]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${(userData.notificationSettings as any)?.[pref.key] !== false ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleTestNotification}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-black opacity-60 hover:opacity-100 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-2"
                >
                  <Bell size={14} />
                  ENVOYER UNE NOTIFICATION DE TEST
                </button>
              </div>
            )}

            {!userData.notificationsEnabled && (
              <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                <p className="text-[10px] font-bold text-yellow-500/80 leading-relaxed">
                  Les notifications sont désactivées. Active-les pour ne plus rien rater de tes objectifs !
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Suggestions de Musique Spotify */}
      <section className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} shadow-xl mt-8`}>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5 text-[var(--primary)]">
              <Music size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Suggestions de Musiques</h3>
              <p className="text-xs font-bold opacity-50 uppercase tracking-wider">Personnalise les boutons rapides d'ambiance du Pomodoro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddPlaylistField}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-black uppercase text-white tracking-wider"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {suggestedPlaylists.map((pl, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-full md:w-1/4">
                  <label className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Nom / Émoji</label>
                  <input
                    type="text"
                    value={pl.name}
                    onChange={(e) => handleUpdatePlaylist(idx, 'name', e.target.value)}
                    placeholder="Ex: 🧘 Lofi Focus"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>

                <div className="w-full md:flex-1">
                  <label className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Lien Spotify (Playlist, Album, Artiste...)</label>
                  <input
                    type="text"
                    value={pl.url}
                    onChange={(e) => handleUpdatePlaylist(idx, 'url', e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemovePlaylistField(idx)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 active:scale-90 transition-all"
                    title="Supprimer la suggestion"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {suggestedPlaylists.length === 0 && (
            <div className="text-center py-6 opacity-40 italic text-xs font-bold">
              Aucune suggestion de musique configurée. Clique sur "Ajouter" pour créer d'élégantes suggestions !
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <button
              type="button"
              onClick={() => setSuggestedPlaylists(defaultPlaylists)}
              className="text-xs font-bold opacity-50 hover:opacity-100 hover:underline cursor-pointer"
            >
              Réinitialiser par défaut
            </button>

            <button
              onClick={handleSavePlaylists}
              disabled={isSavingSuggestions}
              className="px-6 py-3.5 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingSuggestions ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {showSuggestionsSuccess ? 'SUGGESTIONS ENREGISTRÉES !' : 'SAUVEGARDER LES SUGGESTIONS'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
