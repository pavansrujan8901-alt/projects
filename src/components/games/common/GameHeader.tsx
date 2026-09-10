'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Home, Clock, RotateCw } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAccessibilityStore } from '@/store/accessibility-store';
import ExitConfirmModal from './ExitConfirmModal';

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  currentIndex?: number;
  totalQuestions?: number;
  progressPercent?: number;
  secondsElapsed?: number;
  onHearQuestion?: () => void;
  onHearAgain?: () => void;
  onHelp?: () => void;
  onReset?: () => void;
  customStatusBadge?: React.ReactNode;
}

export default function GameHeader({
  title,
  subtitle = 'Take all the time you need. Every moment is comfortable.',
  icon = '🌱',
  currentIndex,
  totalQuestions,
  progressPercent,
  secondsElapsed = 0,
  onHearQuestion,
  onHearAgain,
  onHelp,
  onReset,
  customStatusBadge
}: GameHeaderProps) {
  const [showExitModal, setShowExitModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { language } = useAccessibilityStore();

  useEffect(() => {
    setIsMuted(speech.getSettings().isMuted);
    const unsubscribe = speech.subscribe(() => {
      setIsMuted(speech.getSettings().isMuted);
    });
    return () => unsubscribe();
  }, []);

  const computedPercent = progressPercent !== undefined 
    ? progressPercent 
    : (currentIndex !== undefined && totalQuestions && totalQuestions > 0)
      ? ((currentIndex + 1) / totalQuestions) * 100
      : 0;

  const handleToggleMute = () => {
    const next = speech.toggleMute();
    setIsMuted(next);
    if (!next) {
      speech.playChime('click');
      speech.speak('Voice unmuted.', language);
    }
  };

  const handleHearAgain = () => {
    if (onHearAgain) {
      onHearAgain();
    } else if (onHearQuestion) {
      onHearQuestion();
    } else {
      speech.hearAgain();
    }
  };

  const handleDefaultHelp = () => {
    speech.playChime('click');
    speech.speak("Take your time. Read the options gently, and pick the one that feels most familiar.", language);
  };

  return (
    <>
      <div className="glass-panel p-5 sm:p-6 rounded-3xl shadow-md mb-6 sm:mb-8 border-2 border-slate-200/80 dark:border-bloom-border">
        {/* Top bar: Home / Voice controls / Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitModal(true)}
              className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-bloom-dark hover:bg-slate-200 border border-slate-200 dark:border-bloom-border text-slate-700 dark:text-slate-200 transition-all flex items-center gap-2 shadow-2xs active:scale-95 font-bold text-xs"
              title="Home (Exit Activity)"
            >
              <Home className="w-5 h-5 text-sage" />
              <span>Home</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl select-none">{icon}</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
                  {title}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* 🔊 Hear Question */}
            {onHearQuestion && (
              <button
                onClick={onHearQuestion}
                className="min-h-[44px] px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-sage font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                title="Hear question aloud"
              >
                <Volume2 className="w-4 h-4 text-sage" />
                <span>Hear</span>
              </button>
            )}

            {/* 🔁 Hear Again (Section 5 & 11) */}
            <button
              onClick={handleHearAgain}
              className="min-h-[44px] px-3 py-2 rounded-2xl bg-slate-100/90 dark:bg-bloom-dark hover:bg-slate-200 border border-slate-200/80 dark:border-bloom-border text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              title="Hear again (replay instruction)"
            >
              <RotateCw className="w-4 h-4 text-slate-500" />
              <span>Repeat</span>
            </button>

            {/* 🔇 Mute / Unmute (Section 5) */}
            <button
              onClick={handleToggleMute}
              className={`min-h-[44px] p-2.5 rounded-2xl border transition-all active:scale-95 shadow-2xs ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800'
                  : 'bg-slate-100/90 dark:bg-bloom-dark border-slate-200/80 dark:border-bloom-border text-slate-600 dark:text-slate-300'
              }`}
              title={isMuted ? 'Unmute voice companion' : 'Mute voice companion'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Gentle elapsed clock */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100/90 dark:bg-bloom-dark text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-bloom-border text-xs font-semibold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-sage" />
              <span>{Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}</span>
            </div>

            {/* Custom status or Step Badge */}
            {customStatusBadge ? (
              customStatusBadge
            ) : totalQuestions && totalQuestions > 0 ? (
              <div className="px-3 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sage border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
                Step {(currentIndex || 0) + 1} of {totalQuestions}
              </div>
            ) : null}

            {/* ❓ Help Button */}
            <button
              onClick={onHelp || handleDefaultHelp}
              className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 transition-all active:scale-95"
              title="Help & Guidance"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
            </button>

            {/* Reset Button */}
            {onReset && (
              <button
                onClick={onReset}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-bloom-dark hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                title="Restart Activity"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Calm Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-bloom-dark rounded-full overflow-hidden border border-slate-200/90 dark:border-bloom-border">
          <div
            className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, computedPercent))}%` }}
          />
        </div>
      </div>

      <ExitConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
      />
    </>
  );
}
