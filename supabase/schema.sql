-- ==============================================================================
-- MINDBLOOM - SUPABASE DATABASE SCHEMA
-- AI-Powered Cognitive Gaming and Reminiscence Therapy for Dementia Patients
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('caregiver', 'patient')) DEFAULT 'caregiver',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PATIENTS TABLE (Managed by Caregivers)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  hometown TEXT NOT NULL,
  occupation TEXT,
  family_members JSONB DEFAULT '[]'::jsonb, -- [{name: "Meera", relationship: "Daughter"}, {name: "Aarav", relationship: "Grandson"}]
  favorite_music TEXT,
  favorite_meals TEXT,
  access_code TEXT UNIQUE NOT NULL, -- 6-digit numeric login PIN for patient
  preferred_language TEXT DEFAULT 'en',
  stage TEXT CHECK (stage IN ('early', 'moderate', 'mild_cognitive_impairment')) DEFAULT 'early',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on access_code for rapid patient authentication
CREATE INDEX IF NOT EXISTS idx_patients_access_code ON public.patients(access_code);
CREATE INDEX IF NOT EXISTS idx_patients_caregiver_id ON public.patients(caregiver_id);

-- 3. PATIENT PHOTOS (Used in Face-Name Recall Game & Reminiscence Therapy)
CREATE TABLE IF NOT EXISTS public.patient_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  person_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  era_decade TEXT, -- e.g. "1970s", "1990s"
  context_memory TEXT, -- e.g. "Family vacation to Shillong peak"
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_photos_patient_id ON public.patient_photos(patient_id);

-- 4. PATIENT SESSIONS (Custom token-based auth for PIN access)
CREATE TABLE IF NOT EXISTS public.patient_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  access_code TEXT NOT NULL,
  token UUID DEFAULT gen_random_uuid() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_patient_sessions_token ON public.patient_sessions(token);

-- 5. GAME SESSIONS (Tracks individual gameplay runs)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT CHECK (game_type IN ('memory_match', 'face_name', 'reminiscence_trivia', 'sequence', 'word_assoc', 'orientation')) NOT NULL,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  difficulty_level INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb -- {grid_size: "3x2", hints_used: 1}
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_patient_id ON public.game_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON public.game_sessions(game_type);

-- 6. GAME RESPONSES (Detailed analytics per move/answer for clinical insight)
CREATE TABLE IF NOT EXISTS public.game_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  question_data JSONB NOT NULL, -- {prompt, options, correct_answer, stimulus_id}
  patient_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL,
  attempts_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_responses_session_id ON public.game_responses(session_id);

-- 7. REMINISCENCE CONTENT (AI-generated personalized era trivia cache)
CREATE TABLE IF NOT EXISTS public.reminiscence_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  content JSONB NOT NULL, -- {question, options, correct_answer_index, fun_fact, era_year, topic}
  generated_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reminiscence_patient ON public.reminiscence_content(patient_id, language);

-- 8. CAREGIVER INSIGHTS (AI clinical summaries of cognitive trajectories)
CREATE TABLE IF NOT EXISTS public.caregiver_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  insight_text TEXT NOT NULL,
  category TEXT DEFAULT 'weekly_summary', -- 'weekly_summary', 'alert', 'milestone'
  score_delta_pct NUMERIC(5,2), -- e.g. +14.5%
  insight_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_caregiver_insights_patient ON public.caregiver_insights(patient_id, insight_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminiscence_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_sessions ENABLE ROW LEVEL SECURITY;

-- Caregivers have full control over their own profile
CREATE POLICY "Caregivers can view/update their own profile"
  ON public.users FOR ALL
  USING (auth.uid() = id);

-- Caregivers can view & manage their assigned patients
CREATE POLICY "Caregivers can manage their patients"
  ON public.patients FOR ALL
  USING (auth.uid() = caregiver_id);

-- Patient access code holders can view patient record via session verification
CREATE POLICY "Patients can read their own profile with session token"
  ON public.patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_sessions
      WHERE patient_sessions.patient_id = patients.id
      AND patient_sessions.expires_at > now()
    )
    OR auth.uid() = caregiver_id
  );

-- Patient photos policies
CREATE POLICY "Caregiver can manage patient photos"
  ON public.patient_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = patient_photos.patient_id
      AND patients.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Patients can read their photos during games"
  ON public.patient_photos FOR SELECT
  USING (true);

-- Game sessions & responses policies
CREATE POLICY "Allow patient and caregiver to read and insert game sessions"
  ON public.game_sessions FOR ALL
  USING (true);

CREATE POLICY "Allow patient and caregiver to read and insert game responses"
  ON public.game_responses FOR ALL
  USING (true);

-- Reminiscence & insights policies
CREATE POLICY "Access reminiscence content"
  ON public.reminiscence_content FOR ALL
  USING (true);

CREATE POLICY "Access caregiver insights"
  ON public.caregiver_insights FOR ALL
  USING (true);

-- Storage bucket configuration instructions
-- Insert into storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- Insert into storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
