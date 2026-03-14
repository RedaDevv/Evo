
import React, { useMemo } from 'react';
import { Task, TaskStatus, ThemeType, EisenhowerQuadrant } from '../../types';
import { THEMES } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProgressTrackingProps {
  tasks: Task[];
  theme: ThemeType;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ tasks, theme }) => {
  const currentTheme = THEMES[theme] || THEMES['midnight'];

  // 1. Calculer les données des 7 derniers jours pour le graphique
  const weeklyData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const result = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
      
      const completedOnDay = tasks.filter(t => 
        t.status === TaskStatus.DONE && 
        t.completedAt && 
        t.completedAt >= dayStart && 
        t.completedAt <= dayEnd
      ).length;

      result.push({ name: dayName, completed: completedOnDay, goal: 3 }); // Objectif arbitraire de 3 tâches/jour
    }
    return result;
  }, [tasks]);

  // 2. Calculer le Streak (Jours consécutifs avec au moins 1 tâche terminée)
  const streak = useMemo(() => {
    let currentStreak = 0;
    const now = new Date();
    const sortedCompletedDates = tasks
      .filter(t => t.status === TaskStatus.DONE && t.completedAt)
      .map(t => new Date(t.completedAt!).setHours(0,0,0,0))
      .sort((a, b) => b - a);

    const uniqueDates = Array.from(new Set(sortedCompletedDates));
    
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);

    // Si pas de tâche aujourd'hui, on vérifie si on a fini hier pour continuer le streak
    const hasTaskToday = uniqueDates.includes(checkDate.getTime());
    if (!hasTaskToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const date of uniqueDates) {
      if (date === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [tasks]);

  // 3. Calculer les scores académiques réels
  const metrics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
    
    // Organisation : Ratio de tâches avec quadrant assigné
    const orgScore = tasks.length > 0 
      ? Math.round((tasks.filter(t => t.quadrant !== EisenhowerQuadrant.ELIMINATE).length / tasks.length) * 100) 
      : 0;

    // Discipline : Respect des temps estimés (Actual vs Estimated)
    const disciplineScore = completedTasks.length > 0
      ? Math.round(Math.min(100, (completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes / Math.max(1, t.actualMinutes || t.estimatedMinutes)), 0) / completedTasks.length) * 100))
      : 0;

    // Priorisation : Ratio de tâches DO_FIRST terminées par rapport au total DO_FIRST
    const doFirstTasks = tasks.filter(t => t.quadrant === EisenhowerQuadrant.DO_FIRST);
    const priorisationScore = doFirstTasks.length > 0
      ? Math.round((doFirstTasks.filter(t => t.status === TaskStatus.DONE).length / doFirstTasks.length) * 100)
      : 0;

    // Assiduité : Taux de complétion global
    const assiduiteScore = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

    return {
      organisation: orgScore,
      discipline: disciplineScore,
      priorisation: priorisationScore,
      assiduite: assiduiteScore
    };
  }, [tasks]);

  const totalFocusTime = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${currentTheme.card} rounded-3xl p-8 border ${currentTheme.accent} shadow-sm`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Activité Hebdomadaire</h3>
            <span className="text-[10px] font-bold bg-white/10 border border-white/10 px-2 py-1 rounded text-[var(--text)]/40">7 DERNIERS JOURS</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--text)" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text)', fillOpacity: 0.5 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: 'var(--text)'
                  }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.completed >= entry.goal ? (THEMES[theme] || THEMES['midnight']).colors.primary : 'var(--text)'} fillOpacity={entry.completed >= entry.goal ? 1 : 0.2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-[var(--text)]/40 mt-4 text-center">Tâches complétées par rapport à l'objectif quotidien</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className={`${currentTheme.card} rounded-3xl p-6 border ${currentTheme.accent} shadow-sm flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group`}>
            <div className={`absolute inset-0 ${currentTheme.primary} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            <span className="text-sm font-bold text-[var(--text)]/40 uppercase tracking-widest mb-2">Temps Focus Total</span>
            <h4 className="text-5xl font-black mb-1 tabular-nums">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</h4>
            <p className="text-sm text-[var(--text)]/60">investis dans ta réussite</p>
          </div>
          
          <div className={`${currentTheme.card} rounded-3xl p-6 border ${currentTheme.accent} shadow-sm flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group`}>
             <div className="absolute -right-4 -top-4 text-6xl opacity-10 grayscale group-hover:grayscale-0 transition-all duration-500">🔥</div>
            <span className="text-sm font-bold text-[var(--text)]/40 uppercase tracking-widest mb-2">Série Actuelle</span>
            <h4 className="text-5xl font-black mb-1 tabular-nums">{streak} Jours</h4>
            <p className="text-sm text-[var(--text)]/60">
              {streak === 0 ? "Commence ta série aujourd'hui !" : "La régularité est la clé du succès."}
            </p>
          </div>
        </div>
      </div>

      <div className={`${currentTheme.card} rounded-3xl p-8 border ${currentTheme.accent} shadow-sm`}>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Profil d'Étudiant</h3>
            <p className="text-xs text-[var(--text)]/40">Basé sur ton activité récente</p>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ProgressBar label="Organisation" progress={metrics.organisation} color="bg-[var(--primary)]" description="Capacité à classer les tâches par importance." />
              <ProgressBar label="Discipline (Focus)" progress={metrics.discipline} color="bg-[var(--secondary)]" description="Respect des temps de travail prévus." />
            </div>
            <div className="space-y-6">
              <ProgressBar label="Priorisation" progress={metrics.priorisation} color="bg-[var(--primary)]" description="Efficacité sur les tâches critiques." />
              <ProgressBar label="Assiduité" progress={metrics.assiduite} color="bg-[var(--secondary)]" description="Taux global de complétion des objectifs." />
            </div>
         </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, progress, color, description }: { label: string; progress: number; color: string; description: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold px-1">
      <span className="text-[var(--text)] uppercase tracking-tight">{label}</span>
      <span className="tabular-nums font-black">{progress}%</span>
    </div>
    <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-lg`} 
        style={{ width: `${progress}%` }} 
      />
    </div>
    <p className="text-[10px] text-[var(--text)]/40 italic px-1">{description}</p>
  </div>
);

export default ProgressTracking;
