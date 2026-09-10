'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Play, CheckCircle2, Sparkles, Heart, Mic } from 'lucide-react';
import { speech, CategorizedVoice, VoiceGender, VoiceSpeed } from '@/lib/tts/speech';

export default function CaregiverVoiceSettings() {
  const [voices, setVoices] = useState<CategorizedVoice[]>([]);
  const [gender, setGender] = useState<VoiceGender>('female');
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speed, setSpeed] = useState<VoiceSpeed>('normal');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    // Load initial settings
    const current = speech.getSettings();
    setGender(current.gender);
    setSelectedVoiceURI(current.voiceURI || '');
    setSpeed(current.speed);

    // Load available voices
    const available = speech.getAvailableVoices();
    setVoices(available);

    const unsubscribe = speech.subscribe(() => {
      const updated = speech.getSettings();
      setGender(updated.gender);
      setSelectedVoiceURI(updated.voiceURI || '');
      setSpeed(updated.speed);
      setVoices(speech.getAvailableVoices());
    });

    return () => unsubscribe();
  }, []);

  const handleGenderChange = (newGender: VoiceGender) => {
    setGender(newGender);
    speech.setGender(newGender);
    showSaveConfirmation();
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value || null;
    setSelectedVoiceURI(uri || '');
    speech.setVoiceURI(uri);
    showSaveConfirmation();
  };

  const handleSpeedChange = (newSpeed: VoiceSpeed) => {
    setSpeed(newSpeed);
    speech.setSpeed(newSpeed);
    showSaveConfirmation();
  };

  const handlePreview = () => {
    setIsPlayingPreview(true);
    speech.playChime('click');
    speech.previewVoice(selectedVoiceURI || undefined, speed);
    setTimeout(() => setIsPlayingPreview(false), 4500);
  };

  const showSaveConfirmation = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-md border-2 border-slate-200/80 dark:border-bloom-border mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎙️</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              Voice Companion Settings
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sage border border-emerald-200 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Female-First Default</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure the gentle, natural voice that guides the patient during daily activities and check-ins.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Voice Preference */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Voice Preference
          </label>
          <div className="space-y-2">
            <button
              onClick={() => handleGenderChange('female')}
              className={`w-full p-3 rounded-2xl border-2 font-bold text-sm flex items-center justify-between transition-all ${
                gender === 'female'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-sage text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🌸</span>
                <span>Female (Recommended)</span>
              </div>
              {gender === 'female' && <CheckCircle2 className="w-4 h-4 text-sage" />}
            </button>

            <button
              onClick={() => handleGenderChange('male')}
              className={`w-full p-3 rounded-2xl border-2 font-bold text-sm flex items-center justify-between transition-all ${
                gender === 'male'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-sage text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>👨</span>
                <span>Male</span>
              </div>
              {gender === 'male' && <CheckCircle2 className="w-4 h-4 text-sage" />}
            </button>

            <button
              onClick={() => handleGenderChange('auto')}
              className={`w-full p-3 rounded-2xl border-2 font-bold text-sm flex items-center justify-between transition-all ${
                gender === 'auto'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-sage text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <span>System Automatic</span>
              </div>
              {gender === 'auto' && <CheckCircle2 className="w-4 h-4 text-sage" />}
            </button>
          </div>
        </div>

        {/* 2. Specific Browser Voice Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Available Voices ({voices.length})
          </label>
          <select
            value={selectedVoiceURI}
            onChange={handleVoiceChange}
            className="w-full p-3 rounded-2xl border-2 border-slate-200 dark:border-bloom-border bg-white/90 dark:bg-bloom-dark text-navy font-semibold text-sm focus:border-sage focus:outline-none mb-3"
          >
            <option value="">-- Automatic Best Female Voice --</option>
            {voices.map(item => (
              <option key={item.voice.voiceURI} value={item.voice.voiceURI}>
                {item.displayName} ({item.voice.lang})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Voices are automatically loaded from the current device and prioritized for warmth, naturalness, and clarity.
          </p>
        </div>

        {/* 3. Voice Speed & Preview */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Voice Speed
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['slow', 'normal', 'fast'] as VoiceSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                  speed === s
                    ? 'bg-sage text-white border-sage shadow-xs'
                    : 'bg-white/90 dark:bg-bloom-dark border-slate-200 dark:border-bloom-border text-slate-600 hover:border-slate-300'
                }`}
              >
                {s === 'slow' ? 'Slow (0.8x)' : s === 'normal' ? 'Normal (0.9x)' : 'Fast (1.0x)'}
              </button>
            ))}
          </div>

          <button
            onClick={handlePreview}
            disabled={isPlayingPreview}
            className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs"
          >
            <Play className="w-4 h-4 fill-amber-600 text-amber-600" />
            <span>{isPlayingPreview ? 'Speaking Preview...' : '▶ Preview Voice Companion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
