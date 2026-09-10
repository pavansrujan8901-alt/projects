'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAuthStore } from '@/store/auth-store';
import { useGameStore } from '@/store/game-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { CategoryGroup, CategoryItem } from '@/lib/games/types';
import { shuffleArray } from '@/lib/games/engine';
import GameHeader from './common/GameHeader';

const CATEGORIES: CategoryGroup[] = [
  { id: 'cat_food', name: 'Food & Flavors', icon: '🍲', color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200' },
  { id: 'cat_music', name: 'Songs & Melody', icon: '🎶', color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-900 dark:text-purple-200' },
  { id: 'cat_places', name: 'Places & Nature', icon: '🏞️', color: 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 text-sky-900 dark:text-sky-200' },
  { id: 'cat_family', name: 'Family & Loved Ones', icon: '💖', color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200' }
];

const ITEMS_POOL: CategoryItem[] = [
  { id: 'item_tenga', label: 'Masor Tenga Fish Curry', icon: '🐟', categoryId: 'cat_food' },
  { id: 'item_bhupen', label: 'Dr. Bhupen Hazarika Folk Ballads', icon: '🪕', categoryId: 'cat_music' },
  { id: 'item_brahmaputra', label: 'Brahmaputra River Ghat', icon: '⛵', categoryId: 'cat_places' },
  { id: 'item_meera', label: 'Daughter Meera (Maajoni)', icon: '👩', categoryId: 'cat_family' },
  { id: 'item_pitha', label: 'Fresh Coconut Pitha & Jaggery', icon: '🍯', categoryId: 'cat_food' },
  { id: 'item_shillong', label: "Ward's Lake in Shillong", icon: '🌲', categoryId: 'cat_places' }
];

export default function CategorySortGame() {
  const router = useRouter();
  const { patient } = useAuthStore();
  const { setLastResult } = useGameStore();
  const { language } = useAccessibilityStore();

  const [items, setItems] = useState<CategoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({}); // itemId -> categoryId
  const [seconds, setSeconds] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const initGame = useCallback(() => {
    setItems(shuffleArray(ITEMS_POOL));
    setSelectedItemId(ITEMS_POOL[0]?.id || null);
    setPlacedItems({});
    setFeedback(null);
    setIsCompleted(false);
    setSeconds(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Session start
  useEffect(() => {
    if (patient) {
      fetch(`/api/games/${patient.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          game_type: 'category_sort',
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
    if (isCompleted) return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Read prompt aloud
  useEffect(() => {
    speech.speak("Category Sort. Select an item, then choose which family category it belongs into.", language);
  }, [language]);

  const activeItem = items.find(it => it.id === selectedItemId) || null;
  const remainingItems = items.filter(it => !placedItems[it.id]);

  // Place item into category
  const handleSelectCategory = (categoryId: string) => {
    if (!activeItem || isCompleted) return;

    // Strict validation by stable category ID
    if (activeItem.categoryId === categoryId) {
      speech.playChime('success');
      const updatedPlaced = { ...placedItems, [activeItem.id]: categoryId };
      setPlacedItems(updatedPlaced);
      setFeedback(`Correct! ${activeItem.label} belongs here.`);
      speech.speak(`Well done! ${activeItem.label} belongs here.`, language);

      const stillRemaining = items.filter(it => !updatedPlaced[it.id]);
      if (stillRemaining.length > 0) {
        setSelectedItemId(stillRemaining[0].id);
      } else {
        // All completed!
        setIsCompleted(true);
        speech.playChime('complete');
        speech.speak("Wonderful! All familiar items have been sorted into their categories.", language);

        try {
          confetti({ particleCount: 65, spread: 70 });
        } catch {}

        setLastResult({
          gameType: 'category_sort',
          gameTitle: 'Category Sort',
          score: 100,
          maxScore: 100,
          accuracy: 100,
          timeSeconds: seconds,
          stars: 3,
          encouragement: 'Sorting familiar memories into groups keeps thoughts organized and connected.'
        });

        if (patient) {
          fetch(`/api/games/${patient.id}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'complete',
              session_id: sessionId,
              game_type: 'category_sort',
              score: 100,
              max_score: 100,
              difficulty_level: 1
            })
          }).catch(() => {});
        }
      }
    } else {
      speech.playChime('flip');
      const targetCat = CATEGORIES.find(c => c.id === categoryId);
      setFeedback(`Good try! ${activeItem.label} does not fit into ${targetCat?.name || 'this group'}. Try another.`);
      speech.speak(`That's okay! Try another group for ${activeItem.label}.`, language);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      <GameHeader
        title="Category Sort"
        subtitle="Group familiar memories into their rightful places."
        icon="🗂️"
        progressPercent={(Object.keys(placedItems).length / items.length) * 100}
        secondsElapsed={seconds}
        onReset={initGame}
      />

      {/* Active Item Stimulus */}
      {!isCompleted && activeItem && (
        <div className="glass-card border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl p-6 mb-8 text-center shadow-md animate-fadeIn">
          <span className="text-xs uppercase font-extrabold tracking-wider text-sage mb-1 block">
            Item to Group ({items.length - remainingItems.length + 1} of {items.length})
          </span>
          <div className="text-4xl sm:text-5xl mb-2">{activeItem.icon}</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            {activeItem.label}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
            Tap the matching category below that this belongs to:
          </p>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div className="mb-6 text-center text-sm sm:text-base font-bold text-sage animate-fadeIn bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 max-w-xl mx-auto">
          {feedback}
        </div>
      )}

      {/* Category Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {CATEGORIES.map((category) => {
          const itemsInThisCat = items.filter(it => placedItems[it.id] === category.id);

          return (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category.id)}
              disabled={isCompleted}
              className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col justify-between min-h-[140px] shadow-sm active:scale-98 ${category.color} hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl select-none">{category.icon}</span>
                  <span className="font-extrabold text-lg sm:text-xl">{category.name}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/30">
                  {itemsInThisCat.length} placed
                </span>
              </div>

              {/* Badges of placed items */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {itemsInThisCat.map(it => (
                  <span key={it.id} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/40 font-semibold text-navy">
                    <span>{it.icon}</span>
                    <span>{it.label.split(' ')[0]}</span>
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {isCompleted && (
        <div className="text-center p-8 glass-card border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl shadow-lg animate-fadeIn max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-sage mx-auto flex items-center justify-center mb-3 text-3xl">
            🌱
          </div>
          <h2 className="text-2xl font-extrabold text-navy mb-2">Category Sort Complete!</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            You organized every cherished memory into its rightful home.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push('/patient/session-summary')}
              className="px-8 py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
            >
              <span>View Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
