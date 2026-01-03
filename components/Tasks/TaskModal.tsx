
import React, { useState } from 'react';
import { Task, TaskPriority, TaskDifficulty, EisenhowerQuadrant, TaskStatus, ThemeType } from '../../types';
import { THEMES } from '../../constants';
import { X, Check } from 'lucide-react';

interface TaskModalProps {
  theme: ThemeType;
  task?: Task;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ theme, task, onClose, onSubmit }) => {
  const currentTheme = THEMES[theme];
  const [title, setTitle] = useState(task?.title || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(task?.difficulty || TaskDifficulty.MEDIUM);
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>(task?.quadrant || EisenhowerQuadrant.DO_FIRST);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes || 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      priority,
      difficulty,
      quadrant,
      estimatedMinutes,
      status: task?.status || TaskStatus.TODO,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${currentTheme.card} w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Titre de la tâche</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser le chapitre 3 d'Histoire"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 ring-blue-500 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulté</label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {Object.values(TaskDifficulty).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${difficulty === d ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}
                  >
                    {d === 'easy' ? 'Facile' : d === 'medium' ? 'Moyen' : 'Dur'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Temps (min)</label>
              <input 
                type="number" 
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type (Eisenhower)</label>
            <select 
              value={quadrant}
              onChange={(e) => setQuadrant(e.target.value as EisenhowerQuadrant)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-blue-500 outline-none"
            >
              <option value={EisenhowerQuadrant.DO_FIRST}>🔴 Urgent & Important</option>
              <option value={EisenhowerQuadrant.SCHEDULE}>🔵 Important (Non-urgent)</option>
              <option value={EisenhowerQuadrant.DELEGATE}>🟡 Urgent (Non-important)</option>
              <option value={EisenhowerQuadrant.ELIMINATE}>⚪ Ni l'un ni l'autre</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`w-full ${currentTheme.primary} text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all`}
          >
            <Check size={20} /> {task ? 'Enregistrer' : 'Créer la tâche'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
