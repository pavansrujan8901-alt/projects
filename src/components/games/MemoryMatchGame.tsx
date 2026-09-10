'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { RotateCcw, Clock, ArrowRight, Volume2, Sparkles } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import GameHeader from './common/GameHeader';

interface MatchCard {
  uniqueId: string; // unique card id in the deck
  pairId: string;   // stable matching pair id (e.g. 'pair_kamal')
  symbol: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOL_POOL = [
  { pairId: 'pair_lotus', symbol: '🌸', label: 'Lotus (Kamal)' },
  { pairId: 'pair_chai', symbol: '🫖', label: 'Morning Chai' },
  { pairId: 'pair_mango', symbol: '🥭', label: 'Golden Mango' },
  { pairId: 'pair_sitar', symbol: '🪕', label: 'Sitar & Dotara' },
  { pairId: 'pair_paddy', symbol: '🌾', label: 'Golden Paddy (Dhan)' },
  { pairId: 'pair_diya', symbol: '🪔', label: 'Brass Diya (Chaki)' },
  { pairId: 'pair_tea_leaf', symbol: '🍃', label: 'Fresh Tea Leaves' },
  { pairId: 'pair_peacock', symbol: '🦚', label: 'Peacock (Mayur)' },
  { pairId: 'pair_flute', symbol: '🪈', label: 'Bamboo Flute (Bahi)' },
  { pairId: 'pair_marigold', symbol: '🌺', label: 'Marigold (Genda)' }
];

export default function MemoryMatchGame() {
  const router = useRouter();
  const { patient } = useAuthStore();
  const { setLastResult } = useGameStore();
  const { language, highContrast } = useAccessibilityStore();

  // Difficulty: 1 = Easy (2x2, 2 pairs), 2 = Medium (3x4, 6 pairs), 3 = Advanced (4x4, 8 pairs)
  const [difficulty, setDifficulty] = useState<number>(1);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [positiveFeedback, setPositiveFeedback] = useState<string | null>(null);

  const totalPairs = difficulty === 1 ? 2 : difficulty === 2 ? 6 : 8;

  // Initialize game deck using stable pairIds
  const initializeGame = useCallback(() => {
    const selectedPool = SYMBOL_POOL.slice(0, totalPairs);
    
    // Create pair pairs
    const deck: { pairId: string; symbol: string; label: string }[] = [];
    selectedPool.forEach(item => {
      deck.push({ ...item });
      deck.push({ ...item });
    });

    // Pure Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const initialCards: MatchCard[] = deck.map((item, index) => ({
      uniqueId: `card_${index}_${item.pairId}`,
      pairId: item.pairId,
      symbol: item.symbol,
      label: item.label,
      isFlipped: false,
      isMatched: false
    }));

