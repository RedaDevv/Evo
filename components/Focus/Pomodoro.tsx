
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, ThemeType, UserData } from '../../types';
import { THEMES } from '../../constants';
import { Play, Pause, RotateCcw, Coffee, Brain, Bell, Music, ExternalLink, RefreshCw, SkipBack, SkipForward, Disc, Link, Radio } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { auth, db } from '../../firebase';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { redirectToSpotifyAuth, getValidAccessToken, SPOTIFY_REDIRECT_URI } from '../../spotify';
import { firebaseService } from '../../services/firebaseService';

interface PomodoroProps {
  theme: ThemeType;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  userData: Partial<UserData>;
}

const Pomodoro: React.FC<PomodoroProps> = ({ theme, tasks, onUpdateTask, userData }) => {
  const currentTheme = THEMES[theme];
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  // Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Spotify Integration State
  const [spotifyConnected, setSpotifyConnected] = useState<boolean>(false);
  const [spotifyActiveTab, setSpotifyActiveTab] = useState<'embed' | 'remote'>('embed');
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    artist: string;
    albumArt: string;
    isPlaying: boolean;
  } | null>(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState<boolean>(false);
  const [customPlaylist, setCustomPlaylist] = useState<string>('https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0EXPn'); // Default to Lofi Focus
  const [playlistInput, setPlaylistInput] = useState<string>('');
  const [showConfigHelp, setShowConfigHelp] = useState<boolean>(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState<boolean>(false);

  // User Playlists states
  const [userPlaylists, setUserPlaylists] = useState<Array<{ name: string; url: string; id: string }>>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);

  // Sync with loaded lastUsedPlaylist from database
  useEffect(() => {
    if (userData?.lastUsedPlaylist) {
      setCustomPlaylist(userData.lastUsedPlaylist);
      setPlaylistInput(userData.lastUsedPlaylist);
    }
  }, [userData?.lastUsedPlaylist]);

  const handleSelectPlaylist = async (url: string) => {
    setCustomPlaylist(url);
    setPlaylistInput(url);
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await firebaseService.updateUserData(userId, { lastUsedPlaylist: url });
      } catch (error) {
        console.error("Error saving last used playlist to Firestore:", error);
      }
    }
  };

  const curatedPlaylists = userData?.customSuggestions && userData.customSuggestions.length > 0
    ? userData.customSuggestions
    : [
        { name: '🧘 Lofi Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0EXPn' },
        { name: '🧠 Piano Fluide', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
        { name: '⚡ Dev Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLTE7SAt9g9' },
        { name: '☕ Cafe Jazz', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZOM9CH8Z667' },
      ];

  const fetchUserPlaylists = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setIsLoadingPlaylists(true);
    try {
      const token = await getValidAccessToken(userId);
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=40', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.items) {
          const playlists = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            url: item.external_urls?.spotify || `https://open.spotify.com/playlist/${item.id}`
          }));
          setUserPlaylists(playlists);
          // Auto select first personal playlist if we were on the default and no saved playlist exists
          if (playlists.length > 0 && customPlaylist === 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0EXPn' && !userData?.lastUsedPlaylist) {
            setCustomPlaylist(playlists[0].url);
            setPlaylistInput(playlists[0].url);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user personal playlists from Spotify:", error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  // Helper parsing Spotify Links
  const getEmbedUrl = (uriOrUrl: string) => {
    let type = 'playlist';
    let id = '37i9dQZF1DWWQRwui0EXPn';
    
    if (!uriOrUrl) return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;

    if (uriOrUrl.includes('spotify:')) {
      const parts = uriOrUrl.split(':');
      if (parts.length >= 3) {
        type = parts[parts.length - 2];
        id = parts[parts.length - 1];
      }
    } else if (uriOrUrl.includes('spotify.com/')) {
      const cleanUrl = uriOrUrl.split('?')[0];
      const match = cleanUrl.match(/\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
      if (match) {
        type = match[1];
        id = match[2];
      }
    }
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  };

  const fetchCurrentPlayback = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setIsLoadingTrack(true);
    try {
      const token = await getValidAccessToken(userId);
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        const data = await response.json();
        if (data && data.item) {
          setCurrentTrack({
            name: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(', '),
            albumArt: data.item.album.images[0]?.url || '',
            isPlaying: data.is_playing
          });
          setIsLoadingTrack(false);
          return;
        }
      }
      setCurrentTrack(null);
    } catch (error) {
      console.error("Error retrieving active player status from Spotify:", error);
    } finally {
      setIsLoadingTrack(false);
    }
  };

  const handleSpotifyAction = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const token = await getValidAccessToken(userId);
      let method = 'POST';
      let url = `https://api.spotify.com/v1/me/player/${action}`;
      if (action === 'play' || action === 'pause') {
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTimeout(fetchCurrentPlayback, 600);
    } catch (error) {
      console.error(`Error applying action ${action} on Spotify:`, error);
    }
  };

  // Live token sync check
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const tokenDocRef = doc(db, 'users', userId, 'spotifyTokens', 'data');
    const unsubscribe = onSnapshot(tokenDocRef, (snap) => {
      const exists = snap.exists();
      setSpotifyConnected(exists);
      if (exists) {
        fetchCurrentPlayback();
        fetchUserPlaylists();
      }
    }, (err) => {
      console.error("Error setting up Spotify token socket:", err);
    });

    return () => unsubscribe();
  }, []);

  // Fetch playlists when spotifyConnected changes
  useEffect(() => {
    if (spotifyConnected) {
      fetchUserPlaylists();
    }
  }, [spotifyConnected]);

  // Soft refresh interval for background updates
  useEffect(() => {
    if (!spotifyConnected) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCurrentPlayback();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [spotifyConnected]);

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
      
      if (userData.notificationsEnabled && userData.notificationSettings?.pomodoroAlerts !== false) {
        notificationService.sendNotification("C'est l'heure de la pause ! ☕️", {
          body: "Bravo pour ta session de travail. Prends 5 minutes pour souffler.",
          tag: 'pomodoro-break'
        });
      } else {
        alert("C'est l'heure de la pause ! ☕️");
      }
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
      
      if (userData.notificationsEnabled && userData.notificationSettings?.pomodoroAlerts !== false) {
        notificationService.sendNotification("Au travail ! 💪", {
          body: "Ta pause est finie. C'est reparti pour 25 minutes de focus.",
          tag: 'pomodoro-work'
        });
      } else {
        alert("Au travail ! 💪");
      }
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
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto w-full animate-in fade-in scale-95 duration-500 pb-10">
      
      {/* Colonne de gauche : Pomodoro Timer */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full bg-white/5 p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-xl">
        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
          <button 
            onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'work' ? `${currentTheme.primary} text-white` : 'opacity-60 hover:bg-white/5'}`}
          >
            <Brain size={18} /> Travail
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? `${currentTheme.primary} text-white` : 'opacity-60 hover:bg-white/5'}`}
          >
            <Coffee size={18} /> Pause
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Animated Circle */}
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-white/5 flex items-center justify-center relative overflow-hidden">
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
            className="p-4 rounded-full bg-white/5 text-[var(--text)] opacity-60 hover:bg-white/10 transition-all shadow-sm"
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
            className="p-4 rounded-full bg-white/5 text-[var(--text)] opacity-60 hover:bg-white/10 transition-all shadow-sm"
          >
            <Bell size={28} />
          </button>
        </div>

        <div className="w-full max-w-md">
          <h3 className="text-center font-bold opacity-40 mb-4 text-xs uppercase tracking-widest">Sur quelle tâche travailles-tu ?</h3>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-[var(--primary)] outline-none transition-all"
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

      {/* Colonne de droite : Spotify Companion Card */}
      <div className="w-full lg:max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 shadow-xl flex flex-col space-y-6 self-stretch justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954]">
                <Music size={22} className={currentTrack?.isPlaying ? "animate-spin" : ""} />
              </div>
              <div>
                <h4 className="font-black text-lg tracking-tight">Ambiance Spotify</h4>
                <p className="text-[10px] uppercase font-bold opacity-40 tracking-wider">Compagnon de concentration</p>
              </div>
            </div>
            {spotifyConnected && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-[#1DB954]/15 text-[#1DB954] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#1DB954] " /> CONNECTÉ
              </span>
            )}
          </div>

          {!spotifyConnected ? (
            /* NON_CONNECTED VIEW */
            <div className="flex flex-col items-center justify-center text-center py-12 px-2 space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-white/20 border border-white/10">
                <Disc size={44} className="animate-pulse text-[#1DB954]" />
              </div>
              <div className="space-y-2">
                <p className="font-extrabold text-sm text-[var(--text)]">Besoin de musique de focus ?</p>
                <p className="text-xs text-[var(--text)] opacity-50 max-w-xs leading-relaxed">
                  Ligue ton compte Spotify pour lancer des playlists zen directement depuis Evo, contrôler tes pistes préférées et maximiser ta concentration.
                </p>
              </div>
              <button
                onClick={redirectToSpotifyAuth}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#1DB954]/20"
              >
                <Radio size={16} /> ASSOCIER SPOTIFY
              </button>

              {/* Aide de configuration pour le redirect_uri */}
              <div className="w-full pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowConfigHelp(!showConfigHelp)}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  {showConfigHelp ? 'Masquer' : '💡 Résoudre l\'erreur "redirect_uri" ?'}
                </button>
                {showConfigHelp && (
                  <div className="mt-3 text-left bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] leading-relaxed space-y-3 opacity-95 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="font-extrabold text-[#1DB954]">
                      Pourquoi cette erreur survient ?
                    </p>
                    <p className="opacity-70">
                      Spotify rejette la connexion car l'adresse d'aperçu de cette application n'est pas encore déclarée dans ton tableau de bord Spotify Developer.
                    </p>
                    <p className="font-extrabold text-[var(--text)]">
                      Solution en 2 étapes rapides :
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 opacity-80 font-medium">
                      <li>
                        Va sur ton <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#1DB954] underline inline-flex items-center gap-0.5 font-bold">Spotify Developer Dashboard <ExternalLink size={10} /></a>.
                      </li>
                      <li>
                        Choisis ton application, va dans <strong>Settings</strong>, puis ajoute l'URI ci-dessous dans la section <strong>Redirect URIs</strong> et enregistre :
                      </li>
                    </ol>
                    <div className="flex items-center gap-2 mt-2 bg-black/40 border border-white/5 p-2 rounded-xl">
                      <code className="text-[10px] font-mono text-white/90 truncate flex-1 select-all">
                        {SPOTIFY_REDIRECT_URI}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(SPOTIFY_REDIRECT_URI);
                          setCopiedRedirectUri(true);
                          setTimeout(() => setCopiedRedirectUri(false), 2000);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${copiedRedirectUri ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 hover:bg-white/15'}`}
                      >
                        {copiedRedirectUri ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <p className="text-[10px] opacity-40 italic text-center">
                      Astuce : Pense également à y ajouter tes deux adresses (Vercel Prod et Localhost) pour pouvoir te connecter partout sans encombre !
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CONNECTED VIEW */
            <div className="space-y-6 mt-4">
              {/* Tabs */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setSpotifyActiveTab('embed')}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition-all ${spotifyActiveTab === 'embed' ? 'bg-white/10 text-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                >
                  Lecteur Intégré
                </button>
                <button
                  onClick={() => setSpotifyActiveTab('remote')}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${spotifyActiveTab === 'remote' ? 'bg-white/10 text-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                >
                  Télécommande
                  {currentTrack?.isPlaying && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              </div>

              {spotifyActiveTab === 'embed' ? (
                /* EMBED IFRAME INTERACTIVE PLAYER */
                <div className="space-y-4">
                  {/* Playlist Fast Selector */}
                  <div className="space-y-4">
                    {userPlaylists.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-white/40 tracking-wider">
                            📁 Mes Playlists Personnelles ({userPlaylists.length})
                          </label>
                          <button
                            type="button"
                            onClick={fetchUserPlaylists}
                            disabled={isLoadingPlaylists}
                            className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw size={10} className={isLoadingPlaylists ? "animate-spin" : ""} /> Actualiser
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                          {userPlaylists.map((pl) => (
                            <button
                              key={pl.id}
                              type="button"
                              onClick={() => handleSelectPlaylist(pl.url)}
                              className={`py-2 px-3 rounded-xl border text-left text-xs font-bold truncate transition-all ${
                                customPlaylist === pl.url 
                                  ? `${currentTheme.primary} border-transparent text-white` 
                                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-[var(--text)]'
                              }`}
                              title={pl.name}
                            >
                              🎵 {pl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 px-3">
                        {isLoadingPlaylists ? (
                          <div className="flex items-center justify-center gap-2 text-xs py-2 opacity-60">
                            <RefreshCw size={12} className="animate-spin text-[#1DB954]" />
                            <span>Chargement de tes playlists...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-[11px] font-bold opacity-50">Aucune playlist personnelle trouvée.</p>
                            <button
                              type="button"
                              onClick={redirectToSpotifyAuth}
                              className="text-[10px] font-extrabold text-[#1DB954] hover:underline"
                            >
                              Re-lier mon compte pour accorder l'accès aux playlists ➔
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <label className="text-[10px] font-black uppercase text-white/40 tracking-wider">
                        🧘 Suggestions Concentration
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {curatedPlaylists.map((pl) => (
                          <button
                            key={pl.name}
                            type="button"
                            onClick={() => handleSelectPlaylist(pl.url)}
                            className={`py-2 px-3 rounded-xl border text-left text-xs font-bold truncate transition-all ${
                              customPlaylist === pl.url 
                                ? `${currentTheme.primary} border-transparent text-white` 
                                : 'bg-white/5 hover:bg-white/10 border-white/5 text-[var(--text)]'
                            }`}
                          >
                            {pl.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Manual URL input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 opacity-30" />
                      <input
                        type="text"
                        placeholder="Lien Spotify (Playlist, album...)"
                        value={playlistInput}
                        onChange={(e) => setPlaylistInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-1 ring-[var(--primary)] transition-all placeholder:opacity-30 font-semibold"
                      />
                    </div>
                    <button
                      onClick={() => playlistInput && handleSelectPlaylist(playlistInput)}
                      className="px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-all"
                    >
                      OK
                    </button>
                  </div>

                  {/* Embed Iframe */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 w-full h-[180px] sm:h-[220px]">
                    <iframe
                      src={getEmbedUrl(customPlaylist)}
                      width="100%"
                      height="100%"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="absolute inset-0"
                    />
                  </div>
                </div>
              ) : (
                /* REMOTE CONTROL ACTIVE DEVICE */
                <div className="space-y-6 py-2">
                  {currentTrack ? (
                    <div className="flex flex-col items-center space-y-4">
                      {/* Album cover display */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white/5 bg-black/40 flex items-center justify-center">
                        <img
                          src={currentTrack.albumArt || "/api/placeholder/150/150"}
                          alt="Album jacket"
                          className={`w-full h-full object-cover rounded-full ${currentTrack.isPlaying ? 'animate-spin [animation-duration:15s]' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/10 rounded-full flex items-center justify-center">
                          <div className="w-5 h-5 bg-black rounded-full border border-white/20 shadow-inner" />
                        </div>
                      </div>

                      {/* Song details */}
                      <div className="text-center space-y-1 max-w-[280px]">
                        <h5 className="font-extrabold text-[15px] truncate text-[var(--text)]">{currentTrack.name}</h5>
                        <p className="text-xs opacity-50 truncate font-bold text-[var(--text)]">{currentTrack.artist}</p>
                      </div>

                      {/* Media controls */}
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => handleSpotifyAction('previous')}
                          className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/85 transition-all text-sm active:scale-90"
                          title="Précédent"
                        >
                          <SkipBack size={18} fill="currentColor" />
                        </button>
                        <button
                          onClick={() => handleSpotifyAction(currentTrack.isPlaying ? 'pause' : 'play')}
                          className={`p-4 rounded-full ${currentTheme.primary} hover:scale-105 text-white shadow-md active:scale-90 transition-all`}
                          title={currentTrack.isPlaying ? "Pause" : "Lecture"}
                        >
                          {currentTrack.isPlaying ? (
                            <Pause size={20} fill="currentColor" />
                          ) : (
                            <Play size={20} fill="currentColor" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSpotifyAction('next')}
                          className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/85 transition-all text-sm active:scale-90"
                          title="Suivant"
                        >
                          <SkipForward size={18} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* EMPTY/STANDBY DEVICE NOT ACTIVE REMOTE VIEW */
                    <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                      <Disc size={36} className="text-white/30 animate-pulse" />
                      <div className="space-y-1 text-center">
                        <p className="font-extrabold text-xs text-[var(--text)]">Aucun flux actif détecté</p>
                        <p className="text-[11px] leading-relaxed opacity-50 text-[var(--text)] max-w-xs">
                          Ouvre l'application Spotify sur ton ordinateur, mobile ou tablette, puis lance une piste pour pouvoir la piloter à distance.
                        </p>
                      </div>
                      <button
                        onClick={fetchCurrentPlayback}
                        disabled={isLoadingTrack}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-wider text-white"
                      >
                        <RefreshCw size={11} className={isLoadingTrack ? "animate-spin" : ""} />
                        Forcer la détection
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-center opacity-30 leading-snug font-semibold bg-white/5 p-3 rounded-xl">
                    ⚠️ La télécommande API requiert un compte Spotify Premium. Si tu es en gratuit, utilise le "Lecteur Intégré" !
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer instructions when connected */}
        {spotifyConnected && (
          <div className="text-[10px] opacity-35 hover:opacity-50 transition-all border-t border-white/5 pt-3 flex justify-between items-center w-full mt-auto">
            <span className="font-bold flex items-center gap-1"><ExternalLink size={10} /> PKCE sécurisée</span>
            <button
              onClick={async () => {
                if (confirm("Se déconnecter de Spotify ?")) {
                  const tokenDocRef = doc(db, 'users', auth.currentUser?.uid || '', 'spotifyTokens', 'data');
                  await deleteDoc(tokenDocRef);
                }
              }}
              className="text-red-400 hover:text-red-500 font-extrabold uppercase hover:underline"
            >
              Déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pomodoro;
