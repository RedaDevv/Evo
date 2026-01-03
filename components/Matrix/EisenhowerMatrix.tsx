
import React from 'react';
import { Task, EisenhowerQuadrant, ThemeType, TaskStatus } from '../../types';
import { THEMES } from '../../constants';
import { Zap, Calendar, Users, Trash, ArrowRightLeft } from 'lucide-react';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  theme: ThemeType;
}

const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ tasks, onUpdateTask, theme }) => {
  const currentTheme = THEMES[theme];

  const getTasksByQuadrant = (quadrant: EisenhowerQuadrant) => {
    return tasks.filter(t => t.quadrant === quadrant && t.status !== TaskStatus.DONE);
  };

  const Quadrant = ({ 
    type, 
    title, 
    icon: Icon, 
    colorClass, 
    description 
  }: { 
    type: EisenhowerQuadrant; 
    title: string; 
    icon: any; 
    colorClass: string;
    description: string;
  }) => {
    const quadrantTasks = getTasksByQuadrant(type);
    
    return (
      <div className={`${currentTheme.card} border ${currentTheme.accent} rounded-3xl p-5 flex flex-col h-full shadow-sm overflow-hidden group/quad`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
              <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none mb-1">{title}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{description}</p>
            </div>
          </div>
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{quadrantTasks.length}</span>
        </div>
        
        <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar min-h-[100px]">
          {quadrantTasks.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-colors group-hover/quad:border-slate-200">
              <p className="text-[10px] text-slate-300 text-center italic">Aucune tâche ici.</p>
            </div>
          ) : (
            quadrantTasks.map(t => (
              <div 
                key={t.id} 
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group relative"
              >
                <div className="text-xs font-semibold pr-6">{t.title}</div>
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select 
                    className="bg-white dark:bg-slate-700 text-[9px] rounded border border-slate-200 p-0.5 outline-none"
                    value={t.quadrant}
                    onChange={(e) => onUpdateTask(t.id, { quadrant: e.target.value as EisenhowerQuadrant })}
                  >
                    <option value={EisenhowerQuadrant.DO_FIRST}>🔴</option>
                    <option value={EisenhowerQuadrant.SCHEDULE}>🔵</option>
                    <option value={EisenhowerQuadrant.DELEGATE}>🟡</option>
                    <option value={EisenhowerQuadrant.ELIMINATE}>⚪</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-8">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
        <ArrowRightLeft size={20} className="text-blue-500" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>Gestion des priorités :</strong> Survole une tâche pour changer son quadrant. L'IA utilisera cette répartition pour ton planning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[calc(100vh-280px)] min-h-[600px]">
        <Quadrant 
          type={EisenhowerQuadrant.DO_FIRST} 
          title="Urgent & Important" 
          icon={Zap} 
          colorClass="bg-red-500"
          description="A faire tout de suite"
        />
        <Quadrant 
          type={EisenhowerQuadrant.SCHEDULE} 
          title="Important" 
          icon={Calendar} 
          colorClass="bg-blue-500"
          description="Planifier sereinement"
        />
        <Quadrant 
          type={EisenhowerQuadrant.DELEGATE} 
          title="Urgent" 
          icon={Users} 
          colorClass="bg-orange-500"
          description="Déléguer ou simplifier"
        />
        <Quadrant 
          type={EisenhowerQuadrant.ELIMINATE} 
          title="Ni l'un ni l'autre" 
          icon={Trash} 
          colorClass="bg-slate-500"
          description="A faire en dernier"
        />
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
