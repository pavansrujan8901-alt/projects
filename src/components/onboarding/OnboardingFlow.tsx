'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  User, 
  Volume2, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Type, 
  Eye, 
  Gamepad2, 
  X,
  Lock
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { useAuthStore } from '@/store/auth-store';
import { speech } from '@/lib/tts/speech';
import { translations, SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n/translations';

interface OnboardingFlowProps {
  onComplete?: () => void;
  isOpen?: boolean;
}

export default function OnboardingFlow({ onComplete, isOpen = true }: OnboardingFlowProps) {
  const router = useRouter();
  const { setConsentAndProfile, closeOnboarding } = useOnboardingStore();
  const { 
    language, 
    setLanguage, 
    isDarkMode, 
    toggleDarkMode, 
    textScale, 
    cycleTextScale, 
    highContrast, 
    toggleHighContrast 
  } = useAccessibilityStore();
  const { loginAsDemoPatient, loginAsDemoCaregiver } = useAuthStore();

  const [step, setStep] = useState<'welcome' | 'consent' | 'register'>('welcome');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'caregiver'>('patient');

  // Consent states
  const [consentCognitive, setConsentCognitive] = useState(true);
  const [consentPrivacy, setConsentPrivacy] = useState(true);
  const [consentAudio, setConsentAudio] = useState(true);

  // Registration states
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female',
    birthYear: 1950,
    preferredLanguage: language
  });

  const [formError, setFormError] = useState('');

  const t = translations[language] || translations.en;

  const handleSelectRole = (role: 'patient' | 'caregiver') => {
    setSelectedRole(role);
    speech.playChime('click');
    setStep('consent');
  };

  const handleConsentContinue = () => {
    if (!consentPrivacy || !consentCognitive) {
      alert('Please accept the essential cognitive support and privacy protections to proceed.');
      return;
    }
    speech.playChime('success');
    setStep('register');
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter your name or nickname to continue.');
      return;
    }

    speech.playChime('complete');

    // Save profile to store & localStorage
    setConsentAndProfile({
      name: formData.name.trim(),
      gender: formData.gender,
      role: selectedRole,
      preferred_language: formData.preferredLanguage as SupportedLanguage,
      birth_year: formData.birthYear ? Number(formData.birthYear) : undefined,
      consentAccepted: true
    });

    if (onComplete) {
      onComplete();
    } else {
      closeOnboarding();
      if (selectedRole === 'patient') {
        loginAsDemoPatient('123456');
        router.push('/patient/dashboard');
      } else {
        loginAsDemoCaregiver();
        router.push('/caregiver/dashboard');
      }
    }
  };

  const handleQuickDemo = () => {
    speech.playChime('success');
    setConsentAndProfile({
      name: selectedRole === 'patient' ? 'Dharani Baruah' : 'Dr. Anita Sharma',
      gender: selectedRole === 'patient' ? 'female' : 'female',
      role: selectedRole,
      preferred_language: 'en',
      birth_year: 1948,
      consentAccepted: true
    });

    closeOnboarding();
    if (selectedRole === 'patient') {
      loginAsDemoPatient('123456');
      router.push('/patient/dashboard');
    } else {
      loginAsDemoCaregiver();
      router.push('/caregiver/dashboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-bloom-dark border-2 border-slate-300 dark:border-bloom-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Accessibility & Language Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-bloom-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-extrabold text-sm text-slate-800 dark:text-white">Nivora Onboarding</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Quick Dropdown */}
            <select
              value={language}
              onChange={(e) => {
                const nextLang = e.target.value as SupportedLanguage;
                setLanguage(nextLang);
                setFormData(prev => ({ ...prev, preferredLanguage: nextLang }));
              }}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              title="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>

            {/* Font Scale Button */}
            <button
              onClick={cycleTextScale}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-border text-slate-700 dark:text-slate-200 text-xs font-bold"
              title="Adjust Font Size"
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            {/* High Contrast */}
            <button
              onClick={toggleHighContrast}
              className={`p-1.5 rounded-xl border text-xs font-bold ${
                highContrast
                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                  : 'bg-slate-100 dark:bg-bloom-card border-slate-300 dark:border-bloom-border text-slate-700 dark:text-slate-200'
              }`}
              title="Toggle High Contrast"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-border text-slate-700 dark:text-slate-200"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* STEP 1: WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="text-center py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-bloom-teal/15 text-teal-600 dark:text-bloom-cyan flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-bloom-teal/30 shadow-sm">
              <span className="text-3xl">🌱</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              Welcome to Nivora 🌱
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
              Simple activities to keep your mind active and your memories connected.
            </p>

            {/* Read Aloud Voice Button */}
            <button
              onClick={() => speech.speak(
                "Welcome to Nivora. Simple activities to keep your mind active and your memories connected. Please choose if you are a patient or a caregiver to begin.",
                language
              )}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-bloom-card hover:bg-slate-200 dark:hover:bg-bloom-surface text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-bloom-border mb-8 shadow-sm transition-all"
            >
              <Volume2 className="w-4 h-4 text-teal-600 dark:text-bloom-cyan" />
              <span>Read Aloud</span>
            </button>

            {/* Role Selection Buttons (Large & Accessible) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
              <button
                onClick={() => handleSelectRole('patient')}
                className="group p-6 rounded-3xl border-2 border-teal-300 dark:border-bloom-teal/40 bg-white dark:bg-bloom-card hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-bloom-surface text-left transition-all shadow-md hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-bloom-teal/20 text-teal-700 dark:text-bloom-teal flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    🌸
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    I&apos;m a Patient
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Enjoy gentle memory games, beautiful photos, and heartwarming music.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-bloom-teal">
                  <span>Start Patient Journey</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('caregiver')}
                className="group p-6 rounded-3xl border-2 border-purple-300 dark:border-purple-500/40 bg-white dark:bg-bloom-card hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-bloom-surface text-left transition-all shadow-md hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    🛡️
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    I&apos;m a Caregiver
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Set up memory banks, track cognitive progress, and view clinical insights.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <span>Start Caregiver Journey</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Direct Quick Start Demo Skip */}
            <div className="text-center pt-2">
              <button
                onClick={handleQuickDemo}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-bloom-cyan transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Or explore right away with Quick Demo mode</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERMISSION & CONSENT PAGE */}
        {step === 'consent' && (
          <div className="py-2 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-bloom-teal/20 text-teal-700 dark:text-bloom-teal flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Your Privacy & Consent 🌱
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Before we begin, please grant permission for Nivora care assistance.
                </p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {/* Permission 1: Cognitive Exercise */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border cursor-pointer hover:bg-slate-100 dark:hover:bg-bloom-surface transition-all">
                <input
                  type="checkbox"
                  checked={consentCognitive}
                  onChange={(e) => setConsentCognitive(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🌸 Cognitive Support & Memory Games</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    I consent to Nivora offering gentle memory exercises, reminiscence therapy, and daily orientation check-ins.
                  </p>
                </div>
              </label>

              {/* Permission 2: Privacy & Data Protection */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border cursor-pointer hover:bg-slate-100 dark:hover:bg-bloom-surface transition-all">
                <input
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🔒 Safe Storage & Confidentiality</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    I agree to the secure local storage of family photos, memory responses, and activity progress for clinical and caregiver assistance.
                  </p>
                </div>
              </label>

              {/* Permission 3: Audio & Voice */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border cursor-pointer hover:bg-slate-100 dark:hover:bg-bloom-surface transition-all">
                <input
                  type="checkbox"
                  checked={consentAudio}
                  onChange={(e) => setConsentAudio(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🎙️ Voice Input & Calming Audio Feedback</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    I allow audio narration, harmonic chimes, and optional microphone access for verbal orientation answers.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-bloom-border">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleConsentContinue}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm shadow-md shadow-cyan-600/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>I Grant Permission & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BASIC INFORMATION REGISTRATION PAGE */}
        {step === 'register' && (
          <form onSubmit={handleCompleteRegistration} className="py-2 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-bloom-teal/20 text-teal-700 dark:text-bloom-teal flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Basic Registration 🌱
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tell us a little about yourself to personalize your experience.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="space-y-4 my-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name / Preferred Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (formError) setFormError('');
                  }}
                  placeholder={selectedRole === 'patient' ? "e.g., Dharani Baruah" : "e.g., Dr. Anita Sharma"}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-bloom-card border-2 border-slate-300 dark:border-bloom-border text-slate-900 dark:text-white font-medium text-base focus:border-teal-500 focus:outline-none transition-all"
                />
              </div>

              {/* Gender Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'female', label: 'Female', icon: '👩' },
                    { id: 'male', label: 'Male', icon: '👨' },
                    { id: 'non-binary', label: 'Non-Binary', icon: '🧑' },
                    { id: 'prefer-not-to-say', label: 'Prefer Not to Say', icon: '✨' }
                  ].map((g) => (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => setFormData(prev => ({ ...prev, gender: g.id }))}
                      className={`py-2.5 px-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        formData.gender === g.id
                          ? 'bg-teal-50 dark:bg-bloom-teal/20 border-teal-500 text-teal-800 dark:text-bloom-teal shadow-sm'
                          : 'bg-slate-50 dark:bg-bloom-card border-slate-300 dark:border-bloom-border text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Confirmation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Role on Nivora
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('patient')}
                    className={`py-2.5 px-4 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'patient'
                        ? 'bg-teal-50 dark:bg-bloom-teal/20 border-teal-500 text-teal-800 dark:text-bloom-teal'
                        : 'bg-slate-50 dark:bg-bloom-card border-slate-300 dark:border-bloom-border text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>🌸</span>
                    <span>Patient (Memory Player)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('caregiver')}
                    className={`py-2.5 px-4 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'caregiver'
                        ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-800 dark:text-purple-300'
                        : 'bg-slate-50 dark:bg-bloom-card border-slate-300 dark:border-bloom-border text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>🛡️</span>
                    <span>Caregiver / Clinician</span>
                  </button>
                </div>
              </div>

              {/* Birth Year & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Birth Year (Optional)
                  </label>
                  <input
                    type="number"
                    min={1920}
                    max={2015}
                    value={formData.birthYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthYear: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-bloom-card border-2 border-slate-300 dark:border-bloom-border text-slate-900 dark:text-white font-medium text-sm focus:border-teal-500 focus:outline-none"
                    placeholder="1950"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Helps personalize era trivia & nostalgic music.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => {
                      const nextLang = e.target.value as SupportedLanguage;
                      setFormData(prev => ({ ...prev, preferredLanguage: nextLang }));
                      setLanguage(nextLang);
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-bloom-card border-2 border-slate-300 dark:border-bloom-border text-slate-900 dark:text-white font-medium text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-bloom-border">
              <button
                type="button"
                onClick={() => setStep('consent')}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-bloom-card border border-slate-300 dark:border-bloom-border text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-bloom-border text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-bloom-card transition-all"
                >
                  Skip & Use Demo
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm shadow-md shadow-cyan-600/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Nivora 🌱</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
