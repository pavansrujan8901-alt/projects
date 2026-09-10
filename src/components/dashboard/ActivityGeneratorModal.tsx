'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  Edit3, 
  Info, 
  Play, 
  Volume2, 
  Tag, 
  Lightbulb, 
  ArrowRight,
  BookOpen,
  Sliders,
  AlertTriangle,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { Patient } from '@/types/database';
import { GeneratedActivity } from '@/lib/ai/generator';
import { speech } from '@/lib/tts/speech';

interface ActivityGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  initialMemoryText?: string;
  initialCategory?: string;
  onActivityApproved?: (activity: GeneratedActivity) => void;
}

export default function ActivityGeneratorModal({
  isOpen,
  onClose,
  patient,
  initialMemoryText = '',
  initialCategory = 'family',
  onActivityApproved
}: ActivityGeneratorModalProps) {
  const [memoryText, setMemoryText] = useState(initialMemoryText);
  const [category, setCategory] = useState(initialCategory);
  const [activityType, setActivityType] = useState<GeneratedActivity['type']>('reminiscence_question');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [generatedActivity, setGeneratedActivity] = useState<GeneratedActivity | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const [editQuestion, setEditQuestion] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editFunFact, setEditFunFact] = useState('');

  // Report Problem State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('incorrect_info');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!memoryText.trim()) return;
    setIsGenerating(true);
    setGenerationStep(1);
    speech.playChime('click');

    setTimeout(() => setGenerationStep(2), 650);
    setTimeout(() => setGenerationStep(3), 1300);

    try {
      const res = await fetch('/api/ai/generate-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memory_text: memoryText,
          category,
          activity_type: activityType,
          patient_id: patient.id,
          language: patient.preferred_language || 'en'
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTimeout(() => {
          setGenerationStep(4);
          setGeneratedActivity(data.data);
          setEditQuestion(data.data.question);
          setEditOptions(data.data.options);
          setEditFunFact(data.data.funFact);
          speech.playChime('success');
          setIsGenerating(false);
        }, 1900);
      } else {
        setIsGenerating(false);
      }
    } catch {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    if (!generatedActivity) return;
    speech.playChime('complete');
    setIsApproved(true);

    const finalized: GeneratedActivity = {
      ...generatedActivity,
      question: editQuestion || generatedActivity.question,
      options: editOptions.length === 4 ? editOptions : generatedActivity.options,
      funFact: editFunFact || generatedActivity.funFact,
      approved: true
    };

    fetch('/api/ai/generate-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve_and_save',
        activity: finalized,
        patient_id: patient.id
      })
    }).catch(() => {});

    if (onActivityApproved) {
      onActivityApproved(finalized);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSubmitProblemReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedActivity) return;
    setIsSubmittingReport(true);
    speech.playChime('click');

    try {
      await fetch('/api/ai/generate-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report_problem',
          report: {
            activity_id: generatedActivity.id,
            patient_id: patient.id,
            reason: reportReason,
            details: reportDetails
          }
        })
      });
    } catch {}

    setIsSubmittingReport(false);
    setShowReportModal(false);
    setGeneratedActivity(null);
    setReportSuccessMessage('Activity flagged and permanently excluded from ' + patient.name + "'s experience.");
    setTimeout(() => setReportSuccessMessage(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/60 dark:bg-bloom-dark/60 text-slate-500 hover:text-slate-900 border border-slate-200/60 dark:border-bloom-border transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {reportSuccessMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-900 dark:text-amber-100 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{reportSuccessMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-sage flex items-center justify-center text-xl shadow-2xs">
            ✨
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">
              AI Memory → Activity Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform personal memories into tailored, dignified cognitive activities for <strong>{patient.name}</strong>.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Personal Memory or Story
            </label>
            <textarea
              rows={2}
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder="e.g., Anita enjoyed gardening with her grandchildren in the backyard..."
              className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-bloom-dark/80 border border-slate-300 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                Activity Format
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-bloom-dark/80 border border-slate-300 dark:border-bloom-border text-navy text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage"
              >
                <option value="reminiscence_question">📻 Multiple-Choice Trivia</option>
                <option value="memory_match">🌸 Memory Match Pairing</option>
                <option value="face_name">💖 Face & Name Recall</option>
                <option value="conversation_prompt">💬 Gentle Conversation Prompt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                Cultural Theme
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-bloom-dark/80 border border-slate-300 dark:border-bloom-border text-navy text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage"
              >
                <option value="family">Family & Loved Ones</option>
                <option value="places">Hometown & Riverfront</option>
                <option value="food">Festive Recipes & Chai</option>
                <option value="music">Classic Folk & Songs</option>
                <option value="traditions">Heritage & Traditions</option>
                <option value="gardens">Garden & Tea Leaves</option>
              </select>
            </div>
          </div>

          {isGenerating && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-navy mb-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>
                    {generationStep === 1 && 'Understanding memory...'}
                    {generationStep === 2 && 'Creating activity...'}
                    {generationStep === 3 && 'Personalizing difficulty...'}
                    {generationStep >= 4 && 'Activity ready'}
                  </span>
                </span>
                <span className="text-sage">{Math.min(generationStep * 25, 100)}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-200/50 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(generationStep * 25, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span className={generationStep >= 1 ? 'text-sage font-bold' : ''}>1. Memory</span>
                <span className={generationStep >= 2 ? 'text-sage font-bold' : ''}>2. Crafting</span>
                <span className={generationStep >= 3 ? 'text-sage font-bold' : ''}>3. Calibrating</span>
                <span className={generationStep >= 4 ? 'text-sage font-bold' : ''}>4. Ready</span>
              </div>
            </div>
          )}

          {!isGenerating && (
            <button
              onClick={handleGenerate}
              disabled={!memoryText.trim()}
              className="w-full py-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Create Personalized Activity</span>
            </button>
          )}
        </div>

        {generatedActivity && !isGenerating && (
          <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-bloom-border animate-fadeIn">
            <div className="p-4 rounded-2xl glass-card border border-emerald-200 dark:border-emerald-800 mb-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sage">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activity Traceability & Provenance</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Caregiver Verified Source
                </span>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-navy dark:text-emerald-300">Why was this created?</strong>{' '}
                {generatedActivity.whyThisActivity}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-bloom-dark/60 p-2 rounded-xl border border-slate-200 dark:border-bloom-border">
                <strong>Source Memory:</strong> &ldquo;{generatedActivity.memoryUsed || memoryText}&rdquo;
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1 flex items-center justify-between">
                  <span>Question Stimulus</span>
                  <span className="text-slate-400 font-normal">Caregiver Editable</span>
                </label>
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-bloom-dark/80 border border-slate-300 dark:border-bloom-border text-navy text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Answer Options (Option 1 is correct)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {editOptions.map((opt, idx) => (
                    <div key={idx} className="relative">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...editOptions];
                          updated[idx] = e.target.value;
                          setEditOptions(updated);
                        }}
                        className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium border ${
                          idx === 0 
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-navy font-bold' 
                            : 'bg-white/80 dark:bg-bloom-dark/80 border-slate-200 dark:border-bloom-border text-slate-700'
                        }`}
                      />
                      <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">
                        {idx === 0 ? '✓' : `${idx + 1}.`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1 flex items-center justify-between">
                  <span>Encouraging Reflection & Fun Fact</span>
                  <span className="text-slate-400 font-normal">Spoken when answered</span>
                </label>
                <input
                  type="text"
                  value={editFunFact}
                  onChange={(e) => setEditFunFact(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-bloom-dark/80 border border-slate-300 dark:border-bloom-border text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-bloom-border">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                title="Report Incorrect Information or Unsuitable Question"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Report Problem</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/80 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={handleApprove}
                  disabled={isApproved}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Approved!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Add to Deck</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReportModal && generatedActivity && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-navy">Report Problem with Activity</h3>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Flagging this activity immediately prevents it from ever reaching {patient.name}.
              </p>

              <form onSubmit={handleSubmitProblemReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Reason for Flagging *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 text-navy text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="incorrect_info">❌ Incorrect information</option>
                    <option value="wrong_answer">❌ Wrong answer marked correct</option>
                    <option value="wrong_language">❌ Wrong language or dialect phrasing</option>
                    <option value="too_difficult">❌ Too difficult or confusing for patient</option>
                    <option value="not_culturally_appropriate">❌ Not culturally appropriate</option>
                    <option value="not_relevant">❌ Not relevant to this patient</option>
                    <option value="other">❓ Other concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Caregiver Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Briefly describe what needs correction..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 text-navy text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Submit & Exclude Activity</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}