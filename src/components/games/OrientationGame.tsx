'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CheckCircle2, Mic, MicOff, Volume2, ArrowRight } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { generateOrientationQuestions } from '@/lib/games/engine';
import { useCognitiveGame } from '@/hooks/useCognitiveGame';
import GameHeader from './common/GameHeader';

export default function OrientationGame() {
  const { language, highContrast } = useAccessibilityStore();
  
  // Calculate questions dynamically using the client device's actual local time
  const orientationQuestions = useMemo(() => {
    return generateOrientationQuestions(new Date());
  }, []);

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
    gameType: 'orientation',
    gameTitle: 'Daily Orientation',
    initialQuestions: orientationQuestions,
    difficulty: 'easy',
    encouragementMessage: 'Daily orientation keeps our awareness grounded and connected with the rhythm of life.'
  });

  const [isListening, setIsListening] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<{ stop: () => void } | null>(null);

  // STT Voice Input handler
  const handleVoiceInput = () => {
    if (!currentQuestion || isAnswered) return;

    if (isListening) {
      if (speechRecognizer) speechRecognizer.stop();
      setIsListening(false);
      return;
    }

    speech.playChime('click');
    setIsListening(true);

    const rec = speech.startListening(
      (transcript) => {
        setIsListening(false);
        const matched = currentQuestion.options.find(opt =>
          transcript.toLowerCase().includes(opt.label.toLowerCase()) ||
          opt.label.toLowerCase().includes(transcript.toLowerCase())
        );

        if (matched) {
          handleSelectAnswer(matched.id);
        } else {
          // If no direct label match, try first option or speak gently
          speech.speak(`You said "${transcript}". Tap an option below to confirm.`, language);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    setSpeechRecognizer(rec);
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. TOP TIER: Unified Accessible Game Header with Home & Exit confirmation */}
      <GameHeader
        title="Daily Orientation"
        subtitle="Take a comfortable moment to connect with today's date and season."
        icon="🌅"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        secondsElapsed={seconds}
        onHearQuestion={speakCurrentQuestion}
        onReset={handleRestart}
      />

      {/* 2. MIDDLE TIER: Question Stimulus Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-md mb-8 text-center border-2 border-slate-200/80 dark:border-bloom-border">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-2 leading-snug">
          {currentQuestion.prompt}
        </h2>
        {currentQuestion.subtitle && (
          <p className="text-slate-600 dark:text-slate-300 text-base mb-8">
            {currentQuestion.subtitle}
          </p>
        )}

        {/* 3. BOTTOM TIER: Large Answer Buttons (Min 64px touch target) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswerId === option.id;
            const isThisCorrect = option.id === currentQuestion.correctAnswerId;

            let btnStyle = 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-navy hover:border-sage hover:bg-emerald-50/50';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-extrabold shadow-sm';
              } else if (isSelected && !isThisCorrect) {
                btnStyle = 'bg-slate-100 dark:bg-bloom-card border-slate-300 text-slate-600 dark:text-slate-400';
              } else {
                btnStyle = 'bg-slate-50 dark:bg-bloom-card/40 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (highContrast) {
              btnStyle = 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300 font-bold';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={isAnswered}
                className={`min-h-[72px] p-5 rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-between gap-4 active:scale-95 shadow-sm ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  {option.icon && <span className="text-3xl select-none">{option.icon}</span>}
                  <span className="text-left leading-tight">{option.label}</span>
                </div>
                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-sage flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Voice Input STT Helper */}
        {!isAnswered && (
          <div className="pt-4 border-t border-slate-100 dark:border-bloom-border flex items-center justify-center">
            <button
              onClick={handleVoiceInput}
              className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${
                isListening
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                  : 'bg-slate-50 dark:bg-bloom-dark hover:bg-slate-100 border-slate-200 dark:border-bloom-border text-sage'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-white" />
                  <span>Listening... Speak now</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Speak Your Answer</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Warm, Encouraging Feedback Banner & Next Button */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-sage flex items-center justify-center text-xl flex-shrink-0">
                🌱
              </div>
              <div>
                <div className="text-base font-bold text-navy">
                  {isCorrect ? 'Well done!' : 'Good try!'}
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
              <span>{currentIndex + 1 < questions.length ? 'Next Step' : 'Complete Check-in'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
