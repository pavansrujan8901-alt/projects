'use client';

import React, { useState } from 'react';
import { 
  UserPlus, 
  Image as ImageIcon, 
  Gamepad2, 
  TrendingUp, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { speech } from '@/lib/tts/speech';

interface CaregiverGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatientClick?: () => void;
  onMemoryBankClick?: () => void;
  onExploreGamesClick?: () => void;
}

export default function CaregiverGuideModal({
  isOpen,
  onClose,
  onAddPatientClick,
  onMemoryBankClick,
  onExploreGamesClick
}: CaregiverGuideModalProps) {
  const { setCaregiverTourCompleted } = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: 1,
      title: 'Create a Patient',
      desc: 'Add the person who will use Nivora.',
      actionLabel: 'Add Patient',
      icon: <UserPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      badge: 'Step 1 of 4',
      onAction: () => {
        if (onAddPatientClick) onAddPatientClick();
        handleNext();
      }
    },
    {
      stepNumber: 2,
      title: 'Build Their Memory Bank',
      desc: 'Add family members, photos, hobbies, favorite foods and important memories.',
      actionLabel: 'Add Memories',
      icon: <ImageIcon className="w-8 h-8 text-teal-600 dark:text-bloom-cyan" />,
      badge: 'Step 2 of 4',
      onAction: () => {
        if (onMemoryBankClick) onMemoryBankClick();
        handleNext();
      }
    },
    {
      stepNumber: 3,
      title: 'Start Activities',
      desc: 'Nivora uses these details to create more personal activities.',
      actionLabel: 'Explore Games',
      icon: <Gamepad2 className="w-8 h-8 text-amber-500" />,
      badge: 'Step 3 of 4',
      onAction: () => {
        if (onExploreGamesClick) onExploreGamesClick();
        handleNext();
      }
    },
    {
      stepNumber: 4,
      title: 'Track Progress',
      desc: 'See activity trends and helpful observations from the caregiver dashboard.',
      actionLabel: 'View Dashboard',
      icon: <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Step 4 of 4',
      onAction: () => {
        handleFinish();
      }
    }
  ];

  const active = steps[currentStep];

  const handleNext = () => {
    speech.playChime('click');
    if (currentStep + 1 < steps.length) {
      setCurrentStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    speech.playChime('click');
    setCaregiverTourCompleted(true);
    onClose();
  };

  const handleFinish = () => {
    speech.playChime('complete');
    setCaregiverTourCompleted(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-bloom-dark border-2 border-slate-300 dark:border-bloom-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with progress & close */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Caregiver Guide · {active.badge}</span>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-bloom-card transition-all"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator dots */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-purple-600'
                  : idx < currentStep
                  ? 'w-4 bg-purple-300 dark:bg-purple-800'
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border/80 flex items-center justify-center mx-auto mb-5 shadow-inner">
            {active.icon}
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            {active.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto mb-8">
            {active.desc}
          </p>

          {/* Primary Step Action Button */}
          <div className="space-y-3">
            <button
              onClick={active.onAction}
              className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{active.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Continue button if step action is distinct */}
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Continue Tutorial without adding yet
              </button>
            )}
          </div>
        </div>

        {/* Footer with Skip / Restart later */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 dark:border-bloom-border/60 text-xs">
          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Skip Tutorial
          </button>

          <span className="text-slate-400">
            You can restart anytime via <strong className="text-slate-600 dark:text-slate-300">Guided Tour</strong>
          </span>
        </div>

      </div>
    </div>
  );
}
