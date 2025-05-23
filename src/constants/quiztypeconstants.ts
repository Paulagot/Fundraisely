//src/constants/quiztypeconstants.ts
import type { QuizConfig, QuizGameType } from '../types/quiz';

export const quizGameTypes: QuizGameType[] = [
  {
    id: 'classic_trivia',
    name: 'Classic Team Trivia',
    description: 'Teams of 4–8 players compete to answer general knowledge questions across themed rounds.',
    defaultConfig: {
      teamBased: true,
      roundCount: 5,
      timePerQuestion: 30,
      useMedia: true
    },
    fundraisingOptions: {
      buyHint: {
        maxPerPlayer: 3,
        usagePhase: 'perRound'
      }
    }
  },
  {
    id: 'speed_round',
    name: 'Speed Round Showdown',
    description: 'Fast-paced format where players race to answer as many questions as possible in a short time.',
    defaultConfig: {
      teamBased: false,
      roundCount: 1,
      timePerQuestion: 10,
      useMedia: false,
      totalTimeSeconds: 120 // ✅ total time per game (e.g. 2 minutes)
    },
    fundraisingOptions: {
      extraTime: {
        maxPerPlayer: 1,
        usagePhase: 'any'
      }
    }
  },
  {
    id: 'media_puzzle',
    name: 'Picture and Media Puzzle',
    description: 'Visual-heavy quiz using images, audio, or video clips.',
    defaultConfig: {
      teamBased: true,
      roundCount: 4,
      timePerQuestion: 45,
      useMedia: true
    },
    fundraisingOptions: {
      mediaReveal: {
        maxPerPlayer: 3,
        usagePhase: 'perRound'
      }
    }
  },
  {
    id: 'survivor_quiz',
    name: 'Survivor Quiz',
    description: 'Knockout-style quiz where players or teams are eliminated for wrong answers.',
    defaultConfig: {
      teamBased: false,
      roundCount: 0,
      timePerQuestion: 20,
      useMedia: false
    },
    fundraisingOptions: {
      lifeline: {
        maxPerPlayer: 1,
        usagePhase: 'any'
      },
      secondChance: {
        maxPerPlayer: 1,
        usagePhase: 'any'
      }
    }
  }
];


export const gameTypeDefaults: Record<string, Partial<QuizConfig>> = Object.fromEntries(
  quizGameTypes.map((g) => [g.id, g.defaultConfig])
);
