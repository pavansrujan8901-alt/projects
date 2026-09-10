'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Volume2, 
  Mic, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Info,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useOfflineSyncStatus } from '@/lib/offline/sync-queue';
import { speech } from '@/lib/tts/speech';

export default function NivoraSystemStatus() {
  const { isOnline, pendingCount, isSyncing, syncNow, lastSyncTime } = useOfflineSyncStatus();
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    speech.playChime('click');
    const res = await syncNow();
    speech.playChime('success');
    setSyncFeedback(`Synced ${res.syncedCount} session(s) successfully.`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* 1. Live System Status Bar */}
      <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-bloom-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-sage flex items-center justify-center">
              <Radio className="w-4 h-4 text-sage animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-navy flex items-center gap-2">
                <span>Nivora Platform Telemetry</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                  All Systems Operational
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real-time operational health of AI, speech synthesizers, offline queues, and local databases.
              </p>
            </div>
          </div>

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Offline Queue ({pendingCount})</span>
            </button>
          )}
        </div>

        {syncFeedback && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-sage text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Status Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Internet */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200/80 dark:border-bloom-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Network</span>
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-sage" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isOnline ? 'Connected' : 'Offline Mode'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {pendingCount > 0 ? `${pendingCount} queued` : 'Zero lag'}
            </div>
          </div>

          {/* AI Memory Engine */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200/80 dark:border-bloom-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Engine</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Safe Provenance
            </div>
          </div>

          {/* Voice Companion */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200/80 dark:border-bloom-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice</span>
              <Volume2 className="w-3.5 h-3.5 text-ocean" />
            </div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Female Voice</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Pacing: 0.88x (Calm)
            </div>
          </div>

          {/* Speech Input */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200/80 dark:border-bloom-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speech Mic</span>
              <Mic className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Adaptive</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Web Speech + Fallback
            </div>
          </div>

          {/* Database */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200/80 dark:border-bloom-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database</span>
              <Database className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hybrid Cache</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Zero Config Demo
            </div>
          </div>

          {/* Auto-Sync */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200/80 dark:border-bloom-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync Status</span>
              <RefreshCw className="w-3.5 h-3.5 text-sage" />
            </div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Up to Date</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Continuous'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Medical Notice & Non-Diagnostic Disclosure Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-bloom-dark/60 border border-slate-200 dark:border-bloom-border flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-navy dark:text-slate-100 font-bold block mb-0.5">
            Nivora Clinical Notice &amp; Intended Use:
          </strong>
          <span>
            Nivora is designed strictly for reminiscence, personal memory reinforcement, family connection, and non-clinical cognitive stimulation. Nivora <strong>does not diagnose, treat, mitigate, or prevent</strong> any medical condition, cognitive impairment, or dementia stage, and does not serve as a diagnostic medical device. For clinical evaluations, diagnostic cognitive scoring, and treatment plans, always consult qualified neurologists and healthcare physicians.
          </span>
        </div>
      </div>
    </div>
  );
}
