'use client';

import React, { useEffect } from 'react';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { 
    textScale, 
    highContrast, 
    language, 
    isDarkMode, 
    calmMode,
    reduceMotion,
    setTextScale, 
    setLanguage 
  } = useAccessibilityStore();
  const { initializeFromStorage } = useOnboardingStore();

  useEffect(() => {
    initializeFromStorage();
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mindbloom_dark_mode');
      if (savedTheme === 'true' && !isDarkMode) {
        useAccessibilityStore.getState().toggleDarkMode();
      }
      const savedCalm = localStorage.getItem('mindbloom_calm_mode');
      if (savedCalm === 'true' && !calmMode) {
        useAccessibilityStore.getState().toggleCalmMode();
      }
      const savedMotion = localStorage.getItem('mindbloom_reduce_motion');
      if (savedMotion === 'true' && !reduceMotion) {
        useAccessibilityStore.getState().toggleReduceMotion();
      }
      const savedScale = localStorage.getItem('mindbloom_text_scale') as any;
      if (savedScale && savedScale !== textScale) {
        setTextScale(savedScale);
      }
      const savedContrast = localStorage.getItem('mindbloom_high_contrast');
      if (savedContrast === 'true' && !highContrast) {
        useAccessibilityStore.getState().toggleHighContrast();
      }
      const savedLang = localStorage.getItem('mindbloom_lang') as any;
      if (savedLang && savedLang !== language) {
        setLanguage(savedLang);
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Theme mode: light (default) vs dark
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Calm Mode
    if (calmMode) {
      root.classList.add('calm-mode');
    } else {
      root.classList.remove('calm-mode');
    }

    // Reduce Motion
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font scale
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-extra-large');
    root.classList.add(`font-scale-${textScale}`);

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Language attribute
    root.setAttribute('lang', language);
  }, [textScale, highContrast, language, isDarkMode, calmMode, reduceMotion]);

  return <>{children}</>;
}
