// types/quiz.ts

export interface FundraisingOptions {
  buyHint?: boolean;
  extraTime?: boolean;
  lifeline?: boolean;
  mediaReveal?: boolean;
  secondChance?: boolean;
  sponsoredQuestion?: boolean;
   [key: string]: boolean | undefined;
}

export interface FundraisingPrices {
  [key: string]: number; // key matches enabled extras
}

export interface FundraisingExtraRule {
  maxPerPlayer: number;
  usagePhase: 'any' | 'perRound';
}

export interface QuizConfig {
  hostName: string;
  gameType: string; // corresponds to quizGameTypes.id
  teamBased: boolean;
  roundCount: number;
  timePerQuestion: number;
  questionsPerRound?: number; // ✅ NEW: optional, supports per-round question customization
  useMedia: boolean;
  entryFee: string;
  paymentMethod: 'cash_or_revolut' | 'web3';
  fundraisingOptions: FundraisingOptions;
  fundraisingPrices?: FundraisingPrices; // ✅ NEW: map of prices for extras
  questions: unknown[];
  prizeMode?: 'split' | 'assets' | 'cash';
  prizeSplits?: Record<number, number>; // e.g., { 1: 70, 2: 30 }
  prizes?: Prize[];
  startTime?: string;
  roomId?: string;
  currencySymbol?: string; 
  totalTimeSeconds?: number;

}

export interface QuizGameType {
  id: string;
  name: string;
  description: string;
  defaultConfig: Partial<QuizConfig>;
  fundraisingOptions: {
    [key: string]: FundraisingExtraRule;
  };

}


export interface Prize {
  place: number;
  description: string;
  sponsor?: string;
  value?: number;
  tokenAddress?: string; // Web3 only
}


  
  
  