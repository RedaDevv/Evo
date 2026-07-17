
import React, { useState, useEffect } from 'react';
import { Task, ThemeType, TaskStatus, Unavailability, UserData } from '../../types';
import { THEMES } from '../../constants';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, 
  CalendarDays, 
  BrainCircuit, 
  Loader2, 
  Info, 
  Lock, 
  Calendar, 
  Check, 
  AlertCircle,
  Link,
  CalendarCheck,
  ArrowRight,
  Crown
} from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { googleCalendarService, GoogleCalendarEvent } from '../../services/googleCalendarService';

interface SmartPlanningProps {
  tasks: Task[];
  unavailabilities: Unavailability[];
  theme: ThemeType;
  userData?: Partial<UserData>;
  onGoToSettings?: () => void;
}

const SmartPlanning: React.FC<SmartPlanningProps> = ({ tasks, unavailabilities, theme, userData, onGoToSettings }) => {
  const currentTheme = THEMES[theme] || THEMES['midnight'];
  const isPremium = !!userData?.isPremium;
  const [planning, setPlanning] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [justification, setJustification] = useState('');

  // Google Calendar integration states
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gcalEvents, setGcalEvents] = useState<GoogleCalendarEvent[]>([]);
  const [gcalUnavailabilities, setGcalUnavailabilities] = useState<Unavailability[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState('');

  // Load access token and fetch current week's events on mount if previously connected
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await firebaseService.getGoogleAccessToken();
        if (token) {
          setAccessToken(token);
          fetchGoogleEvents(token);
        }
      } catch (err) {
        console.error("Error loading Google Access Token:", err);
      }
    };
    checkToken();
  }, []);

  // Get current week Monday to Sunday date range
  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Monday is index 1. If Sunday, go back 6 days.
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      timeMin: monday.toISOString(),
      timeMax: sunday.toISOString(),
      mondayDate: monday
    };
  };

  // Maps true calendar dates back to simplified French weekly day names
  const mapGoogleEventsToUnavailabilities = (events: GoogleCalendarEvent[]): Unavailability[] => {
    const daysMapping: { [key: number]: string } = {
      1: 'Lundi',
      2: 'Mardi',
      3: 'Mercredi',
      4: 'Jeudi',
      5: 'Vendredi',
      6: 'Samedi',
      0: 'Dimanche'
    };

    return events.map((event, index) => {
      const startStr = event.start.dateTime || event.start.dateTime || '';
      if (!startStr) return null;
      
      const start = new Date(startStr);
      const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(start.getTime() + 60 * 60 * 1000);
      const dayName = daysMapping[start.getDay()];
      
      const formatTime = (date: Date) => {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      };

      return {
        id: `gcal-${event.id || index}`,
        day: dayName || 'Lundi',
        startTime: formatTime(start),
        endTime: formatTime(end),
        reason: `${event.summary || 'Occupation'}`
      };
    }).filter(item => item !== null) as Unavailability[];
  };

  const fetchGoogleEvents = async (token: string) => {
    try {
      const { timeMin, timeMax } = getWeekRange();
      const events = await googleCalendarService.listEvents(token, timeMin, timeMax);
      setGcalEvents(events);
      const calendarUnavailabilities = mapGoogleEventsToUnavailabilities(events);
      setGcalUnavailabilities(calendarUnavailabilities);
    } catch (err) {
      console.error("Error listing calendar events:", err);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    setExportError('');
    try {
      const token = await firebaseService.requestGoogleAccessToken();
      if (token) {
        setAccessToken(token);
        await fetchGoogleEvents(token);
      }
    } catch (err: any) {
      console.error("Failed to connect Google Calendar:", err);
      setExportError("Impossible de lier Google Calendar. Réessaye.");
    } finally {
      setIsConnecting(false);
    }
  };

  const generatePlanning = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const activeTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
      
      // Merge local unavailability constraints with dynamic Google Calendar events for full conflicts analysis
      const allUnavailabilities = [...unavailabilities, ...gcalUnavailabilities];
      
      const prompt = `Agis comme un expert en productivité EdTech. Voici mes données :
      
      TACHES :
      ${JSON.stringify(activeTasks.map(t => ({ 
        titre: t.title, 
        priorite: t.priority, 
        difficulte: t.difficulty, 
        quadrant: t.quadrant, 
        duree_estimee: t.estimatedMinutes 
      })))}
      
      INDISPONIBILITÉS (Fusion des contraintes de l'agenda Google Calendar et des contraintes locales) :
      ${JSON.stringify(allUnavailabilities.map(u => ({
        jour: u.day,
        debut: u.startTime,
        fin: u.endTime,
        raison: u.reason
      })))}
      
      Génère un planning hebdomadaire d'études optimisé au format JSON. 
      Règles CRITIQUES : 
      1. NE PLANIFIE AUCUNE TÂCHE pendant les créneaux d'indisponibilité listés (particulièrement ceux marqués "Google Calendar:").
      2. Alterne les tâches difficiles avec les tâches faciles pour éviter l'épuisement cognitif.
      3. Planifie en "Deep Work blocs" de 50 à 90 minutes.
      4. Priorise rigoureusement les tâches 'DO_FIRST' et 'SCHEDULE'.
      5. Les créneaux horaires doivent être précis (ex: "14:30 - 15:30") et tenir compte de la durée estimée.
      
      Format attendu :
      {
        "justification": "Ma stratégie pour cette semaine : ...",
        "days": [
          { 
            "day": "Lundi", 
            "slots": [
              { "time": "14:30 - 15:30", "task": "Nom de la Tâche", "reason": "Raison stratégique du placement" }
            ] 
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setPlanning(result.days || []);
      setJustification(result.justification || '');
      setExportSuccess(false);
      setExportError('');
    } catch (error) {
      console.error("AI Error:", error);
      alert("Erreur lors de la génération du planning. Vérifie ta connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeterministicPlanning = () => {
    setIsLoading(true);
    try {
      const activeTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
      if (activeTasks.length === 0) {
        alert("Ajoute des tâches actives pour planifier tes révisions !");
        setIsLoading(false);
        return;
      }

      // Merge local unavailability constraints with dynamic Google Calendar events for full conflicts analysis
      const allUnavailabilities = [...unavailabilities, ...gcalUnavailabilities];

      // Define potential daily slots ordered by general preference
      const potentialSlots = [
        { time: "09:00 - 10:30", start: "09:00", end: "10:30" },
        { time: "14:00 - 15:30", start: "14:00", end: "15:30" },
        { time: "10:45 - 12:15", start: "10:45", end: "12:15" },
        { time: "15:45 - 17:15", start: "15:45", end: "17:15" },
        { time: "18:00 - 19:30", start: "18:00", end: "19:30" }
      ];

      // Check overlap helper with normalized time check
      const isOverlapping = (day: string, slotStart: string, slotEnd: string) => {
        const [sh, sm] = slotStart.split(':').map(Number);
        const [eh, em] = slotEnd.split(':').map(Number);
        const sMin = sh * 60 + sm;
        const eMin = eh * 60 + em;

        const dayUnavailabilities = allUnavailabilities.filter(
          u => u.day.trim().toLowerCase() === day.trim().toLowerCase()
        );

        for (const u of dayUnavailabilities) {
          const [ush, usm] = u.startTime.split(':').map(Number);
          const [ueh, uem] = u.endTime.split(':').map(Number);
          const uStartMin = ush * 60 + usm;
          const uEndMin = ueh * 60 + uem;

          // Check if there is intersection
          if (sMin < uEndMin && uStartMin < eMin) {
            return true;
          }
        }
        return false;
      };

      // Weight tasks by priority/urgency
      const getTaskWeight = (t: Task) => {
        let weight = 0;
        if (t.quadrant === 'do_first') weight += 1000;
        else if (t.quadrant === 'schedule') weight += 500;
        else if (t.quadrant === 'delegate') weight += 200;

        if (t.priority === 'high') weight += 100;
        else if (t.priority === 'medium') weight += 50;
        return weight;
      };

      const sortedTasks = [...activeTasks].sort((a, b) => getTaskWeight(b) - getTaskWeight(a));

      // Build a flat list of study blocks needed based on the tasks' estimated durations
      const blocksQueue: Task[] = [];
      for (const t of sortedTasks) {
        const estimated = t.estimatedMinutes || 90;
        // Each block is 90 minutes. Require at least 1 block, cap at 4 blocks per task to remain realistic
        const blocksCount = Math.min(4, Math.max(1, Math.ceil(estimated / 90)));
        for (let i = 0; i < blocksCount; i++) {
          blocksQueue.push(t);
        }
      }

      const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
      const daySlots: { [day: string]: any[] } = {};
      daysOfWeek.forEach(d => {
        daySlots[d] = [];
      });

      // Track which task IDs are scheduled on a given day to maximize variety
      const scheduledTasksOnDay: { [day: string]: Set<string> } = {};
      daysOfWeek.forEach(d => {
        scheduledTasksOnDay[d] = new Set();
      });

      // Round-robin pass over days of the week to distribute tasks evenly (up to 5 study blocks per day)
      const maxPasses = 5;
      for (let pass = 0; pass < maxPasses; pass++) {
        if (blocksQueue.length === 0) break;

        for (const day of daysOfWeek) {
          if (blocksQueue.length === 0) break;

          // Check if day is already fully packed
          if (daySlots[day].length >= potentialSlots.length) continue;

          // Find the first available non-overlapping slot on this day
          let targetSlot = null;
          for (const slot of potentialSlots) {
            const alreadyChosen = daySlots[day].some(s => s.time === slot.time);
            if (!alreadyChosen && !isOverlapping(day, slot.start, slot.end)) {
              targetSlot = slot;
              break;
            }
          }

          if (!targetSlot) continue; // No available slot due to manual or GCal unavailability constraints

          // Select a task from the remaining queue that hasn't been scheduled on this day yet
          let taskIndexToPick = -1;
          for (let i = 0; i < blocksQueue.length; i++) {
            const task = blocksQueue[i];
            if (!scheduledTasksOnDay[day].has(task.id)) {
              taskIndexToPick = i;
              break;
            }
          }

          // If all tasks in queue have already been scheduled on this day, pick one that is at least
          // different from the last scheduled block of this day
          if (taskIndexToPick === -1) {
            const lastSlotOnDay = daySlots[day][daySlots[day].length - 1];
            if (lastSlotOnDay) {
              for (let i = 0; i < blocksQueue.length; i++) {
                if (blocksQueue[i].title !== lastSlotOnDay.task) {
                  taskIndexToPick = i;
                  break;
                }
              }
            }
            if (taskIndexToPick === -1) {
              taskIndexToPick = 0; // complete fallback
            }
          }

          const chosenTask = blocksQueue.splice(taskIndexToPick, 1)[0];
          scheduledTasksOnDay[day].add(chosenTask.id);

          let reason = `Priorité accordée (${chosenTask.quadrant === 'do_first' ? 'Action urgente' : 'Planification'}).`;
          if (targetSlot.start === "09:00" || targetSlot.start === "10:45") {
            reason += " Placé en matinée pour exploiter au mieux ton attention maximale.";
          } else if (targetSlot.start === "18:00") {
            reason += " Placé en fin de journée pour cimenter les apprentissages.";
          } else {
            reason += " Planification intermédiaire optimisée selon tes limites de temps.";
          }

          daySlots[day].push({
            time: targetSlot.time,
            task: chosenTask.title,
            reason: reason,
            sortKey: targetSlot.start
          });
        }
      }

      // Gather non-empty days and sort their scheduled slots chronologically
      const generatedDays: any[] = [];
      for (const day of daysOfWeek) {
        const slotsForDay = daySlots[day];
        if (slotsForDay.length > 0) {
          slotsForDay.sort((a, b) => {
            const [ah, am] = a.sortKey.split(':').map(Number);
            const [bh, bm] = b.sortKey.split(':').map(Number);
            return (ah * 60 + am) - (bh * 60 + bm);
          });

          const cleanSlots = slotsForDay.map(s => ({
            time: s.time,
            task: s.task,
            reason: s.reason
          }));

          generatedDays.push({
            day,
            slots: cleanSlots
          });
        }
      }

      setPlanning(generatedDays);
      setJustification("Ton emploi du temps a été ajusté dynamiquement de manière déterministe par l'algorithme d'Evo. Tous les créneaux d'indisponibilité physique et les évènements de ton agenda synchronisé Google Calendar ont été évités, sans utiliser de jetons d'IA.");
      setExportSuccess(false);
      setExportError('');

    } catch (err) {
      console.error("Error creating deterministic schedule:", err);
      alert("Une erreur est survenue lors de la planification automatique.");
    } finally {
      setIsLoading(false);
    }
  };

  // Exports generated study blocks to Google Calendar
  const handleExportToGoogleCalendar = async () => {
    if (!accessToken) {
      // Prompt OAuth link connection
      await handleConnectCalendar();
      return;
    }

    const confirmExport = window.confirm(
      `Es-tu sûr de vouloir exporter ce planning d'études vers ton agenda Google ? Des créneaux de Deep Work y seront ajoutés.`
    );
    if (!confirmExport) return;

    setIsExporting(true);
    setExportError('');
    setExportSuccess(false);

    try {
      const { mondayDate } = getWeekRange();
      const dayOffsetMapping: { [key: string]: number } = {
        'Lundi': 0,
        'Mardi': 1,
        'Mercredi': 2,
        'Jeudi': 3,
        'Vendredi': 4,
        'Samedi': 5,
        'Dimanche': 6
      };

      for (const dayData of planning) {
        const offset = dayOffsetMapping[dayData.day];
        if (offset === undefined) continue;

        // Base date for this day
        const dayDate = new Date(mondayDate);
        dayDate.setDate(mondayDate.getDate() + offset);

        for (const slot of dayData.slots) {
          const times = slot.time.split(' - ');
          if (times.length !== 2) continue;

          const [timeStart, timeEnd] = times;
          const [startH, startM] = timeStart.split(':').map(Number);
          const [endH, endM] = timeEnd.split(':').map(Number);

          const startEvent = new Date(dayDate);
          startEvent.setHours(startH, startM, 0, 0);

          const endEvent = new Date(dayDate);
          endEvent.setHours(endH, endM, 0, 0);

          const eventBody = {
            summary: `📚 Révison : ${slot.task} - Evo V2`,
            description: `Session d'étude planifiée intelligemment par l'assistant Evo V2.\n\n🎯 Objectif : ${slot.task}\n💡 Raisonnement d'optimisation : ${slot.reason || ''}\n\nReçois des notifications de rappel pour démarrer ton focus à l'heure !`,
            start: {
              dateTime: startEvent.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: endEvent.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            reminders: {
              useDefault: true
            }
          };

          await googleCalendarService.createEvent(accessToken, eventBody);
        }
      }

      setExportSuccess(true);
    } catch (err: any) {
      console.error("Error exporting events to Google Calendar:", err);
      setExportError("Erreur lors de l'envoi vers Google Calendar. Vérifie tes permissions.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Google Calendar Connection Status Bar */}
      <div className={`${currentTheme.card} p-5 rounded-3xl border ${currentTheme.accent} shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden`}>
        {!isPremium && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex items-center justify-between px-6 animate-in fade-in duration-300">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Crown size={14} className="animate-pulse fill-amber-400/20" /> Synchronisation Google Calendar
            </span>
            <button 
              onClick={onGoToSettings}
              className="px-4 py-2 bg-amber-450 hover:bg-amber-500 rounded-xl font-bold text-[10px] text-black tracking-wider uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Débloquer Premium
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${accessToken ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[var(--text)]">Google Calendar Sync</h4>
            <p className="text-xs opacity-50 font-bold">
              {accessToken 
                ? `Connecté avec succès. ${gcalUnavailabilities.length} contraintes de conflits récupérées de ton agenda précieux.`
                : "Synchronise tes révisions et évite les double-bookings en connectant ton compte Google."
              }
            </p>
          </div>
        </div>
        <div>
          {accessToken ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-green-500/10 text-green-500 border border-green-500/20">
                <Check size={12} strokeWidth={3} /> ACTIF
              </span>
              <button 
                onClick={handleConnectCalendar}
                disabled={isConnecting}
                className="text-xs font-black opacity-50 hover:opacity-100 transition-all uppercase tracking-widest px-3 py-2"
              >
                Reconnecter
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectCalendar}
              disabled={isConnecting}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all bg-blue-600 hover:bg-blue-700 text-white`}
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link size={14} />}
              Associer Google Calendar
            </button>
          )}
        </div>
      </div>

      <div className={`${currentTheme.card} p-8 rounded-[2rem] border ${currentTheme.accent} shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <BrainCircuit size={160} className={currentTheme.secondary} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
            <Sparkles className="text-[var(--primary)]" /> Planning d'Études
          </h2>
          <p className="text-[var(--text)]/60 max-w-2xl mb-8">
            Optimisez votre temps de travail. L'outil prend en compte vos <span className="font-bold text-[var(--text)]">{unavailabilities.length} indisponibilités</span> 
            {gcalUnavailabilities.length > 0 && (
              <span> et vos <span className="font-bold text-blue-500">{gcalUnavailabilities.length} événements Google Calendar</span></span>
            )} pour vous proposer un planning d'études structuré et réaliste.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {isPremium ? (
              <button 
                onClick={generatePlanning}
                disabled={isLoading || tasks.filter(t => t.status !== TaskStatus.DONE).length === 0}
                className={`${currentTheme.primary} text-white px-6 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 flex-1`}
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                Générer avec l'Assistant IA
              </button>
            ) : (
              <button 
                onClick={onGoToSettings}
                className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex-1 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-black/10" />
                Activer l'Assistant Intelligent (Premium)
              </button>
            )}

            <button 
              onClick={generateDeterministicPlanning}
              disabled={isLoading || tasks.filter(t => t.status !== TaskStatus.DONE).length === 0}
              className="bg-white/5 hover:bg-white/10 text-[var(--text)] border border-white/10 px-6 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg transition-all disabled:opacity-50 active:scale-95 flex-1"
            >
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              Générer un Planning Classique
            </button>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-sm font-bold text-red-500">{exportError}</p>
        </div>
      )}

      {exportSuccess && (
        <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <CalendarCheck className="text-green-500" />
          <p className="text-sm font-black text-green-500">Planning exporté avec succès ! Reçois tes alertes sur ton mobile ou ordinateur. 🎉</p>
        </div>
      )}

      {justification && (
        <div className="bg-[var(--primary)]/10 p-4 rounded-2xl border border-[var(--primary)]/20 flex items-start gap-3">
          <Info className="text-[var(--primary)] mt-1 flex-shrink-0" />
          <p className="text-sm text-[var(--text)] italic">{justification}</p>
        </div>
      )}

      {/* Synchronize actions panel */}
      {planning.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
          <div>
            <h3 className="text-base font-black">Prêt à réviser ?</h3>
            <p className="text-xs opacity-50">Réserve ces créneaux d'études directement dans ton calendrier.</p>
          </div>
          <button
            onClick={handleExportToGoogleCalendar}
            disabled={isExporting}
            className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all bg-[var(--primary)] text-black`}
          >
            {isExporting ? <Loader2 className="animate-spin" /> : <Calendar size={18} />}
            {isExporting ? 'Exportation en cours...' : 'EXPORTER TOUT VERS GOOGLE CALENDAR'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planning.length > 0 ? (
          planning.map((dayData, idx) => (
            <div key={idx} className={`${currentTheme.card} p-6 rounded-3xl border ${currentTheme.accent} shadow-sm animate-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <CalendarDays size={20} className={currentTheme.secondary} />
                  {dayData.day}
                </h3>
                {((unavailabilities.some(u => u.day === dayData.day)) || 
                  (gcalUnavailabilities.some(u => u.day === dayData.day))) && (
                  <span title="Contraintes détectées">
                    <Lock size={14} className="opacity-30" />
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {dayData.slots.map((slot: any, sIdx: number) => (
                  <div key={sIdx} className="relative pl-4 border-l-2 border-white/10 py-1">
                    <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <span className="text-[10px] font-bold text-[var(--text)]/50 uppercase tracking-widest">{slot.time}</span>
                    <p className="font-bold text-sm leading-tight text-[var(--text)]">{slot.task}</p>
                    <p className="text-[10px] text-[var(--text)]/40 mt-1 italic leading-tight">{slot.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : !isLoading && (
          <div className="col-span-full py-20 text-center text-[var(--text)]/40">
            {tasks.filter(t => t.status !== TaskStatus.DONE).length === 0 
              ? "Ajoutez des tâches pour planifier votre semaine d'études."
              : "Générez un planning d'études optimisé selon vos contraintes d'agenda."}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartPlanning;
