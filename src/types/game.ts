// types.ts
export interface BingoCell {
  number: number;
  marked: boolean;
}

export interface WinResult {
  type: 'none' | 'line' | 'full_house';
  pattern?: number[];
}

export interface GameState {
  card: BingoCell[];
  calledNumbers: number[];
  currentNumber: number | null;
  hasWonLine: boolean;
  hasWonFullHouse: boolean;
}

export interface RoomState {
  players: Player[];
  gameStarted: boolean;
  currentNumber: number | null;
  calledNumbers: number[];
  autoPlay: boolean;
  lineWinners: { id: string; name: string }[];
  fullHouseWinners: { id: string; name: string }[];
  isPaused: boolean;
  lineWinClaimed: boolean;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  card: BingoCell[] | null;
}