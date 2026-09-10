'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  User, 
  Image as ImageIcon, 
  Gamepad2, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Play
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { speech } from '@/lib/tts/speech';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickStartModal({ isOpen, onClose }: QuickStartModalProps) {
  const router = useRouter();
  const { loginAsDemoCaregiver, loginAsDemoPatient } = useAuthStore();
  const { closeQuickStart, setCaregiverTourCompleted } = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: '🚀 Quick Start Mode',
      subtitle: 'Experience Nivora in 60 seconds with pre-loaded clinical sample data.',
      desc: 'We will load a sample patient, populate their memory bank with family photos, showcase how personalized games work, and see live clinical telemetry.',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      actionText: 'Load Sample Patient'
    },
    {
      title: '1. Sample Patient Profile',
      subtitle: 'Dharani Baruah · Guwahati, Assam (Born 1948)',
      desc: 'Early-stage dementia patient profile with personalized 6-digit access PIN (123456), preferred Assamese & English languages, and nostalgic music preferences.',
      icon: <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      actionText: 'Preview Memory Bank'
    },
    {
      title: '2. Sample Memory Bank',
      subtitle: 'Autobiographical photos & family network loaded.',
      desc: 'Four high-resolution family photos tagged with relationships: Meera (Daughter), Aarav (Grandson), Subhadra (Sister), and Pranab (Son), ready for recall games.',
      icon: <ImageIcon className="w-8 h-8 text-teal-600 dark:text-bloom-cyan" />,
      actionText: 'Connect to Cognitive Games'
    },
    {
      title: '3. Adaptive Cognitive Activities',
      subtitle: 'Games automatically personalize based on the memory bank.',
      desc: 'Face-Name recall uses their family photos. Reminiscence trivia asks about 1960s Guwahati culture. Working memory games adapt dynamically across 3 difficulty levels.',
      icon: <Gamepad2 className="w-8 h-8 text-rose-500" />,
      actionText: 'View Clinical Telemetry'
    },
    {
      title: '4. Caregiver Insights & Trends',
      subtitle: 'Real-time telemetry and AI clinical summaries ready.',
      desc: 'Caregiver dashboard tracks +27% accuracy trajectory, -1.6s latency reductions, and exports printable geriatric clinical evaluation reports.',
      icon: <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      actionText: 'Enter Caregiver Dashboard'
    }
  ];

  const active = demoSteps[currentStep];

  const handleNext = () => {
    speech.playChime('click');
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleLaunchDashboard();
    }
  };

  const handleLaunchDashboard = () => {
    speech.playChime('complete');
    loginAsDemoCaregiver();
    setCaregiverTourCompleted(true);
    closeQuickStart();
    onClose();
    router.push('/caregiver/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-bloom-dark border-2 border-slate-300 dark:border-bloom-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Flow</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {demoSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-7 bg-amber-500'
                  : idx < currentStep
                  ? 'w-3 bg-amber-300 dark:bg-amber-800'
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-bloom-card border border-slate-200 dark:border-bloom-border flex items-center justify-center mx-auto mb-4 shadow-sm">
            {active.icon}
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
            {active.title}
          </h3>

          <p className="text-sm font-semibold text-teal-700 dark:text-bloom-teal mb-3">
            {active.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto mb-8">
            {active.desc}
          </p>

          <button
            onClick={handleNext}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>{active.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 mt-4 border-t border-slate-100 dark:border-bloom-border/60">
          <button
            onClick={handleLaunchDashboard}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Skip to Caregiver Dashboard directly →
          </button>
        </div>

      </div>
    </div>
  );
}
