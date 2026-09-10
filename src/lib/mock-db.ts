// ==============================================================================
// NIVORA - DATA STORE (HYBRID SUPABASE + IN-MEMORY PERSISTENCE)
// Enables zero-configuration out-of-the-box demoing with full relational data
// ==============================================================================

import { 
  User, 
  Patient, 
  PatientPhoto, 
  GameSession, 
  GameResponse, 
  ReminiscenceQuestion, 
  CaregiverInsight, 
  PatientSessionToken,
  CuratedMemory,
  ActivityProblemReport
} from '@/types/database';

// 1. Initial Mock Users
export const initialUsers: User[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    email: 'dr.anita@nivora.health',
    full_name: 'Dr. Anita Sharma',
    role: 'caregiver',
    avatar_url: 'https://images.unsplash.com/photo-1594824813589-983b6329a1b8?w=400&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

// 2. Initial Mock Patients (Northeast Diversity: Assam, Meghalaya, Manipur)
export const initialPatients: Patient[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    caregiver_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Dharani Baruah',
    birth_year: 1948,
    hometown: 'Guwahati, Assam',
    state_region: 'Assam',
    occupation: 'High School Science Principal',
    family_members: [
      { name: 'Meera Baruah', relationship: 'Daughter (Maajoni)', notes: 'Visits every Sunday with homemade sweets' },
      { name: 'Aarav Baruah', relationship: 'Grandson (Puton)', notes: 'Plays sitar and classical acoustic guitar' },
      { name: 'Subhadra Baruah', relationship: 'Wife (Gharnii)', notes: 'Married in 1974 at Umananda ghat' },
      { name: 'Pranab Baruah', relationship: 'Younger Brother (Baiti)', notes: 'Lives in Jorhat near the tea estates' }
    ],
    favorite_music: 'Dr. Bhupen Hazarika folk classics, Rabindra Sangeet, Hemant Kumar Akashvani tracks',
    favorite_meals: 'Khar, Masor Tenga (tangy fish curry), Fresh Bihu Pitha with jaggery tea',
    favorite_festivals: 'Rongali Bihu, Magh Bihu, Durga Puja',
    cultural_traditions: 'Evening walks along the Brahmaputra ghat, tending the family garden, listening to Borgeet',
    access_code: '123456',
    preferred_language: 'as',
    stage: 'early',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    caregiver_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Kamala Devi',
    birth_year: 1952,
    hometown: 'Shillong, Meghalaya',
    state_region: 'Meghalaya',
    occupation: 'Botanical Illustrator & Handloom Artisan',
    family_members: [
      { name: 'Sunita Roy', relationship: 'Daughter', notes: 'Runs a floral nursery near Laitumkhrah' },
      { name: 'Rohan Roy', relationship: 'Son-in-law', notes: 'Architect specializing in hill heritage homes' },
      { name: 'Ananya Roy', relationship: 'Granddaughter', notes: 'Studies botany at North-Eastern Hill University' }
    ],
    favorite_music: 'Shillong Cathedral choral hymns, Geeta Dutt, Hemant Kumar radio classics',
    favorite_meals: 'Jadoh with aromatic herbs, Bamboo shoot broth, Steaming ginger honey tea',
    favorite_festivals: 'Wangala Hundred Drums Festival, Autumn Cherry Blossom, Christmas Caroling',
    cultural_traditions: 'Traditional Eri handloom weaving, peaceful strolls along Ward’s Lake, morning choir prayers',
    access_code: '789012',
    preferred_language: 'kha',
    stage: 'mild_cognitive_impairment',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    caregiver_id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Ningombam Sanatomba',
    birth_year: 1946,
    hometown: 'Imphal, Manipur',
    state_region: 'Manipur',
    occupation: 'Retired Literature Professor & Traditional Pena Instrumentalist',
    family_members: [
      { name: 'Thoibi Ningombam', relationship: 'Daughter (Iche)', notes: 'Teaches classical Manipuri dance' },
      { name: 'Sanajaoba Ningombam', relationship: 'Son (Eikhoi)', notes: 'Researcher of folklore at Manipur University' },
      { name: 'Bembem Devi', relationship: 'Granddaughter', notes: 'Loves singing traditional folk lullabies' }
    ],
    favorite_music: 'Classical Pena narrative ballads, Nat Sankirtan, All India Radio Imphal broadcast',
    favorite_meals: 'Kangsoi (wholesome herbal stew), Iromba with fresh garden herbs, Chak-hao black rice kheer',
    favorite_festivals: 'Ningol Chakouba (festival of family bonds), Yaoshang, Lai Haraoba',
    cultural_traditions: 'Storytelling under the courtyard tree, morning peaceful meditation near Kangla Fort',
    access_code: '345678',
    preferred_language: 'mni',
    stage: 'early',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

// 3. Initial Mock Photos (Indian Everyday Life & Northeast Heritage)
export const initialPhotos: PatientPhoto[] = [
  {
    id: 'ph001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    person_name: 'Meera Baruah',
    relationship: 'Daughter (Maajoni)',
    category: 'family',
    era_decade: '2010s',
    context_memory: 'Meera graduation day celebration at Gauhati University wearing her mother’s Muga silk saree',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'ph002',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    person_name: 'Aarav Baruah',
    relationship: 'Grandson (Puton)',
    category: 'family',
    era_decade: '2020s',
    context_memory: 'Aarav proudly showing his school physics award, just like his grandfather Dharani',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'ph003',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop&q=80',
    person_name: 'Subhadra Baruah',
    relationship: 'Wife (Gharnii)',
    category: 'family',
    era_decade: '1970s',
    context_memory: 'Wedding pilgrimage trip across the Brahmaputra River to Umananda temple in 1974',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'ph004',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
    person_name: 'Pranab Baruah',
    relationship: 'Brother (Baiti)',
    category: 'family',
    era_decade: '1980s',
    context_memory: 'Pranab visiting the family mango orchard with fresh tea samples from Jorhat',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'ph005',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
    person_name: 'Umananda Island & Brahmaputra',
    relationship: 'Sacred River Sanctuary',
    category: 'places',
    era_decade: '1970s',
    context_memory: 'Taking the wooden ferry across the vast Brahmaputra River at golden sunset for peaceful breeze',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'ph006',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    person_name: 'Masor Tenga & Khar Curry',
    relationship: 'Sunday Family Tradition',
    category: 'food',
    era_decade: '1980s',
    context_memory: 'Cooking fresh river fish with homegrown elephant apple (ou tenga), lemon, and coriander',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'ph007',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    person_name: 'Sitar & Dotara Folk Records',
    relationship: 'Musical Passion',
    category: 'music',
    era_decade: '1965',
    context_memory: 'Listening to classic vinyl records on the gramophone with warm Assam tea on rainy afternoons',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'ph008',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&auto=format&fit=crop&q=80',
    person_name: 'Cotton Collegiate High School',
    relationship: '35 Years as Headmaster',
    category: 'work',
    era_decade: '1985',
    context_memory: 'Presiding over morning school assembly and teaching botany and physics to generations of students',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'ph009',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    person_name: 'Rongali Bihu Spring Celebration',
    relationship: 'Most Beloved Festival',
    category: 'festivals',
    era_decade: '1978',
    context_memory: 'Presenting hand-woven red and white Gamosas to the elders under blooming kopou orchid blossoms',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'ph010',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    file_url: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=500&auto=format&fit=crop&q=80',
    person_name: 'Upper Assam Green Tea Estate',
    relationship: 'Hometown Roots',
    category: 'places',
    era_decade: '1960s',
    context_memory: 'Early morning misty walks along the emerald tea bush corridors with aroma of fresh leaf flushes',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'ph011',
    patient_id: 'p0000000-0000-0000-0000-000000000002',
    file_url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&auto=format&fit=crop&q=80',
    person_name: 'Traditional Wooden Loom',
    relationship: 'Handloom Artistry',
    category: 'traditions',
    era_decade: '1975',
    context_memory: 'Kamala weaving warm wool and wild silk shawls on the wooden porch in Shillong',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ph012',
    patient_id: 'p0000000-0000-0000-0000-000000000003',
    file_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
    person_name: 'Loktak Lake & Floating Phumdis',
    relationship: 'Wondrous Childhood Place',
    category: 'places',
    era_decade: '1962',
    context_memory: 'Professor Sanatomba riding the canoe with his father past the circular floating phumdi islands in Moirang',
    uploaded_by: 'c0000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// 4. Initial Reminiscence Trivia (Authentic Indian & Northeast Nostalgia with Stable Answers)
export const initialTrivia: ReminiscenceQuestion[] = [
  {
    id: 'triv001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    language: 'en',
    question: 'Which iconic bridge over the Brahmaputra River in Guwahati was opened in 1962, becoming Assam’s first rail-cum-road bridge?',
    options: ['Saraighat Bridge', 'Bogibeel Bridge', 'Kolia Bhomora Setu', 'Dhola-Sadiya Bridge'],
    correct_answer_index: 0,
    fun_fact: 'The Saraighat Bridge was dedicated to the nation by Prime Minister Jawaharlal Nehru in 1963, uniting the northern and southern banks of Assam!',
    era_year: 1962,
    topic: 'Landmarks & Heritage'
  },
  {
    id: 'triv002',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    language: 'en',
    question: 'Which legendary maestro won the National Film Award for Best Music Direction in 1975 for the classic film Chameli Memsaab?',
    options: ['Jayanta Hazarika', 'Dr. Bhupen Hazarika', 'Hemant Kumar', 'Bishnu Prasad Rabha'],
    correct_answer_index: 1,
    fun_fact: 'Dr. Bhupen Hazarika’s soulful melodies resonated across all of India, connecting river folk ballads to timeless cinema classics.',
    era_year: 1975,
    topic: 'Golden Era Music'
  },
  {
    id: 'triv003',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    language: 'en',
    question: 'In traditional Indian & Assamese home cooking, which refreshing tangy fish curry is celebrated on warm summer afternoons?',
    options: ['Khar', 'Duck with Ash Gourd', 'Masor Tenga', 'Aloo Pitika'],
    correct_answer_index: 2,
    fun_fact: 'Masor Tenga is cooked with fresh elephant apple (ou tenga) or garden lemons and is considered quintessential comfort food!',
    era_year: 1970,
    topic: 'Culinary Memories'
  },
  {
    id: 'triv004',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    language: 'en',
    question: 'During which joyful spring festival in Assam do families weave red-and-white Gamosas to present to elders as a symbol of deep respect?',
    options: ['Bhogali Bihu', 'Kongali Bihu', 'Durga Puja', 'Rongali Bihu'],
    correct_answer_index: 3,
    fun_fact: 'Bihuwan (giving a hand-woven Gamosa) represents an unbroken bond of love, respect, and family blessings.',
    era_year: 1968,
    topic: 'Festivals & Culture'
  },
  {
    id: 'triv005',
    patient_id: 'p0000000-0000-0000-0000-000000000002',
    language: 'en',
    question: 'Which famous lake in Shillong, built in 1894 with its charming wooden bridge, is loved for gentle morning walks under pine trees?',
    options: ['Umiam Lake', 'Ward’s Lake (Nan Polok)', 'Loktak Lake', 'Elephant Falls'],
    correct_answer_index: 1,
    fun_fact: 'Ward’s Lake is enveloped by blooming cherry blossoms and century-old weeping willows in the heart of Shillong.',
    era_year: 1972,
    topic: 'Meghalaya Memories'
  },
  {
    id: 'triv006',
    patient_id: 'p0000000-0000-0000-0000-000000000003',
    language: 'en',
    question: 'Which special festival of Manipur celebrates the cherished bond of married daughters returning home to feast with their parents and brothers?',
    options: ['Yaoshang', 'Lai Haraoba', 'Kang Rath Yatra', 'Ningol Chakouba'],
    correct_answer_index: 3,
    fun_fact: 'During Ningol Chakouba, daughters (Ningols) are welcomed home with love, traditional gifts, and a heartwarming feast prepared by their brothers!',
    era_year: 1966,
    topic: 'Manipur Heritage'
  }
];

// 5. Initial Caregiver Insights
export const initialInsights: CaregiverInsight[] = [
  {
    id: 'ins001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    insight_text: 'Dharani demonstrated strong visual recognition this week. Face-Name recall with daughter Meera reached 85% accuracy, and average reaction time decreased by 1.2 seconds. Reminiscence trivia provoked spontaneous positive verbal reflections about the Saraighat bridge.',
    category: 'weekly_summary',
    score_delta_pct: 18.5,
    insight_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ins002',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    insight_text: 'Orientation check-in scores remained solid at 100% in morning sessions. The patient responds exceptionally well to voice prompts and large tactile buttons.',
    category: 'milestone',
    score_delta_pct: 12.0,
    insight_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

// 6. Initial Game Sessions (7-day trend history for rich charts)
export const initialSessions: GameSession[] = [
  {
    id: 'sess01',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'memory_match',
    start_time: new Date(Date.now() - 6 * 86400000).toISOString(),
    end_time: new Date(Date.now() - 6 * 86400000 + 180000).toISOString(),
    score: 65,
    max_score: 100,
    completed: true,
    difficulty_level: 1
  },
  {
    id: 'sess02',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'face_name',
    start_time: new Date(Date.now() - 5 * 86400000).toISOString(),
    end_time: new Date(Date.now() - 5 * 86400000 + 120000).toISOString(),
    score: 70,
    max_score: 100,
    completed: true,
    difficulty_level: 1
  },
  {
    id: 'sess03',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'reminiscence_trivia',
    start_time: new Date(Date.now() - 4 * 86400000).toISOString(),
    end_time: new Date(Date.now() - 4 * 86400000 + 150000).toISOString(),
    score: 75,
    max_score: 100,
    completed: true,
    difficulty_level: 1
  },
  {
    id: 'sess04',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'orientation',
    start_time: new Date(Date.now() - 3 * 86400000).toISOString(),
    end_time: new Date(Date.now() - 3 * 86400000 + 90000).toISOString(),
    score: 85,
    max_score: 100,
    completed: true,
    difficulty_level: 1
  },
  {
    id: 'sess05',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'memory_match',
    start_time: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_time: new Date(Date.now() - 2 * 86400000 + 160000).toISOString(),
    score: 80,
    max_score: 100,
    completed: true,
    difficulty_level: 2
  },
  {
    id: 'sess06',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'face_name',
    start_time: new Date(Date.now() - 1 * 86400000).toISOString(),
    end_time: new Date(Date.now() - 1 * 86400000 + 110000).toISOString(),
    score: 88,
    max_score: 100,
    completed: true,
    difficulty_level: 1
  },
  {
    id: 'sess07',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    game_type: 'orientation',
    start_time: new Date(Date.now() - 12 * 3600000).toISOString(),
    end_time: new Date(Date.now() - 12 * 3600000 + 75000).toISOString(),
    score: 100,
    max_score: 100,
    completed: true,
    difficulty_level: 1
  }
];

// Global in-memory data store for the running server instance

// 4.5. Initial Curated Memories with Strict Provenance & Status
export const initialCuratedMemories: CuratedMemory[] = [
  // Dharani Baruah (Assam)
  {
    id: 'mem-001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    title: 'High School Science Principal in Guwahati',
    detail: 'Taught physics and chemistry for 32 years at Cotton Collegiate High School. Loved demonstrating prism experiments to students.',
    category: 'occupation',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: '1970s - 1990s',
    tags: ['career', 'teaching', 'guwahati'],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'mem-002',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    title: 'Sunday Masor Tenga with Fresh Garden Lemon',
    detail: 'Loved preparing fresh tangy Rohu fish curry with elephant apple and kaji nemu (Assam lemon) for Sunday family lunches.',
    category: 'food',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: '1980s',
    tags: ['cooking', 'family lunch', 'masor tenga'],
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 'mem-003',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    title: 'Dr. Bhupen Hazarika Classics on Akashvani Radio',
    detail: 'Listened to Dr. Bhupen Hazarika’s "Bistirno Parore" on the Murphy transistor radio every Sunday morning on the veranda.',
    category: 'music',
    source: 'caregiver_approved_ai',
    status: 'active',
    is_important: false,
    era_decade: '1970s',
    tags: ['music', 'radio', 'bhupen hazarika'],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'mem-004',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    title: 'Rongali Bihu Hand-Woven Gamosa Tradition',
    detail: 'Gave hand-woven red and white Bihuwan Gamosas to elders and received heartfelt blessings under blooming Kopou orchids.',
    category: 'festivals',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: '1960s - Present',
    tags: ['bihu', 'tradition', 'gamosa'],
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'mem-005',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    title: 'Old Tea Estate Bungalow in Jorhat',
    detail: 'Childhood home near the lush green tea garden bushed roads in Jorhat. Memories of misty rain on tin roofs.',
    category: 'places',
    source: 'imported',
    status: 'archived',
    is_important: false,
    era_decade: '1950s',
    tags: ['childhood', 'jorhat', 'tea'],
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },

  // Kamala Devi (Meghalaya)
  {
    id: 'mem-006',
    patient_id: 'p0000000-0000-0000-0000-000000000002',
    title: 'Gentle Morning Walks along Ward’s Lake (Nan Polok)',
    detail: 'Enjoyed peaceful strolls across the wooden ornamental bridge under pine trees with fresh morning mist.',
    category: 'places',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: '1980s',
    tags: ['shillong', 'lake', 'walking'],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'mem-007',
    patient_id: 'p0000000-0000-0000-0000-000000000002',
    title: 'Eri Silk Handloom Shawl Weaving',
    detail: 'Spent afternoons weaving warm wild silk shawls on the wooden porch handloom for daughters and granddaughters.',
    category: 'hobbies',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: '1970s - 2000s',
    tags: ['handloom', 'eri silk', 'weaving'],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },

  // Ningombam Sanatomba (Manipur)
  {
    id: 'mem-008',
    patient_id: 'p0000000-0000-0000-0000-000000000003',
    title: 'Pena Instrument Ballads at Sunset',
    detail: 'Mastered the single-string bowed lute (Pena) playing classical Meitei narrative poetry and folk lullabies.',
    category: 'music',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: '1960s - Present',
    tags: ['pena', 'traditional music', 'ballads'],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'mem-009',
    patient_id: 'p0000000-0000-0000-0000-000000000003',
    title: 'Ningol Chakouba Feast with Daughter Thoibi',
    detail: 'Honored the sacred festival celebrating family bonds, welcoming married daughters and sisters back home with grand fish feast.',
    category: 'festivals',
    source: 'caregiver_entered',
    status: 'active',
    is_important: true,
    era_decade: 'Annual Tradition',
    tags: ['ningol chakouba', 'family', 'manipur'],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

class NivoraDataStore {
  curatedMemories: CuratedMemory[] = [...initialCuratedMemories];
  reportedActivities: ActivityProblemReport[] = [];
  users: User[] = [...initialUsers];
  patients: Patient[] = [...initialPatients];
  photos: PatientPhoto[] = [...initialPhotos];
  sessions: GameSession[] = [...initialSessions];
  responses: GameResponse[] = [];
  trivia: ReminiscenceQuestion[] = [...initialTrivia];
  insights: CaregiverInsight[] = [...initialInsights];
  patientSessions: PatientSessionToken[] = [];

  // Patient methods
  getPatientsByCaregiver(caregiverId: string): Patient[] {
    return this.patients.filter(p => p.caregiver_id === caregiverId);
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  getPatientByAccessCode(code: string): Patient | undefined {
    return this.patients.find(p => p.access_code === code.trim());
  }

  createPatient(data: Omit<Patient, 'id' | 'created_at'>): Patient {
    const newPatient: Patient = {
      ...data,
      id: `p-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.patients.unshift(newPatient);
    return newPatient;
  }

  // Photo methods
  getPhotosByPatient(patientId: string): PatientPhoto[] {
    return this.photos.filter(p => p.patient_id === patientId);
  }

  addPhoto(photo: Omit<PatientPhoto, 'id' | 'created_at'>): PatientPhoto {
    const newPhoto: PatientPhoto = {
      ...photo,
      id: `ph-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString()
    };
    this.photos.unshift(newPhoto);
    return newPhoto;
  }

  // Game session methods
  startSession(patientId: string, gameType: GameSession['game_type'], difficulty = 1): GameSession {
    const session: GameSession = {
      id: `sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      patient_id: patientId,
      game_type: gameType,
      start_time: new Date().toISOString(),
      score: 0,
      max_score: 100,
      completed: false,
      difficulty_level: difficulty
    };
    this.sessions.push(session);
    return session;
  }

  completeSession(sessionId: string, score: number, maxScore: number): GameSession | undefined {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.score = score;
      session.max_score = maxScore;
      session.completed = true;
      session.end_time = new Date().toISOString();
    }
    return session;
  }

  getSessionsByPatient(patientId: string): GameSession[] {
    return this.sessions.filter(s => s.patient_id === patientId);
  }

  logResponse(response: Omit<GameResponse, 'id' | 'created_at'>): GameResponse {
    const newResp: GameResponse = {
      ...response,
      id: `resp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString()
    };
    this.responses.push(newResp);
    return newResp;
  }

  // Trivia methods
  getTriviaForPatient(patientId: string, language = 'en'): ReminiscenceQuestion[] {
    return this.trivia.filter(t => t.patient_id === patientId && (t.language === language || language === 'en'));
  }

  // Insight methods
  getInsightsByPatient(patientId: string): CaregiverInsight[] {
    return this.insights.filter(i => i.patient_id === patientId);
  }

  addInsight(insight: Omit<CaregiverInsight, 'id' | 'created_at'>): CaregiverInsight {
    const newInsight: CaregiverInsight = {
      ...insight,
      id: `ins-${Date.now().toString(36)}`,
      created_at: new Date().toISOString()
    };
    this.insights.unshift(newInsight);
    return newInsight;
  }

  // Patient session token management
  createPatientSessionToken(patientId: string, accessCode: string): PatientSessionToken {
    const tokenRecord: PatientSessionToken = {
      id: `tok-${Date.now().toString(36)}`,
      patient_id: patientId,
      access_code: accessCode,
      token: `mb_pat_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    this.patientSessions.push(tokenRecord);
    return tokenRecord;
  }

  validatePatientToken(token: string): PatientSessionToken | undefined {
    return this.patientSessions.find(s => s.token === token && new Date(s.expires_at) > new Date());
  }

  // Curated Memories Methods with Strict Provenance & Status
  getCuratedMemories(patientId: string, includeArchived = false): CuratedMemory[] {
    return this.curatedMemories.filter(m => 
      m.patient_id === patientId && 
      (includeArchived ? m.status !== 'deleted' : m.status === 'active')
    );
  }

  getActiveCuratedMemories(patientId: string): CuratedMemory[] {
    return this.curatedMemories.filter(m => m.patient_id === patientId && m.status === 'active');
  }

  addCuratedMemory(memory: Omit<CuratedMemory, 'id' | 'created_at' | 'updated_at'>): CuratedMemory {
    const newMem: CuratedMemory = {
      ...memory,
      id: `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      status: memory.status || 'active',
      is_important: memory.is_important ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.curatedMemories.unshift(newMem);
    return newMem;
  }

  updateCuratedMemory(id: string, updates: Partial<CuratedMemory>): CuratedMemory | undefined {
    const mem = this.curatedMemories.find(m => m.id === id);
    if (!mem) return undefined;
    Object.assign(mem, updates, { updated_at: new Date().toISOString() });
    return mem;
  }

  archiveCuratedMemory(id: string): boolean {
    const mem = this.curatedMemories.find(m => m.id === id);
    if (!mem) return false;
    mem.status = 'archived';
    mem.updated_at = new Date().toISOString();
    return true;
  }

  unarchiveCuratedMemory(id: string): boolean {
    const mem = this.curatedMemories.find(m => m.id === id);
    if (!mem) return false;
    mem.status = 'active';
    mem.updated_at = new Date().toISOString();
    return true;
  }

  deleteCuratedMemory(id: string): boolean {
    const mem = this.curatedMemories.find(m => m.id === id);
    if (!mem) return false;
    mem.status = 'deleted';
    mem.updated_at = new Date().toISOString();
    return true;
  }

  toggleImportantMemory(id: string): boolean {
    const mem = this.curatedMemories.find(m => m.id === id);
    if (!mem) return false;
    mem.is_important = !mem.is_important;
    mem.updated_at = new Date().toISOString();
    return true;
  }

  // Activity Problem Reporting
  reportActivity(report: Omit<ActivityProblemReport, 'id' | 'created_at' | 'status'>): ActivityProblemReport {
    const newReport: ActivityProblemReport = {
      ...report,
      id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.reportedActivities.unshift(newReport);
    // Remove reported activity from trivia if it was added
    this.trivia = this.trivia.filter(t => t.id !== report.activity_id);
    return newReport;
  }

}

// Singleton global reference
const globalForDb = globalThis as unknown as { nivoraDb?: NivoraDataStore };
export const db = globalForDb.nivoraDb || new NivoraDataStore();
if (process.env.NODE_ENV !== 'production') globalForDb.nivoraDb = db;
