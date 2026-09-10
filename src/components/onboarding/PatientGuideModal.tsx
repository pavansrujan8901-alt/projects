'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  ArrowRight, 
  Check, 
  X,
  Heart,
  Gamepad2,
  Calendar
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { speech } from '@/lib/tts/speech';

interface PatientGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartActivity?: (activityHref?: string) => void;
}

export default function PatientGuideModal({
  isOpen,
  onClose,
  onStartActivity
}: PatientGuideModalProps) {
  const { setPatientGuideCompleted } = useOnboardingStore();
  const { language } = useAccessibilityStore();
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [selectedActivity, setSelectedActivity] = useState<string>('/patient/games/memory-match');

  useEffect(() => {
    if (isOpen) {
      if (screen === 1) {
        speech.speak("Welcome! We'll do a few simple activities together.", language);
      } else if (screen === 2) {
        speech.speak("Choose an activity. Pick something you'd like to try.", language);
      } else if (screen === 3) {
        speech.speak("Take your time. There is no need to rush. Just do your best.", language);
      }
    }
  }, [isOpen, screen, language]);

  if (!isOpen) return null;

  const handleNext = () => {
    speech.playChime('click');
    if (screen === 1) setScreen(2);
    else if (screen === 2) setScreen(3);
    else handleFinish();
  };

  const handleFinish = () => {
    speech.playChime('complete');
    setPatientGuideCompleted(true);
    onClose();
    if (onStartActivity) {
      onStartActivity(selectedActivity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-bloom-dark border-4 border-teal-300 dark:border-bloom-border rounded-3xl max-w-xl w-full p-6 sm:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Read Aloud & Close Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (screen === 1) speech.speak("Welcome! We'll do a few simple activities together.", language);
              if (screen === 2) speech.speak("Choose an activity. Pick something you'd like to try.", language);
              if (screen === 3) speech.speak("Take your time. There is no need to rush. Just do your best.", language);
            }}
            className="px-4 py-2 rounded-2xl bg-teal-50 dark:bg-bloom-card border-2 border-teal-300 dark:border-bloom-border text-teal-800 dark:text-bloom-cyan text-sm font-bold flex items-center gap-2 hover:bg-teal-100 transition-all"
          >
            <Volume2 className="w-5 h-5 text-teal-600 dark:text-bloom-teal" />
            <span>Read to Me</span>
          </button>

          <button
            onClick={() => {
              setPatientGuideCompleted(true);
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-bloom-card text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SCREEN 1: WELCOME */}
        {screen === 1 && (
          <div className="text-center py-4 animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-bloom-teal/20 text-teal-700 dark:text-bloom-teal flex items-center justify-center mx-auto mb-6 text-5xl shadow-sm">
              🌱
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Welcome! 🌱
            </h2>

            <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-10 max-w-md mx-auto">
              We&apos;ll do a few simple activities together.
            </p>

            <button
              onClick={handleNext}
              className="w-full py-4 sm:py-5 px-8 rounded-3xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xl shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* SCREEN 2: CHOOSE AN ACTIVITY */}
        {screen === 2 && (
          <div className="text-center py-2 animate-in fade-in">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Choose an Activity
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Pick something you&apos;d like to try.
            </p>

            <div className="space-y-3 mb-8 text-left">
              {[
                {
                  id: '/patient/games/memory-match',
                  title: 'Memory Match',
                  icon: '🌸',
                  color: 'border-teal-400 bg-teal-50/50 dark:bg-bloom-card',
                  desc: 'Match gentle pairs of flowers and peaceful cards.'
                },
                {
                  id: '/patient/games/face-name',
                  title: 'Face–Name Recall',
                  icon: '💖',
                  color: 'border-rose-400 bg-rose-50/50 dark:bg-bloom-card',
                  desc: 'See familiar smiling photos of family and friends.'
                },
                {
                  id: '/patient/games/orientation',
                  title: "Today's Orientation",
                  icon: '🌅',
                  color: 'border-amber-400 bg-amber-50/50 dark:bg-bloom-card',
                  desc: 'Gentle check-in for day, pleasant weather, and season.'
                }
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => setSelectedActivity(act.id)}
                  className={`w-full p-4 rounded-2xl border-3 flex items-center gap-4 transition-all ${
                    selectedActivity === act.id
                      ? 'border-teal-600 bg-teal-50 dark:bg-bloom-surface shadow-md'
                      : 'border-slate-200 dark:border-bloom-border bg-white dark:bg-bloom-dark hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl">{act.icon}</span>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {act.desc}
                    </div>
                  </div>
                  {selectedActivity === act.id && (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 px-8 rounded-3xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-lg shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SCREEN 3: TAKE YOUR TIME */}
        {screen === 3 && (
          <div className="text-center py-4 animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 text-5xl shadow-sm">
              🕊️
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Take Your Time
            </h2>

            <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-10 max-w-md mx-auto">
              There is no need to rush. Just do your best.
            </p>

            <button
              onClick={handleFinish}
              className="w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span>Start</span>
              <ArrowRight className="w-7 h-7" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
