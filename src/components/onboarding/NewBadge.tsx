'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Sparkles } from 'lucide-react';

interface NewBadgeProps {
  sectionId: string;
  className?: string;
}

export default function NewBadge({ sectionId, className = '' }: NewBadgeProps) {
  const { isSectionNew, markSectionVisited } = useOnboardingStore();

  if (!isSectionNew(sectionId)) return null;

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        markSectionVisited(sectionId);
      }}
      title="New Feature - click to dismiss"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm shadow-amber-500/30 animate-pulse cursor-pointer transition-all hover:scale-105 ${className}`}
    >
      <Sparkles className="w-2.5 h-2.5" />
      <span>New</span>
    </span>
  );
}
