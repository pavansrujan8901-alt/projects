'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Sparkles, 
  FileText, 
  Plus, 
  TrendingUp, 
  Heart, 
  Clock, 
  Award, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  X,
  AlertCircle,
  Smile,
  ShieldCheck,
  Flame,
  Activity,
  Bot
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { initialPatients, initialPhotos, initialSessions, initialInsights, db } from '@/lib/mock-db';
import { Patient, PatientPhoto, GameSession, CaregiverInsight } from '@/types/database';
import CaregiverCharts from '@/components/dashboard/CaregiverCharts';
import CaregiverVoiceSettings from '@/components/dashboard/CaregiverVoiceSettings';
import PhotoManager from '@/components/dashboard/PhotoManager';
import ClinicalReportModal from '@/components/dashboard/ClinicalReportModal';
import LiveClock from '@/components/common/LiveClock';
import CaregiverGuideModal from '@/components/onboarding/CaregiverGuideModal';
import QuickStartModal from '@/components/onboarding/QuickStartModal';
import NewBadge from '@/components/onboarding/NewBadge';
import MemoryConnectionsView from '@/components/dashboard/MemoryConnectionsView';
import NivoraSystemStatus from '@/components/dashboard/NivoraSystemStatus';
import QuickMemorySetup from '@/components/dashboard/QuickMemorySetup';
import MemoryBankManager from '@/components/dashboard/MemoryBankManager';
import CaregiverAIAssistantModal from '@/components/dashboard/CaregiverAIAssistantModal';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/translations';

