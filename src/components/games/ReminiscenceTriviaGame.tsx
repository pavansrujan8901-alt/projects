'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { initialTrivia } from '@/lib/mock-db';
import { ReminiscenceQuestion } from '@/types/database';
import { GameQuestion, GameOption } from '@/lib/games/types';
import { shuffleArray } from '@/lib/games/engine';
import { useCognitiveGame } from '@/hooks/useCognitiveGame';
import GameHeader from './common/GameHeader';
import VoiceAnswerButton from '@/components/patient/VoiceAnswerButton';

/**
 * Transforms legacy ReminiscenceQuestion into GameQuestion with immutable IDs.
 * Shuffles options so correct answer is NOT always at position 0, while keeping ID stable.
 */
function toGameQuestion(q: ReminiscenceQuestion): GameQuestion {
  const correctOptionText = q.options[q.correct_answer_index] || q.options[0];
  const correctId = `opt_${q.id}_correct`;

  const rawOptions: GameOption[] = q.options.map((optText, idx) => {
    const isThisCorrect = idx === q.correct_answer_index;
    return {
      id: isThisCorrect ? correctId : `opt_${q.id}_distractor_${idx}`,
      label: optText,
      icon: '📻'
    };
  });

  return {
    id: q.id,
    prompt: q.question,
    subtitle: `Memories of ${q.topic || 'Golden Eras'}`,
    category: q.topic || 'trivia',
    options: shuffleArray(rawOptions), // Shuffled presentation order, ID stays stable!
    correctAnswerId: correctId,
    explanation: q.fun_fact,
    eraYear: q.era_year
  };
}

export default function ReminiscenceTriviaGame() {
  const { patient } = useAuthStore();
  const { language, highContrast } = useAccessibilityStore();

  const [rawTrivia, setRawTrivia] = useState<ReminiscenceQuestion[]>(initialTrivia);

  // Fetch personalized trivia from Memory Bank if available
  useEffect(() => {
    if (patient) {
      fetch(`/api/reminiscence/${patient.id}?lang=${language}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            setRawTrivia(data.data);
          }
        })
        .catch(() => {});
    }
  }, [patient, language]);

  const questions: GameQuestion[] = useMemo(() => {
    return rawTrivia.map(toGameQuestion);
  }, [rawTrivia]);

  const {
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
    gameType: 'reminiscence_trivia',
    gameTitle: 'Memory Trivia',
    initialQuestions: questions,
    difficulty: 'easy',
    encouragementMessage: 'Nostalgic memories bring comfort and awaken rich stories from golden years.'
  });

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. TOP TIER: Game Header */}
      <GameHeader
        title="Memory Trivia"
        subtitle={patient ? `Personalized for ${patient.name} (${patient.hometown.split(',')[0]})` : 'Gentle questions evoking familiar memories.'}
        icon="📻"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        secondsElapsed={seconds}
        onHearQuestion={speakCurrentQuestion}
        onReset={handleRestart}
      />

      {/* 2. MIDDLE TIER: Question Stimulus Card */}
      <div className="glass-card border-2 border-slate-200/80 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Era: {currentQuestion.eraYear ? `${currentQuestion.eraYear}` : 'Classic Memory'}</span>
          </span>

          <button
            onClick={speakCurrentQuestion}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <span>Listen</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-6 leading-snug">
          {currentQuestion.prompt}
        </h2>

        {/* AI Voice Companion: Speak Answer */}
        {!isAnswered && (
          <div className="mb-5 flex items-center justify-center">
            <VoiceAnswerButton
              options={currentQuestion.options.map(o => o.label)}
              onSelectOption={(idx) => {
                const opt = currentQuestion.options[idx];
                if (opt) handleSelectAnswer(opt.id);
              }}
              disabled={isAnswered}
            />
          </div>
        )}

        {/* 3. BOTTOM TIER: Options List */}
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
            } else if (highContrast) {
              btnStyle = 'bg-yellow-400 text-black border-yellow-300 font-bold hover:bg-yellow-300';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                disabled={isAnswered}
                className={`w-full min-h-[58px] p-4 rounded-2xl border-2 text-left font-semibold text-base sm:text-lg transition-all flex items-center justify-between active:scale-98 shadow-sm ${btnStyle}`}
              >
                <span>{option.label}</span>
                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Positive Encouraging Banner & Next Button */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-sage flex items-center justify-center text-xl flex-shrink-0">
                🌿
              </div>
              <div>
                <div className="text-base font-bold text-navy">
                  {isCorrect ? 'Well done! Great memory!' : 'A pleasant memory!'}
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
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Activity'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
