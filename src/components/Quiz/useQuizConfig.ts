// /quiz/useQuizConfig.ts

import { create } from 'zustand';
import type { QuizConfig } from '../../types/quiz';

interface QuizState {
  config: Partial<QuizConfig>;
  updateConfig: (updates: Partial<QuizConfig>) => void;
  resetConfig: () => void;
}

export const useQuizConfig = create<QuizState>((set) => ({
  config: {},

  updateConfig: (updates) =>
    set((state) => ({
      config: {
        ...state.config,
        ...updates,
        fundraisingOptions: {
          ...state.config.fundraisingOptions,
          ...updates.fundraisingOptions,
        },
        fundraisingPrices: {
          ...state.config.fundraisingPrices,
          ...updates.fundraisingPrices,
        },
      },
    })),

  resetConfig: () => set({ config: {} }),
 

}));