export default function CaregiverDashboardPage() {
  const router = useRouter();
  const { caregiver, loginAsDemoCaregiver } = useAuthStore();
  const { 
    caregiverTourCompleted, 
    showQuickStartModal, 
    openQuickStart, 
    closeQuickStart,
    markSectionVisited
  } = useOnboardingStore();

  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (!caregiverTourCompleted) {
      setShowGuideModal(true);
    }
  }, [caregiverTourCompleted]);

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatients[0]?.id || '');
  const [photos, setPhotos] = useState<PatientPhoto[]>(initialPhotos);
  const [sessions, setSessions] = useState<GameSession[]>(initialSessions);
  const [insights, setInsights] = useState<CaregiverInsight[]>(initialInsights);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showConnectionsView, setShowConnectionsView] = useState(false);
  const [memorySectionTab, setMemorySectionTab] = useState<'curated' | 'quick_setup' | 'photos'>('curated');
  const [customQuestions, setCustomQuestions] = useState([
    {
      question: "Which iconic bridge over the Brahmaputra was opened in 1962?",
      answer: "Saraighat Bridge",
      era: "1962"
    },
    {
      question: "Which tea garden did the Baruah family visit during Bihu in 1974?",
      answer: "Jorhat Heritage Garden",
      era: "1974"
    }
  ]);
  const [newQuestionForm, setNewQuestionForm] = useState({
    question: '',
    answer: '',
    era: ''
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question || !newQuestionForm.answer) return;
    setCustomQuestions(prev => [newQuestionForm, ...prev]);
    setNewQuestionForm({ question: '', answer: '', era: '' });
    setShowAddQuestionModal(false);
  };

  // New Patient Form state
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    birth_year: 1950,
    hometown: '',
    occupation: '',
    state_region: 'Assam',
    cultural_traditions: '',
    favorite_festivals: '',
    preferred_language: 'as',
    stage: 'early' as const
  });

  // Ensure caregiver session exists
  useEffect(() => {
    if (!caregiver) {
      loginAsDemoCaregiver();
    }
  }, [caregiver, loginAsDemoCaregiver]);

  // Fetch live patients & data
  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setPatients(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleGenerateInsight = async () => {
    setIsGeneratingInsight(true);
    try {
      const res = await fetch(`/api/insights/${currentPatient.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.data) {
        setInsights(prev => [data.data, ...prev]);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Friendly local insight
      const fallback: CaregiverInsight = {
        id: `ins-${Date.now()}`,
        patient_id: currentPatient.id,
        insight_text: `${currentPatient.name} exhibited calm, sustained attention during today’s activities. Response latency improved gently, and recognition of family photos brought cheerful smiles.`,
        category: 'weekly_summary',
        score_delta_pct: 14.0,
        insight_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
      setInsights(prev => [fallback, ...prev]);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientForm)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPatients(prev => [data.data, ...prev]);
        setSelectedPatientId(data.data.id);
        setShowAddPatientModal(false);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Local fallback
      const fallbackPatient: Patient = {
        id: `p-local-${Date.now()}`,
        caregiver_id: 'c0000000-0000-0000-0000-000000000001',
        name: newPatientForm.name,
        birth_year: newPatientForm.birth_year,
        hometown: newPatientForm.hometown,
        occupation: newPatientForm.occupation,
        state_region: newPatientForm.state_region,
        cultural_traditions: newPatientForm.cultural_traditions,
        favorite_festivals: newPatientForm.favorite_festivals,
        family_members: [],
        access_code: Math.floor(100000 + Math.random() * 900000).toString(),
        preferred_language: newPatientForm.preferred_language,
        stage: newPatientForm.stage,
        created_at: new Date().toISOString()
      };
      setPatients(prev => [fallbackPatient, ...prev]);
      setSelectedPatientId(fallbackPatient.id);
      setShowAddPatientModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-bloom-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sage text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
            <span>🛡️ Caregiver Support Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">
            Caregiver Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Caregiver: <strong>{caregiver?.full_name || 'Dr. Anita Sharma'}</strong>
            </p>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-1.5 text-xs text-sage font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Telemetry Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LiveClock mode="compact" />

          {/* Guided Tour restart */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-bloom-card hover:bg-slate-50 border border-slate-200 dark:border-bloom-border text-navy font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
            title="Restart Guided Introduction"
          >
            <span>🌱</span>
            <span>Guided Tour</span>
          </button>

          {/* Quick Start Mode */}
          <button
            onClick={openQuickStart}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Start</span>
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={() => setShowAssistantModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            title="Ask Caregiver AI Copilot"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Copilot</span>
          </button>

          {/* Memory Connections Toggle */}
          <button
            onClick={() => setShowConnectionsView(!showConnectionsView)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
              showConnectionsView
                ? 'bg-purple-600 border-purple-700 text-white'
                : 'bg-white dark:bg-bloom-card hover:bg-slate-50 border-slate-200 dark:border-bloom-border text-navy'
            }`}
            title="Toggle Memory Connections Network"
          >
            <span>🕸️</span>
            <span>{showConnectionsView ? 'Hide Connections' : 'Connections'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-bloom-card hover:bg-slate-50 border border-slate-200 dark:border-bloom-border text-navy font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-ocean" />
            <span>Generate Health Report</span>
          </button>

          <button
            onClick={() => {
              markSectionVisited('new_patient');
              setShowAddPatientModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all relative"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
            <NewBadge sectionId="new_patient" className="ml-1" />
          </button>
        </div>
      </div>

      {/* Patient Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPatientId(p.id)}
            className={`px-5 py-3 rounded-2xl border-2 text-left flex-shrink-0 transition-all ${
              selectedPatientId === p.id
                ? 'bg-white dark:bg-bloom-card border-sage text-navy shadow-md ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="font-bold text-sm text-navy">{p.name}</div>
              {p.state_region && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-sage border border-emerald-200 dark:border-emerald-800 font-semibold">
                  {p.state_region}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PIN: <span className="font-mono font-bold text-sage">{p.access_code}</span> · {p.hometown.split(',')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* NIVORA LIVE TELEMETRY & MEDICAL DISCLAIMER */}
      <NivoraSystemStatus />

      {/* 2. PATIENT OVERVIEW PROFILE CARD */}
      {currentPatient && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-md mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-navy">{currentPatient.name}</h2>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-sage border border-emerald-200 dark:border-emerald-800 text-xs font-bold uppercase">
                  {currentPatient.stage.replace('_', ' ')}
                </span>
                {currentPatient.state_region && (
                  <span className="px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                    📍 {currentPatient.state_region}
                  </span>
                )}
                {currentPatient.preferred_language && (
                  <span className="px-3 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                    🗣️ Language: {currentPatient.preferred_language.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Born in <strong>{currentPatient.birth_year}</strong> ({new Date().getFullYear() - currentPatient.birth_year} yrs) · From <strong>{currentPatient.hometown}</strong> · {currentPatient.occupation}
              </p>
              {(currentPatient.favorite_festivals || currentPatient.cultural_traditions) && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  🌿 <strong>Traditions & Celebrations:</strong> {currentPatient.favorite_festivals} {currentPatient.cultural_traditions ? `· ${currentPatient.cultural_traditions}` : ''}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-center shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Patient 6-Digit PIN</div>
                <div className="text-2xl font-extrabold font-mono text-navy tracking-wider">
                  {currentPatient.access_code}
                </div>
              </div>
            </div>
          </div>

          {/* Connected Loop Active Banner */}
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Connected Memory Loop Active:</strong> {photos.filter(p => p.patient_id === currentPatient.id).length || photos.length} memories curated are automatically generating tailored cognitive games, family face recognizers, and reminiscence trivia for {currentPatient.name.split(' ')[0]}.
              </span>
            </div>
            <a 
              href="#memory-bank-section" 
              className="text-xs font-bold text-sage hover:text-emerald-800 dark:hover:text-emerald-300 whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>Explore Memory Bank</span>
              <span>&rarr;</span>
            </a>
          </div>

          {/* Family Members Tag Cloud */}
          {currentPatient.family_members && currentPatient.family_members.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-bloom-border/60">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Identified Family Members (Memory Network):
              </div>
              <div className="flex flex-wrap gap-2">
                {currentPatient.family_members.map((member, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-bloom-dark text-xs text-navy border border-slate-200 dark:border-bloom-border flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <strong>{member.name}</strong> ({member.relationship})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CALM ACTIVITY STATUS & NEEDS ATTENTION ALERT */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-sage flex items-center justify-center text-xl shadow-xs">
            🌸
          </div>
          <div>
            <div className="text-sm font-bold text-navy">
              Today&apos;s Activity Status: On Track
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {currentPatient?.name} completed morning orientation today. Next recommended activity: <strong>Memory Match (3 mins)</strong>.
            </div>
          </div>
        </div>

        {/* Calm reminder badge (Non-alarming) */}
        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-bloom-card border border-emerald-200 text-xs font-semibold text-sage flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-sage" />
          <span>Active Streak: 3 Days</span>
        </div>
      </div>

      {/* 4. KEY METRICS (4 CLEAN & SIMPLE CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Metric 1: Activities Completed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">This Week</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-sage flex items-center justify-center text-base">
              🌸
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-navy font-mono mb-1">14</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Activities Completed</div>
          </div>
        </div>

        {/* Metric 2: Total Time Engaged */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Time</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-ocean flex items-center justify-center">
              <Clock className="w-4 h-4 text-ocean" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-navy font-mono mb-1">42 mins</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Calm Engagement</div>
          </div>
        </div>

        {/* Metric 3: Most Enjoyed Activity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Favorite</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-navy truncate mb-1">Memory Match</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Highest smiles & focus</div>
          </div>
        </div>

        {/* Metric 4: Consistency / Active Days */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consistency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-navy font-mono mb-1">5 of 7 days</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Routine active consistency</div>
          </div>
        </div>
      </div>

      {/* 5. MINDBLOOM INSIGHT CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-bloom-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-sage flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sage" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <span>Nivora Insight</span>
                <NewBadge sectionId="view_insights" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Easy-to-read summary of how {currentPatient?.name} is doing</p>
            </div>
          </div>

          <button
            onClick={() => {
              markSectionVisited('view_insights');
              handleGenerateInsight();
            }}
            disabled={isGeneratingInsight}
            className="px-4 py-2 rounded-xl bg-navy hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingInsight ? 'animate-spin' : ''}`} />
            <span>{isGeneratingInsight ? 'Updating Summary...' : 'Update Insight'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {insights.map((ins) => (
            <div key={ins.id} className="p-4 rounded-2xl glass-card shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-sage font-bold uppercase">{ins.category.replace('_', ' ')}</span>
                <span>{ins.insight_date}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {ins.insight_text}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-bloom-border/60 text-xs text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span><strong>Suggested Action:</strong> Consider adding a few more family photographs or memories from the 1970s.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5.5. MEMORY CONNECTIONS GRAPH VIEW (AI Visual Network) */}
      {showConnectionsView && currentPatient && (
        <MemoryConnectionsView
          patient={currentPatient}
          photos={photos}
        />
      )}

      {/* 6. RECENT ENGAGEMENT (WEEKLY CHARTS) */}
      <div className="mb-8">
        <CaregiverCharts sessions={sessions} />
      </div>

      {/* 7. PERSONAL MEMORY BANK MANAGEMENT */}
      <div id="memory-bank-section" className="mb-8" onClick={() => markSectionVisited('memory_bank')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-navy">
              Memory Bank &amp; Personalization
            </h3>
            <NewBadge sectionId="memory_bank" />
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setMemorySectionTab('curated')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                memorySectionTab === 'curated'
                  ? 'bg-white dark:bg-bloom-card text-navy shadow-xs'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              🌿 Curated Memory Bank
            </button>
            <button
              type="button"
              onClick={() => setMemorySectionTab('quick_setup')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                memorySectionTab === 'quick_setup'
                  ? 'bg-white dark:bg-bloom-card text-navy shadow-xs'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              ✨ Quick Memory Setup
            </button>
            <button
              type="button"
              onClick={() => setMemorySectionTab('photos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                memorySectionTab === 'photos'
                  ? 'bg-white dark:bg-bloom-card text-navy shadow-xs'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              📷 Photo Memories ({photos.length})
            </button>
          </div>
        </div>

        {currentPatient && memorySectionTab === 'curated' && (
          <MemoryBankManager
            patient={currentPatient}
            onActivityCreateRequested={(mem) => {
              // Open activity generator prefilled with memory
            }}
          />
        )}

        {currentPatient && memorySectionTab === 'quick_setup' && (
          <QuickMemorySetup
            patient={currentPatient}
            onMemoryAdded={(mem) => {
              // Automatically updates patient memory bank
            }}
          />
        )}

        {currentPatient && memorySectionTab === 'photos' && (
          <PhotoManager
            patientId={currentPatient?.id || ''}
            patient={currentPatient}
            photos={photos}
            onPhotoAdded={(newPh) => setPhotos(prev => [newPh, ...prev])}
            onActivityApproved={(act) => {
              db.trivia.unshift({
                id: act.id,
                patient_id: currentPatient.id,
                language: act.language || 'en',
                question: act.question,
                options: act.options,
                correct_answer_index: act.correctAnswerIndex || 0,
                fun_fact: act.funFact,
                era_year: 1975,
                topic: act.category || 'Family Memory'
              });
              setCustomQuestions(prev => [{
                question: act.question,
                answer: act.correctAnswer,
                era: 'Memory'
              }, ...prev]);
            }}
          />
        )}
      </div>

      {/* 8. PERSONALIZED REMINISCENCE QUESTIONS & QUESTION CREATOR */}
      <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-bloom-border/60">
          <div>
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <span>📻 Personalized Reminiscence Questions</span>
              <NewBadge sectionId="create_question" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize era-specific memories, favorite hometown landmarks, or family milestones for {currentPatient?.name}
            </p>
          </div>

          <button
            onClick={() => {
              markSectionVisited('create_question');
              setShowAddQuestionModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-sage hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {customQuestions.map((q, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border flex items-start justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm font-bold text-navy mb-0.5">{q.question}</div>
                <div className="text-xs text-sage font-medium">
                  Correct Answer: <strong>{q.answer}</strong> {q.era && `· (${q.era})`}
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-sage border border-emerald-200 text-[10px] font-bold flex-shrink-0">
                Active in Trivia
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddQuestionModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-navy mb-1">Create Reminiscence Question</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add a personalized memory prompt for {currentPatient?.name}.
            </p>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Question Prompt *
                </label>
                <input
                  type="text"
                  required
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. Which street did our family live on during the 1970s?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Correct Answer *
                </label>
                <input
                  type="text"
                  required
                  value={newQuestionForm.answer}
                  onChange={(e) => setNewQuestionForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="e.g. Panbazar High Street"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Era / Year (Optional)
                </label>
                <input
                  type="text"
                  value={newQuestionForm.era}
                  onChange={(e) => setNewQuestionForm(prev => ({ ...prev, era: e.target.value }))}
                  placeholder="e.g. 1972"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sage hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ClinicalReportModal
          patient={currentPatient}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddPatientModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-navy mb-1">Create Patient Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Generates an auto-assigned 6-digit numeric login PIN for patient ease.
            </p>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="e.g. Kamala Baruah"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Birth Year *
                  </label>
                  <input
                    type="number"
                    required
                    min={1920}
                    max={1970}
                    value={newPatientForm.birth_year}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, birth_year: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Hometown / Origin *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatientForm.hometown}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, hometown: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                    placeholder="e.g. Shillong, Meghalaya"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Past Occupation / Fond Memories
                </label>
                <input
                  type="text"
                  value={newPatientForm.occupation}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, occupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="e.g. Botanical Artist, Teacher, Railway Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    State / Region
                  </label>
                  <select
                    value={newPatientForm.state_region}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, state_region: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  >
                    <option value="Assam">Assam</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other (India)">Other (India)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={newPatientForm.preferred_language}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, preferred_language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Favorite Festivals & Cultural Traditions
                </label>
                <input
                  type="text"
                  value={newPatientForm.favorite_festivals}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, favorite_festivals: e.target.value, cultural_traditions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  placeholder="e.g. Rongali Bihu, Wangala, Ningol Chakouba, Tea Gardens"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Stage
                </label>
                <select
                  value={newPatientForm.stage}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, stage: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                >
                  <option value="early">Early Stage</option>
                  <option value="mild_cognitive_impairment">Mild Cognitive Impairment (MCI)</option>
                  <option value="moderate">Moderate Stage</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sage hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
                >
                  Create Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Caregiver Guided Tour Modal */}
      <CaregiverGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onAddPatientClick={() => {
          setShowGuideModal(false);
          setShowAddPatientModal(true);
        }}
        onMemoryBankClick={() => {
          setShowGuideModal(false);
          const el = document.getElementById('memory-bank-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreGamesClick={() => {
          setShowGuideModal(false);
          router.push('/patient/dashboard');
        }}
      />

      {/* Quick Start Modal */}
      <QuickStartModal
        isOpen={showQuickStartModal}
        onClose={closeQuickStart}
      />

      {/* Caregiver AI Copilot Modal */}
      {showAssistantModal && currentPatient && (
        <CaregiverAIAssistantModal
          isOpen={showAssistantModal}
          onClose={() => setShowAssistantModal(false)}
          patient={currentPatient}
          sessions={sessions}
          photos={photos}
        />
      )}
    </div>
  );
}
