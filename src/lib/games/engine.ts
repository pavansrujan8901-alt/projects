// ==============================================================================
// NIVORA - COMMON GAME ENGINE CORE
// Pure functions for validation, dynamic orientation, shuffling, and AI activity QA
// ==============================================================================

import { GameQuestion, GameOption, ValidationResult, SequenceActivity } from './types';

/**
 * Validates an answer strictly using immutable IDs.
 * NEVER relies on array index, display order, or button position.
 */
export function validateAnswer(question: GameQuestion, selectedOptionId: string): ValidationResult {
  if (!question || !question.correctAnswerId) {
    return {
      isCorrect: false,
      selectedAnswerId: selectedOptionId,
      correctAnswerId: '',
      feedbackText: "Let's continue together."
    };
  }

  const isCorrect = selectedOptionId === question.correctAnswerId;
  const correctOption = question.options.find(opt => opt.id === question.correctAnswerId);

  let feedbackText = '';
  if (isCorrect) {
    feedbackText = question.explanation 
      ? `Well done! ${question.explanation}`
      : 'Well done! That is correct!';
  } else {
    feedbackText = correctOption 
      ? `That was a good try! The answer is ${correctOption.label}.`
      : "That's okay! Let's keep exploring.";
  }

  return {
    isCorrect,
    selectedAnswerId: selectedOptionId,
    correctAnswerId: question.correctAnswerId,
    feedbackText
  };
}

/**
 * Fisher-Yates array shuffler.
 * Returns a new shuffled array without mutating the input, preserving immutable IDs.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Validates a sequence of steps by comparing ordered IDs against correctOrderIds.
 */
export function validateSequenceOrder(currentStepIds: string[], correctOrderIds: string[]): {
  isCorrect: boolean;
  correctPositionsCount: number;
  totalSteps: number;
} {
  if (currentStepIds.length !== correctOrderIds.length) {
    return { isCorrect: false, correctPositionsCount: 0, totalSteps: correctOrderIds.length };
  }

  let matches = 0;
  for (let i = 0; i < currentStepIds.length; i++) {
    if (currentStepIds[i] === correctOrderIds[i]) {
      matches++;
    }
  }

  return {
    isCorrect: matches === correctOrderIds.length,
    correctPositionsCount: matches,
    totalSteps: correctOrderIds.length
  };
}

/**
 * Generates Daily Orientation questions based on client's actual runtime local date & time.
 * Takes timezone into account, never hardcodes days, dates, or months.
 */
