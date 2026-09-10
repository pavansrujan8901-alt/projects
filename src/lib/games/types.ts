// ==============================================================================
// NIVORA - COMMON GAME ENGINE TYPE DEFINITIONS
// Immutable IDs, robust game state, and single source of truth validation
// ==============================================================================

export type GameType =
  | 'memory_match'
  | 'face_name'
  | 'reminiscence_trivia'
  | 'orientation'
  | 'sequence'
  | 'association'
  | 'category_sort'
  | 'picture_recall';

export type GameDifficulty = 'easy' | 'medium' | 'advanced';

export interface GameOption {
  id: string; // Unique, immutable identifier (e.g., 'opt_tuesday', 'step_boil_water')
  label: string;
  icon?: string;
  imageUrl?: string;
  description?: string;
}

export interface GameQuestion {
  id: string; // Unique question identifier
  prompt: string;
  subtitle?: string;
  category?: string;
  options: GameOption[];
  correctAnswerId: string; // Stable ID matching one of options[i].id
  explanation?: string;
  hint?: string;
  imageUrl?: string;
  eraYear?: number;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  isCorrect: boolean;
  selectedAnswerId: string;
  correctAnswerId: string;
  feedbackText: string;
}

export interface GameRecordedResponse {
  questionId: string;
  selectedAnswerId: string;
  correctAnswerId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  attempts: number;
  timestamp: string;
}

export interface GameSessionState {
  sessionId: string | null;
  gameType: GameType;
  gameTitle: string;
  difficulty: GameDifficulty;
  currentQuestionIndex: number;
  questions: GameQuestion[];
  selectedAnswerId: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  attemptCount: number;
  correctCount: number;
  totalQuestions: number;
  secondsElapsed: number;
  isCompleted: boolean;
  isPaused: boolean;
  feedbackText: string | null;
  recordedResponses: GameRecordedResponse[];
}

export interface SequenceStep {
  id: string; // Stable ID e.g. 'step_1_boil'
  label: string;
  icon?: string;
  imageUrl?: string;
  orderIndex: number; // 0, 1, 2, ...
}

export interface SequenceActivity {
  id: string;
  title: string;
  instruction: string;
  contextHint: string;
  steps: SequenceStep[];
  correctOrderIds: string[]; // List of IDs in exact correct order
}

export interface CategoryGroup {
  id: string; // e.g. 'cat_food', 'cat_music'
  name: string;
  icon: string;
  color: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  categoryId: string; // matches CategoryGroup.id
}
