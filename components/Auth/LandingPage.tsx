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
      <header className="sticky top-0 z-40 bg-[#060814]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/30 rounded-lg flex items-center justify-center text-amber-400">
              <Sparkles size={18} className="fill-amber-400/20" />
            </div>
            <div>
              <span className="font-serif text-2xl font-normal tracking-tight text-white">Evo</span>
              <span className="text-[9px] font-mono block text-amber-400 uppercase tracking-widest leading-none">Études</span>
            </div>
          </div>

          {/* Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#preview" className="hover:text-white transition-colors">Aperçu Live</a>
            <a href="#pricing" className="hover:text-white transition-colors">Premium</a>
            <a href="#trust" className="hover:text-white transition-colors">Sécurité</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartAuth(true)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Se connecter
            </button>
            <button
              onClick={() => onStartAuth(false)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider rounded-lg border border-amber-400/30 transition-all active:scale-95 cursor-pointer"
            >
              S'inscrire ✨
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            className="lg:col-span-6 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-amber-300 font-mono uppercase tracking-wide">
              <Award size={14} className="fill-amber-400/20" /> Élu compagnon idéal d'études 2026
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.08] text-white">
              Reprenez le contrôle de vos <span className="italic text-amber-300">examens et devoirs.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-sm text-white/70 leading-relaxed max-w-lg font-sans">
              Evo fusionne la rigueur scientifique de la matrice d'Eisenhower, la concentration des ondes binaurales et l'intelligence de planification par IA pour créer un emploi du temps 100% réaliste, adapté à vos contraintes.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => onStartAuth(false)}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 border border-amber-400/30 active:scale-95 transition-all cursor-pointer"
              >
                Commencer gratuitement <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider rounded-lg border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Découvrir l'App
              </button>
            </motion.div>

            {/* Micro proof figures */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <span className="block font-serif text-3xl font-normal text-white">4.9/5</span>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Note étudiante</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-normal text-white">+85%</span>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">De productivité</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-normal text-white">0</span>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Publicité Premium</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right Visual: Mockup Previews */}
          <motion.div 
            className="lg:col-span-6 relative flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Simulated app panel */}
            <div className="w-full max-w-lg bg-[#0e1324] border border-white/10 rounded-lg p-6 relative overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-white/40">
                  https://app.evo.study/dashboard
                </div>
              </div>

              {/* Layout body teaser */}
              <div className="space-y-4">
                {/* Simulated Wave Card */}
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/20 rounded-lg flex items-center justify-center text-amber-400">
                      <Brain size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Ondes Binaurales Actives</h4>
                      <p className="text-[9px] font-mono text-amber-300 uppercase tracking-wider">Mode Bêta : Concentration active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>

                {/* Simulated Planning Schedule */}
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/50 border-b border-white/10 pb-2">
                    <span className="uppercase tracking-wider text-[9px] font-mono">Mon Planning Optimal</span>
                    <span className="text-sky-400 text-[10px] flex items-center gap-1 font-mono"><Zap size={10} /> Assisté par IA</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-red-500/10 border-l-2 border-red-500 rounded-r-lg flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-medium text-white">Révision Mathématiques (Analyse)</span>
                        <span className="text-[9px] text-white/40 font-mono">14h00 - 15h30 | Urgent & Important</span>
                      </div>
                      <span className="text-[9px] bg-red-500/20 text-red-300 font-mono px-2 py-0.5 rounded-md">Do First</span>
                    </div>

                    <div className="p-2.5 bg-sky-500/10 border-l-2 border-sky-500 rounded-r-lg flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-medium text-white">Projet d'Informatique (Algorithme)</span>
                        <span className="text-[9px] text-white/40 font-mono">16h00 - 17h30 | Important</span>
                      </div>
                      <span className="text-[9px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded-md">Planifier</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats check */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">Discipline d'étude</span>
                    <span className="font-serif text-xl font-normal text-emerald-400">92%</span>
                  </div>
                  <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">Concentration active</span>
                    <span className="font-serif text-xl font-normal text-sky-400">4.2 heures</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. APP MODULES SHOWCASE (Features) */}
      <section id="features" className="bg-[#0a0d1d] py-20 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono text-amber-300 uppercase tracking-widest">Une méthode éprouvée pour réussir</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">Découvrez les 4 piliers d'Evo</h2>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Nous avons éliminé tout superflu pour nous concentrer sur l'essentiel : organiser, concentrer, planifier et évaluer votre travail quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Eisenhower */}
            <div className="p-6 rounded-lg bg-[#0e1324] border border-white/10 hover:border-amber-400/30 transition-all duration-200">
              <div className="p-3 w-10 h-10 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg flex items-center justify-center mb-5">
                <Grid2X2 size={20} />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-2 tracking-tight">Matrice d'Eisenhower</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Priorisez vos tâches scolaires selon l'urgence et l'importance réelle. Éliminez la procrastination en sachant exactement quoi faire maintenant.
              </p>
            </div>

            {/* Card 2: Pomodoro & Binaural */}
            <div className="p-6 rounded-lg bg-[#0e1324] border border-white/10 hover:border-emerald-400/30 transition-all duration-200">
              <div className="p-3 w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-5">
                <Brain size={20} />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-2 tracking-tight">Ondes Binaurales</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Améliorez votre attention grâce à des générateurs d'ondes Alpha (détente), Bêta (concentration) et Thêta (créativité), combinés à un filtre antibruit rose.
              </p>
            </div>

            {/* Card 3: Smart Planning */}
            <div className="p-6 rounded-lg bg-[#0e1324] border border-white/10 hover:border-sky-400/30 transition-all duration-200">
              <div className="p-3 w-10 h-10 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center mb-5">
                <Calendar size={20} />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-2 tracking-tight">Planning par l'IA</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                L'assistant IA de Google (Gemini) construit un emploi du temps intelligent qui contourne automatiquement vos heures de cours et vos indisponibilités.
              </p>
            </div>

            {/* Card 4: Progress Tracking */}
            <div className="p-6 rounded-lg bg-[#0e1324] border border-white/10 hover:border-indigo-400/30 transition-all duration-200">
              <div className="p-3 w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center mb-5">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-2 tracking-tight">Statistiques de Session</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Analysez votre régularité, mesurez votre focus, gardez un œil sur votre assiduité et comprenez où va réellement votre temps de travail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TAB TEASER PREVIEW */}
      <section id="preview" className="py-20 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono text-amber-300 uppercase tracking-widest">Aperçu interactif</span>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white">À quoi ressemble votre nouvel espace de travail ?</h2>
        </div>

        {/* Tab selectors */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto bg-white/5 p-1.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTeaserTab('matrix')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer ${activeTeaserTab === 'matrix' ? 'bg-amber-400 text-black font-semibold' : 'opacity-60 hover:opacity-100 text-white'}`}
          >
            <Grid2X2 size={14} /> Matrice
          </button>
          <button
            onClick={() => setActiveTeaserTab('focus')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer ${activeTeaserTab === 'focus' ? 'bg-amber-400 text-black font-semibold' : 'opacity-60 hover:opacity-100 text-white'}`}
          >
            <Brain size={14} /> Ondes & Focus
          </button>
          <button
            onClick={() => setActiveTeaserTab('planner')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer ${activeTeaserTab === 'planner' ? 'bg-amber-400 text-black font-semibold' : 'opacity-60 hover:opacity-100 text-white'}`}
          >
            <Calendar size={14} /> Planning IA
          </button>
          <button
            onClick={() => setActiveTeaserTab('stats')}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer ${activeTeaserTab === 'stats' ? 'bg-amber-400 text-black font-semibold' : 'opacity-60 hover:opacity-100 text-white'}`}
          >
            <BarChart3 size={14} /> Suivi
          </button>
        </div>

        {/* Dynamic teaser output container */}
        <div className="w-full max-w-4xl mx-auto bg-[#0a0d1d] border border-white/10 rounded-lg p-6 md:p-10 relative min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeTeaserTab === 'matrix' && (
              <motion.div 
                key="teaser-matrix"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-red-300 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">Méthode Eisenhower</span>
                  <h3 className="font-serif text-2xl font-normal text-white tracking-tight">La clarté absolue au service de votre productivité</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    Triez vos tâches instantanément dans nos 4 quadrants dynamiques : "Faire d'abord" (urgent et important), "Planifier" (important mais non urgent), "Déléguer" et "Éliminer".
                  </p>
                  <ul className="space-y-2 font-mono text-xs text-white/70 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-red-400" /> Tri automatique selon vos échéances</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-red-400" /> Interface fluide de drag-and-drop</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-5 rounded-lg border border-white/10 grid grid-cols-2 gap-3">
                  <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-red-400 block">1. DO FIRST</span>
                    <span className="block text-xs font-semibold text-white">Examen de Demain 🚨</span>
                  </div>
                  <div className="bg-sky-500/10 p-3 rounded-lg border border-sky-500/20 text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400 block">2. SCHEDULE</span>
                    <span className="block text-xs font-semibold text-white">Fiches de Lecture</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 block">3. DELEGATE</span>
                    <span className="block text-xs font-medium text-white/60">Emails de Groupe</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center opacity-40 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider block">4. ELIMINATE</span>
                    <span className="block text-xs">Réseaux sociaux</span>
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
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">Intégration Sonore Avancée</span>
                  <h3 className="font-serif text-2xl font-normal text-white tracking-tight">Bloquez les distractions avec un cocon acoustique</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    Optimisez votre concentration avec notre lecteur de concentration. Choisissez des ondes cérébrales calibrées (Alpha pour assimiler, Bêta pour la logique, Thêta pour la création).
                  </p>
                  <ul className="space-y-2 font-mono text-xs text-white/70 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Calibration en temps réel</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Filtre antibruit de fond</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-6 rounded-lg border border-white/10 space-y-5 text-center">
                  <div className="font-serif text-3xl font-normal text-emerald-400 tracking-tight">
                    25:00
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-white/50">
                      <span>Vibrations Solfeggio (528 Hz)</span>
                      <span className="text-emerald-400">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div className="w-[75%] h-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-mono uppercase tracking-wider">🧘 Ondes Alpha Actives</span>
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
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-sky-300 uppercase tracking-widest bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">Assistant IA Gemini</span>
                  <h3 className="font-serif text-2xl font-normal text-white tracking-tight">Votre planning d'études optimisé en 2 secondes</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    Evo prend en compte votre vie d'étudiant : heures de cours, rendez-vous personnels ou sportifs. Notre assistant intelligent analyse ces contraintes.
                  </p>
                  <ul className="space-y-2 font-mono text-xs text-white/70 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-sky-400" /> Analyse des indisponibilités d'agenda</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-sky-400" /> Synchronisation Google Calendar</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-5 rounded-lg border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono border-b border-white/10 pb-2">
                    <span className="text-white/50 uppercase text-[9px] tracking-widest">Calcul de l'Algorithme</span>
                    <span className="text-emerald-400 text-[10px]">● Optimal</span>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between text-xs text-white/80 font-mono">
                    <span>Créneaux libres détectés</span>
                    <span className="text-amber-300">14h00</span>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between text-xs text-white/80 font-mono">
                    <span>Tâches réparties à caler</span>
                    <span className="text-sky-300">4 devoirs</span>
                  </div>
                  <button className="w-full py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer">
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
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">Progression Analytique</span>
                  <h3 className="font-serif text-2xl font-normal text-white tracking-tight">Visualisez l'effort, célébrez la régularité</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    Un tableau de bord complet pour analyser votre parcours. Suivez vos sessions d'études et vos pics de concentration réels.
                  </p>
                  <ul className="space-y-2 font-mono text-xs text-white/70 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-indigo-400" /> Graphique d'efficience d'Eisenhower</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-indigo-400" /> Analyseurs de temps et de régularité</li>
                  </ul>
                </div>
                <div className="bg-[#0e1324] p-5 rounded-lg border border-white/10 text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Historique d'Effort</span>
                  <div className="h-20 flex items-end justify-center gap-2 pt-2">
                    <div className="w-7 bg-indigo-500/25 h-[40%] rounded-t text-[9px] font-mono pb-1 text-white/40">Lun</div>
                    <div className="w-7 bg-indigo-500/40 h-[65%] rounded-t text-[9px] font-mono pb-1 text-white/50">Mar</div>
                    <div className="w-7 bg-indigo-500/65 h-[80%] rounded-t text-[9px] font-mono pb-1 text-white/60">Mer</div>
                    <div className="w-7 bg-amber-400 h-full rounded-t text-[9px] font-mono font-bold pb-1 text-black">Jeu</div>
                    <div className="w-7 bg-indigo-500/80 h-[90%] rounded-t text-[9px] font-mono pb-1 text-white/80">Ven</div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 block pt-1 border-t border-white/10">Record de focus : Jeudi (+5.5h)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 5. PRICING & OFFER DETAILS */}
      <section id="pricing" className="bg-[#0a0d1d] py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono text-amber-300 uppercase tracking-widest">Tarification Transparente</span>
            <h2 className="font-serif text-3xl font-normal tracking-tight text-white">Deux formules simples pour deux profils d'études</h2>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Commencez à organiser vos cours gratuitement dès aujourd'hui ou passez à l'étape supérieure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1: Free */}
            <div className="p-8 rounded-lg bg-[#0e1324] border border-white/10 relative flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono text-white/50 uppercase tracking-widest block">Compte Classique</span>
                <h3 className="font-serif text-3xl font-normal text-white">0.00$ <span className="text-xs font-mono text-white/40">/ à vie</span></h3>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  L'essentiel pour organiser vos examens et devoirs avec une structure claire et méthodique.
                </p>
                <div className="border-t border-white/10 pt-5 space-y-2.5 text-xs text-white/70 font-sans">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Matrice d'Eisenhower complète</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Minuteur Pomodoro basique</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Planning classique</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> 1 Playlist d'Ambiance</div>
                </div>
              </div>
              <button
                onClick={() => onStartAuth(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider rounded-lg border border-white/10 transition-all cursor-pointer"
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Plan 2: Premium */}
            <div className="p-8 rounded-lg bg-[#111831] border border-amber-400/80 relative flex flex-col justify-between space-y-6">
              <div className="absolute top-0 right-0 bg-amber-400 text-black font-semibold text-[9px] font-mono uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Recommandé ✨
              </div>
              
              <div className="space-y-4">
                <span className="text-xs font-mono text-amber-300 uppercase tracking-widest block">Formule Premium</span>
                <h3 className="font-serif text-3xl font-normal text-amber-300">4.99$ <span className="text-xs font-mono text-white/40">/ unique</span></h3>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  Idéal pour les étudiants ambitieux souhaitant automatiser leur organisation scolaire.
                </p>
                <div className="border-t border-white/10 pt-5 space-y-2.5 text-xs text-white/70 font-sans">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <strong>Planning 100% assisté par IA (Gemini)</strong></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <strong>Générateur complet d'Ondes Binaurales</strong></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Synchronisation Google Calendar</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <strong>Zéro distraction publicitaire</strong></div>
                </div>
              </div>
              <button
                onClick={() => onStartAuth(false)}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider rounded-lg border border-amber-400/30 transition-all cursor-pointer"
              >
                Débloquer EVO Premium 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SECURITY */}
      <section id="trust" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={14} /> Sécurité Académique
            </span>
            <h2 className="font-serif text-3xl font-normal tracking-tight text-white">Vos devoirs et cours sont en lieu sûr</h2>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Nous croyons en un écosystème étudiant transparent et vertueux. Evo est construit sur des serveurs sécurisés et respecte la législation sur la protection des données (RGPD).
            </p>
            <div className="grid grid-cols-2 gap-6 pt-3 border-t border-white/10 text-xs">
              <div className="space-y-1">
                <h4 className="font-semibold text-white">Chiffrement Complet</h4>
                <p className="text-white/50 text-[11px] leading-relaxed">Toutes vos données sont chiffrées au repos.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white">Contrôle Total</h4>
                <p className="text-white/50 text-[11px] leading-relaxed">Supprimez vos données d'un seul clic.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0e1324] p-8 rounded-lg border border-white/10 space-y-5 relative overflow-hidden">
            <h3 className="font-serif text-xl font-normal text-white">Un écosystème responsable</h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Nous limitons l'utilisation de traceurs tiers. Seuls les services requis pour l'authentification sécurisée (Firebase Auth) et la sauvegarde cryptée (Firestore) sont intégrés.
            </p>
            <div className="flex gap-4 pt-2 border-t border-white/10">
              <button
                onClick={() => setLegalModalType('privacy')}
                className="text-xs font-mono text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Shield size={12} /> Confidentialité
              </button>
              <button
                onClick={() => setLegalModalType('terms')}
                className="text-xs font-mono text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Scale size={12} /> Conditions
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
