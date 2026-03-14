
import React from 'react';
import { ThemeType } from '../types';
import { THEMES } from '../constants';
import { Settings as SettingsIcon, Palette, Shield, Bell, User } from 'lucide-react';

interface SettingsProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange }) => {
  const currentTheme = THEMES[theme] || THEMES['midnight'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
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
                  <SettingsIcon size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} opacity-50 cursor-not-allowed`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/5">
              <User size={20} />
            </div>
            <h3 className="font-black tracking-tight">Profil & Compte</h3>
          </div>
          <p className="text-xs font-bold opacity-60">Gère tes informations personnelles et tes préférences de compte.</p>
        </div>

        <div className={`${currentTheme.card} p-8 rounded-[2.5rem] border ${currentTheme.accent} opacity-50 cursor-not-allowed`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/5">
              <Bell size={20} />
            </div>
            <h3 className="font-black tracking-tight">Notifications</h3>
          </div>
          <p className="text-xs font-bold opacity-60">Configure tes rappels de tâches et alertes de planning.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
