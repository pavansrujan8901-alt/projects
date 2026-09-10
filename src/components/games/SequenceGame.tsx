'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { ArrowUp, ArrowDown, CheckCircle2, ArrowRight, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { SequenceActivity, SequenceStep } from '@/lib/games/types';
import { validateSequenceOrder, shuffleArray } from '@/lib/games/engine';
import GameHeader from './common/GameHeader';

const SEQUENCE_ACTIVITIES: SequenceActivity[] = [
  {
    id: 'seq_tea',
    title: 'Making Morning Assam Chai',
    instruction: 'Put the steps in order to make a fragrant cup of Assam chai.',
    contextHint: 'Think about boiling water first before pouring the tea into a cup.',
    correctOrderIds: ['step_tea_boil', 'step_tea_leaves', 'step_tea_milk', 'step_tea_cup'],
    steps: [
      { id: 'step_tea_boil', label: '1. Boil fresh water in the kettle', icon: '🫖', orderIndex: 0 },
      { id: 'step_tea_leaves', label: '2. Add fragrant CTC Assam tea leaves', icon: '🍃', orderIndex: 1 },
      { id: 'step_tea_milk', label: '3. Add warm milk and gentle spices', icon: '🥛', orderIndex: 2 },
      { id: 'step_tea_cup', label: '4. Strain into cup and enjoy warm', icon: '☕', orderIndex: 3 }
    ]
  },
  {
    id: 'seq_plant',
    title: 'Tending the Courtyard Tulsi Plant',
    instruction: 'Put the gentle morning garden routine in order.',
    contextHint: 'Begin with fresh water and finish with the peaceful evening lamp.',
    correctOrderIds: ['step_tulsi_pot', 'step_tulsi_water', 'step_tulsi_sweep', 'step_tulsi_diya'],
    steps: [
      { id: 'step_tulsi_pot', label: '1. Fill the brass pot with fresh well water', icon: '🪴', orderIndex: 0 },
      { id: 'step_tulsi_water', label: '2. Gently water the sacred Tulsi base', icon: '💧', orderIndex: 1 },
      { id: 'step_tulsi_sweep', label: '3. Sweep fallen leaves from the courtyard', icon: '🧹', orderIndex: 2 },
      { id: 'step_tulsi_diya', label: '4. Light a peaceful brass diya at dusk', icon: '🪔', orderIndex: 3 }
    ]
  },
  {
    id: 'seq_bihu',
    title: 'Preparing for the Spring Festival',
    instruction: 'Put the celebration preparations in order.',
    contextHint: 'Start with decorating the home before greeting family with sweets.',
    correctOrderIds: ['step_bihu_clean', 'step_bihu_garland', 'step_bihu_clothes', 'step_bihu_sweets'],
    steps: [
      { id: 'step_bihu_clean', label: '1. Clean and wash the front veranda', icon: '🏡', orderIndex: 0 },
      { id: 'step_bihu_garland', label: '2. Hang fresh marigold garlands on doorways', icon: '🌺', orderIndex: 1 },
      { id: 'step_bihu_clothes', label: '3. Dress in festive Gamosa and traditional attire', icon: '🧣', orderIndex: 2 },
      { id: 'step_bihu_sweets', label: '4. Welcome visiting loved ones with fresh pitha', icon: '🍯', orderIndex: 3 }
    ]
  }
];

