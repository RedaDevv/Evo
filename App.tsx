
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { Task, TaskStatus, ThemeType, Unavailability, User, UserData } from './types';
import { THEMES } from './constants';
import { firebaseService } from './services/firebaseService';
import { notificationService } from './services/notificationService';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import Dashboard from './components/Dashboard';
import TodoList from './components/Tasks/TodoList';
import EisenhowerMatrix from './components/Matrix/EisenhowerMatrix';
import Pomodoro from './components/Focus/Pomodoro';
import ProgressTracking from './components/Stats/ProgressTracking';
import SmartPlanning from './components/Planning/SmartPlanning';
import TaskModal from './components/Tasks/TaskModal';
import AuthScreen from './components/Auth/AuthScreen';
import Settings from './components/Settings';
import ModeSelection from './components/ModeSelection';
import AdminPanel from './components/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Mail, RefreshCw, LogOut as LogOutIcon, Settings as SettingsIcon, Shield } from 'lucide-react';
import { handleSpotifyCallback } from './spotify';
import { AdSenseAd } from './components/AdSenseAd';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  
  // Persistent UI state (still useful for UI-only preferences)
  const [activeTab, setActiveTab] = useLocalStorageState<string>('evo_active_tab', 'dashboard');
  const [theme, setTheme] = useState<ThemeType>('midnight');
  
  // Task and planning data (synced with Firestore)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  
  const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Task reminders
  useEffect(() => {
    if (!userData.notificationsEnabled || userData.notificationSettings?.taskReminders === false) return;

    const checkTasks = () => {
      const now = Date.now();
      const fifteenMinutesFromNow = now + 15 * 60 * 1000;

      tasks.forEach(task => {
        if (task.status !== TaskStatus.DONE && task.dueDate && !notifiedTasks.has(task.id)) {
          const dueTime = new Date(task.dueDate).getTime();
          if (dueTime > now && dueTime <= fifteenMinutesFromNow) {
            notificationService.sendNotification(`Rappel : ${task.title}`, {
              body: `Cette tâche arrive à échéance dans moins de 15 minutes !`,
              tag: `task-reminder-${task.id}`
            });
            setNotifiedTasks(prev => new Set(prev).add(task.id));
          }
        }
      });
    };

    const interval = setInterval(checkTasks, 60000); // Check every minute
    checkTasks(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, userData.notificationsEnabled, userData.notificationSettings?.taskReminders, notifiedTasks]);

  // Auth state listener
  useEffect(() => {
    firebaseService.testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'Utilisateur'
        });
        setIsEmailVerified(user.emailVerified);
      } else {
        setCurrentUser(null);
        setIsEmailVerified(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleReloadUser = async () => {
    setIsReloading(true);
    try {
      const user = await firebaseService.reloadUser();
      if (user) {
        setIsEmailVerified(user.emailVerified);
      }
    } catch (error) {
      console.error("Erreur lors du rechargement de l'utilisateur:", error);
    } finally {
      setIsReloading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await firebaseService.resendVerificationEmail();
      alert("Un nouvel email de vérification a été envoyé !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }
  };

  // Listen for success message from Spotify OAuth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if possible, or just check the event type
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        console.log("Captured SPOTIFY_AUTH_SUCCESS from popup!");
        setActiveTab('focus');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Real-time Firestore sync and Spotify callback capturing
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setUnavailabilities([]);
      return;
    }

    // Capture the Spotify OAuth redirect code
    if (window.location.search.includes('code=')) {
      handleSpotifyCallback(currentUser.id)
        .then((token) => {
          if (token) {
            console.log("Spotify connected successfully!");
            setActiveTab('focus');
          }
        })
        .catch((error) => {
          console.error("Failed to authenticate with Spotify:", error);
        });
    }

    const unsubTasks = firebaseService.subscribeToTasks(currentUser.id, setTasks);
    const unsubUnavail = firebaseService.subscribeToUnavailabilities(currentUser.id, setUnavailabilities);
    const unsubUser = firebaseService.subscribeToUserData(currentUser.id, (data) => {
      setUserData(data);
      if (data.theme) setTheme(data.theme);
      setIsUserDataLoading(false);
    });

    return () => {
      unsubTasks();
      unsubUnavail();
      unsubUser();
    };
  }, [currentUser?.id]);

  // Apply theme to body and CSS variables
  useEffect(() => {
    const themeData = THEMES[theme];
    const root = document.documentElement;
    
    // Apply CSS variables for instant updates
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    document.body.style.backgroundColor = themeData.colors.bg;
    
    // Always add dark class since all our themes are dark-based now
    document.body.classList.add('dark');
  }, [theme]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await firebaseService.logout();
    setActiveTab('dashboard');
  };

  const addTask = async (taskData: any) => {
    if (!currentUser) return;
    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: Date.now(),
      actualMinutes: 0
    };
    await firebaseService.addTask(currentUser.id, newTask);
    setIsTaskModalOpen(false);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!currentUser) return;
    
    // Find the task to check status change
    const task = tasks.find(t => t.id === id);
    if (task) {
      const isNowDone = updates.status === TaskStatus.DONE && task.status !== TaskStatus.DONE;
      const finalUpdates = {
        ...updates,
        completedAt: isNowDone ? Date.now() : (updates.status === TaskStatus.TODO ? undefined : task.completedAt)
      };
      await firebaseService.updateTask(currentUser.id, id, finalUpdates);
    }
    
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const addUnavailability = async (unavail: Omit<Unavailability, 'id'>) => {
    if (!currentUser) return;
    await firebaseService.addUnavailability(currentUser.id, unavail);
  };

  const deleteUnavailability = async (id: string) => {
    if (!currentUser) return;
    await firebaseService.deleteUnavailability(currentUser.id, id);
  };

  const handleThemeChange = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    if (currentUser) {
      await firebaseService.updateTheme(currentUser.id, newTheme);
    }
  };

  const handleModeSelect = async (mode: 'computer' | 'phone') => {
    if (currentUser) {
      // Mise à jour optimiste pour une transition instantanée
      setUserData(prev => ({ ...prev, displayMode: mode }));
      try {
        await firebaseService.updateDisplayMode(currentUser.id, mode);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du mode d'affichage:", error);
      }
    }
  };

  const currentTheme = THEMES[theme];
  const isPhoneMode = userData.displayMode === 'phone';

  if (isAuthLoading || (currentUser && isUserDataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-[var(--text)] opacity-40 uppercase tracking-[0.2em] text-xs">Initialisation de ta session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={`${currentTheme.bg} ${currentTheme.text}`}>
        <AuthScreen onLogin={handleLogin} />
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
        <div className={`max-w-md w-full ${currentTheme.card} rounded-[2.5rem] p-10 shadow-2xl border-4 ${currentTheme.accent}`}>
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-3xl flex items-center justify-center text-[var(--primary)] mx-auto mb-8">
            <Mail size={40} strokeWidth={2.5} />
          </div>
          
          <h2 className="text-3xl font-black text-center text-[var(--text)] mb-4 tracking-tighter">Vérifie ton email !</h2>
          <p className="text-center text-[var(--text)] opacity-60 font-bold mb-8 leading-relaxed">
            On t'a envoyé un lien de vérification à <span className="text-[var(--primary)]">{currentUser.email}</span>. 
            Vérifie tes spams si tu ne le vois pas !
          </p>

          <div className="space-y-4">
            <button
              onClick={handleReloadUser}
              disabled={isReloading}
              className={`w-full ${currentTheme.button} py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50`}
            >
              <RefreshCw size={20} className={isReloading ? 'animate-spin' : ''} />
              J'AI VÉRIFIÉ MON EMAIL
            </button>

            <button
              onClick={handleResendEmail}
              className="w-full bg-white/5 hover:bg-white/10 text-[var(--text)] opacity-60 py-5 rounded-2xl font-black text-sm transition-all active:scale-95"
            >
              RENVOYER L'EMAIL
            </button>

            <button
              onClick={() => setIsEmailVerified(true)}
              className="w-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Passer l'étape (Mode Démo / Test)
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-xs font-black text-red-400 hover:text-red-500 transition-all uppercase tracking-widest"
            >
              <LogOutIcon size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser && isEmailVerified && !userData.displayMode) {
    return (
      <div className={`${currentTheme.bg} ${currentTheme.text} min-h-screen`}>
        <ModeSelection onSelect={handleModeSelect} />
      </div>
    );
  }

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
            userData={userData}
            onGoToSettings={() => setActiveTab('settings')}
          />
        );
      case 'tasks':
        return <TodoList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={(id) => currentUser && firebaseService.deleteTask(currentUser.id, id)} onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }} onAddTask={() => setIsTaskModalOpen(true)} theme={theme} />;
      case 'matrix':
        return <EisenhowerMatrix tasks={tasks} onUpdateTask={updateTask} theme={theme} />;
      case 'planning':
        return <SmartPlanning tasks={tasks} unavailabilities={unavailabilities} theme={theme} userData={userData} onGoToSettings={() => setActiveTab('settings')} />;
      case 'focus':
        return <Pomodoro theme={theme} tasks={tasks} onUpdateTask={updateTask} userData={userData} onGoToSettings={() => setActiveTab('settings')} />;
      case 'stats':
        return <ProgressTracking tasks={tasks} theme={theme} userData={userData} onGoToSettings={() => setActiveTab('settings')} />;
      case 'settings':
        return (
          <Settings 
            theme={theme} 
            onThemeChange={handleThemeChange} 
            userData={userData}
            onUpdateUserData={(updates) => currentUser && firebaseService.updateUserData(currentUser.id, updates)}
            onUpdateProfileName={(name) => firebaseService.updateProfileName(name)}
            onLogout={handleLogout}
          />
        );
      case 'admin':
        if (currentUser?.email === 'reda.elhajji.43@gmail.com') {
          return (
            <AdminPanel 
              theme={theme} 
              currentUserEmail={currentUser.email} 
              userData={userData}
              onUpdateUserData={(updates) => currentUser && firebaseService.updateUserData(currentUser.id, updates)}
            />
          );
        }
        return null;
      default:
        return (
          <Dashboard 
            tasks={tasks} 
            theme={theme} 
            unavailabilities={unavailabilities} 
            onAddTask={() => setIsTaskModalOpen(true)} 
            onUpdateTask={updateTask} 
            onAddUnavailability={addUnavailability} 
            onDeleteUnavailability={deleteUnavailability} 
            userData={userData}
            onGoToSettings={() => setActiveTab('settings')}
          />
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'matrix', label: 'Priorités', icon: Grid2X2 },
    { id: 'planning', label: 'Planning IA', icon: CalendarDays },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'stats', label: 'Analyses', icon: BarChart3 },
    { id: 'settings', label: 'Réglages', icon: SettingsIcon },
    ...(currentUser?.email === 'reda.elhajji.43@gmail.com' ? [{ id: 'admin', label: 'Admin 👑', icon: Shield }] : [])
  ];

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${!isPhoneMode ? 'md:flex-row' : ''} ${currentTheme.bg} ${currentTheme.text} transition-all duration-500`}>
      <aside className={`${isPhoneMode ? 'hidden' : 'hidden md:flex'} flex-col w-64 ${currentTheme.card} border-r border-white/10 h-screen sticky top-0 transition-all duration-500`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center text-white">
            <BarChart3 size={20} />
          </div>
          <span className="font-serif text-2xl font-normal tracking-tight text-white">Evo</span>
        </div>
        
        <div className="px-4 py-4 border-b border-white/10 mb-2">
          <div className="bg-white/[0.03] p-3 rounded-lg border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-serif font-bold text-sm shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-xs font-semibold truncate text-white">{currentUser.name}</p>
                {userData?.isPremium && (
                  <span className="shrink-0 text-[8px] font-mono font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-md">
                    PREMIUM ✨
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-50 font-mono truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-150 active:scale-[0.98] group overflow-hidden cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavigationPill"
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-4 text-xs uppercase tracking-wider font-medium ${
                  isActive ? 'text-white font-semibold' : 'opacity-60 hover:opacity-100 text-white'
                }`}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </aside>

      <nav className={`${isPhoneMode ? 'flex' : 'md:hidden'} fixed bottom-0 left-0 right-0 z-50 ${currentTheme.card} border-t border-white/10 px-2 py-2.5 flex justify-around`}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className="relative flex flex-col items-center gap-1 p-2 min-w-[50px] transition-all cursor-pointer"
            >
              <item.icon size={18} className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'opacity-40'}`} />
              <span className={`text-[10px] font-mono tracking-wider relative z-10 transition-colors duration-200 ${isActive ? 'text-white font-semibold' : 'opacity-40'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeMobileDot"
                  className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <main className={`flex-1 ${isPhoneMode ? 'p-4 pb-24' : 'p-4 md:p-8 pb-24 md:pb-8'} max-w-7xl mx-auto w-full transition-all duration-300`}>
        <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-white">Salut {currentUser.name} ! 👋</h1>
            <p className="opacity-50 text-xs font-mono uppercase tracking-widest mt-1">C'est le moment de briller.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="px-5 py-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-white flex items-center gap-2 font-semibold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">NOUVELLE TÂCHE</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 border border-white/10 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Déconnexion"
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {activeTab !== 'settings' && activeTab !== 'admin' && (
          <AdSenseAd 
            theme={theme} 
            userData={userData} 
            onGoToSettings={() => setActiveTab('settings')} 
          />
        )}

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
    </ErrorBoundary>
  );
};

export default App;
