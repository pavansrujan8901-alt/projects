'use client';

import React from 'react';
import { ArrowDown, Sparkles, Heart } from 'lucide-react';

interface MemoryToActivityVisualProps {
  memorySnippet: string;
  activityTitle: string;
  categoryIcon?: string;
  className?: string;
}

export default function MemoryToActivityVisual({
  memorySnippet,
  activityTitle,
  categoryIcon = '🌿',
  className = ''
}: MemoryToActivityVisualProps) {
  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-bloom-card/70 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs ${className}`}>
      {/* Top Banner: Warm connection message */}
      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-sage dark:text-emerald-300">
        <span className="text-sm">🌸</span>
        <span className="tracking-wide">This activity came directly from your memories</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* 1. Left: The Cherished Memory */}
        <div className="flex-1 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
          <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-0.5">
            Cherished Memory
          </div>
          <div className="flex items-center gap-2 text-navy dark:text-slate-200 font-semibold text-xs sm:text-sm">
            <span>{categoryIcon}</span>
            <span className="line-clamp-1">{memorySnippet}</span>
          </div>
        </div>

        {/* 2. Center: Elegant Connecting Transition Indicator */}
        <div className="flex items-center justify-center text-sage flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Crafted into</span>
            <span className="sm:hidden">↓</span>
            <span className="hidden sm:inline">→</span>
          </div>
        </div>

        {/* 3. Right: Today's Cognitive Activity */}
        <div className="flex-1 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="text-[10px] font-bold text-sage uppercase tracking-wider mb-0.5">
            Today&apos;s Activity
          </div>
          <div className="flex items-center gap-2 text-navy dark:text-emerald-200 font-bold text-xs sm:text-sm">
            <span>🧠</span>
            <span className="line-clamp-1">{activityTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
