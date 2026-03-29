
import React, { useState } from 'react';
import { Task, TaskStatus, ThemeType, TaskPriority, EisenhowerQuadrant, Unavailability, UserData } from '../types';
import { THEMES } from '../constants';
import { CheckCircle2, Clock, Calendar, TrendingUp, Plus, Target, X, Clock3, BellRing } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  theme: ThemeType;
  unavailabilities: Unavailability[];
  onAddTask: (task: any) => void;
  onUpdateTask: (id: string, updates: any) => void;
  onAddUnavailability: (unavail: Omit<Unavailability, 'id'>) => void;
  onDeleteUnavailability: (id: string) => void;
  userData: Partial<UserData>;
  onGoToSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, 
  theme, 
  unavailabilities, 
  onAddTask, 
  onAddUnavailability, 
  onDeleteUnavailability,
  userData,
  onGoToSettings
}) => {
  const currentTheme = THEMES[theme];
  
  const [newUnavail, setNewUnavail] = useState({ day: 'Lundi', startTime: '08:00', endTime: '12:00', reason: 'Cours' });

  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
  const totalEstimated = tasks.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Notification Banner */}
      {!userData.notificationsEnabled && (
        <div className={`${currentTheme.card} p-6 rounded-3xl border-2 border-dashed border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <BellRing size={24} />
            </div>
            <div>
              <h4 className="font-black text-sm">Active les notifications !</h4>
              <p className="text-xs font-bold opacity-60">Ne rate plus aucun rappel de tes tâches importantes.</p>
            </div>
          </div>
          <button 
            onClick={onGoToSettings}
            className="px-6 py-3 bg-amber-500 text-black rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
          >
            ACTIVER MAINTENANT
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Terminées" value={completedTasks.length.toString()} icon={CheckCircle2} color="text-emerald-500" theme={theme} />
        <StatCard label="En attente" value={pendingTasks.length.toString()} icon={Clock} color="text-amber-500" theme={theme} />
        <StatCard label="Temps estimé" value={`${Math.floor(totalEstimated / 60)}h ${totalEstimated % 60}m`} icon={Calendar} color="text-sky-500" theme={theme} />
        <StatCard label="Focus Score" value={`${progressPercentage}%`} icon={TrendingUp} color="text-fuchsia-500" theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Progression Card */}
          <div className={`${currentTheme.card} rounded-[3rem] p-10 border ${currentTheme.accent} shadow-2xl shadow-black/5 flex flex-col items-center justify-center min-h-[400px] transition-all duration-700`}>
             <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="82" stroke="currentColor" strokeWidth="14" fill="transparent" className="opacity-5" />
                  <circle cx="96" cy="96" r="82" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray={2 * Math.PI * 82} strokeDashoffset={2 * Math.PI * 82 * (1 - progressPercentage / 100)} strokeLinecap="round" className={`${currentTheme.secondary} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="flex flex-col items-center justify-center z-10">
                  <Target size={40} className={`${currentTheme.secondary} mb-2 opacity-10`} />
                  <span className="text-6xl font-black leading-none tracking-tighter tabular-nums">{progressPercentage}%</span>
                  <span className="text-[11px] opacity-40 font-black uppercase tracking-[0.2em] mt-3">Maîtrise</span>
                </div>
             </div>
             <div className="mt-10 text-center">
                <h3 className="text-2xl font-black mb-2 tracking-tight">Objectif du jour</h3>
                <p className="opacity-50 max-w-xs mx-auto text-base font-bold italic">
                  {progressPercentage === 100 ? "Légendaire ! 🏆" : progressPercentage > 50 ? "Tu gères carrément ! 💪" : "Le premier pas est le plus dur. 🚀"}
                </p>
             </div>
          </div>

          {/* Unavailabilities Management */}
          <div className={`${currentTheme.card} rounded-[3rem] p-10 border ${currentTheme.accent} shadow-2xl shadow-black/5 transition-all duration-700`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                <Clock3 className={currentTheme.secondary} size={28} /> Mon Temps Bloqué
              </h3>
              <span className="text-[10px] font-black opacity-30 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">Zone IA Off</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white/5 p-8 rounded-[2rem] space-y-5">
                <div className="space-y-4">
                  <select 
                    value={newUnavail.day} 
                    onChange={(e) => setNewUnavail({...newUnavail, day: e.target.value})}
                    className="w-full bg-white/5 border-none rounded-2xl px-5 py-3 text-sm font-bold shadow-sm outline-none focus:ring-4 ring-white/5"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="flex gap-3">
                    <input type="time" value={newUnavail.startTime} onChange={(e) => setNewUnavail({...newUnavail, startTime: e.target.value})} className="flex-1 bg-white/5 border-none rounded-2xl px-5 py-3 text-sm font-bold shadow-sm outline-none focus:ring-4 ring-white/5" />
                    <input type="time" value={newUnavail.endTime} onChange={(e) => setNewUnavail({...newUnavail, endTime: e.target.value})} className="flex-1 bg-white/5 border-none rounded-2xl px-5 py-3 text-sm font-bold shadow-sm outline-none focus:ring-4 ring-white/5" />
                  </div>
                  <input type="text" placeholder="Raison (Cours, Sport...)" value={newUnavail.reason} onChange={(e) => setNewUnavail({...newUnavail, reason: e.target.value})} className="w-full bg-white/5 border-none rounded-2xl px-5 py-3 text-sm font-bold shadow-sm outline-none focus:ring-4 ring-white/5" />
                  <button onClick={() => onAddUnavailability(newUnavail)} className={`w-full ${currentTheme.button} font-black py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all`}>
                    <Plus size={18} strokeWidth={3} /> Ajouter ce blocage
                  </button>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-4 custom-scrollbar">
                {unavailabilities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-[2.5rem] p-10 text-center">
                    <p className="text-sm font-bold opacity-30 italic">Aucune contrainte enregistrée.</p>
                  </div>
                ) : (
                  unavailabilities.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-white/20 transition-all hover:translate-x-1 shadow-sm">
                      <div>
                        <p className="text-sm font-black">{u.day} • {u.reason}</p>
                        <p className="text-[11px] opacity-40 font-bold tracking-wider">{u.startTime} — {u.endTime}</p>
                      </div>
                      <button onClick={() => onDeleteUnavailability(u.id)} className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-xl">
                        <X size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="flex flex-col gap-6">
          <div className={`${currentTheme.card} rounded-[2.5rem] p-8 border ${currentTheme.accent} shadow-2xl shadow-black/5 transition-all duration-700`}>
            <h3 className="font-black text-xl mb-6 flex items-center gap-3 tracking-tight">
              <Plus size={24} className={currentTheme.secondary} strokeWidth={3} /> Ajout Rapide
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('taskTitle') as HTMLInputElement;
              if (input.value.trim()) {
                onAddTask({ title: input.value, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, difficulty: 'medium', quadrant: EisenhowerQuadrant.DO_FIRST, estimatedMinutes: 30 });
                form.reset();
              }
            }} className="space-y-5">
              <input name="taskTitle" type="text" placeholder="Une idée ? Note-la !" className="w-full bg-white/5 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 ring-white/5 outline-none transition-all" />
              <button className={`w-full ${currentTheme.button} font-black py-5 rounded-2xl shadow-2xl uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all`}>
                AJOUTER À MA LISTE
              </button>
            </form>
          </div>
          <div className={`${currentTheme.card} rounded-[2.5rem] p-8 border ${currentTheme.accent} shadow-2xl shadow-black/5 transition-all duration-700 border-l-8 border-l-[var(--primary)]`}>
            <h3 className="font-black text-lg mb-3 flex items-center gap-2 tracking-tight">🤖 EVO COACH</h3>
            <p className="text-sm opacity-60 leading-relaxed italic font-bold">
              "Le succès n'est pas un sprint, c'est une suite de petites habitudes. Bloque tes heures de sommeil, c'est ta priorité n°1."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: any; color: string; theme: ThemeType }> = ({ label, value, icon: Icon, color, theme }) => {
  const currentTheme = THEMES[theme];
  return (
    <div className={`${currentTheme.card} rounded-[2rem] p-6 border ${currentTheme.accent} shadow-xl shadow-black/5 flex items-center gap-5 transition-all hover:-translate-y-2 hover:shadow-2xl`}>
      <div className={`p-4 rounded-2xl bg-white/5 ${color} shadow-inner`}><Icon size={28} strokeWidth={2.5} /></div>
      <div>
        <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.15em] mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tighter tabular-nums">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
