// types/quiz.ts

export interface FundraisingOptions {
    buyHint?: boolean;
    extraTime?: boolean;
    lifeline?: boolean;
    mediaReveal?: boolean;
    secondChance?: boolean;
    sponsoredQuestion?: boolean;
  }
  
  export interface QuizConfig {
    hostName: string;
    gameType: string;
    teamBased: boolean;
    roundCount: number;
    timePerQuestion: number;
    useMedia: boolean;
    entryFee: string;
    paymentMethod: 'cash_or_revolut' | 'web3';
    fundraisingOptions: FundraisingOptions;
    questions: unknown[];
  }
  
  export interface QuizGameType {
    id: string;
    name: string;
    description: string;
    defaultConfig: Partial<QuizConfig>;
    fundraisingOptions: string[];
  }
  
  