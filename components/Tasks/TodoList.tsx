
import React, { useState } from 'react';
import { Task, TaskStatus, ThemeType, TaskDifficulty } from '../../types';
import { THEMES } from '../../constants';
import { Trash2, CheckCircle2, Circle, Clock, Edit2, AlertCircle } from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
  theme: ThemeType;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onUpdateTask, onDeleteTask, onEditTask, onAddTask, theme }) => {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const currentTheme = THEMES[theme] || THEMES['midnight'];

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  const toggleStatus = (task: Task) => {
    const nextStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    onUpdateTask(task.id, { status: nextStatus });
  };

  const getDifficultyColor = (diff: TaskDifficulty) => {
    switch(diff) {
      case 'easy': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'hard': return 'text-rose-500';
      default: return 'opacity-40';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {(['all', TaskStatus.TODO, TaskStatus.DONE] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f 
                ? `${currentTheme.primary} text-white` 
                : 'bg-white/10 text-[var(--text)]/50 border border-white/10'
              }`}
            >
              {f === 'all' ? 'Tous' : f === TaskStatus.TODO ? 'À faire' : 'Terminé'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-[var(--text)]/40">Aucune tâche trouvée. ✨</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`group ${currentTheme.card} border ${currentTheme.accent} p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-left-2`}
            >
              <button 
                onClick={() => toggleStatus(task)}
                className={`transition-colors ${task.status === TaskStatus.DONE ? 'text-green-500' : 'text-[var(--text)]/30 hover:text-[var(--text)]/50'}`}
              >
                {task.status === TaskStatus.DONE ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${task.status === TaskStatus.DONE ? 'line-through text-[var(--text)]/40' : ''}`}>
                    {task.title}
                  </h4>
                  <span className={`text-[10px] font-bold ${getDifficultyColor(task.difficulty)}`}>
                    • {task.difficulty === 'easy' ? 'Facile' : task.difficulty === 'medium' ? 'Moyen' : 'Dur'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                    task.quadrant === 'do_first' ? 'bg-red-100 text-red-600' : 
                    task.quadrant === 'schedule' ? 'bg-blue-100 text-blue-600' : 
                    'bg-white/10 text-[var(--text)]/60'
                  }`}>
                    {task.quadrant.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--text)]/40 text-xs">
                    <Clock size={12} />
                    <span>{task.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEditTask(task)}
                  className="p-2 text-[var(--text)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-[var(--text)]/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
