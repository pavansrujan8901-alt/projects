'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Edit3, 
  Star, 
  BookOpen, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Heart,
  MapPin,
  Utensils,
  Briefcase,
  Music,
  Smile,
  Compass
} from 'lucide-react';
import { Patient, CuratedMemory, MemoryCategory } from '@/types/database';
import { speech } from '@/lib/tts/speech';

interface QuickMemorySetupProps {
  patient: Patient;
  onMemoryAdded?: (memory: CuratedMemory) => void;
}

interface ExtractedCandidate {
  tempId: string;
  title: string;
  detail: string;
  category: MemoryCategory;
  isImportant: boolean;
  accepted?: boolean;
  rejected?: boolean;
  isEditing?: boolean;
}

export default function QuickMemorySetup({ patient, onMemoryAdded }: QuickMemorySetupProps) {
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sampleStories = [
    {
      label: 'Assam / Guwahati Memory',
      text: `${patient.name} worked for over 30 years as a high school science teacher in Guwahati. He loved Sunday lunches with fresh Masor Tenga and garden lemon. In the mornings, he listened to Dr. Bhupen Hazarika songs on the radio and cherished giving hand-woven Gamosas during Rongali Bihu.`
    },
    {
      label: 'Shillong / Pine Hills Memory',
      text: `${patient.name} lived near Ward's Lake in Shillong and enjoyed peaceful morning walks under the pine trees. She was a master weaver of warm Eri silk shawls for her grandchildren, and loved steaming ginger honey tea with traditional Jadoh.`
    },
    {
      label: 'Manipur / Valley Memory',
      text: `${patient.name} taught literature at Manipur University in Imphal. He played the classical single-string Pena fiddle during peaceful evenings. Every year, he celebrated Ningol Chakouba with his daughter Thoibi with a heartfelt fish feast.`
    }
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Heuristic entity and category extractor
  const extractMemoriesFromText = (rawText: string) => {
    setIsExtracting(true);
    speech.playChime('click');

    setTimeout(() => {
      const sentences = rawText
        .split(/(?<=[.!?])s+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

      const found: ExtractedCandidate[] = [];

      sentences.forEach((sentence, idx) => {
        const lower = sentence.toLowerCase();
        let category: MemoryCategory = 'other';
        let title = 'Personal Memory';
        let isImportant = false;

        if (lower.includes('work') || lower.includes('teach') || lower.includes('principal') || lower.includes('professor') || lower.includes('school') || lower.includes('career') || lower.includes('doctor') || lower.includes('engineer')) {
          category = 'occupation';
          title = `Career & Profession in ${patient.hometown.split(',')[0]}`;
          isImportant = true;
        } else if (lower.includes('food') || lower.includes('eat') || lower.includes('curry') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('tea') || lower.includes('masor tenga') || lower.includes('jadoh') || lower.includes('khar') || lower.includes('pitha') || lower.includes('recipe')) {
          category = 'food';
          title = 'Beloved Comfort Meal & Culinary Memory';
        } else if (lower.includes('lake') || lower.includes('walk') || lower.includes('hometown') || lower.includes('guwahati') || lower.includes('shillong') || lower.includes('imphal') || lower.includes('river') || lower.includes('brahmaputra') || lower.includes('garden')) {
          category = 'places';
          title = 'Fond Hometown Landmark & Peaceful Place';
        } else if (lower.includes('bihu') || lower.includes('festival') || lower.includes('ningol') || lower.includes('wangala') || lower.includes('tradition') || lower.includes('gamosa') || lower.includes('puja')) {
          category = 'festivals';
          title = 'Cherished Cultural Celebration & Tradition';
          isImportant = true;
        } else if (lower.includes('music') || lower.includes('song') || lower.includes('radio') || lower.includes('pena') || lower.includes('hazarika') || lower.includes('sing') || lower.includes('sitar') || lower.includes('melod')) {
          category = 'music';
          title = 'Beloved Golden Era Music & Melodies';
        } else if (lower.includes('daughter') || lower.includes('son') || lower.includes('grandchild') || lower.includes('wife') || lower.includes('husband') || lower.includes('family') || lower.includes('children')) {
          category = 'family';
          title = 'Loving Family Bond & Relationship';
          isImportant = true;
        } else if (lower.includes('weave') || lower.includes('garden') || lower.includes('reading') || lower.includes('hobby') || lower.includes('shawl')) {
          category = 'hobbies';
          title = 'Beloved Creative Craft & Hobby';
        }

        found.push({
          tempId: `cand-${Date.now()}-${idx}`,
          title,
          detail: sentence,
          category,
          isImportant
        });
      });

      // Fallback if sentences were too short
      if (found.length === 0 && rawText.trim()) {
        found.push({
          tempId: `cand-${Date.now()}-0`,
          title: 'Caregiver Memory Entry',
          detail: rawText.trim(),
          category: 'family',
          isImportant: true
        });
      }

      setCandidates(found);
      setIsExtracting(false);
      setHasExtracted(true);
      speech.playChime('success');
    }, 700);
  };

  const handleAccept = async (candidate: ExtractedCandidate) => {
    try {
      const res = await fetch(`/api/patients/${patient.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: candidate.title,
          detail: candidate.detail,
          category: candidate.category,
          source: 'caregiver_approved_ai',
          status: 'active',
          is_important: candidate.isImportant
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates(prev => prev.map(c => c.tempId === candidate.tempId ? { ...c, accepted: true } : c));
        speech.playChime('complete');
        showToast(`✓ "${candidate.title}" added to active memory bank!`);
        if (onMemoryAdded) onMemoryAdded(data.data);
      }
    } catch {
      // Offline/Local fallback
      const localMem: CuratedMemory = {
        id: `mem-${Date.now()}`,
        patient_id: patient.id,
        title: candidate.title,
        detail: candidate.detail,
        category: candidate.category,
        source: 'caregiver_approved_ai',
        status: 'active',
        is_important: candidate.isImportant,
        created_at: new Date().toISOString()
      };
      setCandidates(prev => prev.map(c => c.tempId === candidate.tempId ? { ...c, accepted: true } : c));
      speech.playChime('complete');
      showToast(`✓ "${candidate.title}" added locally!`);
      if (onMemoryAdded) onMemoryAdded(localMem);
    }
  };

  const handleReject = (tempId: string) => {
    setCandidates(prev => prev.map(c => c.tempId === tempId ? { ...c, rejected: true } : c));
    speech.playChime('click');
    showToast('Rejected item discarded permanently.');
  };

  const handleAcceptAll = async () => {
    const unreviewed = candidates.filter(c => !c.accepted && !c.rejected);
    for (const item of unreviewed) {
      await handleAccept(item);
    }
    showToast(`✓ Accepted ${unreviewed.length} memories into ${patient.name}'s active memory bank!`);
  };

  const getCategoryIcon = (category: MemoryCategory) => {
    switch (category) {
      case 'occupation': return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'food': return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'places': return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
      case 'music': return <Music className="w-3.5 h-3.5 text-purple-500" />;
      case 'festivals': return <Sparkles className="w-3.5 h-3.5 text-rose-500" />;
      case 'family': return <Heart className="w-3.5 h-3.5 text-pink-500" />;
      case 'hobbies': return <Compass className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <Smile className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-bloom-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-sage text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Rapid Ingestion</span>
          </div>
          <h3 className="text-xl font-bold text-navy">
            Quick Memory Setup
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Type or paste a few natural sentences about <strong>{patient.name}</strong>. Nivora extracts structured memory nodes for your approval.
          </p>
        </div>

        {/* Provenance Reassurance Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-sage" />
          <span>Caregiver Approval Required</span>
        </div>
      </div>

      {/* 1-Tap Example Stories */}
      <div className="mb-4">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Try a 1-Tap Northeast/Indian Story Example:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleStories.map((story, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(story.text);
                speech.playChime('click');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-bloom-dark hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-bloom-border text-xs font-semibold transition-all text-left"
            >
              🌿 {story.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Text Area */}
      <div className="mb-5">
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type natural sentences about ${patient.name}, e.g.: "${patient.name} loved tending the garden with her grandchildren in Shillong. She worked as a high school teacher and made the best Masor Tenga with fresh lemon."`}
          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage resize-y leading-relaxed"
        />

        <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {inputText.length} characters entered
          </span>

          <button
            type="button"
            onClick={() => extractMemoriesFromText(inputText)}
            disabled={!inputText.trim() || isExtracting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 active:scale-95"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Entities...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Suggested Memories</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review Suggested Memories Panel */}
      {hasExtractingStateOrCandidates(hasExtracted, candidates) && (
        <div className="pt-5 border-t border-slate-200/70 dark:border-bloom-border animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-sm font-extrabold text-navy flex items-center gap-2">
                <span>Review Suggested Memories</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-sage text-[10px] font-bold">
                  {candidates.filter(c => !c.rejected && !c.accepted).length} Pending Review
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect each memory below. Tap <strong>Accept</strong> to add it to {patient.name}&apos;s verified bank.
              </p>
            </div>

            {candidates.filter(c => !c.accepted && !c.rejected).length > 1 && (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-sage border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All ({candidates.filter(c => !c.accepted && !c.rejected).length})</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => {
              if (cand.rejected) return null;

              return (
                <div 
                  key={cand.tempId}
                  className={`p-4 rounded-2xl border transition-all ${
                    cand.accepted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50/80 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-bloom-card border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          {getCategoryIcon(cand.category)}
                          <span className="capitalize">{cand.category}</span>
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          AI Extracted
                        </span>

                        {cand.isImportant && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center gap-0.5">
                            ★ Primary Memory
                          </span>
                        )}
                      </div>

                      {/* Content (view mode or edit mode) */}
                      {cand.isEditing ? (
                        <div className="space-y-2 mt-2">
                          <input
                            type="text"
                            value={cand.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCandidates(prev => prev.map(c => c.tempId === cand.tempId ? { ...c, title: val } : c));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-navy"
                          />
                          <textarea
                            rows={2}
                            value={cand.detail}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCandidates(prev => prev.map(c => c.tempId === cand.tempId ? { ...c, detail: val } : c));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => setCandidates(prev => prev.map(c => c.tempId === cand.tempId ? { ...c, isEditing: false } : c))}
                            className="px-3 py-1 rounded-lg bg-navy text-white text-[11px] font-bold"
                          >
                            Save Edits
                          </button>
                        </div>
                      ) : (
                        <>
                          <h5 className="text-xs sm:text-sm font-bold text-navy mb-1">
                            {cand.title}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {cand.detail}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0">
                      {cand.accepted ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Accepted</span>
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setCandidates(prev => prev.map(c => c.tempId === cand.tempId ? { ...c, isEditing: !c.isEditing } : c))}
                            className="p-2 rounded-xl bg-white dark:bg-bloom-card border border-slate-200 text-slate-600 hover:text-navy text-xs font-semibold transition-all"
                            title="Edit Memory"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReject(cand.tempId)}
                            className="p-2 rounded-xl bg-white dark:bg-bloom-card border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                            title="Reject Memory"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAccept(cand)}
                            className="px-3.5 py-1.5 rounded-xl bg-sage hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function hasExtractingStateOrCandidates(hasExtracted: boolean, candidates: ExtractedCandidate[]): boolean {
  return hasExtracted && candidates.length > 0;
}
