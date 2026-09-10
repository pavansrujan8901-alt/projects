'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, Volume2, Check, ArrowRight, Heart } from 'lucide-react';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { SUPPORTED_LANGUAGES, SupportedLanguage, translations } from '@/lib/i18n/translations';
import { speech } from '@/lib/tts/speech';

export default function LanguagePage() {
  const router = useRouter();
  const { language, setLanguage } = useAccessibilityStore();
  const t = translations[language] || translations.en;

  const handleSelect = (code: SupportedLanguage, sampleText: string) => {
    speech.playChime('click');
    setLanguage(code);
    speech.speak(sampleText, code);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14 text-center">
      {/* Header */}
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-sage mx-auto flex items-center justify-center mb-5 text-3xl shadow-sm">
        🌿
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-navy mb-2 tracking-tight">
        Choose Your Language
      </h1>
      <p className="text-sm sm:text-base text-sage font-bold max-w-xl mx-auto mb-2">
        আপোনাৰ নিজৰ ভাষা বাছক · अपनी भाषा चुनें · ৱা ঙাংনবা লোন খনবীয়ু
      </p>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-10">
        Nivora speaks your mother tongue with familiar warmth. Select your language to personalize voice guidance and all memory activities.
      </p>

      {/* Active 9 Regional Languages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
        {SUPPORTED_LANGUAGES.map((item) => {
          const isSelected = language === item.code;
          return (
            <div
              key={item.code}
              onClick={() => handleSelect(item.code, item.sampleText)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                isSelected
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-sage ring-4 ring-emerald-600/10'
                  : 'bg-white dark:bg-bloom-card border-slate-200 dark:border-bloom-border hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl select-none">{item.flag}</span>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-sage text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {item.code.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="text-xl font-bold text-navy mb-0.5">
                  {item.nativeName}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2">
                  {item.name}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-bloom-border flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[140px]">
                  {item.region}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speech.speak(item.sampleText, item.code);
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-bloom-dark hover:bg-slate-200 text-sage transition-all"
                  title="Listen to audio greeting"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Action */}
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/patient/dashboard"
          className="px-8 py-4 rounded-2xl bg-sage hover:bg-emerald-700 text-white font-extrabold text-base flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <span>Continue with {SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
