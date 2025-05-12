// hooks/quiz/usePlayerStore.ts
import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  paid: boolean;
  paymentMethod: 'cash' | 'revolut' | 'web3' | 'unknown';
  credits: number;
}

interface PlayerState {
  players: Player[];
  addPlayer: (player: Player) => void;
  togglePaid: (id: string) => void;
  adjustCredits: (id: string, delta: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
    })),

  togglePaid: (id) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, paid: !p.paid } : p
      ),
    })),

  adjustCredits: (id, delta) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, credits: Math.max(0, p.credits + delta) } : p
      ),
    })),
}));

