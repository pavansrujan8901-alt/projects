'use client';

import { create } from 'zustand';
import { SupportedLanguage } from '@/lib/i18n/translations';

export interface UserRegistrationProfile {
  name: string;
  gender: 'female' | 'male' | 'non-binary' | 'prefer-not-to-say' | string;
  role: 'patient' | 'caregiver';
  preferred_language: SupportedLanguage;
  birth_year?: number;
  consentAccepted: boolean;
  registeredAt: string;
}

interface OnboardingState {
  hasGivenConsent: boolean;
  userProfile: UserRegistrationProfile | null;
  caregiverTourCompleted: boolean;
  patientGuideCompleted: boolean;
  visitedSections: string[];
  showOnboardingModal: boolean;
  showQuickStartModal: boolean;
  
  // Actions
  initializeFromStorage: () => void;
  setConsentAndProfile: (profile: Omit<UserRegistrationProfile, 'registeredAt'>) => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  setCaregiverTourCompleted: (completed: boolean) => void;
  setPatientGuideCompleted: (completed: boolean) => void;
  resetCaregiverTour: () => void;
  resetPatientGuide: () => void;
  markSectionVisited: (sectionId: string) => void;
  isSectionNew: (sectionId: string) => boolean;
  openQuickStart: () => void;
  closeQuickStart: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasGivenConsent: false,
  userProfile: null,
  caregiverTourCompleted: false,
  patientGuideCompleted: false,
  visitedSections: [],
  showOnboardingModal: false,
  showQuickStartModal: false,

  initializeFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const consentStr = localStorage.getItem('mindbloom_consent');
      const profileStr = localStorage.getItem('mindbloom_user_profile');
      const cgTourStr = localStorage.getItem('mindbloom_caregiver_onboarded');
      const ptGuideStr = localStorage.getItem('mindbloom_patient_onboarded');
      const visitedStr = localStorage.getItem('mindbloom_visited_sections');

      const hasGivenConsent = consentStr === 'true';
      const userProfile = profileStr ? JSON.parse(profileStr) : null;
      const caregiverTourCompleted = cgTourStr === 'true';
      const patientGuideCompleted = ptGuideStr === 'true';
      const visitedSections = visitedStr ? JSON.parse(visitedStr) : [];

      set({
        hasGivenConsent,
        userProfile,
        caregiverTourCompleted,
        patientGuideCompleted,
        visitedSections,
        // If first-time user hasn't consented or registered, we can suggest onboarding
        showOnboardingModal: !hasGivenConsent
      });
    } catch (e) {
      console.error('Failed to load onboarding preferences from storage', e);
    }
  },

  setConsentAndProfile: (profileData) => {
    const fullProfile: UserRegistrationProfile = {
      ...profileData,
      consentAccepted: true,
      registeredAt: new Date().toISOString()
    };

    set({
      hasGivenConsent: true,
      userProfile: fullProfile,
      showOnboardingModal: false
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_consent', 'true');
      localStorage.setItem('mindbloom_user_profile', JSON.stringify(fullProfile));
      localStorage.setItem('mindbloom_lang', fullProfile.preferred_language);
    }
  },

  openOnboarding: () => set({ showOnboardingModal: true }),
  closeOnboarding: () => set({ showOnboardingModal: false }),

  setCaregiverTourCompleted: (completed) => {
    set({ caregiverTourCompleted: completed });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_caregiver_onboarded', String(completed));
    }
  },

  setPatientGuideCompleted: (completed) => {
    set({ patientGuideCompleted: completed });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_patient_onboarded', String(completed));
    }
  },

  resetCaregiverTour: () => {
    set({ caregiverTourCompleted: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mindbloom_caregiver_onboarded');
    }
  },

  resetPatientGuide: () => {
    set({ patientGuideCompleted: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mindbloom_patient_onboarded');
    }
  },

  markSectionVisited: (sectionId) => {
    const current = get().visitedSections;
    if (!current.includes(sectionId)) {
      const updated = [...current, sectionId];
      set({ visitedSections: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem('mindbloom_visited_sections', JSON.stringify(updated));
      }
    }
  },

  isSectionNew: (sectionId) => {
    return !get().visitedSections.includes(sectionId);
  },

  openQuickStart: () => set({ showQuickStartModal: true }),
  closeQuickStart: () => set({ showQuickStartModal: false })
}));
