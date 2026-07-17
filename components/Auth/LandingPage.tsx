import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Layers, 
  BarChart3, 
  Clock3, 
  Calendar, 
  ChevronRight, 
  Check, 
  Shield, 
  Scale, 
  Play, 
  Lock, 
  Grid2X2, 
  Timer, 
  ArrowRight,
  Star,
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';
import { LegalModal } from './LegalModal';

interface LandingPageProps {
  onStartAuth: (isLogin: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAuth }) => {
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Active feature tab state for interactive preview
  const [activeTeaserTab, setActiveTeaserTab] = useState<'matrix' | 'focus' | 'planner' | 'stats'>('matrix');

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white overflow-hidden font-sans selection:bg-amber-400 selection:text-black">
      {/* Dynamic Ambient Background Beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[160px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-amber-400/5 rounded-full blur-[140px] animate-pulse duration-[12000ms]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px] animate-pulse duration-[10000ms]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] opacity-75" />
      </div>

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#060814]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-amber-400/20">
              <Sparkles size={20} className="fill-black/10" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-white">Evo</span>
              <span className="text-[9px] font-bold block text-amber-400 uppercase tracking-widest leading-none">Études</span>
            </div>
          </div>

          {/* Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#preview" className="hover:text-white transition-colors">Aperçu Live</a>
            <a href="#pricing" className="hover:text-white transition-colors">Premium</a>
            <a href="#trust" className="hover:text-white transition-colors">Sécurité & Confidentialité</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartAuth(true)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Se connecter
            </button>
            <button
              onClick={() => onStartAuth(false)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-amber-400/10 cursor-pointer"
            >
              S'inscrire ✨
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            className="lg:col-span-6 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-amber-400 font-bold uppercase tracking-wide">
              <Award size={14} className="fill-amber-400/20" /> Élu compagnon idéal d'études 2026
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Reprenez le contrôle de vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">examens et devoirs.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base text-white/60 leading-relaxed max-w-lg font-medium">
              Evo fusionne la rigueur scientifique de la matrice d'Eisenhower, la concentration des ondes binaurales et l'intelligence de planification par IA pour créer un emploi du temps 100% réaliste, adapté à vos contraintes.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => onStartAuth(false)}
                className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-400/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Commencer gratuitement <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Découvrir l'App
              </button>
            </motion.div>

            {/* Micro proof figures */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div>
                <span className="block text-3xl font-black text-white">4.9/5</span>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Note étudiante</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-white">+85%</span>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">De productivité</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-white">0</span>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Publicité Premium</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right Visual: Breathtaking Interactive Mockup Previews */}
          <motion.div 
            className="lg:col-span-6 relative flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Ambient behind glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 to-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

            {/* Simulated app panel */}
            <div className="w-full max-w-lg bg-[#0e1324] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-mono text-white/40">
                  https://app.evo.study/dashboard
                </div>
              </div>

              {/* Layout body teaser */}
              <div className="space-y-4">
                {/* Simulated Wave Card */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400/15 rounded-xl flex items-center justify-center text-amber-400">
                      <Brain size={18} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Ondes Binaurales Actives</h4>
                      <p className="text-[9px] font-bold text-amber-400/60 uppercase tracking-wider">Mode Bêta : Concentration active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce" />
                    <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>

                {/* Simulated Planning Schedule */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white/50">
                    <span className="uppercase tracking-wider text-[9px]">Mon Planning Optimal d'aujourd'hui</span>
                    <span className="text-blue-400 text-[10px] flex items-center gap-1"><Zap size={10} className="fill-blue-400/20" /> Assisté par IA</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-white">Révision Mathématiques (Analyse)</span>
                        <span className="text-[9px] text-white/40">14h00 - 15h30 | Urgent & Important</span>
                      </div>
                      <span className="text-[9px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full">Do First</span>
                    </div>

                    <div className="p-2.5 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-white">Projet d'Informatique (Algorithme)</span>
                        <span className="text-[9px] text-white/40">16h00 - 17h30 | Important non-urgent</span>
                      </div>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">Planifier</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats check */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">Discipline d'étude</span>
                    <span className="text-xl font-black text-emerald-400">92%</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-1">Concentration active</span>
                    <span className="text-xl font-black text-blue-400">4.2 heures</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. APP MODULES SHOWCASE (Features) */}
      <section id="features" className="bg-[#0a0d1d] py-24 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Une méthode éprouvée pour réussir</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Découvrez les 4 piliers d'Evo</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Nous avons éliminé tout superflu pour nous concentrer sur l'essentiel : organiser, concentrer, planifier et évaluer votre travail quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: Eisenhower */}
            <div className="p-6 rounded-3xl bg-[#0e1324] border border-white/5 hover:border-amber-400/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="p-4 w-12 h-12 bg-amber-400/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Grid2X2 size={22} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Matrice d'Eisenhower</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Priorisez vos tâches scolaires selon l'urgence et l'importance réelle. Éliminez la procrastination en sachant exactement quoi faire maintenant.
              </p>
            </div>

            {/* Card 2: Pomodoro & Binaural */}
            <div className="p-6 rounded-3xl bg-[#0e1324] border border-white/5 hover:border-emerald-400/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="p-4 w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Brain size={22} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Ondes Binaurales</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Améliorez votre attention grâce à des générateurs d'ondes Alpha (détente), Bêta (concentration) et Thêta (créativité), combinés à un filtre antibruit rose.
              </p>
            </div>

            {/* Card 3: Smart Planning */}
            <div className="p-6 rounded-3xl bg-[#0e1324] border border-white/5 hover:border-blue-400/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="p-4 w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Calendar size={22} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Planning par l'IA</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                L'assistant IA de Google (Gemini) construit un emploi du temps intelligent qui contourne automatiquement vos heures de cours et vos indisponibilités.
              </p>
            </div>

            {/* Card 4: Progress Tracking */}
            <div className="p-6 rounded-3xl bg-[#0e1324] border border-white/5 hover:border-indigo-400/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="p-4 w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <BarChart3 size={22} />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Statistiques de Session</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Analysez votre régularité, mesurez votre focus, gardez un œil sur votre assiduité et comprenez où va réellement votre temps de travail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TAB TEASER PREVIEW */}
      <section id="preview" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Essayez l'Expérience en Direct</span>
          <h2 className="text-3xl font-black tracking-tight">À quoi ressemble votre nouvel espace de travail ?</h2>
        </div>

        {/* Tab selectors */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTeaserTab('matrix')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTeaserTab === 'matrix' ? 'bg-amber-400 text-black shadow-lg' : 'opacity-60 hover:opacity-100'}`}
          >
            <Grid2X2 size={14} /> Matrice
          </button>
          <button
            onClick={() => setActiveTeaserTab('focus')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTeaserTab === 'focus' ? 'bg-amber-400 text-black shadow-lg' : 'opacity-60 hover:opacity-100'}`}
          >
            <Brain size={14} /> Ondes & Focus
          </button>
          <button
            onClick={() => setActiveTeaserTab('planner')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTeaserTab === 'planner' ? 'bg-amber-400 text-black shadow-lg' : 'opacity-60 hover:opacity-100'}`}
          >
            <Calendar size={14} /> Planning IA
          </button>
          <button
            onClick={() => setActiveTeaserTab('stats')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTeaserTab === 'stats' ? 'bg-amber-400 text-black shadow-lg' : 'opacity-60 hover:opacity-100'}`}
          >
            <BarChart3 size={14} /> Suivi
          </button>
        </div>

        {/* Dynamic teaser output container */}
        <div className="w-full max-w-4xl mx-auto bg-[#0a0d1d] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative min-h-[400px] flex flex-col justify-between shadow-2xl">
          <AnimatePresence mode="wait">
            {activeTeaserTab === 'matrix' && (
              <motion.div 
                key="teaser-matrix"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-6">
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-3 py-1 rounded-full">Méthode Eisenhower</span>
                  <h3 className="text-2xl font-black">La clarté absolue au service de votre productivité</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Triez vos tâches instantanément dans nos 4 quadrants dynamiques : "Faire d'abord" (urgent et important), "Planifier" (important mais non urgent), "Déléguer/Automatiser" (urgent mais non important) et "Éliminer" (ni l'un ni l'autre).
                  </p>
                  <ul className="space-y-3 font-semibold text-xs text-white/70">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-red-400" /> Tri automatique selon vos échéances</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-red-400" /> Interface intuitive de drag-and-drop</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-6 rounded-3xl border border-white/10 grid grid-cols-2 gap-4">
                  <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">1. DO FIRST</span>
                    <span className="block text-xs font-bold text-white leading-normal">Révision Examen de Demain 🚨</span>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">2. SCHEDULE</span>
                    <span className="block text-xs font-bold text-white leading-normal">Fiches de Lecture de Philo</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">3. DELEGATE</span>
                    <span className="block text-xs font-bold text-white/60 leading-normal">Répondre aux Emails de Groupe</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center opacity-40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">4. ELIMINATE</span>
                    <span className="block text-xs leading-normal">Faire défiler TikTok</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTeaserTab === 'focus' && (
              <motion.div 
                key="teaser-focus"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-6">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">Intégration Sonore Avancée</span>
                  <h3 className="text-2xl font-black">Bloquez les distractions avec un cocon acoustique</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Optimisez votre concentration avec notre lecteur de concentration. Choisissez des ondes cérébrales calibrées (Alpha pour assimiler, Bêta pour la logique, Thêta pour la création) et ajoutez un fond de bruit rose ou de vibrations thérapeutiques.
                  </p>
                  <ul className="space-y-3 font-semibold text-xs text-white/70">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Calibration en temps réel</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Filtre antibruit de fond breveté</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-8 rounded-3xl border border-white/10 space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                    25:00
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-white/50">
                      <span>Vibrations Solfeggio (528 Hz)</span>
                      <span className="text-emerald-400">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-[75%] h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider">🧘 Ondes Alpha Actives</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTeaserTab === 'planner' && (
              <motion.div 
                key="teaser-planner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-6">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full">Assistant IA Gemini</span>
                  <h3 className="text-2xl font-black">Votre planning d'études optimisé en 2 secondes</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Evo prend en compte votre vie d'étudiant : heures de cours, rendez-vous personnels ou sportifs. Notre assistant intelligent analyse ces contraintes et distribue de manière logique et fluide vos révisions à venir.
                  </p>
                  <ul className="space-y-3 font-semibold text-xs text-white/70">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400" /> Analyse des indisponibilités d'agenda</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400" /> Synchronisation Google Calendar (Premium)</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/60 uppercase text-[9px] tracking-widest">Calcul de l'Algorithme</span>
                    <span className="text-emerald-400 text-[10px] flex items-center gap-1">● Optimal</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-bold text-white/80">
                    <span>Créneaux libres détectés</span>
                    <span className="text-amber-400">14 heures</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-bold text-white/80">
                    <span>Tâches réparties à caler</span>
                    <span className="text-blue-400">4 devoirs</span>
                  </div>
                  <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                    <Sparkles size={14} /> Lancer le calcul IA
                  </button>
                </div>
              </motion.div>
            )}

            {activeTeaserTab === 'stats' && (
              <motion.div 
                key="teaser-stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-6">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full">Progression Analytique</span>
                  <h3 className="text-2xl font-black">Visualisez l'effort, célébrez la régularité</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Un tableau de bord complet pour analyser votre parcours. Suivez vos sessions d'études, observez la répartition par matière ou par urgence d'Eisenhower, et comprenez vos pics de concentration réels.
                  </p>
                  <ul className="space-y-3 font-semibold text-xs text-white/70">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Graphique d'efficience d'Eisenhower</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> Analyseurs de temps et de régularité</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-6 rounded-3xl border border-white/10 text-center space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Historique d'Effort d'Études</span>
                  <div className="h-24 flex items-end justify-center gap-2 pt-2">
                    <div className="w-8 bg-indigo-500/25 h-[40%] rounded-t-lg text-[9px] font-bold pb-1 text-white/40">Lun</div>
                    <div className="w-8 bg-indigo-500/40 h-[65%] rounded-t-lg text-[9px] font-bold pb-1 text-white/50">Mar</div>
                    <div className="w-8 bg-indigo-500/65 h-[80%] rounded-t-lg text-[9px] font-bold pb-1 text-white/60">Mer</div>
                    <div className="w-8 bg-amber-400 h-full rounded-t-lg text-[10px] font-bold pb-1 text-black">Jeu</div>
                    <div className="w-8 bg-indigo-500/80 h-[90%] rounded-t-lg text-[9px] font-bold pb-1 text-white/80">Ven</div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400">Record de focus : Jeudi (+5.5h)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 5. PRICING & OFFER DETAILS */}
      <section id="pricing" className="bg-[#0a0d1d] py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Tarification Transparente</span>
            <h2 className="text-3xl font-black tracking-tight">Deux formules simples pour deux profils d'études</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Commencez à organiser vos cours gratuitement dès aujourd'hui ou passez à l'étape supérieure en débloquant l'assistance IA illimitée et un cocon sonore d'excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1: Free */}
            <div className="p-8 rounded-3xl bg-[#0e1324] border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest block">Compte Classique</span>
                <h3 className="text-3xl font-black text-white">0.00$ <span className="text-sm font-bold text-white/40">/ à vie</span></h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  L'essentiel pour organiser vos examens et devoirs avec une structure claire et méthodique.
                </p>
                <div className="border-t border-white/5 pt-6 space-y-3 text-xs text-white/70">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Matrice d'Eisenhower complète</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Minuteur Pomodoro basique</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Planning classique (Heuristique hors-IA)</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> 1 Playlist d'Ambiance de travail</div>
                  <div className="flex items-center gap-2 opacity-40"><Check size={14} /> Blocs publicitaires AdSense intégrés</div>
                </div>
              </div>
              <button
                onClick={() => onStartAuth(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Plan 2: Premium */}
            <div className="p-8 rounded-3xl bg-[#111831] border-2 border-amber-400 relative overflow-hidden flex flex-col justify-between space-y-8 shadow-2xl">
              <div className="absolute top-0 right-0 bg-amber-400 text-black font-black text-[9px] uppercase tracking-wider px-4 py-1 rounded-bl-xl">
                Recommandé ✨
              </div>
              
              <div className="space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Formule Premium</span>
                <h3 className="text-3xl font-black text-amber-400">4.99$ <span className="text-sm font-bold text-white/40">/ paiement unique</span></h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Idéal pour les étudiants ambitieux souhaitant automatiser leur organisation scolaire et travailler dans un cocon sonore haut de gamme.
                </p>
                <div className="border-t border-white/5 pt-6 space-y-3 text-xs text-white/70">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <strong>Planning d'études 100% assisté par IA (Gemini)</strong></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <strong>Générateur complet d'Ondes Binaurales (Alpha, Bêta, Thêta)</strong></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Synchronisation Google Calendar</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Jusqu'à 8 Playlists d'études sauvegardées</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <strong>Zéro distraction publicitaire</strong></div>
                </div>
              </div>
              <button
                onClick={() => onStartAuth(false)}
                className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-400/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Débloquer EVO Premium 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST, SECURITY & COOKIES */}
      <section id="trust" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={14} /> Sécurité & Sécurité Académique
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white">Vos devoirs et cours sont en lieu sûr</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Nous croyons en un écosystème étudiant transparent et vertueux. Evo est construit sur des serveurs sécurisés et respecte scrupuleusement la législation sur la protection des données (RGPD). Vos données ne seront jamais vendues ni utilisées à des fins commerciales.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-white">Chiffrement Complet</h4>
                <p className="text-white/50 leading-relaxed">Toutes vos notes et tâches sont chiffrées en transit et au repos.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-white">Contrôle Total</h4>
                <p className="text-white/50 leading-relaxed">Supprimez définitivement l'intégralité de vos informations d'un seul clic.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0e1324] p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold">Un écosystème responsable</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Nous limitons l'utilisation de traceurs tiers. Seuls les services requis pour l'authentification sécurisée (Firebase Auth), la sauvegarde cryptée de vos plannings (Firestore) et la monétisation optionnelle (Google AdSense) sont intégrés.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setLegalModalType('privacy')}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Shield size={12} /> Politique de Confidentialité
              </button>
              <button
                onClick={() => setLegalModalType('terms')}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Scale size={12} /> Conditions d'Utilisation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/5 bg-[#03050c] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-black">
              E
            </div>
            <span>© 2026 Evo Study Inc. Tous droits réservés.</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Confidentialité & Sécurité
            </button>
            <button 
              onClick={() => setLegalModalType('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Conditions Générales
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <AnimatePresence>
        {legalModalType && (
          <LegalModal
            isOpen={!!legalModalType}
            onClose={() => setLegalModalType(null)}
            type={legalModalType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
