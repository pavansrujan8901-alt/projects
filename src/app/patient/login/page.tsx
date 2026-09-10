'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Delete, Sparkles, AlertCircle, Volume2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { translations } from '@/lib/i18n/translations';
import { speech } from '@/lib/tts/speech';

export default function PatientLoginPage() {
  const router = useRouter();
  const { setPatient, loginAsDemoPatient } = useAuthStore();
  const { language, highContrast } = useAccessibilityStore();
  const t = translations[language] || translations.en;

  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = (digit: string) => {
    speech.playChime('click');
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    speech.playChime('click');
    setPin(p => p.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    speech.playChime('click');
    setPin('');
    setError(null);
  };

  const verifyPin = async (codeToVerify: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_code: codeToVerify })
      });
      const data = await res.json();

      if (data.success && data.data) {
        speech.playChime('success');
        setPatient(data.data.patient, data.data.token);
        speech.speak(`Welcome back, ${data.data.patient.name}! Let us play today's memory games.`, language);
        router.push('/patient/dashboard');
      } else {
        speech.playChime('flip');
        setError(data.error || 'Invalid 6-digit access code.');
        speech.speak('The code did not match. Please try again or tap the demo button below.', language);
      }
    } catch {
      // Fallback
      loginAsDemoPatient(codeToVerify);
      router.push('/patient/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (code: string) => {
    speech.playChime('success');
    setPin(code);
    verifyPin(code);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-teal-100 dark:bg-bloom-teal/20 text-teal-700 dark:text-bloom-teal mx-auto flex items-center justify-center mb-4 shadow-lg shadow-bloom-teal/10">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          {t.enterPin}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Please enter your 6-digit access number to begin your memory activities.
        </p>
      </div>

      {/* PIN Boxes */}
      <div className="flex justify-center items-center gap-3 mb-6">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const digit = pin[index];
          return (
            <div
              key={index}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold font-mono transition-all ${
                digit
                  ? 'border-teal-500 dark:border-bloom-cyan bg-teal-50 dark:bg-bloom-surface text-teal-800 dark:text-bloom-cyan shadow-md shadow-bloom-cyan/20 scale-105'
                  : 'border-slate-300 dark:border-bloom-border bg-white dark:bg-bloom-card text-slate-400'
              }`}
            >
              {digit ? '•' : ''}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-2 justify-center animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            disabled={isLoading}
            className={`h-16 sm:h-20 rounded-2xl border-2 text-2xl sm:text-3xl font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-100 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-white'
            }`}
          >
            {digit}
          </button>
        ))}

        <button
          onClick={handleClear}
          disabled={isLoading}
          className="h-16 sm:h-20 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 font-bold text-sm sm:text-base flex items-center justify-center active:scale-95"
        >
          Clear
        </button>

        <button
          onClick={() => handleKeyPress('0')}
          disabled={isLoading}
          className={`h-16 sm:h-20 rounded-2xl border-2 text-2xl sm:text-3xl font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300'
              : 'bg-white dark:bg-bloom-card hover:bg-slate-100 dark:hover:bg-bloom-surface border-slate-300 dark:border-bloom-border text-slate-800 dark:text-white'
          }`}
        >
          0
        </button>

        <button
          onClick={handleBackspace}
          disabled={isLoading}
          className="h-16 sm:h-20 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 flex items-center justify-center active:scale-95"
          aria-label="Delete last digit"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Instant Demo Access Buttons */}
      <div className="space-y-2.5 pt-4 border-t border-slate-300 dark:border-bloom-border/60">
        <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Hackathon Quick Demo Credentials:
        </div>

        <button
          onClick={() => handleQuickDemo('123456')}
          className="w-full p-3 rounded-2xl bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-teal/40 text-left transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-bloom-teal transition-colors">
              Dharani Baruah (Guwahati, Assam)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">PIN: 123456 · Early Stage · Age 78</div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </button>

        <button
          onClick={() => handleQuickDemo('789012')}
          className="w-full p-3 rounded-2xl bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-border text-left transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-bloom-cyan transition-colors">
              Kamala Devi (Shillong, Meghalaya)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">PIN: 789012 · MCI Stage · Age 74</div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </button>
      </div>
    </div>
  );
}
