'use client';

import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { speech } from '@/lib/tts/speech';
import { useAccessibilityStore } from '@/store/accessibility-store';

interface VoiceAnswerButtonProps {
  options: string[];
  onSelectOption: (index: number) => void;
  disabled?: boolean;
}

export default function VoiceAnswerButton({
  options,
  onSelectOption,
  disabled = false
}: VoiceAnswerButtonProps) {
  const { language } = useAccessibilityStore();
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'processing' | 'responded'>('idle');
  const [spokenWord, setSpokenWord] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');

  const handleStartListening = () => {
    if (disabled) return;

    if (assistantState === 'listening') {
      speech.stop();
      setAssistantState('idle');
      return;
    }

    setAssistantState('listening');
    setSpokenWord('');
    setFeedbackNotice('');
    speech.playChime('click');

    const listener = speech.startListening(
      (transcript) => {
        setAssistantState('processing');
        setSpokenWord(transcript);
        
        setTimeout(() => {
          matchSpokenToOption(transcript);
        }, 500);
      },
      () => {
        setAssistantState('idle');
        setFeedbackNotice('Voice not detected. Feel free to tap an answer below.');
      },
      language
    );

    if (!listener) {
      setAssistantState('idle');
      setFeedbackNotice('Microphone is quiet today. Feel free to tap an answer below.');
    }

    setTimeout(() => {
      if (listener) {
        listener.stop();
        setAssistantState(curr => (curr === 'listening' ? 'idle' : curr));
      }
    }, 6000);
  };

  const matchSpokenToOption = (spoken: string) => {
    const cleanSpoken = spoken.toLowerCase().trim();
    let bestMatchIndex = -1;

    options.forEach((opt, idx) => {
      const cleanOpt = opt.toLowerCase();
      if (cleanOpt.includes(cleanSpoken) || cleanSpoken.includes(cleanOpt)) {
        bestMatchIndex = idx;
      }
      const words = cleanOpt.split(' ');
      for (const w of words) {
        if (w.length > 3 && cleanSpoken.includes(w)) {
          bestMatchIndex = idx;
          break;
        }
      }
    });

    if (bestMatchIndex !== -1) {
      setAssistantState('responded');
      setFeedbackNotice(`Recognized: "${options[bestMatchIndex]}"`);
      speech.playChime('success');
      onSelectOption(bestMatchIndex);
    } else {
      setAssistantState('idle');
      setFeedbackNotice(`Heard "${spoken}". You can tap any answer below.`);
    }
  };

  const handleHearAgain = () => {
    speech.playChime('click');
    const optionsPrompt = options.map((opt, i) => `Option ${i + 1}: ${opt}`).join('. ');
    speech.speak(optionsPrompt, language);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-3">
        {/* Main 4-State Voice Companion Button */}
        <div className="relative">
          {/* Subtle Ambient Pulse Ring when listening */}
          {assistantState === 'listening' && (
            <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-pulseRing pointer-events-none" />
          )}

          <button
            onClick={handleStartListening}
            disabled={disabled}
            className={`px-6 py-3.5 rounded-full font-bold text-sm flex items-center gap-2.5 transition-all duration-300 active:scale-95 shadow-md ${
              assistantState === 'listening'
                ? 'bg-rose-500 text-white shadow-rose-500/25 ring-4 ring-rose-200 dark:ring-rose-900/50'
                : assistantState === 'processing'
                ? 'bg-amber-500 text-white shadow-amber-500/25 ring-4 ring-amber-200'
                : assistantState === 'responded'
                ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                : 'glass-card text-sage hover:text-emerald-800 dark:text-emerald-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Voice Answer Assistant"
          >
            <Mic className={`w-4 h-4 ${
              assistantState === 'listening' ? 'animate-bounce text-white' : 
              assistantState === 'processing' ? 'animate-spin text-white' : 
              assistantState === 'responded' ? 'text-white' : 'text-sage'
            }`} />
            
            <span>
              {assistantState === 'listening' ? 'Listening...' :
               assistantState === 'processing' ? 'One moment...' :
               assistantState === 'responded' ? 'Answer Recognized ✓' :
               '🎤 Speak Answer'}
            </span>
          </button>
        </div>

        {/* 🔊 Hear Again Action */}
        <button
          onClick={handleHearAgain}
          disabled={disabled}
          className="px-4 py-3.5 rounded-full glass-card hover:border-sage text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          title="Hear options read aloud"
        >
          <Volume2 className="w-4 h-4 text-sage" />
          <span className="hidden sm:inline">Hear Again</span>
        </button>
      </div>

      {feedbackNotice && (
        <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium animate-fadeIn text-center px-4 py-1.5 rounded-full bg-slate-100/70 dark:bg-bloom-dark/70 backdrop-blur-xs border border-slate-200 dark:border-bloom-border">
          {feedbackNotice}
        </div>
      )}
    </div>
  );
}
