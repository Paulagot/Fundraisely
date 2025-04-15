import { create } from 'zustand';
import { BingoCell, Player, RoomState } from '../types/game';

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
  playerName: string;
  setPlayerName: (name: string) => void;
  hasWon: boolean;
  setHasWon: (hasWon: boolean) => void;
  winnerId: string | null;
  setWinnerId: (id: string | null) => void;
  // ADDED: joinError state and setter
  joinError: string;
  setJoinError: (error: string) => void;
  updateRoomState: (state: RoomState) => void;
}

export const useGameStore = create<GameStore>((set) => ({
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
  playerName: '',
  setPlayerName: (name) => set({ playerName: name }),
  hasWon: false,
  setHasWon: (hasWon) => set({ hasWon }),
  winnerId: null,
  setWinnerId: (id) => set({ winnerId: id }),
  // ADDED: Initialize joinError state and setter
  joinError: '',
  setJoinError: (error) => set({ joinError: error }),
  updateRoomState: (state) => set({
    players: state.players,
    gameStarted: state.gameStarted,
    currentNumber: state.currentNumber,
    calledNumbers: state.calledNumbers,
    autoPlay: state.autoPlay,
    winnerId: state.winnerId
  })
}));