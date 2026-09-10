// ==============================================================================
// NIVORA - CORE TYPES & DATABASE INTERFACES
// ==============================================================================

export type UserRole = 'caregiver' | 'patient';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  notes?: string;
}

export interface Patient {
  id: string;
  caregiver_id: string;
  name: string;
  birth_year: number;
  hometown: string;
  state_region?: string;
  occupation?: string;
  family_members: FamilyMember[];
  favorite_music?: string;
  favorite_meals?: string;
  favorite_festivals?: string;
  cultural_traditions?: string;
  access_code: string; // 6-digit PIN
  preferred_language: string;
  stage: 'early' | 'moderate' | 'mild_cognitive_impairment';
  created_at: string;
}

export interface PatientPhoto {
  id: string;
  patient_id: string;
  file_url: string;
  person_name: string;
  relationship: string;
  category?: string;
  era_decade?: string;
  context_memory?: string;
  uploaded_by?: string;
  created_at: string;
}

export type GameType = 
  | 'memory_match' 
  | 'face_name' 
  | 'reminiscence_trivia' 
  | 'sequence' 
  | 'word_assoc' 
  | 'orientation'
  | 'association'
  | 'category_sort'
  | 'picture_recall';

export interface GameSession {
  id: string;
  patient_id: string;
  game_type: GameType;
  start_time: string;
  end_time?: string;
  score: number;
  max_score: number;
  completed: boolean;
  difficulty_level: number;
  metadata?: Record<string, unknown>;
}

export interface GameResponse {
  id: string;
  session_id: string;
  question_data: {
    prompt?: string;
    options?: string[];
    correct_answer?: string | number;
    stimulus_id?: string;
    image_url?: string;
  };
  patient_answer: string;
  is_correct: boolean;
  response_time_ms: number;
  attempts_count: number;
  created_at: string;
}

export interface ReminiscenceQuestion {
  id: string;
  patient_id: string;
  language: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  fun_fact: string;
  era_year?: number;
  era_decade?: string;
  topic?: string;
}

export interface CaregiverInsight {
  id: string;
  patient_id: string;
  insight_text: string;
  category: 'weekly_summary' | 'alert' | 'milestone';
  score_delta_pct?: number;
  insight_date: string;
  created_at: string;
}

export interface PatientSessionToken {
  id: string;
  patient_id: string;
  access_code: string;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}


// ==============================================================================
// MEMORY PROVENANCE & CONFIDENCE TYPES
// ==============================================================================

export type MemorySource = 'caregiver_entered' | 'caregiver_approved_ai' | 'imported';
export type MemoryStatus = 'active' | 'archived' | 'deleted';
export type MemoryCategory = 
  | 'family' 
  | 'person' 
  | 'places' 
  | 'food' 
  | 'occupation' 
  | 'hobbies' 
  | 'music' 
  | 'festivals' 
  | 'traditions' 
  | 'other';

export interface CuratedMemory {
  id: string;
  patient_id: string;
  title: string;
  detail: string;
  category: MemoryCategory;
  source: MemorySource;
  status: MemoryStatus;
  is_important?: boolean;
  era_decade?: string;
  related_person?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ActivityProblemReport {
  id: string;
  activity_id: string;
  patient_id: string;
  reason: 
    | 'incorrect_info' 
    | 'wrong_answer' 
    | 'wrong_language' 
    | 'too_difficult' 
    | 'not_culturally_appropriate' 
    | 'not_relevant' 
    | 'other';
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}
