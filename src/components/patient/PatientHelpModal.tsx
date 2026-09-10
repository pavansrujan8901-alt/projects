'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HelpCircle, 
  X, 
  Volume2, 
  Mic, 
  Home, 
  Globe, 
  Type, 
  PhoneCall, 
  Play,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { useAuthStore } from '@/store/auth-store';

interface PatientHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientHelpModal({
  isOpen,
  onClose
}: PatientHelpModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, cycleTextScale } = useAccessibilityStore();
  const { patient } = useAuthStore();

  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [responseMessage, setResponseMessage] = useState<string>('');

  const getContextInstruction = () => {
    if (pathname.includes('/games/memory-match')) {
      return 'You are playing Memory Match. Tap two cards to turn them over and find matching pictures. Take all the time you need.';
    } else if (pathname.includes('/games/face-name')) {
      return 'You are looking at a family photograph. Tap the name that belongs to your loved one. Take all the time you need.';
    } else if (pathname.includes('/games/reminiscence')) {
      return 'You are enjoying Memory Trivia. Tap the answer that feels right to you. There are no wrong answers.';
    } else if (pathname.includes('/games/orientation')) {
      return 'You are doing your daily check-in. Tap today’s day of the week or date.';
    } else if (pathname.includes('/games/sequence')) {
      return 'You are putting daily steps in order. Tap the arrows to arrange them from first to last.';
    } else if (pathname.includes('/games/association')) {
      return 'You are connecting familiar objects with memories. Tap the story that belongs with the object.';
    } else if (pathname.includes('/games/category-sort')) {
      return 'You are grouping memories. Tap the category that matches the item shown.';
    } else if (pathname.includes('/games/picture-recall')) {
      return 'You are observing a peaceful picture, then answering a simple memory question.';
    } else {
      return `Hello ${patient?.name || ''}. You are on your home screen. Tap 'Start Today\'s Activity' to begin a peaceful 3-minute activity.`;
    }
  };

  const activeInstruction = responseMessage || getContextInstruction();

  useEffect(() => {
    if (isOpen) {
      speech.speak(activeInstruction, language);
    } else {
      speech.stop();
    }
  }, [isOpen, activeInstruction, language]);

  const handleHearInstructions = () => {
    speech.playChime('click');
    speech.speak(activeInstruction, language);
  };

  const handleVoiceAsk = () => {
    if (isListening) {
      speech.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setSpokenTranscript('');
    speech.playChime('click');

    const listener = speech.startListening(
      (transcript) => {
        setIsListening(false);
        setSpokenTranscript(transcript);
        processPatientVoiceQuery(transcript);
      },
      () => {
        setIsListening(false);
      },
      language
    );

    if (!listener) {
      setIsListening(false);
    }
  };

  // Enhanced Voice-First command recognition (Section 10)
  const processPatientVoiceQuery = async (queryText: string) => {
    const lower = queryText.toLowerCase().trim();

    // 1. "Repeat" / "Hear again" / "Speak again"
    if (lower.includes('repeat') || lower.includes('again') || lower.includes('speak again')) {
      const msg = 'Of course. ' + getContextInstruction();
      setResponseMessage(msg);
      speech.speak(msg, language);
      return;
    }

    // 2. "I don't understand" / "What do I do" / "Help me"
    if (lower.includes('understand') || lower.includes('what do i do') || lower.includes('help me') || lower.includes('confused')) {
      const msg = "That's okay. I'll explain it again. " + getContextInstruction();
      setResponseMessage(msg);
      speech.speak(msg, language);
      return;
    }

    // 3. "Go home" / "Exit"
    if (lower.includes('home') || lower.includes('exit') || lower.includes('leave')) {
      speech.speak('Taking you to your home screen.', language, () => {
        router.push('/patient/dashboard');
        onClose();
      });
      return;
    }

    // 4. "Make it bigger" / "Larger text"
    if (lower.includes('bigger') || lower.includes('larger') || lower.includes('font')) {
      cycleTextScale();
      const msg = 'Text size adjusted.';
      setResponseMessage(msg);
      speech.speak(msg, language);
      return;
    }

    // 5. "Change language"
    if (lower.includes('language') || lower.includes('assamese') || lower.includes('hindi')) {
      speech.speak('Opening language selection.', language, () => {
        router.push('/language');
        onClose();
      });
      return;
    }

    // Fallback: Call AI patient help endpoint
    try {
      const res = await fetch('/api/ai/patient-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          current_screen: pathname,
          patient_name: patient?.name || 'there',
          language
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResponseMessage(data.data.message);
        speech.speak(data.data.message, language);
      }
    } catch {
      const fallback = 'I am here with you. Feel free to explore any activity or tap Home to relax.';
      setResponseMessage(fallback);
      speech.speak(fallback, language);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Large Glass Panel */}
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl relative border-2 border-slate-200 dark:border-bloom-border">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-bloom-card text-slate-500 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-2xl shadow-sm">
            🌸
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
              Nivora Voice Companion
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              I am here to guide you gently. What would you like help with?
            </p>
          </div>
        </div>

        {/* Current Instruction Display */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 mb-6 text-left">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-100 leading-relaxed">
              &quot;{activeInstruction}&quot;
            </p>
            <button
              onClick={handleHearInstructions}
              className="p-2.5 rounded-xl bg-sage hover:bg-emerald-700 text-white shadow-sm flex-shrink-0 transition-all active:scale-95"
              title="Hear instruction aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice ask button */}
        <div className="mb-6 flex flex-col items-center">
          <button
            onClick={handleVoiceAsk}
            className={`min-h-[58px] px-8 py-3.5 rounded-2xl border-2 font-bold text-base flex items-center gap-3 transition-all active:scale-95 shadow-md ${
              isListening
                ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                : 'bg-sage hover:bg-emerald-700 text-white border-sage'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>{isListening ? 'Listening... Speak now' : 'Ask Question with Your Voice'}</span>
          </button>
          {spokenTranscript && (
            <p className="text-xs text-slate-500 mt-2">
              You said: &quot;{spokenTranscript}&quot;
            </p>
          )}
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={handleHearInstructions}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 border border-slate-200 dark:border-bloom-border text-navy text-left font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-sage flex-shrink-0" />
            <span>Repeat Instruction</span>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push('/patient/dashboard');
            }}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 border border-slate-200 dark:border-bloom-border text-navy text-left font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4 text-ocean flex-shrink-0" />
            <span>Go Home</span>
          </button>

          <button
            onClick={() => {
              cycleTextScale();
              speech.speak('Text size adjusted.', language);
            }}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 border border-slate-200 dark:border-bloom-border text-navy text-left font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Type className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>Larger Text</span>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push('/language');
            }}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 border border-slate-200 dark:border-bloom-border text-navy text-left font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Globe className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Change Language</span>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push('/patient/dashboard');
            }}
            className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 text-sage text-left font-bold text-xs flex items-center gap-2 transition-all active:scale-95 col-span-2 sm:col-span-2"
          >
            <Play className="w-4 h-4 fill-sage text-sage flex-shrink-0" />
            <span>Continue Today&apos;s Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
}
