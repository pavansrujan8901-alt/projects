'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Clock, CheckCircle2, ArrowRight, Home, Volume2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { translations } from '@/lib/i18n/translations';
import { speech } from '@/lib/tts/speech';

import BloomingCelebration3D from '@/components/patient/BloomingCelebration3D';

export default function SessionSummaryPage() {
  const router = useRouter();
  const { patient } = useAuthStore();
  const { lastResult } = useGameStore();
  const { language } = useAccessibilityStore();
  const t = translations[language] || translations.en;

  const result = lastResult || {
    gameType: 'memory_match',
    gameTitle: 'Memory Match',
    score: 100,
    maxScore: 100,
    accuracy: 100,
    timeSeconds: 75,
    stars: 3,
    encouragement: 'You took your time and enjoyed every moment.'
  };

  useEffect(() => {
    speech.playChime('complete');
    speech.speak(
      `Activity Complete! You completed today's activity. Wonderful job.`,
      language
    );
  }, [language]);

  // Format engagement minutes nicely
  const minutes = Math.max(1, Math.round(result.timeSeconds / 60));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 text-center">
      {/* 3D-Style Subtle Blooming Flower Celebration (Section 27) */}
      <BloomingCelebration3D size={140} />

      {/* Main Title & Reassuring Subtitle */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Activity Complete!
        </h1>
        <button
          onClick={() => speech.speak("Activity Complete! You completed today's activity. Wonderful job.", language)}
          className="p-2.5 rounded-2xl glass-card text-sage hover:bg-slate-50 transition-all shadow-sm"
          title="Read aloud"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xl sm:text-2xl font-bold text-sage mb-3">
        You completed today&apos;s activity.
      </p>

      <p className="text-base text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
        {patient ? `${patient.name}, ` : ''}wonderful focus today. Every small moment of activity helps keep memories and connections warm.
      </p>

      {/* Small Positive Glass Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
        <div className="p-5 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950 text-sage flex items-center justify-center text-xl flex-shrink-0">
            🌸
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Activity Finished</div>
            <div className="text-base font-bold text-navy">{result.gameTitle || 'Memory Match'}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-100/90 dark:bg-sky-950 text-ocean flex items-center justify-center text-xl flex-shrink-0">
            ✨
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Memories Explored</div>
            <div className="text-base font-bold text-navy">Familiar & Loved</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100/90 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Brain Engagement</div>
            <div className="text-base font-bold text-navy">{minutes} min{minutes > 1 ? 's' : ''} of calm</div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Continue / Back to Home */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/patient/dashboard"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border-2 border-slate-300 dark:border-bloom-border text-navy font-bold flex items-center justify-center gap-2 text-base transition-all shadow-sm"
        >
          <Home className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/patient/dashboard"
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