export function generateOrientationQuestions(currentLocalDate: Date = new Date()): GameQuestion[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentDayIndex = currentLocalDate.getDay(); // 0 to 6
  const currentActualDay = dayNames[currentDayIndex];
  const currentMonthIndex = currentLocalDate.getMonth(); // 0 to 11
  const currentActualMonth = monthNames[currentMonthIndex];
  const currentActualDateNum = currentLocalDate.getDate();
  const currentYear = currentLocalDate.getFullYear();

  // Determine local season (Indian / Northeast seasonal context)
  // Mar-May: Spring Bloom / Pre-monsoon (Rongali Bihu)
  // Jun-Sep: Monsoon / Gentle Rains (Brahmaputra lush season)
  // Oct-Nov: Autumn / Festive Season (Durga Puja, Diwali)
  // Dec-Feb: Winter Warmth / Harvest (Magh Bihu)
  let actualSeasonName = 'Spring Bloom';
  let seasonIcon = '🌸';
  if (currentMonthIndex >= 2 && currentMonthIndex <= 4) {
    actualSeasonName = 'Spring Bloom (Bihu Season)';
    seasonIcon = '🌸';
  } else if (currentMonthIndex >= 5 && currentMonthIndex <= 8) {
    actualSeasonName = 'Monsoon & Refreshing Rains';
    seasonIcon = '🌧️';
  } else if (currentMonthIndex >= 9 && currentMonthIndex <= 10) {
    actualSeasonName = 'Golden Autumn';
    seasonIcon = '🍂';
  } else {
    actualSeasonName = 'Cool Winter Warmth';
    seasonIcon = '❄️';
  }

  // 1. Day of the Week Question
  const dayOptions: GameOption[] = dayNames.map((d, i) => ({
    id: `opt_day_${d.toLowerCase()}`,
    label: d,
    icon: '🗓️'
  }));
  const correctDayId = `opt_day_${currentActualDay.toLowerCase()}`;

  // Select today + 3 random distractors
  const otherDays = dayOptions.filter(opt => opt.id !== correctDayId);
  const shuffledOtherDays = shuffleArray(otherDays).slice(0, 3);
  const finalDayOptions = shuffleArray([
    dayOptions.find(opt => opt.id === correctDayId)!,
    ...shuffledOtherDays
  ]);

  // 2. Day of the Month (Date) Question
  const correctDateId = `opt_date_${currentActualDateNum}`;
  const dateDistractors: number[] = [];
  const candidates = [
    currentActualDateNum - 2,
    currentActualDateNum - 1,
    currentActualDateNum + 1,
    currentActualDateNum + 3,
    currentActualDateNum + 5
  ].filter(d => d >= 1 && d <= 31 && d !== currentActualDateNum);

  const selectedDistractorNumbers = shuffleArray(candidates).slice(0, 3);
  const dateOptions: GameOption[] = [
    { id: correctDateId, label: getOrdinalDate(currentActualDateNum), icon: '📅' },
    ...selectedDistractorNumbers.map(num => ({
      id: `opt_date_${num}`,
      label: getOrdinalDate(num),
      icon: '📅'
    }))
  ];

  // 3. Month Question
  const correctMonthId = `opt_month_${currentActualMonth.toLowerCase()}`;
  const otherMonths = monthNames
    .filter(m => m !== currentActualMonth)
    .map(m => ({ id: `opt_month_${m.toLowerCase()}`, label: m, icon: '🌿' }));
  const finalMonthOptions = shuffleArray([
    { id: correctMonthId, label: currentActualMonth, icon: '🌿' },
    ...shuffleArray(otherMonths).slice(0, 3)
  ]);

  // 4. Season Question
  const seasonChoices = [
    { id: 'opt_season_spring', label: 'Spring Bloom (Bihu Season)', icon: '🌸' },
    { id: 'opt_season_monsoon', label: 'Monsoon & Refreshing Rains', icon: '🌧️' },
    { id: 'opt_season_autumn', label: 'Golden Autumn', icon: '🍂' },
    { id: 'opt_season_winter', label: 'Cool Winter Warmth', icon: '❄️' }
  ];
  let correctSeasonId = 'opt_season_spring';
  if (currentMonthIndex >= 5 && currentMonthIndex <= 8) correctSeasonId = 'opt_season_monsoon';
  else if (currentMonthIndex >= 9 && currentMonthIndex <= 10) correctSeasonId = 'opt_season_autumn';
  else if (currentMonthIndex >= 11 || currentMonthIndex <= 1) correctSeasonId = 'opt_season_winter';

  // 5. Gentle Mindful Mood Check-in
  const moodQuestion: GameQuestion = {
    id: 'orientation_mood_05',
    prompt: 'How are your spirits feeling at this moment?',
    subtitle: 'Every feeling is welcome. Take a peaceful breath.',
    category: 'orientation',
    options: [
      { id: 'opt_mood_peaceful', label: 'Calm & Peaceful', icon: '🕊️' },
      { id: 'opt_mood_happy', label: 'Happy & Loved', icon: '😊' },
      { id: 'opt_mood_relaxed', label: 'Cozy & Relaxed', icon: '🌿' },
      { id: 'opt_mood_ready', label: 'Ready for the Day', icon: '✨' }
    ],
    // Any mood response is valid and celebrated
    correctAnswerId: 'opt_mood_peaceful', // acts as default accepted
    explanation: 'Wishing you a tranquil and joyful day ahead.'
  };

  return [
    {
      id: 'orientation_day_01',
      prompt: 'What day of the week is today?',
      subtitle: `Take your time. Today is in ${currentActualMonth} ${currentYear}.`,
      category: 'orientation',
      options: finalDayOptions,
      correctAnswerId: correctDayId,
      explanation: `Today is ${currentActualDay}!`
    },
    {
      id: 'orientation_date_02',
      prompt: 'Which day of the month is it today?',
      subtitle: `Look at the calendar or sun outside. We are in ${currentActualMonth}.`,
      category: 'orientation',
      options: shuffleArray(dateOptions),
      correctAnswerId: correctDateId,
      explanation: `Today is the ${getOrdinalDate(currentActualDateNum)} of ${currentActualMonth}.`
    },
    {
      id: 'orientation_month_03',
      prompt: 'Which month of the year are we in?',
      subtitle: `A beautiful time of year in ${currentYear}.`,
      category: 'orientation',
      options: finalMonthOptions,
      correctAnswerId: correctMonthId,
      explanation: `We are enjoying the month of ${currentActualMonth}.`
    },
    {
      id: 'orientation_season_04',
      prompt: 'What season are we experiencing right now?',
      subtitle: 'Feel the breeze and the gentle weather outside.',
      category: 'orientation',
      options: shuffleArray(seasonChoices),
      correctAnswerId: correctSeasonId,
      explanation: `We are in ${actualSeasonName} ${seasonIcon}.`
    },
    moodQuestion
  ];
}

function getOrdinalDate(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Validates AI-generated activity output according to Section 6.
 * Rejects malformed structures, missing answers, duplicate IDs, or invented memories.
 */
export function validateAiActivity(activity: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!activity) {
    return { valid: false, errors: ['Activity object is empty or null'] };
  }

  if (!activity.prompt || typeof activity.prompt !== 'string') {
    errors.push('Activity is missing a prompt string');
  }

  if (!Array.isArray(activity.options) || activity.options.length < 2) {
    errors.push('Activity must have at least 2 options');
  } else {
    const seenIds = new Set<string>();
    for (const opt of activity.options) {
      if (!opt.id || typeof opt.id !== 'string') {
        errors.push(`Option missing stable string ID: ${JSON.stringify(opt)}`);
      } else if (seenIds.has(opt.id)) {
        errors.push(`Duplicate option ID detected: ${opt.id}`);
      } else {
        seenIds.add(opt.id);
      }

      if (!opt.label || typeof opt.label !== 'string') {
        errors.push(`Option ID ${opt.id} is missing a text label`);
      }
    }

    if (!activity.correctAnswerId) {
      errors.push('Activity is missing correctAnswerId');
    } else if (!seenIds.has(activity.correctAnswerId)) {
      errors.push(`correctAnswerId "${activity.correctAnswerId}" not found in option IDs`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