    setCards(initialCards);
    setFlippedIndices([]);
    setAttempts(0);
    setMatches(0);
    setIsCompleted(false);
    setSeconds(0);
    setPositiveFeedback(null);
    speech.playChime('complete');
  }, [totalPairs]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Session start
  useEffect(() => {
    if (patient) {
      fetch(`/api/games/${patient.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          game_type: 'memory_match',
          difficulty_level: difficulty
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
  }, [patient, difficulty]);

  // Gentle timer (no countdown pressure)
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Handle card tap
  const handleCardClick = (index: number) => {
    if (isCompleted || flippedIndices.length >= 2) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    speech.playChime('flip');

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(a => a + 1);
      const [idx1, idx2] = newFlipped;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];

      // Match strictly by pairId, NEVER by symbol or position
      if (card1.pairId === card2.pairId) {
        setTimeout(() => {
          speech.playChime('success');
          const matchedCards = [...newCards];
          matchedCards[idx1].isMatched = true;
          matchedCards[idx2].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setPositiveFeedback(`Great match! You found the ${card1.label}!`);
          speech.speak(`Wonderful! You found the ${card1.label}.`, language);

          setMatches(m => {
            const nextMatches = m + 1;
            if (nextMatches === totalPairs) {
              handleGameCompletion(attempts + 1);
            }
            return nextMatches;
          });
        }, 400);
      } else {
        // Not a match, flip back gently without harsh buzzer
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[idx1].isFlipped = false;
          resetCards[idx2].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

  const handleGameCompletion = (finalAttempts: number) => {
    setIsCompleted(true);
    speech.playChime('star');

    try {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const calculatedAccuracy = Math.round((totalPairs / Math.max(finalAttempts, totalPairs)) * 100);

    setLastResult({
      gameType: 'memory_match',
      gameTitle: 'Memory Match',
      score: calculatedAccuracy,
      maxScore: 100,
      accuracy: calculatedAccuracy,
      timeSeconds: seconds,
      stars: 3,
      encouragement: 'Well done! You found every matching pair at your own gentle pace.'
    });

    speech.speak('Well done! You completed all the matching pairs.', language);

    // Save completed session to database
    if (patient) {
      fetch(`/api/games/${patient.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          session_id: sessionId,
          game_type: 'memory_match',
          score: calculatedAccuracy,
          max_score: 100,
          difficulty_level: difficulty
        })
      }).catch(() => {});
    }
  };

  const handleHearInstructions = () => {
    speech.playChime('click');
    speech.speak("Memory Match. Tap any card to look underneath, then tap another card to find its matching pair.", language);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* 1. TOP TIER: Game Header with Exit confirmation */}
      <GameHeader
        title="Memory Match"
        subtitle="Tap cards to find matching pairs. Take all the time you need."
        icon="🌸"
        progressPercent={(matches / totalPairs) * 100}
        secondsElapsed={seconds}
        onHearQuestion={handleHearInstructions}
        onReset={initializeGame}
        customStatusBadge={
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-bloom-dark p-1 rounded-2xl border border-slate-200 dark:border-bloom-border">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                  difficulty === lvl
                    ? 'bg-sage text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy'
                }`}
              >
                {lvl === 1 ? 'Easy (4 Cards)' : lvl === 2 ? 'Medium (12 Cards)' : 'Advanced (16 Cards)'}
              </button>
            ))}
          </div>
        }
      />

      {/* Pairs found status banner */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 px-2">
        <span>Pairs Matched: {matches} of {totalPairs}</span>
        <span>Turns Taken: {attempts}</span>
      </div>

      {/* Gentle feedback banner */}
      {positiveFeedback && (
        <div className="mb-4 text-center text-sm sm:text-base font-bold text-sage animate-fadeIn bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          {positiveFeedback}
        </div>
      )}

      {/* 2. MIDDLE TIER: Card Grid */}
      <div className={`grid gap-3 sm:gap-4 mx-auto mb-8 ${
        difficulty === 1 
          ? 'grid-cols-2 max-w-xs' 
          : difficulty === 2 
            ? 'grid-cols-3 sm:grid-cols-4 max-w-xl' 
            : 'grid-cols-4 max-w-2xl'
      }`}>
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;

          let cardClasses = 'card-3d aspect-square rounded-3xl p-3 flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 border-2 shadow-sm ';

          if (card.isMatched) {
            cardClasses += 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300 cursor-default';
          } else if (isRevealed) {
            cardClasses += 'card-3d-selected glass-card border-sage text-navy shadow-md';
          } else if (highContrast) {
            cardClasses += 'bg-yellow-400 text-black border-yellow-300 hover:scale-105 cursor-pointer';
          } else {
            cardClasses += 'glass-card border-slate-200/90 dark:border-bloom-border hover:border-sage hover:shadow-md cursor-pointer';
          }

          return (
            <button
              key={card.uniqueId}
              onClick={() => handleCardClick(idx)}
              disabled={isRevealed || isCompleted}
              className={cardClasses}
              aria-label={isRevealed ? card.label : `Card ${idx + 1}`}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center animate-fadeIn text-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl mb-1 select-none">
                    {card.symbol}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                    {card.label}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <span className="text-2xl sm:text-3xl text-sage/70">🌿</span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-1">
                    #{idx + 1}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. BOTTOM TIER: Actions */}
      {isCompleted ? (
        <div className="text-center p-8 glass-card border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl shadow-lg animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-sage mx-auto flex items-center justify-center mb-3 text-3xl">
            🌱
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-2">Great match! Well done!</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6">
            You matched every pair with calm focus in {seconds} seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={initializeGame}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-bloom-dark hover:bg-slate-50 border border-slate-300 dark:border-bloom-border text-navy font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-sage" />
              <span>Play Again</span>
            </button>
            <button
              onClick={() => router.push('/patient/session-summary')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-95"
            >
              <span>View Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={initializeGame}
            className="px-5 py-2.5 rounded-2xl bg-white dark:bg-bloom-card hover:bg-slate-50 border border-slate-200 dark:border-bloom-border text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2 text-xs transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-sage" />
            <span>Reset Cards</span>
          </button>
        </div>
      )}
    </div>
  );
}
