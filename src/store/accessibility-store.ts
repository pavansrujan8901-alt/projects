import { create } from 'zustand';
import { SupportedLanguage } from '@/lib/i18n/translations';

export type TextScale = 'normal' | 'large' | 'extra-large';

interface AccessibilityState {
  textScale: TextScale;
  highContrast: boolean;
  autoReadAloud: boolean;
  language: SupportedLanguage;
  isReading: boolean;
  activeReadingText: string | null;
  isDarkMode: boolean;
  calmMode: boolean;
  reduceMotion: boolean;
  
  // Actions
  setTextScale: (scale: TextScale) => void;
  cycleTextScale: () => void;
  toggleHighContrast: () => void;
  toggleAutoReadAloud: () => void;
  toggleDarkMode: () => void;
  toggleCalmMode: () => void;
  toggleReduceMotion: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setIsReading: (reading: boolean, text?: string | null) => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  textScale: 'normal',
  highContrast: false,
  autoReadAloud: false,
  language: 'en',
  isReading: false,
  activeReadingText: null,
  isDarkMode: false, // Default is Light Theme
  calmMode: false,
  reduceMotion: false,

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    set({ isDarkMode: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_dark_mode', String(next));
    }
  },

  toggleCalmMode: () => {
    const next = !get().calmMode;
    set({ calmMode: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_calm_mode', String(next));
    }
  },

  toggleReduceMotion: () => {
    const next = !get().reduceMotion;
    set({ reduceMotion: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_reduce_motion', String(next));
    }
  },

  setTextScale: (scale) => {
    set({ textScale: scale });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_text_scale', scale);
    }
  },

  cycleTextScale: () => {
    const current = get().textScale;
    const next: TextScale = 
      current === 'normal' ? 'large' : 
      current === 'large' ? 'extra-large' : 'normal';
    get().setTextScale(next);
  },

  toggleHighContrast: () => {
    const next = !get().highContrast;
    set({ highContrast: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_high_contrast', String(next));
    }
  },

  toggleAutoReadAloud: () => {
    const next = !get().autoReadAloud;
    set({ autoReadAloud: next });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_lang', lang);
    }
  },

  setIsReading: (reading, text = null) => {
    set({ isReading: reading, activeReadingText: text });
  }
}));
