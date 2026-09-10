import { create } from 'zustand';
import { User, Patient } from '@/types/database';
import { initialUsers, initialPatients } from '@/lib/mock-db';

interface AuthState {
  caregiver: User | null;
  patient: Patient | null;
  patientToken: string | null;
  isCaregiverLoggedIn: boolean;
  isPatientLoggedIn: boolean;
  setCaregiver: (user: User | null) => void;
  setPatient: (patient: Patient | null, token?: string) => void;
  logoutCaregiver: () => void;
  logoutPatient: () => void;
  loginAsDemoCaregiver: () => void;
  loginAsDemoPatient: (code?: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  caregiver: null,
  patient: null,
  patientToken: null,
  isCaregiverLoggedIn: false,
  isPatientLoggedIn: false,

  setCaregiver: (user) => {
    set({ caregiver: user, isCaregiverLoggedIn: Boolean(user) });
  },

  setPatient: (patient, token) => {
    set({
      patient,
      patientToken: token || (patient ? `mb_token_${patient.id}` : null),
      isPatientLoggedIn: Boolean(patient)
    });
  },

  logoutCaregiver: () => {
    set({ caregiver: null, isCaregiverLoggedIn: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mindbloom_caregiver');
    }
  },

  logoutPatient: () => {
    set({ patient: null, patientToken: null, isPatientLoggedIn: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mindbloom_patient');
      localStorage.removeItem('mindbloom_patient_token');
    }
  },

  loginAsDemoCaregiver: () => {
    const demoUser = initialUsers[0];
    set({ caregiver: demoUser, isCaregiverLoggedIn: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_caregiver', JSON.stringify(demoUser));
    }
  },

  loginAsDemoPatient: (code = '123456') => {
    const p = initialPatients.find(item => item.access_code === code) || initialPatients[0];
    const token = `demo_tok_${p.id}`;
    set({ patient: p, patientToken: token, isPatientLoggedIn: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_patient', JSON.stringify(p));
      localStorage.setItem('mindbloom_patient_token', token);
    }
  }
}));
