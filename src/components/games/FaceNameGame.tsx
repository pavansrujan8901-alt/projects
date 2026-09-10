'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Heart, HelpCircle, ArrowRight, CheckCircle2, Volume2 } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { useGameStore } from '@/store/game-store';
import { initialPhotos } from '@/lib/mock-db';
import { PatientPhoto } from '@/types/database';
import { GameQuestion, GameOption } from '@/lib/games/types';
import { shuffleArray } from '@/lib/games/engine';
import GameHeader from './common/GameHeader';
import VoiceAnswerButton from '@/components/patient/VoiceAnswerButton';

export default function FaceNameGame() {
  const router = useRouter();
  const { patient } = useAuthStore();
  const { setLastResult } = useGameStore();
  const { language, highContrast } = useAccessibilityStore();

  const [photos, setPhotos] = useState<PatientPhoto[]>(() => {
    return initialPhotos.filter(p => !p.category || p.category === 'family');
  });

  // Difficulty: 1 = Easy (2 choices), 2 = Medium (3 choices), 3 = Advanced (4 choices)
  const [difficulty, setDifficulty] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const questionStartTimeRef = useRef<number>(Date.now());

  // Fetch photos if possible
  useEffect(() => {
    if (patient) {
      fetch(`/api/patients/${patient.id}/photos`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            const familyOnly = data.data.filter((p: PatientPhoto) => !p.category || p.category === 'family');
            if (familyOnly.length > 0) {
              setPhotos(familyOnly);
            }
          }
        })
        .catch(() => {});
    }
  }, [patient]);

  // Session start
  useEffect(() => {
    if (patient) {
      fetch(`/api/games/${patient.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          game_type: 'face_name',
          difficulty_level: difficulty
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.id) setSessionId(data.data.id);
        })
        .catch(() => {});
    }
  }, [patient, difficulty]);

  // Gentle timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPhoto = photos[currentIndex] || initialPhotos[0];

  // Progressive choices generator based on difficulty
  const choices = useMemo(() => {
    if (!currentPhoto) return [];

    const otherPhotos = photos.filter(p => p.id !== currentPhoto.id);
    const distractorCount = difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3;
    const chosenDistractors = shuffleArray(otherPhotos).slice(0, distractorCount);

    const pool = [currentPhoto, ...chosenDistractors];

    // Format choices based on difficulty
    return shuffleArray(pool).map(p => {
      let label = p.person_name;
      let sublabel = '';
      if (difficulty === 2) {
        sublabel = p.relationship;
      } else if (difficulty === 3) {
        sublabel = `${p.relationship} ${p.context_memory ? '• ' + p.context_memory.slice(0, 45) + '...' : ''}`;
      }
      return {
        id: p.id,
        personName: p.person_name,
        relationship: p.relationship,
        label,
        sublabel
      };
    });
  }, [currentPhoto, photos, difficulty]);

  // Speak prompt on photo change
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    speech.speak("Who is in this photo? Look at the smiling face and choose their name.", language);
  }, [currentIndex, language]);

  const handleSelect = (chosenId: string) => {
    if (isAnswered || !currentPhoto) return;

    const reactionTimeMs = Math.max(500, Date.now() - questionStartTimeRef.current);
    const correct = chosenId === currentPhoto.id;

    setSelectedPersonId(chosenId);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(c => c + 1);
      speech.playChime('success');
      speech.speak(`Well done! That is ${currentPhoto.person_name}, your ${currentPhoto.relationship}!`, language);
    } else {
      speech.playChime('flip');
      speech.speak(`Nice memory! This is your ${currentPhoto.relationship}, ${currentPhoto.person_name}.`, language);
    }

    // Telemetry
    if (patient) {
      fetch(`/api/games/${patient.id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId || `sess-fn-${patient.id}`,
          question_data: {
            stimulus_id: currentPhoto.id,
            image_url: currentPhoto.file_url,
            correct_name: currentPhoto.person_name,
            relationship: currentPhoto.relationship
          },
          patient_answer: chosenId,
          is_correct: correct,
          response_time_ms: reactionTimeMs
        })
      }).catch(() => {});
    }
  };

  const handleNext = () => {
    speech.playChime('click');

    if (currentIndex + 1 < photos.length) {
      // Atomic reset
      setSelectedPersonId(null);
      setIsAnswered(false);
      setIsCorrect(null);
      setShowHint(false);
      setCurrentIndex(c => c + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      // Completed game
      try {
        confetti({ particleCount: 65, spread: 65 });
      } catch {}

      const total = Math.max(1, photos.length);
      const calculatedAccuracy = Math.round((correctCount / total) * 100);

      setLastResult({
        gameType: 'face_name',
        gameTitle: 'Face & Name',
        score: calculatedAccuracy,
        maxScore: 100,
        accuracy: calculatedAccuracy,
        timeSeconds: seconds,
        stars: 3,
        encouragement: 'Nice memory! Connecting with familiar family faces brings joy and warmth.'
      });

      speech.playChime('complete');
      speech.speak("Activity Complete! Connecting with familiar faces keeps our memories close.", language);

      if (patient) {
        fetch(`/api/games/${patient.id}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            session_id: sessionId,
            game_type: 'face_name',
            score: calculatedAccuracy,
            max_score: 100,
            difficulty_level: difficulty
          })
        }).catch(() => {});
      }

      router.push('/patient/session-summary');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedPersonId(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setShowHint(false);
    setCorrectCount(0);
    setSeconds(0);
    questionStartTimeRef.current = Date.now();
    speech.playChime('click');
  };

  const handleHearQuestion = () => {
    speech.playChime('click');
    speech.speak("Who is in this photo? Choose the name of your loved one.", language);
  };

  if (!currentPhoto) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. TOP TIER: Game Header */}
      <GameHeader
        title="Face & Name"
        subtitle="Look at the photo and pick the name you remember. There is no rush."
        icon="💖"
        currentIndex={currentIndex}
        totalQuestions={photos.length}
        secondsElapsed={seconds}
        onHearQuestion={handleHearQuestion}
        onReset={handleRestart}
        customStatusBadge={
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-bloom-dark p-1 rounded-2xl border border-slate-200 dark:border-bloom-border">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setDifficulty(lvl);
                  setSelectedPersonId(null);
                  setIsAnswered(false);
                  setIsCorrect(null);
                }}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all ${
                  difficulty === lvl
                    ? 'bg-sage text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy'
                }`}
              >
                {lvl === 1 ? '2 Choices' : lvl === 2 ? '3 Choices' : '4 Choices'}
              </button>
            ))}
          </div>
        }
      />

      {/* 2. MIDDLE TIER: Large Image & Stimulus */}
      <div className="glass-card border-2 border-slate-200/80 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Photo Display */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-emerald-100 dark:border-emerald-900/50 shadow-md flex-shrink-0 bg-slate-100">
            {currentPhoto?.file_url ? (
              <img
                src={currentPhoto.file_url}
                alt={`Family member ${currentPhoto.relationship}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                👤
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs text-white text-center font-medium">
              Family & Loved Ones
            </div>
          </div>

          {/* Question & Options */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Who is in this photo?
              </h2>
              <button
                onClick={() => {
                  speech.playChime('click');
                  setShowHint(true);
                  speech.speak(`Hint: This person is your beloved ${currentPhoto.relationship}.`, language);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Need a Hint?</span>
              </button>
            </div>

            {/* Gentle Hint */}
            {showHint && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
                <Heart className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Hint:</strong> This is your <strong>{currentPhoto.relationship}</strong>!
                </span>
              </div>
            )}

            {/* AI Voice Companion: Speak Answer */}
            {!isAnswered && (
              <div className="mb-4 flex items-center justify-center">
                <VoiceAnswerButton
                  options={choices.map(c => c.label)}
                  onSelectOption={(idx) => {
                    const choice = choices[idx];
                    if (choice) handleSelect(choice.id);
                  }}
                  disabled={isAnswered}
                />
              </div>
            )}

            {/* 3. BOTTOM TIER: Clear, Large Answer Buttons */}
            <div className="grid grid-cols-1 gap-3">
              {choices.map((choice) => {
                const isSelected = selectedPersonId === choice.id;
                const isThisCorrect = choice.id === currentPhoto.id;

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
                    key={choice.id}
                    onClick={() => handleSelect(choice.id)}
                    disabled={isAnswered}
                    className={`min-h-[58px] p-4 rounded-2xl border-2 text-left font-semibold text-base transition-all flex items-center justify-between active:scale-98 shadow-sm ${btnStyle}`}
                  >
                    <div>
                      <div className="font-bold">{choice.label}</div>
                      {choice.sublabel && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                          {choice.sublabel}
                        </div>
                      )}
                    </div>
                    {isAnswered && isThisCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback Banner & Next Button */}
        {isAnswered && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-sage flex items-center justify-center text-2xl flex-shrink-0">
                🌿
              </div>
              <div>
                <div className="text-base font-bold text-navy">
                  {isCorrect ? 'Well done! Nice memory!' : 'A lovely memory!'}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  This is <strong>{currentPhoto.person_name}</strong> ({currentPhoto.relationship}).
                  {currentPhoto.context_memory && ` "${currentPhoto.context_memory}"`}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>{currentIndex + 1 < photos.length ? 'Next Photo' : 'Complete Activity'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
