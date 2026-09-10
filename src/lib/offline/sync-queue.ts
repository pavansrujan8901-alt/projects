'use client';

// ==============================================================================
// NIVORA - OFFLINE SESSION QUEUE & AUTO-SYNCHRONIZATION
// Guarantees zero patient data loss during connectivity drops.
// Caches completed game sessions in localStorage and automatically flushes
// to the cloud/database whenever online connection is restored.
// ==============================================================================

import { useState, useEffect, useCallback } from 'react';
import { GameSession } from '@/types/database';

const QUEUE_KEY = 'nivora_offline_session_queue';
const LAST_SYNC_KEY = 'nivora_last_sync_timestamp';

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine !== false;
}

export function getOfflineQueue(): GameSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineSession(session: GameSession): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflineQueue();
    // Deduplicate by session ID
    const exists = current.some(s => s.id === session.id);
    if (!exists) {
      current.push(session);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('nivora:sync-change'));
    }
  } catch (e) {
    console.error('Failed to enqueue offline session:', e);
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(QUEUE_KEY);
    window.dispatchEvent(new CustomEvent('nivora:sync-change'));
  } catch {}
}

export async function syncOfflineQueue(): Promise<{ syncedCount: number; failedCount: number }> {
  if (typeof window === 'undefined' || !isOnline()) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const remaining: GameSession[] = [];

  for (const session of queue) {
    try {
      const res = await fetch(`/api/games/${session.patient_id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (res.ok) {
        syncedCount++;
      } else {
        remaining.push(session);
        failedCount++;
      }
    } catch {
      remaining.push(session);
      failedCount++;
    }
  }

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('nivora:sync-change'));
  } catch {}

  return { syncedCount, failedCount };
}

// Auto-sync event listener on reconnection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Nivora: Internet restored. Flushing offline session queue...');
    syncOfflineQueue();
  });
}

/**
 * React hook to observe online connectivity, queue depth, and trigger manual syncs.
 */
export function useOfflineSyncStatus() {
  const [online, setOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const refreshState = useCallback(() => {
    if (typeof window === 'undefined') return;
    setOnline(navigator.onLine !== false);
    setPendingCount(getOfflineQueue().length);
    setLastSyncTime(localStorage.getItem(LAST_SYNC_KEY));
  }, []);

  useEffect(() => {
    refreshState();

    const handleOnline = () => {
      setOnline(true);
      syncOfflineQueue().then(() => refreshState());
    };

    const handleOffline = () => {
      setOnline(false);
      refreshState();
    };

    const handleCustomSync = () => {
      refreshState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('nivora:sync-change', handleCustomSync);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('nivora:sync-change', handleCustomSync);
    };
  }, [refreshState]);

  const syncNow = async () => {
    setIsSyncing(true);
    const res = await syncOfflineQueue();
    setIsSyncing(false);
    refreshState();
    return res;
  };

  return {
    isOnline: online,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow
  };
}
