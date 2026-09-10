'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sun, Moon, Sunrise, Sunset, Sparkles } from 'lucide-react';

interface LiveClockProps {
  mode?: 'compact' | 'full' | 'banner';
  className?: string;
}

export default function LiveClock({ mode = 'compact', className = '' }: LiveClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize on client to avoid SSR hydration mismatch
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-slate-400 ${className}`}>
        <Clock className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-bloom-teal" />
        <span>Loading time...</span>
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Period of the day for dementia temporal orientation
  let periodGreeting = 'Morning';
  let periodIcon = <Sunrise className="w-4 h-4 text-amber-500" />;
  let periodBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/30';

  if (hours >= 12 && hours < 17) {
    periodGreeting = 'Afternoon';
    periodIcon = <Sun className="w-4 h-4 text-amber-500" />;
    periodBadgeClass = 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-300 dark:border-sky-500/30';
  } else if (hours >= 17 && hours < 21) {
    periodGreeting = 'Evening';
    periodIcon = <Sunset className="w-4 h-4 text-orange-500" />;
    periodBadgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border-orange-300 dark:border-orange-500/30';
  } else if (hours >= 21 || hours < 5) {
    periodGreeting = 'Night';
    periodIcon = <Moon className="w-4 h-4 text-indigo-500" />;
    periodBadgeClass = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30';
  }

  const timeString = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const compactTimeString = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFormatted = time.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Compact Mode (for Navbar header)
  if (mode === 'compact') {
    return (
      <div className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 shadow-sm ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {periodIcon}
          <span className="font-mono font-bold text-slate-900 dark:text-white">{compactTimeString}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{dayName}, {dateFormatted}</span>
        </div>
      </div>
    );
  }

  // Banner Mode (for Patient Dashboard Hero & Orientation Widget)
  return (
    <div className={`rounded-3xl p-5 sm:p-6 bg-white dark:bg-bloom-dark border-2 border-slate-300 dark:border-bloom-border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-bloom-card border border-teal-200 dark:border-bloom-border flex items-center justify-center text-teal-600 dark:text-bloom-cyan shadow-sm flex-shrink-0">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${periodBadgeClass}`}>
              {periodIcon}
              <span>{periodGreeting} Time</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Orientation Clock
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Today is <strong>{dayName}</strong>, {dateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Large Live Digital Time Display */}
      <div className="px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border text-center shadow-inner">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
          Current Live Time
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-700 dark:text-bloom-cyan tracking-wider">
          {timeString}
        </div>
      </div>
    </div>
  );
}
