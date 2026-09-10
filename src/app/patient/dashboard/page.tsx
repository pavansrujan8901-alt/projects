'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Volume2, 
  ArrowRight, 
  Clock, 
  Play, 
  Heart, 
  Calendar, 
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { translations } from '@/lib/i18n/translations';
import { speech } from '@/lib/tts/speech';
import LiveClock from '@/components/common/LiveClock';
import PatientGuideModal from '@/components/onboarding/PatientGuideModal';
import PatientHelpModal from '@/components/patient/PatientHelpModal';
import DecorativeBloom3D from '@/components/patient/DecorativeBloom3D';
import MemoryToActivityVisual from '@/components/patient/MemoryToActivityVisual';

export default function PatientDashboard() {
  const router = useRouter();
  const { patient, isPatientLoggedIn, loginAsDemoPatient } = useAuthStore();
  const { language, highContrast } = useAccessibilityStore();
  const { patientGuideCompleted } = useOnboardingStore();
  const [showPatientGuide, setShowPatientGuide] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [adaptiveRec, setAdaptiveRec] = useState<any>(null);

  useEffect(() => {
    if (!patientGuideCompleted) {
      setShowPatientGuide(true);
    }
  }, [patientGuideCompleted]);

  const t = translations[language] || translations.en;

  // Auto-login demo patient if accessed directly
  useEffect(() => {
    if (!isPatientLoggedIn || !patient) {
      loginAsDemoPatient('123456');
    }
  }, [isPatientLoggedIn, patient, loginAsDemoPatient]);

  const activePatient = patient || {
    id: 'demo-patient-1',
    name: 'Dharani Baruah',
    hometown: 'Guwahati, Assam',
    birth_year: 1948,
    occupation: 'High School Science Principal',
    favorite_music: 'Bhupen Hazarika folk classics, Rabindra Sangeet',
    favorite_meals: 'Masor Tenga, Khar, Bihu Pitha',
    access_code: '123456'
  };

  useEffect(() => {
    const patientId = activePatient?.id || 'demo-patient-1';
    fetch(`/api/ai/adaptive/${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAdaptiveRec(data.data);
        }
      })
      .catch(() => {});
  }, [activePatient?.id]);

  const getAdaptiveHref = (gameType: string) => {
    switch (gameType) {
      case 'face_name':
        return '/patient/games/face-name';
      case 'reminiscence_trivia':
        return '/patient/games/reminiscence';
      case 'orientation':
        return '/patient/games/orientation';
      case 'sequence':
        return '/patient/games/sequence';
      case 'association':
        return '/patient/games/association';
      case 'category_sort':
        return '/patient/games/category-sort';
      case 'picture_recall':
        return '/patient/games/picture-recall';
      case 'memory_match':
      default:
        return '/patient/games/memory-match';
    }
  };

  // Time-aware greeting
  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Section 29: Redesigned game cards with icon, name, one-line desc, difficulty, personalized badge
  const activities = [
    {
      id: 'memory_match',
      title: 'Memory Match',
      desc: 'Pair simple flower and nature cards at a peaceful pace.',
      icon: '🌸',
      timeEstimate: '3 mins',
      difficulty: 'Easy (4) to Advanced (16)',
      personalized: true,
      href: '/patient/games/memory-match'
    },
    {
      id: 'face_name',
      title: 'Face & Name Recall',
      desc: 'See photos of loved family members and remember who they are.',
      icon: '💖',
      timeEstimate: '3 mins',
      difficulty: '2 to 4 Choices',
      personalized: true,
      href: '/patient/games/face-name'
    },
    {
      id: 'reminiscence_trivia',
      title: 'Memory Trivia',
      desc: 'Enjoy pleasant questions about familiar places, songs, and food.',
      icon: '📻',
      timeEstimate: '4 mins',
      difficulty: 'Gentle Recall',
      personalized: true,
      href: '/patient/games/reminiscence'
    },
    {
      id: 'orientation',
      title: 'Daily Orientation',
      desc: 'Check in with today’s local date, day of the week, and season.',
      icon: '🌅',
      timeEstimate: '2 mins',
      difficulty: 'Daily Connection',
      personalized: false,
      href: '/patient/games/orientation'
    },
    {
      id: 'sequence',
      title: 'Put It in Order',
      desc: 'Arrange everyday sequences like making tea and watering garden plants.',
      icon: '📋',
      timeEstimate: '3 mins',
      difficulty: 'Sequential Logic',
      personalized: true,
      href: '/patient/games/sequence'
    },
    {
      id: 'association',
      title: 'Object & Memory',
      desc: 'Connect familiar objects with their heartfelt stories and traditions.',
      icon: '🕊️',
      timeEstimate: '3 mins',
      difficulty: 'Story Connection',
      personalized: true,
      href: '/patient/games/association'
    },
    {
      id: 'category_sort',
      title: 'Category Sort',
      desc: 'Group familiar memories into Food, Music, Places, and Family.',
      icon: '🗂️',
      timeEstimate: '3 mins',
      difficulty: 'Gentle Sorting',
      personalized: true,
      href: '/patient/games/category-sort'
    },
    {
      id: 'picture_recall',
      title: 'Remember the Picture',
      desc: 'Look gently at a peaceful picture and answer simple visual questions.',
      icon: '🖼️',
      timeEstimate: '2 mins',
      difficulty: 'Visual Focus',
      personalized: true,
      href: '/patient/games/picture-recall'
    }
  ];

  const handleReadGreeting = () => {
    speech.speak(
      `${greetingTime}, ${activePatient.name}. Welcome to your morning journey. Let's enjoy a few relaxing activities together.`,
      language
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* 1. TOP GREETING: TODAY'S JOURNEY (Glass Panel + Subtle 3D Bloom) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-lg mb-8 relative overflow-hidden">
        {/* Subtle Decorative 3D Bloom Element (Section 27) */}
        <DecorativeBloom3D className="hidden md:block absolute right-8 top-6 opacity-90" size={125} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl sm:text-4xl">🌱</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight">
                {greetingTime}, <span className="text-sage">{activePatient.name}</span>
              </h1>
              <button
                onClick={handleReadGreeting}
                className="p-2.5 rounded-2xl glass-card text-sage hover:text-emerald-700 transition-all shadow-xs"
                title="Read greeting aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-medium">
              Today&apos;s Journey · Relaxing moments to keep memories connected.
            </p>
            {activePatient.hometown && (
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50/90 dark:bg-emerald-950/60 text-sage text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  📍 {activePatient.hometown}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Activities tailored to your memories & familiar traditions
                </span>
              </div>
            )}
          </div>

          {/* Simple Patient PIN Badge (Calm Glass) */}
          <div className="px-5 py-3 rounded-2xl glass-card text-center self-stretch sm:self-auto shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Your PIN</div>
            <div className="text-2xl font-bold font-mono text-navy tracking-wider">{activePatient.access_code}</div>
          </div>
        </div>

        {/* 2. PROMINENT PRIMARY ACTION: "Start Today's Activity" */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-bloom-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-sm font-bold text-navy">
              Ready for your morning activity?
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Only takes 3 minutes. Zero pressure, pure comfort.
            </div>
          </div>

          <Link
            href="/patient/games/memory-match"
            onClick={() => speech.playChime('click')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Today&apos;s Activity</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Dementia Orientation Live Clock Banner */}
      <LiveClock mode="banner" className="mb-8" />

      {/* AI Adaptive Activity Recommendation Card with Personalized Memory Visual */}
      {adaptiveRec && (
        <div className="mb-8 p-6 sm:p-7 rounded-3xl glass-panel shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                ✨
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage bg-emerald-100/90 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Recommended Today • Level {adaptiveRec.recommendedDifficulty} Pace
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {adaptiveRec.recentTrend === 'steady_engagement' ? 'Gentle Steady Rhythm' : 'High Comfort Level'}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-navy">
                  {adaptiveRec.recommendedTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {adaptiveRec.reason}
                </p>
              </div>
            </div>

            <Link
              href={getAdaptiveHref(adaptiveRec.recommendedGameType)}
              onClick={() => speech.playChime('click')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all flex-shrink-0"
            >
              <span>Play Recommended</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Section 30: Personalized Memory Visualization */}
          <MemoryToActivityVisual
            memorySnippet={`${activePatient.name}'s family stories & hometown traditions`}
            activityTitle={adaptiveRec.recommendedTitle}
            className="mt-2"
          />
        </div>
      )}

      {/* 3. ACTIVITY CARDS HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy tracking-tight flex items-center gap-2">
            <span>🌸</span> Recommended Activities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose any activity you like. There are no wrong answers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              speech.playChime('click');
              setShowHelpModal(true);
            }}
            className="px-4 py-2 rounded-2xl glass-card hover:border-sage text-sage font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all"
          >
            <span>❓</span>
            <span>Help</span>
          </button>

          <button
            onClick={() => setShowPatientGuide(true)}
            className="px-4 py-2 rounded-2xl glass-card hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all"
          >
            <span>🌱</span>
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* Section 29: Redesigned Premium & Accessible Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm transition-all duration-300 ${
              highContrast
                ? 'bg-yellow-400 text-black border-2 border-yellow-300'
                : 'glass-card'
            }`}
          >
            <div>
              {/* Card Header with Icon, Time & Badges */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-5xl sm:text-6xl select-none" role="img" aria-label={activity.title}>
                  {activity.icon}
                </span>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-bloom-dark/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-bloom-border text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-sage" />
                    <span>{activity.timeEstimate}</span>
                  </span>

                  {activity.personalized && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950 text-sage text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      <span>✨</span>
                      <span>Personalized</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Game Name & Difficulty Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className={`text-2xl font-bold ${
                  highContrast ? 'text-black' : 'text-navy'
                }`}>
                  {activity.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-bloom-dark/80 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  {activity.difficulty}
                </span>
              </div>

              {/* One-Line Description */}
              <p className={`text-sm sm:text-base leading-relaxed mb-6 ${
                highContrast ? 'text-black/90' : 'text-slate-600 dark:text-slate-300'
              }`}>
                {activity.desc}
              </p>
            </div>

            {/* Bottom Action Row with Min 56px Touch Area */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-bloom-border/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-sage flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Relaxing pace</span>
              </span>

              <Link
                href={activity.href}
                onClick={() => speech.playChime('click')}
                className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-navy hover:bg-slate-800 text-white font-extrabold text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span>Start</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Guided Introduction Modal */}
      <PatientGuideModal
        isOpen={showPatientGuide}
        onClose={() => setShowPatientGuide(false)}
        onStartActivity={(href) => {
          if (href) router.push(href);
        }}
      />

      {/* Patient Context-Aware AI Help Assistant Modal */}
      <PatientHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Friendly Floating Help Assistant Button (Section 32: ❓ Help) */}
      <button
        onClick={() => {
          speech.playChime('click');
          setShowHelpModal(true);
        }}
        className="fixed bottom-6 right-6 z-40 px-6 py-4 rounded-full glass-panel hover:border-sage text-navy dark:text-white font-extrabold text-base shadow-2xl flex items-center gap-2.5 active:scale-95 transition-all border-2 border-white/70 dark:border-white/20"
        aria-label="Open Nivora Help Assistant"
      >
        <span className="text-2xl animate-pulse">❓</span>
        <span>Help</span>
      </button>
    </div>
  );
}
