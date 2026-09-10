// ==============================================================================
// NIVORA - AI PROMPT TEMPLATES & GENERATOR ENGINE
// Claude 3.5 / OpenAI prompt structures + resilient local fallback engine
// ==============================================================================

import { ReminiscenceQuestion } from '@/types/database';

export const REMINISCENCE_PROMPT_TEMPLATE = `
You are an empathetic geriatric AI psychologist helping early-to-moderate dementia patients recall pleasant memories.
Generate a comforting multiple-choice trivia question about life in [HOMETOWN] around the year [ERA_YEAR].
Focus on nostalgic music, golden cinema, heartwarming cultural moments, local landmarks, or beloved regional food.
Avoid distressing historical events or tragic news.

Return strictly a JSON object:
{
  "question": "Question text in [LANGUAGE]",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct_answer_index": 0,
  "fun_fact": "A short, warm 1-2 sentence nostalgic detail celebrating this memory in [LANGUAGE]",
  "era_year": [ERA_YEAR],
  "topic": "Music / Cinema / Food / Landmark"
}
`;

export const CAREGIVER_INSIGHT_PROMPT_TEMPLATE = `
Given the following game performance data for dementia patient [NAME] over the last 7 days:
[PERFORMANCE_SUMMARY]

Write a concise (2-3 sentences) encouraging clinical insight for the family caregiver.
Highlight positive trends, areas of visual/verbal memory strength, or recommendations for shared reminiscence at home.
Tone: Warm, clinically observant, gentle, and respectful.
`;

export const ADAPTIVE_DIFFICULTY_PROMPT_TEMPLATE = `
Based on this game session data:
- Game: [GAME_TYPE]
- Accuracy: [ACCURACY_PCT]%
- Average Response Time: [AVG_TIME_MS]ms
- Current Level: [CURRENT_LEVEL]

Suggest an adaptive difficulty level (1-3) for the next session.
Return JSON: { "new_difficulty": number, "reason": string }
`;

// Resilient Fallback Generator for immediate demo without API keys
export function generateLocalTrivia(
  patientId: string,
  hometown: string,
  birthYear: number,
  language = 'en'
): ReminiscenceQuestion {
  const eraYear = birthYear + 20;

  const questionsPool = [
    {
      question: `In the 1960s and 70s, which golden voice brought the soothing melodies of folk and classical songs to life across ${hometown}?`,
      options: ['Dr. Bhupen Hazarika', 'Manna Dey', 'Kishore Kumar', 'Mohammad Rafi'],
      correct_answer_index: 0,
      fun_fact: `Music from the ${eraYear}s holds deep neurological resonance for memory recall and brings comforting calm to the mind.`,
      topic: 'Golden Era Music'
    },
    {
      question: `Which aromatic local preparation made with fresh herbs and lemon was traditionally shared during family Sunday gatherings in ${hometown}?`,
      options: ['Fragrant Lemon Herb Curry', 'Sweet Coconut Pitha', 'Spiced Lentil Broth', 'Steamed Rice Cakes'],
      correct_answer_index: 0,
      fun_fact: 'Smell and taste memories from our 20s are stored in the olfactory bulb, which often remains remarkably intact in gentle memory care.',
      topic: 'Culinary Traditions'
    },
    {
      question: `Which community gathering or seasonal festival in ${hometown} brought families together to exchange hand-woven gifts and greetings?`,
      options: ['Spring Harvest Festival', 'Autumn Light Fair', 'Winter Solstice Gathering', 'New Moon Celebration'],
      correct_answer_index: 0,
      fun_fact: 'Remembering hand-made gifts and festive melodies activates bilateral temporal lobe pathways associated with joyful autobiographical memories.',
      topic: 'Festivals & Family'
    }
  ];

  const picked = questionsPool[Math.floor(Math.random() * questionsPool.length)];

  return {
    id: `triv-gen-${Date.now()}`,
    patient_id: patientId,
    language,
    question: picked.question,
    options: picked.options,
    correct_answer_index: picked.correct_answer_index,
    fun_fact: picked.fun_fact,
    era_year: eraYear,
    topic: picked.topic
  };
}

export function generateLocalCaregiverInsight(
  patientName: string,
  recentAccuracy: number,
  sessionsCount: number
): string {
  if (recentAccuracy >= 80) {
    return `${patientName} demonstrated exceptional pattern recognition and sustained attention across ${sessionsCount} cognitive sessions. Visual recall of close family members remains vibrant. Engaging in conversation about favorite 1960s-1970s memories continues to uplift mood and conversational fluency.`;
  } else if (recentAccuracy >= 60) {
    return `${patientName} completed ${sessionsCount} memory activities with steady, calm engagement. Response pacing is natural and unhurried. Pairing audio narration with the high-contrast mode has supported visual focus and confidence.`;
  } else {
    return `${patientName} engaged warmly with the morning orientation check-in. Gentle encouragement and smaller 2x2 memory cards provided a supportive, stress-free environment.`;
  }
}
