'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useCognitiveGame } from '@/hooks/useCognitiveGame';
import { GameQuestion } from '@/lib/games/types';
import GameHeader from './common/GameHeader';

const ASSOCIATION_QUESTIONS: GameQuestion[] = [
  {
    id: 'assoc_01',
    prompt: 'What cherished memory is connected with this Morning Chai pot?',
    subtitle: 'Look at the steaming tea pot and choose the familiar memory.',
    category: 'association',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_assoc_chai_correct', label: 'Enjoying fresh ginger tea on the veranda at dawn', icon: '🫖' },
      { id: 'opt_assoc_chai_d1', label: 'Repairing a bicycle gear in the shed', icon: '🚲' },
      { id: 'opt_assoc_chai_d2', label: 'Rushing to catch an early express train', icon: '🚂' }
    ],
    correctAnswerId: 'opt_assoc_chai_correct',
    explanation: 'Morning chai on the veranda brings peaceful reflection and family warmth.'
  },
  {
    id: 'assoc_02',
    prompt: 'What music memory belongs with this string Dotara instrument?',
    subtitle: 'Think of golden tunes played during gentle afternoons.',
    category: 'association',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_assoc_dotara_d1', label: 'Working on school physics exam papers', icon: '📚' },
      { id: 'opt_assoc_dotara_correct', label: 'Listening to Dr. Bhupen Hazarika folk records on the gramophone', icon: '🪕' },
      { id: 'opt_assoc_dotara_d2', label: 'Buying fresh river fish at the crowded Sunday market', icon: '🐟' }
    ],
    correctAnswerId: 'opt_assoc_dotara_correct',
    explanation: 'Soulful Dotara notes evoke the timeless ballads of the Brahmaputra valley.'
  },
  {
    id: 'assoc_03',
    prompt: 'What family tradition is connected with this handwoven Gamosa?',
    subtitle: 'A beloved symbol of deep respect and festival blessings.',
    category: 'association',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_assoc_gamosa_d1', label: 'Watching an evening football match', icon: '⚽' },
      { id: 'opt_assoc_gamosa_d2', label: 'Baking bread in an outdoor clay oven', icon: '🍞' },
      { id: 'opt_assoc_gamosa_correct', label: 'Presenting hand-woven Gamosas to elders during Rongali Bihu', icon: '🌸' }
    ],
    correctAnswerId: 'opt_assoc_gamosa_correct',
    explanation: 'Presenting a Gamosa honors parents and elders with lifelong love and blessings.'
  }
];

export default function AssociationGame() {
  const {
    questions,
    currentIndex,
    currentQuestion,
    selectedAnswerId,
    isAnswered,
    isCorrect,
    feedbackText,
    seconds,
    handleSelectAnswer,
    handleNextQuestion,
    handleRestart,
    speakCurrentQuestion
  } = useCognitiveGame({
    gameType: 'association',
    gameTitle: 'Object & Memory Association',
    initialQuestions: ASSOCIATION_QUESTIONS,
    difficulty: 'easy',
    encouragementMessage: 'Connecting everyday objects with memories keeps our life stories shining bright.'
  });

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <GameHeader
        title="Object & Memory"
        subtitle="Connect the familiar object with its heartfelt story."
        icon="🕊️"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        secondsElapsed={seconds}
        onHearQuestion={speakCurrentQuestion}
        onReset={handleRestart}
      />

      <div className="glass-card border-2 border-slate-200/80 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8">
        {currentQuestion.imageUrl && (
          <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden mb-6 shadow-sm border border-slate-200 dark:border-bloom-border">
            <img
              src={currentQuestion.imageUrl}
              alt="Memory stimulus"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-2">
          {currentQuestion.prompt}
        </h2>
        {currentQuestion.subtitle && (
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            {currentQuestion.subtitle}
          </p>
        )}

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswerId === option.id;
            const isThisCorrect = option.id === currentQuestion.correctAnswerId;

            let btnStyle = 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-navy hover:border-sage hover:bg-emerald-50/50';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
              } else if (isSelected && !isThisCorrect) {
                btnStyle = 'bg-slate-100 dark:bg-bloom-card border-slate-300 text-slate-600';
              } else {
                btnStyle = 'bg-slate-50 dark:bg-bloom-card/40 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={isAnswered}
                className={`w-full min-h-[58px] p-4 rounded-2xl border-2 text-left font-semibold text-base transition-all flex items-center justify-between active:scale-98 shadow-sm ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  {option.icon && <span className="text-2xl select-none">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-sage flex items-center justify-center text-xl flex-shrink-0">
                🌿
              </div>
              <div>
                <div className="text-base font-bold text-navy">
                  {isCorrect ? 'Well done!' : 'A comforting memory!'}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  {feedbackText}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 flex-shrink-0"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Memory' : 'Complete Activity'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
