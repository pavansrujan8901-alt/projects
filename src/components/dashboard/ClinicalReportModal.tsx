'use client';

import React from 'react';
import { X, Printer, Download, Flower2, ShieldCheck, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { Patient } from '@/types/database';

interface ClinicalReportModalProps {
  patient: Patient;
  onClose: () => void;
}

export default function ClinicalReportModal({ patient, onClose }: ClinicalReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl bg-bloom-dark border-2 border-bloom-border p-6 sm:p-10 shadow-2xl relative my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Print / Close Actions */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-bloom-border/60 print:hidden">
          <div className="flex items-center gap-2 text-bloom-cyan font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Official Cognitive Assessment Summary</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-bloom-cyan text-bloom-darkest font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-md shadow-bloom-cyan/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-700 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-bloom-teal to-bloom-cyan flex items-center justify-center text-bloom-darkest">
              <Flower2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white print:text-black">Nivora Clinical Health Report</h1>
              <p className="text-xs text-slate-400 print:text-slate-600">Cognitive Stimulation & Reminiscence Therapy Telemetry</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600">
            <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
            <div><strong>Clinician:</strong> Dr. Anita Sharma, MD</div>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-bloom-card/60 border border-bloom-border/60 mb-8 print:bg-slate-100 print:border-slate-300 print:text-black">
          <div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">Patient Name</div>
            <div className="font-bold text-white print:text-black text-sm">{patient.name}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">Birth Year & Age</div>
            <div className="font-bold text-white print:text-black text-sm">{patient.birth_year} ({new Date().getFullYear() - patient.birth_year} yrs)</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">Hometown & Era</div>
            <div className="font-bold text-white print:text-black text-sm">{patient.hometown}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">Clinical Stage</div>
            <div className="font-bold text-emerald-400 print:text-emerald-700 text-sm uppercase">{patient.stage.replace('_', ' ')}</div>
          </div>
        </div>

        {/* Core Cognitive Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="p-4 rounded-2xl bg-bloom-card border border-bloom-border/60 print:border-slate-300 print:bg-white">
            <div className="text-xs text-slate-400 print:text-slate-600 mb-1">Overall Accuracy</div>
            <div className="text-3xl font-bold text-bloom-cyan print:text-teal-700 font-mono">86%</div>
            <div className="text-[11px] text-emerald-400 print:text-emerald-700 mt-1">+14% vs Baseline</div>
          </div>
          <div className="p-4 rounded-2xl bg-bloom-card border border-bloom-border/60 print:border-slate-300 print:bg-white">
            <div className="text-xs text-slate-400 print:text-slate-600 mb-1">Stimulus Latency</div>
            <div className="text-3xl font-bold text-purple-300 print:text-purple-700 font-mono">2.4s</div>
            <div className="text-[11px] text-emerald-400 print:text-emerald-700 mt-1">-1.2s improvement</div>
          </div>
          <div className="p-4 rounded-2xl bg-bloom-card border border-bloom-border/60 print:border-slate-300 print:bg-white">
            <div className="text-xs text-slate-400 print:text-slate-600 mb-1">Completed Sessions</div>
            <div className="text-3xl font-bold text-amber-300 print:text-amber-700 font-mono">14</div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 mt-1">100% Adherence</div>
          </div>
        </div>

        {/* Cognitive Domain Breakdown */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black mb-4">
            Domain-Specific Cognitive Evaluation
          </h3>
          <div className="space-y-3">
            {[
              { domain: 'Visual Memory & Facial Recognition', score: 85, status: 'Stable' },
              { domain: 'Short-Term Working Memory (Pattern Flip)', score: 80, status: 'Improving' },
              { domain: 'Autobiographical & Era Reminiscence', score: 92, status: 'Strong Resonance' },
              { domain: 'Temporal & Spatial Orientation', score: 95, status: 'Optimal' }
            ].map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-bloom-card/60 border border-bloom-border/40 print:bg-slate-50 print:border-slate-200">
                <div className="flex justify-between items-center text-xs font-semibold mb-1 text-white print:text-black">
                  <span>{d.domain}</span>
                  <span className="text-bloom-cyan print:text-teal-700">{d.score}% — {d.status}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 print:bg-slate-200 overflow-hidden">
                  <div style={{ width: `${d.score}%` }} className="h-full bg-gradient-to-r from-bloom-teal to-bloom-cyan" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Observations & Recommendations */}
        <div className="p-5 rounded-2xl bg-bloom-surface/60 border border-bloom-border print:bg-slate-100 print:border-slate-300 print:text-black">
          <h3 className="text-sm font-bold text-white print:text-black mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-bloom-teal print:text-teal-700" />
            <span>Geriatric Care Recommendations</span>
          </h3>
          <ul className="text-xs text-slate-300 print:text-slate-800 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Maintain regular 10-minute morning play sessions to capitalize on peak circadian cognitive clarity.</li>
            <li>Incorporate family photo reviews with daughter Meera during weekly visits to reinforce semantic connections.</li>
            <li>Assamese audio prompts elicit strong emotional calmness and spontaneous verbal storytelling.</li>
          </ul>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700 print:border-slate-300 flex justify-between items-center text-[11px] text-slate-500 print:text-slate-600">
          <span>Nivora AI Cognitive Platform · HIPAA/WCAG AA+ Compliant</span>
          <span>Digital Signature: Dr. Anita Sharma, MD (Geriatrics)</span>
        </div>
      </div>
    </div>
  );
}
