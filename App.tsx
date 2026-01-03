
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Grid2X2, 
  Timer, 
  BarChart3, 
  CalendarDays,
  Plus,
  LogOut
} from 'lucide-react';
import { Task, TaskStatus, ThemeType, Unavailability, User, UserData } from './types';
import { THEMES } from './constants';
import { mockAuthService } from './services/mockBackend';
import Dashboard from './components/Dashboard';
import TodoList from './components/Tasks/TodoList';
import EisenhowerMatrix from './components/Matrix/EisenhowerMatrix';
import Pomodoro from './components/Focus/Pomodoro';
import ProgressTracking from './components/Stats/ProgressTracking';
import SmartPlanning from './components/Planning/SmartPlanning';
import TaskModal from './components/Tasks/TaskModal';
import AuthScreen from './components/Auth/AuthScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [theme, setTheme] = useState<ThemeType>('lime');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('evo_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      handleLogin(user);
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  // Sync data with simulated SQL DB
  useEffect(() => {
    if (currentUser) {
      const userData: UserData = { tasks, unavailabilities, theme };
      mockAuthService.saveUserData(currentUser.id, userData);
      
      const currentThemeData = THEMES[theme];
      document.body.style.backgroundColor = currentThemeData.hex;
      if (theme === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    }
  }, [tasks, theme, unavailabilities, currentUser]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('evo_current_user', JSON.stringify(user));
    
    // Load per-user data from SQL simulation
    const userData = await mockAuthService.getUserData(user.id);
    setTasks(userData.tasks);
    setUnavailabilities(userData.unavailabilities);
    setTheme(userData.theme);
    
    setIsAuthLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('evo_current_user');
    setActiveTab('dashboard');
  };

  const addTask = (taskData: any) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      actualMinutes: 0
    };
    setTasks([...tasks, newTask]);
    setIsTaskModalOpen(false);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isNowDone = updates.status === TaskStatus.DONE && t.status !== TaskStatus.DONE;
        return { 
          ...t, 
          ...updates, 
          completedAt: isNowDone ? Date.now() : (updates.status === TaskStatus.TODO ? undefined : t.completedAt)
        };
      }
      return t;
    }));
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const addUnavailability = (unavail: Omit<Unavailability, 'id'>) => {
    setUnavailabilities([...unavailabilities, { ...unavail, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const deleteUnavailability = (id: string) => {
    setUnavailabilities(unavailabilities.filter(u => u.id !== id));
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefce8]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-lime-900/40 uppercase tracking-[0.2em] text-xs">Initialisation de ta session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const currentTheme = THEMES[theme];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks} 
            theme={theme} 
            unavailabilities={unavailabilities}
            onAddTask={() => setIsTaskModalOpen(true)} 
            onUpdateTask={updateTask}
            onAddUnavailability={addUnavailability}
            onDeleteUnavailability={deleteUnavailability}
          />
        );
      case 'tasks':
        return <TodoList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} onAddTask={() => setIsTaskModalOpen(true)} theme={theme} />;
      case 'matrix':
        return <EisenhowerMatrix tasks={tasks} onUpdateTask={updateTask} theme={theme} />;
      case 'planning':
        return <SmartPlanning tasks={tasks} unavailabilities={unavailabilities} theme={theme} />;
      case 'focus':
        return <Pomodoro theme={theme} tasks={tasks} onUpdateTask={updateTask} />;
      case 'stats':
        return <ProgressTracking tasks={tasks} theme={theme} />;
      default:
        return <Dashboard tasks={tasks} theme={theme} unavailabilities={unavailabilities} onAddTask={() => setIsTaskModalOpen(true)} onUpdateTask={updateTask} onAddUnavailability={addUnavailability} onDeleteUnavailability={deleteUnavailability} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'matrix', label: 'Priorités', icon: Grid2X2 },
    { id: 'planning', label: 'Planning IA', icon: CalendarDays },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'stats', label: 'Analyses', icon: BarChart3 },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${currentTheme.bg} ${currentTheme.text} transition-all duration-500`}>
      <aside className={`hidden md:flex flex-col w-64 ${currentTheme.card} border-r ${currentTheme.accent} h-screen sticky top-0 transition-all duration-500 shadow-2xl shadow-black/5`}>
        <div className="p-8 flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${currentTheme.primary} flex items-center justify-center text-white shadow-xl shadow-primary/20`}>
            <BarChart3 size={28} />
          </div>
          <span className="text-3xl font-black tracking-tighter">Evo</span>
        </div>
        
        <div className="px-6 mb-4">
          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center text-lime-950 font-black text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate">{currentUser.name}</p>
              <p className="text-[10px] opacity-40 font-bold truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? `${currentTheme.button} shadow-lg scale-[1.02]` 
                : `hover:bg-black/5 text-slate-500 dark:text-slate-400 font-medium`
              }`}
            >
              <item.icon size={22} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-black/5 dark:border-white/5 space-y-6">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase opacity-50">Thèmes</span>
            <div className="flex gap-2">
              {(Object.keys(THEMES) as ThemeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-125 active:scale-95 ${theme === t ? 'border-slate-400 ring-2 ring-offset-2 ring-slate-200' : 'border-transparent'} ${THEMES[t].primary}`}
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all uppercase tracking-widest"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${currentTheme.card} border-t ${currentTheme.accent} px-2 py-3 flex justify-around shadow-2xl`}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 p-2 ${activeTab === item.id ? currentTheme.secondary : 'text-slate-400'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full transition-all duration-500">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Salut {currentUser.name} ! 👋</h1>
            <p className="opacity-50 text-sm font-bold uppercase tracking-wider">C'est le moment de briller.</p>
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className={`${currentTheme.button} px-6 py-4 rounded-[1.25rem] shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-black text-sm`}
          >
            <Plus size={20} strokeWidth={3} /> <span className="hidden sm:inline">NOUVELLE TÂCHE</span>
          </button>
        </header>

        {renderContent()}

        {isTaskModalOpen && (
          <TaskModal 
            theme={theme}
            task={editingTask}
            onClose={() => { setIsTaskModalOpen(false); setEditingTask(undefined); }}
            onSubmit={editingTask ? (data) => updateTask(editingTask.id, data) : addTask}
          />
        )}
      </main>
    </div>
  );
};

export default App;
