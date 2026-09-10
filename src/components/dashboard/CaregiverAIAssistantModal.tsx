'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  BarChart3, 
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { Patient, GameSession, PatientPhoto } from '@/types/database';
import { speech } from '@/lib/tts/speech';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  suggestedAction?: string;
  timestamp: string;
}

interface CaregiverAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  sessions?: GameSession[];
  photos?: PatientPhoto[];
}

export default function CaregiverAIAssistantModal({
  isOpen,
  onClose,
  patient,
  sessions = [],
  photos = []
}: CaregiverAIAssistantModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your Nivora Caregiver AI Copilot for ${patient.name}. I can answer questions about recent session engagement, suggest memories to add, or help tailor new cognitive exercises.`,
      suggestedAction: 'Ask a question below or choose a suggested prompt.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    `How many activities did ${patient.name} complete this week?`,
    'What kind of memories should I add next to help engagement?',
    'Which activities bring the highest comfort and success?'
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    speech.playChime('click');
    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/caregiver-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          patient_id: patient.id
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: data.data.answer,
            suggestedAction: data.data.suggestedAction,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        speech.playChime('success');
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl h-[85vh] rounded-3xl bg-white dark:bg-bloom-card border-2 border-slate-200 dark:border-bloom-border flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-bloom-border flex items-center justify-between bg-slate-50/50 dark:bg-bloom-dark/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage text-white flex items-center justify-center text-xl shadow-xs">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <span>Caregiver AI Copilot</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-sage text-[10px] font-bold uppercase tracking-wider">
                  Secure & Grounded
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Insights tailored to <strong>{patient.name}</strong> ({sessions.length} sessions recorded)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border text-slate-500 hover:text-slate-900 transition-all shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-navy text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-bloom-dark text-navy dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-bloom-border'
                }`}
              >
                <div className="font-medium whitespace-pre-wrap">{m.text}</div>
                {m.suggestedAction && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-bloom-border/60 text-xs text-sage font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{m.suggestedAction}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-200 text-xs text-slate-500 max-w-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-sage animate-spin" />
              <span>Analyzing engagement records...</span>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-bloom-dark/40 border-t border-slate-200 dark:border-bloom-border overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-bloom-card border border-slate-200 dark:border-bloom-border text-navy dark:text-slate-300 hover:border-sage hover:text-sage transition-all whitespace-nowrap shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div className="p-4 border-t border-slate-200 dark:border-bloom-border bg-white dark:bg-bloom-card flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask a question about ${patient.name}'s progress or memories...`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-bloom-dark border border-slate-300 dark:border-bloom-border text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="p-3.5 rounded-2xl bg-sage hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
