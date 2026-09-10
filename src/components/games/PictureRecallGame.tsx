'use client';

import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCognitiveGame } from '@/hooks/useCognitiveGame';
import { GameQuestion } from '@/lib/games/types';
import GameHeader from './common/GameHeader';

const PICTURE_RECALL_QUESTIONS: GameQuestion[] = [
  {
    id: 'pic_01',
    prompt: 'What special family moment was in the picture you just viewed?',
    subtitle: 'Choose what you recognized in the image.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_pic_01_correct', label: 'Daughter Meera graduation in Assam Muga silk', icon: '👩‍🎓' },
      { id: 'opt_pic_01_d1', label: 'A busy train station in Mumbai', icon: '🚂' },
      { id: 'opt_pic_01_d2', label: 'A snowy mountain hike in winter', icon: '🏔️' }
    ],
    correctAnswerId: 'opt_pic_01_correct',
    explanation: 'Meera celebrated her university degree wearing her mother’s traditional silk saree.'
  },
  {
    id: 'pic_02',
    prompt: 'What peaceful water body was shown in the scenery?',
    subtitle: 'Think of the wide sacred river with wooden ferries.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_pic_02_d1', label: 'An ocean cruise ship in the Pacific', icon: '🚢' },
      { id: 'opt_pic_02_correct', label: 'Brahmaputra River at golden sunset near Umananda', icon: '⛵' },
      { id: 'opt_pic_02_d2', label: 'A busy city harbor with container cranes', icon: '🏗️' }
    ],
    correctAnswerId: 'opt_pic_02_correct',
    explanation: 'The sunset boat rides across the Brahmaputra bring calm and gentle memories.'
  }
];

export default function PictureRecallGame() {
  const [viewingImage, setViewingImage] = useState(true);
  const [viewCountdown, setViewCountdown] = useState(6);

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
    handleNextQuestion: originalNextQuestion,
    handleRestart,
    speakCurrentQuestion
  } = useCognitiveGame({
    gameType: 'picture_recall',
    gameTitle: 'Remember the Picture',
    initialQuestions: PICTURE_RECALL_QUESTIONS,
    difficulty: 'easy',
    encouragementMessage: 'Observing pictures and recalling details keeps visual attention sharp and peaceful.'
  });

  // Countdown timer for viewing the picture
  useEffect(() => {
    if (!viewingImage) return;
    setViewCountdown(6);
    const interval = setInterval(() => {
      setViewCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          setViewingImage(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [viewingImage, currentIndex]);

  const handleProceedToQuestion = () => {
    setViewingImage(false);
  };

  const handleNext = () => {
    setViewingImage(true);
    originalNextQuestion();
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <GameHeader
        title="Remember the Picture"
        subtitle="Look gently at the picture, then answer a simple memory question."
        icon="🖼️"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        secondsElapsed={seconds}
        onHearQuestion={speakCurrentQuestion}
        onReset={handleRestart}
      />

      {viewingImage ? (
        // Picture Viewing Phase
        <div className="glass-card border-2 border-slate-200/80 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8 text-center animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sage border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sage" />
              <span>Observing Picture ({viewCountdown}s remaining)</span>
            </span>

            <button
              onClick={handleProceedToQuestion}
              className="px-4 py-1.5 rounded-xl bg-sage hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              I am Ready
            </button>
          </div>

          <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md mb-6 border-2 border-emerald-100">
            <img
              src={currentQuestion.imageUrl}
              alt="Observation scene"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Take a calm moment to notice the smiling face, colors, and place in the picture.
          </p>
        </div>
      ) : (
        // Question Phase
        <div className="glass-card border-2 border-slate-200/80 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8 animate-fadeIn">
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
                    {isCorrect ? 'Well done! Great observation!' : 'Good try!'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {feedbackText}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 flex-shrink-0"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Picture' : 'Complete Activity'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
