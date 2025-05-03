import { create } from 'zustand';
import { BingoCell, Player } from '../types/game';

interface GameStore {
  socket: any;
  setSocket: (socket: any) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  currentNumber: number | null;
  setCurrentNumber: (number: number | null) => void;
  calledNumbers: number[];
  setCalledNumbers: (numbers: number[]) => void;
  autoPlay: boolean;
  setAutoPlay: (autoPlay: boolean) => void;
  hasWon: boolean;
  setHasWon: (hasWon: boolean) => void;
  winner: string | null;
  setWinner: (winner: string | null) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  joinError: string;
  setJoinError: (error: string) => void;
  hasWonLine: boolean;
  setHasWonLine: (hasWon: boolean) => void;
  hasWonFullHouse: boolean;
  setHasWonFullHouse: (hasWon: boolean) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  lineWinClaimed: boolean;
  setLineWinClaimed: (claimed: boolean) => void;
  lineWinners: { id: string; name: string }[];
  setLineWinners: (winners: { id: string; name: string }[]) => void;
  fullHouseWinners: { id: string; name: string }[];
  setFullHouseWinners: (winners: { id: string; name: string }[]) => void;
  paymentsFinalized: boolean;
  setPaymentsFinalized: (status: boolean) => void;

  // ✅ NEW WIN EFFECTS STATE
  showWinNotification: boolean;
  setShowWinNotification: (show: boolean) => void;
  winNotificationType: 'line' | 'fullHouse' | '';
  setWinNotificationType: (type: 'line' | 'fullHouse' | '') => void;
  winnerName: string;
  setWinnerName: (name: string) => void;

  resetGameState: () => void;
}

// ✅ Define the store logic separately
const store = (set: any, get: () => GameStore): GameStore => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
  players: [],
  setPlayers: (players) => set({ players }),
  gameStarted: false,
  setGameStarted: (started) => set({ gameStarted: started }),
  currentNumber: null,
  setCurrentNumber: (number) => set({ currentNumber: number }),
  calledNumbers: [],
  setCalledNumbers: (numbers) => set({ calledNumbers: numbers }),
  autoPlay: false,
  setAutoPlay: (autoPlay) => set({ autoPlay }),
  hasWon: false,
  setHasWon: (hasWon) => set({ hasWon }),
  winner: null,
  setWinner: (winner) => set({ winner }),
  playerName: '',
  setPlayerName: (name) => set({ playerName: name }),
  joinError: '',
  setJoinError: (error) => set({ joinError: error }),
  hasWonLine: false,
  setHasWonLine: (hasWon) => set({ hasWonLine: hasWon }),
  hasWonFullHouse: false,
  setHasWonFullHouse: (hasWon) => set({ hasWonFullHouse: hasWon }),
  isPaused: false,
  setIsPaused: (paused) => set({ isPaused: paused }),
  lineWinClaimed: false,
  setLineWinClaimed: (claimed) => set({ lineWinClaimed: claimed }),
  lineWinners: [],
  setLineWinners: (winners) => set({ lineWinners: winners }),
  fullHouseWinners: [],
  setFullHouseWinners: (winners) => set({ fullHouseWinners: winners }),
  paymentsFinalized: false,
  setPaymentsFinalized: (status) => set({ paymentsFinalized: status }),
  showWinNotification: false,
  setShowWinNotification: (show) => set({ showWinNotification: show }),
  winNotificationType: '',
  setWinNotificationType: (type) => set({ winNotificationType: type }),
  winnerName: '',
  setWinnerName: (name) => set({ winnerName: name }),

  resetGameState: () => {
    const currentSocket = get().socket;
    set({
      socket: currentSocket,
      players: [],
      gameStarted: false,
      currentNumber: null,
      calledNumbers: [],
      autoPlay: false,
      hasWon: false,
      winner: null,
      playerName: '',
      joinError: '',
      hasWonLine: false,
      hasWonFullHouse: false,
      isPaused: false,
      lineWinClaimed: false,
      lineWinners: [],
      fullHouseWinners: [],
      paymentsFinalized: false,
      showWinNotification: false,
      winNotificationType: '',
      winnerName: '',
    });
  },
});

// ✅ Export the hook
export const useGameStore = create<GameStore>(store);
