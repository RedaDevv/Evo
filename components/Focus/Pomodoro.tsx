
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, ThemeType } from '../../types';
import { THEMES } from '../../constants';
import { Play, Pause, RotateCcw, Coffee, Brain, Bell } from 'lucide-react';

interface PomodoroProps {
  theme: ThemeType;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const Pomodoro: React.FC<PomodoroProps> = ({ theme, tasks, onUpdateTask }) => {
  const currentTheme = THEMES[theme];
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  // Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      if (selectedTask) {
        const task = tasks.find(t => t.id === selectedTask);
        if (task) {
          onUpdateTask(selectedTask, { actualMinutes: (task.actualMinutes || 0) + 25 });
        }
      }
      setMode('break');
      setTimeLeft(5 * 60);
      alert("C'est l'heure de la pause ! ☕️");
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
      alert("Au travail ! 💪");
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (mode === 'work' ? 25 * 60 - timeLeft : 5 * 60 - timeLeft) / (mode === 'work' ? 25 * 60 : 5 * 60) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10 animate-in fade-in scale-95 duration-500">
      <div className="flex gap-4 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button 
          onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'work' ? `${currentTheme.primary} text-white` : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Brain size={18} /> Travail
        </button>
        <button 
          onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? `${currentTheme.primary} text-white` : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Coffee size={18} /> Pause
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Animated Circle */}
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div 
              className={`absolute bottom-0 w-full transition-all duration-1000 ease-linear ${currentTheme.primary} opacity-10`} 
              style={{ height: `${progress}%` }} 
            />
            <div className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums z-10">
                {formatTime(timeLeft)}
            </div>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-all"
        >
          <RotateCcw size={28} />
        </button>
        <button 
          onClick={toggleTimer}
          className={`p-6 rounded-full ${currentTheme.primary} text-white shadow-xl transform transition-all active:scale-90 hover:scale-105`}
        >
          {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
        </button>
        <button 
          className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-all"
        >
          <Bell size={28} />
        </button>
      </div>

      <div className="w-full max-w-md">
        <h3 className="text-center font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest">Sur quelle tâche travailles-tu ?</h3>
        <select 
          className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-blue-500 outline-none transition-all`}
          value={selectedTask || ''}
          onChange={(e) => setSelectedTask(e.target.value)}
        >
          <option value="">Sélectionner une tâche...</option>
          {tasks.filter(t => t.status !== TaskStatus.DONE).map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pomodoro;
