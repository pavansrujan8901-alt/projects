'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Gamepad2, 
  ShieldCheck, 
  Heart, 
  Volume2, 
  ArrowRight,
  UserCheck,
  CheckCircle2,
  KeyRound,
  Eye,
  Sliders,
  Globe2,
  Clock,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import QuickStartModal from '@/components/onboarding/QuickStartModal';
import { translations } from '@/lib/i18n/translations';
import { speech } from '@/lib/tts/speech';

export default function LandingView() {
  const router = useRouter();
  const { loginAsDemoPatient, loginAsDemoCaregiver } = useAuthStore();
  const { language } = useAccessibilityStore();
  const { 
    showOnboardingModal, 
    openOnboarding, 
    closeOnboarding, 
    showQuickStartModal, 
    openQuickStart, 
    closeQuickStart,
    hasGivenConsent,
    userProfile
  } = useOnboardingStore();
  const t = translations[language] || translations.en;

  const handleDemoPatient = (code = '123456') => {
    speech.playChime('success');
    loginAsDemoPatient(code);
    router.push('/patient/dashboard');
  };

  const handleDemoCaregiver = () => {
    speech.playChime('success');
    loginAsDemoCaregiver();
    router.push('/caregiver/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* 1. HERO SECTION */}
      <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
        {/* Soft Cultural Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="text-base">🪔</span>
          <span>Cognitive Support for Indian Families & Northeast Communities</span>
        </div>

        {/* App Title & Positioning Tagline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-navy tracking-tight leading-tight mb-3">
          Nivora
        </h1>
        <p className="text-2xl sm:text-3xl font-bold text-sage mb-6">
          Your memories. Your language. Your culture. Your people.
        </p>

        {/* Friendly Explanation */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
          A gentle cognitive gaming and memory-support platform designed for older adults across India and Northeast communities. Built around real family connections, cherished hometown nostalgia, and mother tongue guidance.
        </p>

        {/* Audio Overview & Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => speech.speak(
              "Welcome to Nivora. Your memories, your language, your culture, your people. A gentle cognitive gaming and memory-support platform designed for older adults across India and Northeast communities.",
              language
            )}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-ocean" />
            <span>Listen in Mother Tongue</span>
          </button>

          <Link
            href="/language"
            className="px-5 py-2.5 rounded-full bg-white dark:bg-bloom-card hover:bg-slate-50 border border-slate-300 dark:border-bloom-border text-navy font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <Globe2 className="w-4 h-4 text-amber-600" />
            <span>9 Regional Languages</span>
          </Link>

          <button
            onClick={openOnboarding}
            className="px-5 py-2.5 rounded-full bg-sage hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <span>🌱</span>
            <span>{hasGivenConsent ? `Profile: ${userProfile?.name || 'Registered'}` : 'New User? Welcome & Consent'}</span>
          </button>

          <button
            onClick={openQuickStart}
            className="px-5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Quick Start Demo</span>
          </button>
        </div>

        {/* Warm Visual Element: Family, River, Greenery */}
        <div className="relative max-w-3xl mx-auto mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-50/70 via-white to-sky-50/50 dark:from-bloom-card/40 dark:to-bloom-card/80 border border-emerald-100 dark:border-bloom-border shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-sage flex items-center justify-center text-5xl sm:text-6xl shadow-inner flex-shrink-0">
              🪔
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-navy mb-2">
                Built Around People, Families & Lifelong Memories
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                From morning Assam tea and Brahmaputra river walks to festive Bihu, Wangala, and Ningol Chakouba celebrations—every activity evokes familiar warmth and family smiles without any clinical stress.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Role Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {/* Patient Card */}
          <div className="rounded-3xl bg-white dark:bg-bloom-card border-2 border-emerald-200 dark:border-emerald-800/60 p-6 sm:p-8 shadow-lg relative flex flex-col justify-between hover:border-sage transition-all group">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold">
              Simple 6-Digit PIN
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-sage flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-3xl">
                🌸
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">I&apos;m a Patient</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Play relaxing card matching with lotus and morning chai, see familiar photos of children and grandchildren, and enjoy cheerful nostalgia from your youth.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/patient/login"
                className="w-full py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-center"
              >
                <KeyRound className="w-5 h-5" />
                <span>Enter with 6-Digit PIN</span>
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoPatient('123456')}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-bloom-dark hover:bg-slate-100 border border-slate-300 dark:border-bloom-border text-sage font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dharani (Assam)</span>
                </button>
                <button
                  onClick={() => handleDemoPatient('789012')}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-bloom-dark hover:bg-slate-100 border border-slate-300 dark:border-bloom-border text-navy font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kamala (Meghalaya)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Caregiver Card */}
          <div className="rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border p-6 sm:p-8 shadow-lg relative flex flex-col justify-between hover:border-ocean transition-all group">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/50 text-xs font-bold">
              Family & Clinicians
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-ocean flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-3xl">
                🛡️
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">I&apos;m a Caregiver</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Build personal memory albums across 10 cultural categories, review quiet weekly engagement, add custom traditions, and print structured health summaries.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/caregiver/login"
                className="w-full py-4 rounded-2xl bg-navy hover:bg-slate-800 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-center"
              >
                <UserCheck className="w-5 h-5" />
                <span>Caregiver Sign In</span>
              </Link>

              <button
                onClick={handleDemoCaregiver}
                className="w-full py-3 rounded-xl bg-slate-50 dark:bg-bloom-dark hover:bg-slate-100 border border-slate-300 dark:border-bloom-border text-navy font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Demo as Dr. Anita Sharma</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE CONNECTED SYSTEM: MEMORY → ACTIVITY → ENGAGEMENT LOOP */}
      <div className="mb-20 pt-10 border-t border-slate-200 dark:border-bloom-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-sage text-xs font-bold uppercase mb-2">
            <span>The Nivora Loop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            One Connected System for Meaningful Care
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            How a single family memory flows into cognitive comfort and caregiver peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-sage font-extrabold text-lg flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Caregiver Adds Memory</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Add family photos, hometown river walks, favorite recipes (e.g. Masor Tenga), or loom weaving memories.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-sage font-semibold">
              ✓ 10 Cultural Categories
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-ocean font-extrabold text-lg flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Auto-Crafts Activity</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nivora weaves the memory into Face-Name recall cards and era trivia in their preferred mother tongue.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-ocean font-semibold">
              ✓ Personal, not generic
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-extrabold text-lg flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Patient Plays & Smiles</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                No stressful exams or countdowns. Large buttons, audio narrator, and positive affirmations keep spirits high.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-700 font-semibold">
              ✓ Dignity-first engagement
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-lg flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Caregiver Insight</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Review weekly consistency, response comfort, and compassionate AI clinical summaries in plain language.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-purple-700 font-semibold">
              ✓ Real peace of mind
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURE PREVIEW SECTION */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            Gentle Cognitive Activities
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Every game is created with culturally familiar Indian symbols and gentle pacing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Memory Match */}
          <div className="rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="text-4xl mb-3">🌸</div>
              <h3 className="text-xl font-bold text-navy mb-2">Memory Match</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Pair familiar symbols: Lotus, morning tea, golden mango, brass diya, and sitar.
              </p>
              <div className="text-xs text-slate-500 mb-5">
                <strong>Helps with:</strong> Visual pattern attention & gentle focus.
              </div>
            </div>
            <Link
              href="/patient/games/memory-match"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-bloom-dark hover:bg-emerald-50 text-sage border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Try Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Face & Name */}
          <div className="rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="text-4xl mb-3">💖</div>
              <h3 className="text-xl font-bold text-navy mb-2">Face & Name</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Recognize children, grandchildren, and friends with affectionate family relationships.
              </p>
              <div className="text-xs text-slate-500 mb-5">
                <strong>Helps with:</strong> Social memory and emotional connection.
              </div>
            </div>
            <Link
              href="/patient/games/face-name"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-bloom-dark hover:bg-rose-50 text-rose-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Try Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Story Reminiscence */}
          <div className="rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="text-4xl mb-3">📻</div>
              <h3 className="text-xl font-bold text-navy mb-2">Memory Trivia</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Relive memories of Akashvani radio, Saraighat bridge, harvest festivals, and classic cinema.
              </p>
              <div className="text-xs text-slate-500 mb-5">
                <strong>Helps with:</strong> Long-term autobiographical storytelling.
              </div>
            </div>
            <Link
              href="/patient/games/reminiscence"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-bloom-dark hover:bg-amber-50 text-amber-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Try Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Daily Orientation */}
          <div className="rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="text-4xl mb-3">🌅</div>
              <h3 className="text-xl font-bold text-navy mb-2">Daily Orientation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Gentle morning check-in to ground today&apos;s day of the week, season, and time of day.
              </p>
              <div className="text-xs text-slate-500 mb-5">
                <strong>Helps with:</strong> Time-space grounding and morning peace.
              </div>
            </div>
            <Link
              href="/patient/games/orientation"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-bloom-dark hover:bg-sky-50 text-ocean border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Try Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. ACCESSIBILITY & TRUST FOOTER */}
      <div className="pt-10 border-t border-slate-200 dark:border-bloom-border text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 mb-6">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-sage" />
            <span>High Contrast & Low-Stimulation Calm Mode</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-ocean" />
            <span>Adjustable Font Sizes (A / A+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-amber-600" />
            <span>Assamese, Manipuri, Bodo, Khasi, Mizo, Garo, Kokborok, Hindi & English</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-purple-600" />
            <span>Read-Aloud Voice Guidance in Mother Tongue</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-slate-100/70 dark:bg-bloom-card/60 text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-navy dark:text-slate-300 mb-1">
            Care for Older Adults & Families
          </p>
          <p>
            Nivora is an engaging cognitive activity and reminiscence support companion. It is not intended to diagnose or treat medical conditions. Please consult qualified doctors for medical guidance.
          </p>
        </div>
      </div>

      {/* Onboarding Flow Modal */}
      <OnboardingFlow isOpen={showOnboardingModal} onComplete={closeOnboarding} />

      {/* Quick Start Modal */}
      <QuickStartModal isOpen={showQuickStartModal} onClose={closeQuickStart} />
    </div>
  );
}
