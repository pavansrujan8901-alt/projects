import { create } from 'zustand';
import { GameType } from '@/types/database';

export interface GameSummaryResult {
  gameType: GameType;
  gameTitle: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSeconds: number;
  stars: number;
  encouragement: string;
}

interface GameState {
  currentSessionId: string | null;
  activeGameType: GameType | null;
  lastResult: GameSummaryResult | null;
  difficultyLevels: Record<GameType, number>;
  setCurrentSessionId: (id: string | null) => void;
  setActiveGameType: (type: GameType | null) => void;
  setLastResult: (result: GameSummaryResult) => void;
  setDifficulty: (gameType: GameType, level: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentSessionId: null,
  activeGameType: null,
  lastResult: null,
  difficultyLevels: {
    memory_match: 1,
    face_name: 1,
    reminiscence_trivia: 1,
    orientation: 1,
    sequence: 1,
    word_assoc: 1,
    association: 1,
    category_sort: 1,
    picture_recall: 1
  },

  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setActiveGameType: (type) => set({ activeGameType: type }),
  setLastResult: (result) => set({ lastResult: result }),
  setDifficulty: (gameType, level) =>
    set((state) => ({
      difficultyLevels: {
        ...state.difficultyLevels,
        [gameType]: level
      }
    }))
}));
