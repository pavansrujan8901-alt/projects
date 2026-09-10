'use client';

import React, { useState } from 'react';
import { TrendingUp, Activity, Clock, Award, BarChart3, LineChart } from 'lucide-react';
import { GameSession } from '@/types/database';

interface CaregiverChartsProps {
  sessions: GameSession[];
}

export default function CaregiverCharts({ sessions }: CaregiverChartsProps) {
  const [activeTab, setActiveTab] = useState<'accuracy' | 'speed' | 'breakdown'>('accuracy');

  // 7-day trend data
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const accuracyValues = [65, 70, 75, 80, 85, 88, 92];
  const latencyValues = [3.8, 3.4, 3.1, 2.9, 2.6, 2.4, 2.2]; // in seconds

  const gameTypeBreakdown = [
    { name: 'Face–Name Recall', sessions: 8, avgAccuracy: 86, color: 'bg-rose-500' },
    { name: 'Memory Match', sessions: 12, avgAccuracy: 82, color: 'bg-emerald-600' },
    { name: 'Reminiscence Trivia', sessions: 6, avgAccuracy: 90, color: 'bg-amber-500' },
    { name: 'Daily Orientation', sessions: 7, avgAccuracy: 98, color: 'bg-sky-500' }
  ];

  return (
    <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-bloom-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sage" />
            <span>Weekly Engagement & Activity Trends</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Clear, gentle weekly progress across visual matching, face recall, and daily check-ins
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-bloom-dark p-1 rounded-2xl border border-slate-200 dark:border-bloom-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('accuracy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'accuracy'
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-navy'
            }`}
          >
            Engagement Consistency
          </button>
          <button
            onClick={() => setActiveTab('speed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'speed'
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-navy'
            }`}
          >
            Response Comfort
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'breakdown'
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-navy'
            }`}
          >
            Activity Breakdown
          </button>
        </div>
      </div>

      {/* Chart View 1: Consistency / Accuracy */}
      {activeTab === 'accuracy' && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>7-Day Activity Trend</span>
            <span className="text-sage font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +27% steady engagement this week
            </span>
          </div>

          <div className="relative h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-3 bg-slate-50 dark:bg-bloom-dark rounded-2xl border border-slate-200 dark:border-bloom-border">
            {/* Horizontal Guide Lines */}
            <div className="absolute inset-x-0 top-1/4 border-b border-slate-200 dark:border-slate-800"></div>
            <div className="absolute inset-x-0 top-2/4 border-b border-slate-200 dark:border-slate-800"></div>
            <div className="absolute inset-x-0 top-3/4 border-b border-slate-200 dark:border-slate-800"></div>

            {accuracyValues.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end z-10 group">
                <span className="text-[11px] font-bold text-navy dark:text-sky-300 mb-1.5 font-mono">
                  {val}%
                </span>
                <div
                  style={{ height: `${val}%` }}
                  className="w-full max-w-[36px] bg-sage hover:bg-emerald-600 rounded-t-xl transition-all duration-500 shadow-sm"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {trendDays[idx]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Baseline Start</div>
              <div className="text-lg font-bold text-navy font-mono">65%</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="text-[11px] text-sage font-medium">Current Week Peak</div>
              <div className="text-lg font-bold text-sage font-mono">92%</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Recommended Target</div>
              <div className="text-lg font-bold text-navy font-mono">80%+</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart View 2: Response Comfort (Latency) */}
      {activeTab === 'speed' && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Average Comfortable Response Pace (Seconds per question)</span>
            <span className="text-sage font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> -1.6s smoother recall
            </span>
          </div>

          <div className="relative h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-3 bg-slate-50 dark:bg-bloom-dark rounded-2xl border border-slate-200 dark:border-bloom-border">
            {latencyValues.map((val, idx) => {
              const barHeightPct = Math.round((val / 4.5) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end z-10 group">
                  <span className="text-[11px] font-bold text-ocean mb-1.5 font-mono">
                    {val}s
                  </span>
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className="w-full max-w-[36px] bg-ocean hover:bg-sky-600 rounded-t-xl transition-all duration-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {trendDays[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-200">
            💡 <strong>Caregiver Observation:</strong> A steady, calm response time shows that the patient is comfortable with the activities and recognizes familiar memory cues with confidence.
          </p>
        </div>
      )}

      {/* Chart View 3: Breakdown by Game */}
      {activeTab === 'breakdown' && (
        <div className="space-y-3">
          {gameTypeBreakdown.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border">
              <div className="flex items-center justify-between text-sm font-semibold text-navy mb-2">
                <span>{item.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {item.avgAccuracy}% completion ({item.sessions} sessions)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${item.avgAccuracy}%` }}
                  className={`h-full rounded-full ${item.color} transition-all duration-700`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
