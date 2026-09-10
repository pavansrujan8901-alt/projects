'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Volume2, 
  VolumeX, 
  Type, 
  Contrast, 
  Globe, 
  Home, 
  Sparkles, 
  Check, 
  X,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { translations, SUPPORTED_LANGUAGES } from '@/lib/i18n/translations';
import { speech } from '@/lib/tts/speech';

interface AccessibilityToolbarProps {
  contentToRead?: string;
}

export default function AccessibilityToolbar({ contentToRead }: AccessibilityToolbarProps) {
  const router = useRouter();
  const { 
    textScale, 
    cycleTextScale, 
    highContrast, 
    toggleHighContrast, 
    language, 
    setLanguage, 
    isReading, 
    setIsReading,
    isDarkMode,
    toggleDarkMode,
    calmMode,
    toggleCalmMode,
    reduceMotion,
    toggleReduceMotion
  } = useAccessibilityStore();

  const [showLangModal, setShowLangModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const t = translations[language] || translations.en;

  const handleToggleSpeech = () => {
    if (isReading) {
      speech.stop();
      setIsReading(false);
    } else {
      speech.playChime('click');
      const text = contentToRead || document.getElementById('main-content')?.innerText || document.body.innerText.substring(0, 500);
      setIsReading(true);
      speech.speak(text, language, () => {
        setIsReading(false);
      });
    }
  };

  const getTextScaleLabel = () => {
    if (textScale === 'normal') return 'A';
    if (textScale === 'large') return 'A+';
    return 'A++';
  };

  return (
    <>
      {/* Sticky Bottom Accessibility Bar */}
      <div 
        role="region" 
        aria-label="Accessibility Toolbar"
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all border-t shadow-2xl ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white/95 dark:bg-bloom-darkest/95 backdrop-blur-lg border-slate-300 dark:border-bloom-border/80 text-slate-800 dark:text-slate-100 shadow-xl'
        }`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Home Button */}
          <Link
            href="/patient/dashboard"
            className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm sm:text-base border transition-all active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shadow-sm'
            }`}
            aria-label="Return to Game Hub"
            title="Return to Game Hub"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-bloom-cyan" />
            <span className="hidden sm:inline">{t.home}</span>
          </Link>

          {/* Font Size Cycle (A / A+ / A++) */}
          <button
            onClick={() => {
              speech.playChime('click');
              cycleTextScale();
            }}
            className={`min-w-[56px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm sm:text-base border transition-all active:scale-95 ${
              highContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400/20'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shadow-sm'
            }`}
            aria-label={`Change text size. Current: ${textScale}`}
            title={`Text Size (${textScale})`}
          >
            <Type className="w-5 h-5 text-bloom-teal" />
            <span className="font-mono tracking-wider">{getTextScaleLabel()}</span>
          </button>

          {/* Read Aloud Audio Narrator */}
          <button
            onClick={handleToggleSpeech}
            className={`min-w-[64px] h-12 sm:h-14 px-3.5 sm:px-5 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-sm sm:text-base border transition-all active:scale-95 ${
              isReading
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-[#1e3a5f] hover:bg-[#14263f] text-white shadow-md shadow-slate-900/10'
            }`}
            aria-label={isReading ? t.stopReading : t.readAloud}
            title={isReading ? t.stopReading : t.readAloud}
          >
            {isReading ? (
              <>
                <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="hidden xs:inline text-white">{t.stopReading}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="hidden xs:inline text-white">{t.readAloud}</span>
              </>
            )}
          </button>

          {/* Calm Mode (Warm, Low Stimulation) */}
          <button
            onClick={() => {
              speech.playChime('click');
              toggleCalmMode();
            }}
            className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm border transition-all active:scale-95 ${
              calmMode
                ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-sm'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200'
            }`}
            aria-label={calmMode ? 'Calm Mode Active' : 'Enable Calm Mode'}
            title="Calm Mode (Warm, Low Stimulation)"
          >
            <span>☕</span>
            <span className="hidden md:inline">Calm</span>
          </button>

          {/* Reduce Motion Mode */}
          <button
            onClick={() => {
              speech.playChime('click');
              toggleReduceMotion();
            }}
            className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm border transition-all active:scale-95 ${
              reduceMotion
                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-sm'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200'
            }`}
            aria-label={reduceMotion ? 'Reduced Motion Active' : 'Reduce Motion'}
            title="Reduce Motion"
          >
            <span>🌿</span>
            <span className="hidden md:inline">Steady</span>
          </button>

          {/* Theme Mode Toggle (Sun/Moon) */}
          <button
            onClick={() => {
              speech.playChime('click');
              toggleDarkMode();
            }}
            className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm sm:text-base border transition-all active:scale-95 ${
              highContrast
                ? 'bg-black text-yellow-400 border-yellow-400'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 shadow-sm'
            }`}
            aria-label={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            title={isDarkMode ? 'Light Theme' : 'Dark Theme'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            )}
            <span className="hidden lg:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => {
              speech.playChime('click');
              toggleHighContrast();
            }}
            className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm sm:text-base border transition-all active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 shadow-sm'
            }`}
            aria-label="Toggle High Contrast Mode"
            title="High Contrast Mode"
          >
            <Contrast className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400" />
            <span className="hidden md:inline">{t.highContrast}</span>
          </button>

          {/* Language Switcher Modal Trigger */}
          <button
            onClick={() => setShowLangModal(true)}
            className={`min-w-[48px] h-12 sm:h-14 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm sm:text-base border transition-all active:scale-95 ${
              highContrast
                ? 'bg-black text-yellow-400 border-yellow-400'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 shadow-sm'
            }`}
            aria-label="Choose Language"
            title="Choose Language"
          >
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-bloom-cyan" />
            <span className="hidden sm:inline uppercase text-xs tracking-wider">{language}</span>
          </button>

          {/* Gentle Help / Guide Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="min-w-[44px] h-12 sm:h-14 px-3 rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:border-slate-300 dark:hover:border-bloom-border transition-all"
            aria-label="Help & Guidance"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-bloom-dark border-2 border-bloom-border p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowLangModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-bloom-cyan/20 text-bloom-cyan flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Select Your Language</h3>
                <p className="text-sm text-slate-400">আপোনাৰ ভাষা বাছক / अपनी भाषा चुनें</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SUPPORTED_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    speech.playChime('click');
                    setLanguage(item.code);
                    setShowLangModal(false);
                    speech.speak(item.sampleText, item.code);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    language === item.code
                      ? 'bg-bloom-teal/15 border-bloom-teal text-white shadow-lg shadow-bloom-teal/10'
                      : 'bg-bloom-card border-bloom-border/60 text-slate-300 hover:border-slate-500 hover:bg-bloom-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flag}</span>
                    <div>
                      <div className="font-bold text-base text-white">{item.nativeName}</div>
                      <div className="text-xs text-slate-400">{item.name}</div>
                    </div>
                  </div>
                  {language === item.code && (
                    <div className="w-6 h-6 rounded-full bg-bloom-teal text-bloom-darkest flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gentle Help / Encouragement Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-bloom-dark border-2 border-bloom-border p-6 sm:p-8 shadow-2xl relative text-center">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-bloom-teal to-bloom-cyan text-bloom-darkest mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">You Are Doing Great!</h3>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              There is never any rush. Play each activity at your own comfortable pace.
              Tap the <strong>Read Aloud</strong> button anytime to have the screen read to you.
            </p>

            <button
              onClick={() => {
                speech.playChime('click');
                setShowHelpModal(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-bloom-cyan text-bloom-darkest font-bold text-lg hover:brightness-110 shadow-lg shadow-bloom-cyan/20 transition-all"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}
    </>
  );
}
