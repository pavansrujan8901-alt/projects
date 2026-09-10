'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { translations } from '@/lib/i18n/translations';
import { 
  GameType, 
  GameDifficulty, 
  GameQuestion, 
  GameRecordedResponse,
  ValidationResult 
} from '@/lib/games/types';
import { validateAnswer } from '@/lib/games/engine';
import { enqueueOfflineSession } from '@/lib/offline/sync-queue';

interface UseCognitiveGameProps {
  gameType: GameType;
  gameTitle: string;
  initialQuestions: GameQuestion[];
  difficulty?: GameDifficulty;
  encouragementMessage?: string;
}

export function useCognitiveGame({
  gameType,
  gameTitle,
  initialQuestions,
  difficulty = 'easy',
  encouragementMessage = 'Wonderful focus today. Keeping memories alive brings comfort and peace.'
}: UseCognitiveGameProps) {
  const router = useRouter();
  const { patient } = useAuthStore();
  const { setLastResult } = useGameStore();
  const { language } = useAccessibilityStore();
  const t = translations[language] || translations.en;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [recordedResponses, setRecordedResponses] = useState<GameRecordedResponse[]>([]);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  // Update questions if initialQuestions change
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Start timer
  useEffect(() => {
    if (isCompleted) return;
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted]);

  // Start Session with API
  useEffect(() => {
    if (patient) {
      fetch(`/api/games/${patient.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          game_type: gameType,
          difficulty_level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.id) {
            setSessionId(data.data.id);
          }
        })
        .catch(() => {});
    }
  }, [patient, gameType, difficulty]);

  const currentQuestion = questions[currentIndex] || null;

  // Speak current question aloud (short, natural sentence)
  const speakCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;
    speech.playChime('click');
    const text = currentQuestion.subtitle 
      ? `${currentQuestion.prompt}. ${currentQuestion.subtitle}`
      : currentQuestion.prompt;
    speech.speak(text, language);
  }, [currentQuestion, language]);

  // Hear again handler (replays exact current instruction)
  const handleHearAgain = useCallback(() => {
    if (!currentQuestion) return;
    speakCurrentQuestion();
  }, [currentQuestion, speakCurrentQuestion]);

  // Auto-speak on question transition using female companion voice
  useEffect(() => {
    if (currentQuestion && !isAnswered) {
      questionStartTimeRef.current = Date.now();
      speech.speak(currentQuestion.prompt, language);
    }
  }, [currentIndex, currentQuestion, language]);

  /**
   * Selects and validates an answer using immutable IDs.
   * Single source of truth: validationResult drives UI, voice, telemetry, and DB.
   * Uses safe natural response variations from speech.getRandomFeedback() (Section 7 & 8)
   */
  const handleSelectAnswer = useCallback((optionId: string) => {
    if (isAnswered || !currentQuestion) return;

    const responseTimeMs = Math.max(500, Date.now() - questionStartTimeRef.current);
    const result: ValidationResult = validateAnswer(currentQuestion, optionId);

    // Natural safe spoken response variation
    const variation = speech.getRandomFeedback(result.isCorrect);
    const spokenFeedback = currentQuestion.explanation && result.isCorrect
      ? `${variation} ${currentQuestion.explanation}`
      : `${variation} ${result.feedbackText}`;

    setSelectedAnswerId(optionId);
    setIsAnswered(true);
    setIsCorrect(result.isCorrect);
    setFeedbackText(spokenFeedback);
    setAttempts(a => a + 1);

    if (result.isCorrect) {
      setCorrectCount(c => c + 1);
      speech.playChime('success');
    } else {
      speech.playChime('flip');
    }

    // Spoken through the prioritized female voice
    speech.speak(spokenFeedback, language);

    const record: GameRecordedResponse = {
      questionId: currentQuestion.id,
      selectedAnswerId: optionId,
      correctAnswerId: currentQuestion.correctAnswerId,
      isCorrect: result.isCorrect,
      responseTimeMs,
      attempts: 1,
      timestamp: new Date().toISOString()
    };
    setRecordedResponses(prev => [...prev, record]);

    // Send single-source-of-truth telemetry to backend
    if (patient) {
      fetch(`/api/games/${patient.id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId || `sess-${gameType}-${patient.id}`,
          question_data: {
            stimulus_id: currentQuestion.id,
            prompt: currentQuestion.prompt,
            options: currentQuestion.options.map(o => o.label),
            correct_answer: currentQuestion.correctAnswerId
          },
          patient_answer: optionId,
          is_correct: result.isCorrect,
          response_time_ms: responseTimeMs,
          attempts_count: 1
        })
      }).catch(() => {});
    }
  }, [isAnswered, currentQuestion, language, patient, sessionId, gameType]);

  /**
   * Moves to the next question with an atomic state reset to prevent closure leakage.
   */
  const handleNextQuestion = useCallback(() => {
    speech.playChime('click');

    if (currentIndex + 1 < questions.length) {
      // Atomic state reset
      setSelectedAnswerId(null);
      setIsAnswered(false);
      setIsCorrect(null);
      setFeedbackText(null);
      setCurrentIndex(c => c + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      // Complete game
      setIsCompleted(true);
      speech.playChime('complete');

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      const total = Math.max(1, questions.length);
      const calculatedAccuracy = Math.round((correctCount / total) * 100);

      setLastResult({
        gameType,
        gameTitle,
        score: calculatedAccuracy,
        maxScore: 100,
        accuracy: calculatedAccuracy,
        timeSeconds: seconds,
        stars: 3,
        encouragement: encouragementMessage
      });

      speech.speak('Wonderful job! You completed all questions in this activity.', language);

      // Mark session complete in DB
      if (patient) {
        fetch(`/api/games/${patient.id}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            session_id: sessionId,
            game_type: gameType,
            score: calculatedAccuracy,
            max_score: 100,
            difficulty_level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
          })
        }).catch(() => {
          // Offline fallback: Enqueue in local storage for auto-sync
          enqueueOfflineSession({
            id: sessionId || `sess-${Date.now()}`,
            patient_id: patient.id,
            game_type: gameType,
            start_time: new Date(Date.now() - seconds * 1000).toISOString(),
            end_time: new Date().toISOString(),
            score: calculatedAccuracy,
            max_score: 100,
            completed: true,
            difficulty_level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
          });
        });
      }

      router.push('/patient/session-summary');
    }
  }, [
    currentIndex,
    questions.length,
    correctCount,
    gameType,
    gameTitle,
    seconds,
    encouragementMessage,
    patient,
    sessionId,
    difficulty,
    router,
    setLastResult,
    language
  ]);

  /**
   * Completely resets all game state back to question 0.
   */
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswerId(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setFeedbackText(null);
    setCorrectCount(0);
    setAttempts(0);
    setSeconds(0);
    setIsCompleted(false);
    setRecordedResponses([]);
    questionStartTimeRef.current = Date.now();
    speech.playChime('click');
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion,
    selectedAnswerId,
    isAnswered,
    isCorrect,
    feedbackText,
    correctCount,
    attempts,
    seconds,
    isCompleted,
    handleSelectAnswer,
    handleNextQuestion,
    handleRestart,
    speakCurrentQuestion,
    handleHearAgain
  };
}
