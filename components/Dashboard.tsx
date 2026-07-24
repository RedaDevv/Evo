
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Notification Banner */}
      {!userData.notificationsEnabled && (
        <div className="p-5 rounded-lg border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <BellRing size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-amber-200">Active les notifications !</h4>
              <p className="text-xs text-amber-200/70">Ne rate plus aucun rappel de tes tâches importantes.</p>
            </div>
          </div>
          <button 
            onClick={onGoToSettings}
            className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-medium text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            ACTIVER MAINTENANT
          </button>
        </div>
      )}

      {/* Stats Overview - Grid with clean micro-borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Terminées" value={completedTasks.length.toString()} icon={CheckCircle2} color="text-emerald-400" theme={theme} />
        <StatCard label="En attente" value={pendingTasks.length.toString()} icon={Clock} color="text-amber-400" theme={theme} />
        <StatCard label="Temps estimé" value={`${Math.floor(totalEstimated / 60)}h ${totalEstimated % 60}m`} icon={Calendar} color="text-sky-400" theme={theme} />
        <StatCard label="Focus Score" value={`${progressPercentage}%`} icon={TrendingUp} color="text-fuchsia-400" theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Progression Card */}
          <div className={`${currentTheme.card} rounded-lg p-8 border border-white/10 flex flex-col items-center justify-center min-h-[360px]`}>
             <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="82" stroke="currentColor" strokeWidth="10" fill="transparent" className="opacity-10 text-white" />
                  <circle cx="96" cy="96" r="82" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 82} strokeDashoffset={2 * Math.PI * 82 * (1 - progressPercentage / 100)} strokeLinecap="round" className={`${currentTheme.secondary} transition-all duration-700 ease-out`} />
                </svg>
                <div className="flex flex-col items-center justify-center z-10">
                  <Target size={32} className={`${currentTheme.secondary} mb-2 opacity-20`} />
                  <span className="font-serif text-5xl font-medium leading-none tracking-tight tabular-nums text-white">{progressPercentage}%</span>
                  <span className="text-[10px] opacity-50 font-mono uppercase tracking-[0.2em] mt-2">Maîtrise</span>
                </div>
             </div>
             <div className="mt-8 text-center">
                <h3 className="font-serif text-2xl font-normal mb-1.5 tracking-tight text-white">Objectif du jour</h3>
                <p className="text-sm opacity-60 max-w-xs mx-auto font-sans italic">
                  {progressPercentage === 100 ? "Légendaire ! 🏆" : progressPercentage > 50 ? "Tu gères carrément ! 💪" : "Le premier pas est le plus dur. 🚀"}
                </p>
             </div>
          </div>

          {/* Unavailabilities Management */}
          <div className={`${currentTheme.card} rounded-lg p-8 border border-white/10`}>
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <h3 className="font-serif text-xl font-normal flex items-center gap-3 tracking-tight text-white">
                <Clock3 className={currentTheme.secondary} size={22} /> Mon Temps Bloqué
              </h3>
              <span className="text-[10px] font-mono opacity-50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase tracking-widest">Contraintes locales</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] p-5 rounded-lg border border-white/10 space-y-4">
                <div className="space-y-3">
                  <select 
                    value={newUnavail.day} 
                    onChange={(e) => setNewUnavail({...newUnavail, day: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-white/30 text-white"
                  >
                    {days.map(d => <option key={d} value={d} className="bg-neutral-900 text-white">{d}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="time" value={newUnavail.startTime} onChange={(e) => setNewUnavail({...newUnavail, startTime: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-white/30 text-white" />
                    <input type="time" value={newUnavail.endTime} onChange={(e) => setNewUnavail({...newUnavail, endTime: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-white/30 text-white" />
                  </div>
                  <input type="text" placeholder="Raison (Cours, Sport...)" value={newUnavail.reason} onChange={(e) => setNewUnavail({...newUnavail, reason: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-white/30 text-white" />
                  <button onClick={() => onAddUnavailability(newUnavail)} className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer">
                    <Plus size={16} strokeWidth={2.5} /> Ajouter ce blocage
                  </button>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
                {unavailabilities.length === 0 ? (
                  <div className="h-full min-h-[160px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg p-6 text-center">
                    <p className="text-xs font-medium opacity-40 italic">Aucune contrainte enregistrée.</p>
                  </div>
                ) : (
                  unavailabilities.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/10 group hover:border-white/20 transition-all">
                      <div>
                        <p className="text-xs font-semibold text-white">{u.day} • {u.reason}</p>
                        <p className="text-[10px] opacity-50 font-mono tracking-wider mt-0.5">{u.startTime} — {u.endTime}</p>
                      </div>
                      <button onClick={() => onDeleteUnavailability(u.id)} className="p-1.5 text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-md cursor-pointer">
                        <X size={16} strokeWidth={2} />
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
          <div className={`${currentTheme.card} rounded-lg p-6 border border-white/10`}>
            <h3 className="font-serif text-xl font-normal mb-5 flex items-center gap-2.5 tracking-tight text-white">
              <Plus size={20} className={currentTheme.secondary} strokeWidth={2.5} /> Ajout Rapide
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('taskTitle') as HTMLInputElement;
              if (input.value.trim()) {
                onAddTask({ title: input.value, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, difficulty: 'medium', quadrant: EisenhowerQuadrant.DO_FIRST, estimatedMinutes: 30 });
                form.reset();
              }
            }} className="space-y-4">
              <input name="taskTitle" type="text" placeholder="Une idée ? Note-la !" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs font-medium focus:border-white/30 outline-none text-white transition-all" />
              <button className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold py-3 rounded-lg uppercase text-xs tracking-wider active:scale-95 transition-all cursor-pointer">
                Ajouter à ma liste
              </button>
            </form>
          </div>

          <div className={`${currentTheme.card} rounded-lg p-6 border border-white/10 border-l-4 border-l-[var(--primary)]`}>
            <h3 className="font-serif text-lg font-normal mb-2 tracking-tight text-white">Conseil d'Evo</h3>
            <p className="text-xs opacity-70 leading-relaxed italic font-sans">
              "Le succès n'est pas un sprint, c'est une suite de petites habitudes. Bloque tes heures de sommeil, c'est ta priorité n°1."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: any; color: string; theme: ThemeType }> = ({ label, value, icon: Icon, color, theme }) => {
  return (
    <div className="rounded-lg p-5 border border-white/10 bg-white/[0.02] flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-white/5 ${color}`}><Icon size={22} strokeWidth={2} /></div>
      <div>
        <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-serif text-3xl font-normal tracking-tight tabular-nums text-white">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
