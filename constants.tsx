
import { ThemeType } from './types';

export const THEMES: Record<ThemeType, { 
  name: string;
  primary: string; 
  secondary: string; 
  bg: string; 
  accent: string;
  text: string;
  card: string;
  hex: string;
  button: string;
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    text: string;
    card: string;
    accent: string;
  }
}> = {
  midnight: {
    name: 'Midnight',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#000000',
    button: 'bg-[var(--primary)] text-black hover:opacity-90',
    colors: {
      primary: '#d4af37',
      secondary: '#c5a028',
      bg: '#000000',
      text: '#ffffff',
      card: 'rgba(20, 20, 20, 0.8)',
      accent: 'rgba(212, 175, 55, 0.2)'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#0d0221',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#ff0055',
      secondary: '#00ffcc',
      bg: '#0d0221',
      text: '#ffffff',
      card: 'rgba(20, 10, 40, 0.8)',
      accent: 'rgba(255, 0, 85, 0.2)'
    }
  },
  emerald: {
    name: 'Emerald',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#061a12',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      bg: '#061a12',
      text: '#ecfdf5',
      card: 'rgba(6, 30, 20, 0.8)',
      accent: 'rgba(16, 185, 129, 0.2)'
    }
  },
  ocean: {
    name: 'Ocean',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#011627',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#00d2ff',
      secondary: '#3a7bd5',
      bg: '#011627',
      text: '#f0f9ff',
      card: 'rgba(1, 30, 50, 0.8)',
      accent: 'rgba(0, 210, 255, 0.2)'
    }
  },
  dracula: {
    name: 'Dracula',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#282a36',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#bd93f9',
      secondary: '#ff79c6',
      bg: '#282a36',
      text: '#f8f8f2',
      card: 'rgba(40, 42, 54, 0.8)',
      accent: 'rgba(189, 147, 249, 0.2)'
    }
  },
  nord: {
    name: 'Nord',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#2e3440',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#88c0d0',
      secondary: '#81a1c1',
      bg: '#2e3440',
      text: '#eceff4',
      card: 'rgba(46, 52, 64, 0.8)',
      accent: 'rgba(136, 192, 208, 0.2)'
    }
  },
  volcano: {
    name: 'Volcano',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#1a0f0f',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#ff4d00',
      secondary: '#ff9e00',
      bg: '#1a0f0f',
      text: '#fff5f5',
      card: 'rgba(30, 15, 15, 0.8)',
      accent: 'rgba(255, 77, 0, 0.2)'
    }
  },
  sunset: {
    name: 'Sunset',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#1a120b',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#e58e26',
      secondary: '#f39c12',
      bg: '#1a120b',
      text: '#fff9f0',
      card: 'rgba(30, 20, 10, 0.8)',
      accent: 'rgba(229, 142, 38, 0.2)'
    }
  },
  forest: {
    name: 'Forest',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#1b1f13',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#556b2f',
      secondary: '#6b8e23',
      bg: '#1b1f13',
      text: '#f5f5f0',
      card: 'rgba(27, 31, 19, 0.8)',
      accent: 'rgba(85, 107, 47, 0.2)'
    }
  },
  slate: {
    name: 'Slate',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#0f172a',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      bg: '#0f172a',
      text: '#f8fafc',
      card: 'rgba(15, 23, 42, 0.8)',
      accent: 'rgba(56, 189, 248, 0.2)'
    }
  },
  rose: {
    name: 'Rose',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#1a0a0d',
    button: 'bg-[var(--primary)] text-white hover:opacity-90',
    colors: {
      primary: '#e91e63',
      secondary: '#f06292',
      bg: '#1a0a0d',
      text: '#fff0f3',
      card: 'rgba(30, 10, 15, 0.8)',
      accent: 'rgba(233, 30, 99, 0.2)'
    }
  },
  neon: {
    name: 'Neon',
    primary: 'bg-[var(--primary)]',
    secondary: 'text-[var(--secondary)]',
    bg: 'bg-[var(--bg)]',
    accent: 'border-[var(--accent)]',
    text: 'text-[var(--text)]',
    card: 'bg-[var(--card)] backdrop-blur-xl',
    hex: '#000000',
    button: 'bg-[var(--primary)] text-black hover:opacity-90',
    colors: {
      primary: '#39ff14',
      secondary: '#ccff00',
      bg: '#000000',
      text: '#ffffff',
      card: 'rgba(10, 10, 10, 0.8)',
      accent: 'rgba(57, 255, 20, 0.2)'
    }
  }
};
