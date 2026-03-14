
import React, { useState } from 'react';
import { Task, ThemeType, TaskStatus, Unavailability } from '../../types';
import { THEMES } from '../../constants';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, CalendarDays, BrainCircuit, Loader2, Info, Lock } from 'lucide-react';

interface SmartPlanningProps {
  tasks: Task[];
  unavailabilities: Unavailability[];
  theme: ThemeType;
}

const SmartPlanning: React.FC<SmartPlanningProps> = ({ tasks, unavailabilities, theme }) => {
  const currentTheme = THEMES[theme] || THEMES['midnight'];
  const [planning, setPlanning] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [justification, setJustification] = useState('');

  const generatePlanning = async () => {
    setIsLoading(true);
    try {
      // Use the injected API_KEY from process.env for the GoogleGenAI instance
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const activeTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
      
      const prompt = `Agis comme un expert en productivité EdTech. Voici mes données :
      
      TACHES :
      ${JSON.stringify(activeTasks.map(t => ({ 
        titre: t.title, 
        priorite: t.priority, 
        difficulte: t.difficulty, 
        quadrant: t.quadrant, 
        duree_estimee: t.estimatedMinutes 
      })))}
      
      INDISPONIBILITÉS (Créneaux où l'utilisateur n'est PAS disponible) :
      ${JSON.stringify(unavailabilities.map(u => ({
        jour: u.day,
        debut: u.startTime,
        fin: u.endTime,
        raison: u.reason
      })))}
      
      Génère un planning hebdomadaire optimisé au format JSON. 
      Règles CRITIQUES : 
      1. NE PLANIFIE AUCUNE TÂCHE pendant les créneaux d'indisponibilité listés.
      2. Alterne les tâches difficiles avec les tâches faciles.
      3. Priorise les tâches 'DO_FIRST'.
      4. Les créneaux horaires doivent être précis (ex: "14:30 - 15:30") et tenir compte de la durée estimée.
      
      Format attendu :
      {
        "justification": "Ma stratégie pour cette semaine : ...",
        "days": [
          { "day": "Lundi", "slots": [{ "time": "14:30 - 15:30", "task": "...", "reason": "Placé ici car..." }] }
        ]
      }`;

      // Call generateContent with the model name and contents as specified in the guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      // Directly access the text property of GenerateContentResponse
      const result = JSON.parse(response.text || '{}');
      setPlanning(result.days || []);
      setJustification(result.justification || '');
    } catch (error) {
      console.error("AI Error:", error);
      alert("Erreur lors de la génération du planning. Vérifie ta connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className={`${currentTheme.card} p-8 rounded-[2rem] border ${currentTheme.accent} shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <BrainCircuit size={160} className={currentTheme.secondary} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
            <Sparkles className="text-[var(--primary)]" /> Planning Sur-Mesure
          </h2>
          <p className="text-[var(--text)]/60 max-w-2xl mb-8">
            L'IA prend désormais en compte tes <span className="font-bold text-[var(--text)]">{unavailabilities.length} créneaux bloqués</span> pour te proposer un emploi du temps 100% réaliste.
          </p>
          
          <button 
            onClick={generatePlanning}
            disabled={isLoading || tasks.filter(t => t.status !== TaskStatus.DONE).length === 0}
            className={`${currentTheme.primary} text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg hover:opacity-90 transition-all disabled:opacity-50 active:scale-95`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isLoading ? 'Calcul du meilleur créneau...' : 'Générer mon planning intelligent'}
          </button>
        </div>
      </div>

      {justification && (
        <div className="bg-[var(--primary)]/10 p-4 rounded-2xl border border-[var(--primary)]/20 flex items-start gap-3">
          <Info className="text-[var(--primary)] mt-1 flex-shrink-0" />
          <p className="text-sm text-[var(--text)] italic">{justification}</p>
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
                {/* Fixed: Moved 'title' from Lock icon to a wrapping span to fix TypeScript error */}
                {unavailabilities.some(u => u.day === dayData.day) && (
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
                    <p className="font-bold text-sm leading-tight">{slot.task}</p>
                    <p className="text-[10px] text-[var(--text)]/40 mt-1 italic leading-tight">{slot.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : !isLoading && (
          <div className="col-span-full py-20 text-center text-[var(--text)]/40">
            {tasks.filter(t => t.status !== TaskStatus.DONE).length === 0 
              ? "Ajoute des tâches pour voir l'IA à l'œuvre ! 📝"
              : "Clique sur le bouton pour que l'IA contourne tes créneaux bloqués."}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartPlanning;
