'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Home } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationHref?: string;
}

export default function ExitConfirmModal({
  isOpen,
  onClose,
  destinationHref = '/patient/dashboard'
}: ExitConfirmModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-scaleUp">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 text-3xl shadow-sm">
          🌱
        </div>

        <h3 id="exit-modal-title" className="text-2xl font-bold text-navy mb-2">
          Take a gentle pause?
        </h3>

        <p className="text-slate-600 dark:text-slate-300 text-base mb-6 leading-relaxed">
          Leave this activity? Your progress will be saved. You can always return whenever you feel ready.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5 fill-white/30" />
            <span>Stay Here</span>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push(destinationHref);
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 dark:bg-bloom-dark hover:bg-slate-200 border border-slate-200 dark:border-bloom-border text-slate-700 dark:text-slate-200 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5 text-slate-500" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
