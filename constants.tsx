
import { ThemeType } from './types';

export const THEMES: Record<ThemeType, { 
  primary: string; 
  secondary: string; 
  bg: string; 
  accent: string;
  text: string;
  card: string;
  hex: string;
  button: string;
}> = {
  lime: {
    primary: 'bg-lime-400', // Un vert plus frais
    secondary: 'text-yellow-600', // Accents jaunes pour le contraste
    bg: 'bg-[#fefce8]', // Fond jaune très pâle (yellow-50)
    accent: 'border-yellow-200/50',
    text: 'text-lime-950',
    card: 'bg-white/80 backdrop-blur-xl',
    hex: '#fefce8',
    button: 'bg-yellow-400 text-yellow-950 hover:bg-yellow-500'
  },
  blue: {
    primary: 'bg-blue-600',
    secondary: 'text-blue-700',
    bg: 'bg-blue-50/50',
    accent: 'border-blue-200/60',
    text: 'text-slate-900',
    card: 'bg-white/90 backdrop-blur-md',
    hex: '#eff6ff',
    button: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  purple: {
    primary: 'bg-fuchsia-500', 
    secondary: 'text-purple-700',
    bg: 'bg-[#fdf4ff]', // Fond fuchsia-50
    accent: 'border-fuchsia-200/50',
    text: 'text-purple-950',
    card: 'bg-white/80 backdrop-blur-xl',
    hex: '#fdf4ff',
    button: 'bg-fuchsia-500 text-white hover:bg-fuchsia-600'
  },
  dark: {
    primary: 'bg-indigo-500',
    secondary: 'text-indigo-400',
    bg: 'bg-slate-950',
    accent: 'border-slate-800',
    text: 'text-slate-100',
    card: 'bg-slate-900/80 backdrop-blur-md',
    hex: '#020617',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700'
  }
};