export default function SequenceGame() {
  const router = useRouter();
  const { patient } = useAuthStore();
  const { setLastResult } = useGameStore();
  const { language, highContrast } = useAccessibilityStore();

  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentSteps, setCurrentSteps] = useState<SequenceStep[]>([]);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const activeActivity = SEQUENCE_ACTIVITIES[currentActivityIndex] || SEQUENCE_ACTIVITIES[0];

  // Initialize and shuffle steps
  const initializeActivity = useCallback((activity: SequenceActivity) => {
    // Pure shuffle ensuring it starts in a scrambled state
    let scrambled = shuffleArray(activity.steps);
    // Ensure it does not randomly happen to be pre-solved
    if (scrambled.map(s => s.id).join(',') === activity.correctOrderIds.join(',') && scrambled.length > 1) {
      scrambled = [scrambled[1], scrambled[0], ...scrambled.slice(2)];
    }
    setCurrentSteps(scrambled);
    setIsEvaluated(false);
    setIsCorrect(false);
    setFeedback(null);
  }, []);

  useEffect(() => {
    initializeActivity(activeActivity);
  }, [activeActivity, initializeActivity]);

  // Session start
  useEffect(() => {
    if (patient) {
      fetch(`/api/games/${patient.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          game_type: 'sequence',
          difficulty_level: 1
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.id) setSessionId(data.data.id);
        })
        .catch(() => {});
    }
  }, [patient]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Voice narration
  useEffect(() => {
    speech.speak(`${activeActivity.title}. ${activeActivity.instruction}`, language);
  }, [activeActivity, language]);

  // Move step up
  const handleMoveUp = (index: number) => {
    if (index === 0 || isCorrect) return;
    speech.playChime('click');
    const updated = [...currentSteps];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setCurrentSteps(updated);
    setIsEvaluated(false);
  };

  // Move step down
  const handleMoveDown = (index: number) => {
    if (index === currentSteps.length - 1 || isCorrect) return;
    speech.playChime('click');
    const updated = [...currentSteps];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setCurrentSteps(updated);
    setIsEvaluated(false);
  };

  // Check sequence order
  const handleCheckOrder = () => {
    setAttempts(a => a + 1);
    const stepIds = currentSteps.map(s => s.id);
    const result = validateSequenceOrder(stepIds, activeActivity.correctOrderIds);

    setIsEvaluated(true);
    setIsCorrect(result.isCorrect);

    if (result.isCorrect) {
      speech.playChime('success');
      setFeedback('Perfect! You arranged every step in the exact comfortable order!');
      speech.speak('Wonderful! All the steps are in the correct order.', language);
    } else {
      speech.playChime('flip');
      const encouragement = result.correctPositionsCount > 0 
        ? `Good progress! ${result.correctPositionsCount} of ${result.totalSteps} steps are in the right place. Tap the arrows to adjust.`
        : 'Take your time. Think about what happens first, and tap the arrows to reorder.';
      setFeedback(encouragement);
      speech.speak(encouragement, language);
    }
  };

  // Next activity or complete
  const handleNextActivity = () => {
    speech.playChime('click');

    if (currentActivityIndex + 1 < SEQUENCE_ACTIVITIES.length) {
      setCurrentActivityIndex(c => c + 1);
    } else {
      // Completed game
      try {
        confetti({ particleCount: 65, spread: 70 });
      } catch {}

      setLastResult({
        gameType: 'sequence',
        gameTitle: 'Put It in Order',
        score: 100,
        maxScore: 100,
        accuracy: 100,
        timeSeconds: seconds,
        stars: 3,
        encouragement: 'Well done! Reconstructing everyday sequences strengthens logical recall.'
      });

      speech.playChime('complete');
      speech.speak('Wonderful job! You completed all the sequence activities.', language);

      if (patient) {
        fetch(`/api/games/${patient.id}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            session_id: sessionId,
            game_type: 'sequence',
            score: 100,
            max_score: 100,
            difficulty_level: 1
          })
        }).catch(() => {});
      }

      router.push('/patient/session-summary');
    }
  };

  const handleHearInstructions = () => {
    speech.playChime('click');
    speech.speak(`${activeActivity.instruction}. ${activeActivity.contextHint}`, language);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. TOP TIER: Game Header */}
      <GameHeader
        title="Put It in Order"
        subtitle={activeActivity.instruction}
        icon="📋"
        currentIndex={currentActivityIndex}
        totalQuestions={SEQUENCE_ACTIVITIES.length}
        secondsElapsed={seconds}
        onHearQuestion={handleHearInstructions}
        onReset={() => initializeActivity(activeActivity)}
      />

      {/* 2. MIDDLE TIER: Stimulus Card */}
      <div className="glass-card border-2 border-slate-200/80 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-navy mb-2">
          {activeActivity.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6">
          {activeActivity.contextHint}
        </p>

        {/* Reorderable Steps List */}
        <div className="space-y-3 mb-6">
          {currentSteps.map((step, idx) => {
            const isCorrectPosition = isEvaluated && step.id === activeActivity.correctOrderIds[idx];

            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all shadow-sm ${
                  isCorrectPosition
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-200'
                    : 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-navy'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-bloom-card text-sage font-extrabold text-sm flex items-center justify-center border border-slate-200 dark:border-bloom-border">
                    {idx + 1}
                  </span>
                  <span className="text-2xl select-none">{step.icon}</span>
                  <span className="font-bold text-base sm:text-lg">{step.label.replace(/^\d+\.\s*/, '')}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0 || isCorrect}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-bloom-card disabled:opacity-30 transition-all text-sage active:scale-90"
                    title="Move Step Up"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === currentSteps.length - 1 || isCorrect}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-bloom-card disabled:opacity-30 transition-all text-sage active:scale-90"
                    title="Move Step Down"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback text */}
        {feedback && (
          <div className={`p-4 rounded-2xl text-center text-sm sm:text-base font-bold mb-6 border animate-fadeIn ${
            isCorrect
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
          }`}>
            {feedback}
          </div>
        )}

        {/* Action button: Check Order or Next Step */}
        <div className="flex justify-center">
          {isCorrect ? (
            <button
              onClick={handleNextActivity}
              className="px-8 py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>{currentActivityIndex + 1 < SEQUENCE_ACTIVITIES.length ? 'Next Sequence' : 'Complete Activity'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleCheckOrder}
              className="px-8 py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Check My Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
