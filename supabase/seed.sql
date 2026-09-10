-- ==============================================================================
-- MINDBLOOM - SUPABASE SEED DATA
-- Rich demo dataset for judges, clinicians, and offline hackathon testing
-- ==============================================================================

-- 1. Insert Demo Caregiver (ID: c0000000-0000-0000-0000-000000000001)
INSERT INTO public.users (id, email, full_name, role, avatar_url, phone)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'dr.anita@mindbloom.health',
  'Dr. Anita Sharma',
  'caregiver',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  '+91 98765 43210'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Demo Patients
-- Patient 1: Dharani Baruah (Access PIN: 123456)
INSERT INTO public.patients (
  id,
  caregiver_id,
  name,
  birth_year,
  hometown,
  occupation,
  family_members,
  favorite_music,
  favorite_meals,
  access_code,
  preferred_language,
  stage
) VALUES (
  'p0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Dharani Baruah',
  1948,
  'Guwahati, Assam',
  'High School Science Principal',
  '[
    {"name": "Meera Baruah", "relationship": "Daughter", "notes": "Visits every Sunday"},
    {"name": "Aarav Baruah", "relationship": "Grandson", "notes": "Plays the guitar"},
    {"name": "Subhadra Baruah", "relationship": "Wife", "notes": "Married in 1974"},
    {"name": "Pranab Baruah", "relationship": "Younger Brother", "notes": "Lives in Jorhat"}
  ]'::jsonb,
  'Bhupen Hazarika folk classics, Rabindra Sangeet, Hemant Kumar',
  'Khar, Masor Tenga (sour fish curry), Pitha during Bihu',
  '123456',
  'as',
  'early'
) ON CONFLICT (access_code) DO NOTHING;

-- Patient 2: Kamala Devi (Access PIN: 789012)
INSERT INTO public.patients (
  id,
  caregiver_id,
  name,
  birth_year,
  hometown,
  occupation,
  family_members,
  favorite_music,
  favorite_meals,
  access_code,
  preferred_language,
  stage
) VALUES (
  'p0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Kamala Devi',
  1952,
  'Shillong, Meghalaya',
  'Botanical Illustrator & Weaver',
  '[
    {"name": "Sunita Roy", "relationship": "Daughter"},
    {"name": "Rohan Roy", "relationship": "Son-in-law"},
    {"name": "Ananya Roy", "relationship": "Granddaughter"}
  ]'::jsonb,
  'Geeta Dutt, Lata Mangeshkar, Shillong choral hymns',
  'Jadoh, Bamboo shoot stew, Ginger tea with honey',
  '789012',
  'en',
  'mild_cognitive_impairment'
) ON CONFLICT (access_code) DO NOTHING;

-- 3. Patient Photos for Face-Name Recall
INSERT INTO public.patient_photos (patient_id, file_url, person_name, relationship, era_decade, context_memory, uploaded_by)
VALUES
(
  'p0000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'Meera Baruah',
  'Daughter',
  '2010s',
  'Meera graduation day celebration at Gauhati University',
  'c0000000-0000-0000-0000-000000000001'
),
(
  'p0000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'Aarav Baruah',
  'Grandson',
  '2020s',
  'Aarav holding his award after the school science fair',
  'c0000000-0000-0000-0000-000000000001'
),
(
  'p0000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  'Subhadra Baruah',
  'Wife',
  '1970s',
  'Trip to Umananda temple on the Brahmaputra River',
  'c0000000-0000-0000-0000-000000000001'
),
(
  'p0000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'Pranab Baruah',
  'Brother',
  '1980s',
  'Pranab visiting the family garden during Rongali Bihu',
  'c0000000-0000-0000-0000-000000000001'
);

-- 4. Initial Reminiscence Trivia Questions
INSERT INTO public.reminiscence_content (patient_id, language, content)
VALUES
(
  'p0000000-0000-0000-0000-000000000001',
  'en',
  '{
    "question": "Which iconic bridge over the Brahmaputra River in Guwahati was inaugurated in 1962, becoming Assam’s first rail-cum-road bridge?",
    "options": ["Saraighat Bridge", "Bogibeel Bridge", "Kolia Bhomora Setu", "Dhola-Sadiya Bridge"],
    "correct_answer_index": 0,
    "fun_fact": "The Saraighat Bridge was dedicated to the nation by Prime Minister Jawaharlal Nehru in 1963, uniting the northern and southern banks of Assam!",
    "era_year": 1962,
    "topic": "Landmarks & History"
  }'::jsonb
),
(
  'p0000000-0000-0000-0000-000000000001',
  'en',
  '{
    "question": "Which legendary singer-composer from Assam won the National Film Award for Best Music Direction in 1975 for the film Chameli Memsaab?",
    "options": ["Dr. Bhupen Hazarika", "Jayanta Hazarika", "Zubeen Garg", "Bishnu Prasad Rabha"],
    "correct_answer_index": 0,
    "fun_fact": "Dr. Bhupen Hazarika’s soulful song \'Dil Hoom Hoom Kare\' remains one of India’s most beloved emotional ballads to this day.",
    "era_year": 1975,
    "topic": "Golden Era Music"
  }'::jsonb
),
(
  'p0000000-0000-0000-0000-000000000001',
  'as',
  '{
    "question": "১৯৬২ চনত গুৱাহাটীত ব্ৰহ্মপুত্ৰৰ ওপৰত মুকলি কৰা ঐতিহাসিক দলংখনৰ নাম কি আছিল?",
    "options": ["শৰাইঘাট দলং", "বগীবিল দলং", "কলীয়াভোমোৰা সেতু", "ধলা-শদিয়া দলং"],
    "correct_answer_index": 0,
    "fun_fact": "শৰাইঘাট দলং অসমৰ প্ৰথম ৰে’ল-তথা-পথ সংযোগ সেতু আছিল, যিয়ে দুয়ো পাৰৰ জনসাধাৰণক ওচৰ চপাই আনিছিল।",
    "era_year": 1962,
    "topic": "ঐতিহাসিক কীৰ্তিস্তম্ভ"
  }'::jsonb
);

-- 5. Caregiver Clinical Insights
INSERT INTO public.caregiver_insights (patient_id, insight_text, category, score_delta_pct, insight_date)
VALUES
(
  'p0000000-0000-0000-0000-000000000001',
  'Dharani displayed notable recall stability this week. Face-Name recall accuracy reached 85% with daughter Meera, and response latency decreased by 18%. Reminiscence trivia provoked spontaneous positive verbal reflections about the Saraighat bridge inauguration.',
  'weekly_summary',
  18.5,
  CURRENT_DATE - INTERVAL '1 day'
),
(
  'p0000000-0000-0000-0000-000000000001',
  'Orientation check-in scores remained consistent across morning sessions. High engagement observed when using Assamese voice prompts.',
  'milestone',
  12.0,
  CURRENT_DATE - INTERVAL '5 days'
);
