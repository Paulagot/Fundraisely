//src/constants/quiztypeconstants.ts
import type { QuizConfig, QuizGameType } from '../types/quiz';

export const quizGameTypes: QuizGameType[] = [
  {
    id: 'classic_trivia',
    name: 'Classic Team Trivia',
    description: 'Teams of 4-8 players compete to answer general knowledge questions across themed rounds.',
    defaultConfig: {
      teamBased: true,
      roundCount: 5,
      timePerQuestion: 30,
      useMedia: true
    },
    fundraisingOptions: ['buyHint']
  },
  {
    id: 'speed_round',
    name: 'Speed Round Showdown',
    description: 'Fast-paced format where players race to answer as many questions as possible in a short time.',
    defaultConfig: {
      teamBased: false,
      roundCount: 1,
      timePerQuestion: 10,
      useMedia: false
    },
    fundraisingOptions: ['extraTime', 'sponsoredQuestion']
  },
  {
    id: 'media_puzzle',
    name: 'Picture and Media Puzzle',
    description: 'Visual-heavy quiz using images, audio, or video clips. Perfect for multimedia delivery.',
    defaultConfig: {
      teamBased: true,
      roundCount: 4,
      timePerQuestion: 45,
      useMedia: true
    },
    fundraisingOptions: ['mediaReveal']
  },
  {
    id: 'survivor_quiz',
    name: 'Survivor Quiz',
    description: 'Knockout-style quiz where teams or players are eliminated for wrong answers.',
    defaultConfig: {
      teamBased: false,
      roundCount: 0, // dynamic
      timePerQuestion: 20,
      useMedia: false
    },
    fundraisingOptions: ['lifeline', 'secondChance']
  }
];

export const gameTypeDefaults: Record<string, Partial<QuizConfig>> = Object.fromEntries(
  quizGameTypes.map((g) => [g.id, g.defaultConfig])
);
