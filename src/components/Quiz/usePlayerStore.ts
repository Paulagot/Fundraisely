// hooks/quiz/usePlayerStore.ts
import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  paid: boolean;
  paymentMethod: 'cash' | 'revolut' | 'web3' | 'unknown';
  credits: number;
  extras?: string[];
  extraPayments?: {
    [extraKey: string]: {
      method: 'cash' | 'revolut' | 'other';
      amount: number;
    };
  };
}


interface PlayerState {
  players: Player[];
  addPlayer: (player: Player, roomId?: string) => void;
  togglePaid: (id: string, roomId?: string) => void;
  adjustCredits: (id: string, delta: number) => void;
  resetPlayers: () => void;
  toggleExtraForPlayer: (id: string, extra: string, roomId?: string) => void;

  updateExtraPayment: (
    playerId: string,
    extraKey: string,
    method: 'cash' | 'revolut' | 'other',
    amount: number,
    roomId: string
  ) => void;
  loadPlayersFromStorage: (roomId: string) => void; // ✅ NEW
}


export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],

  addPlayer: (player, roomId) =>
    set((state) => {
      const updatedPlayers = [...state.players, player];
      if (roomId) {
        localStorage.setItem(`players_${roomId}`, JSON.stringify(updatedPlayers));
      }
      return { players: updatedPlayers };
    }),

 togglePaid: (id, roomId) =>
  set((state) => {
    const updatedPlayers = state.players.map((p) =>
      p.id === id ? { ...p, paid: !p.paid } : p
    );

    if (roomId) {
      localStorage.setItem(`players_${roomId}`, JSON.stringify(updatedPlayers));
    }

    return { players: updatedPlayers };
  }),


  adjustCredits: (id, delta) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, credits: Math.max(0, p.credits + delta) } : p
      ),
    })),

  resetPlayers: () => set({ players: [] }),

  toggleExtraForPlayer: (id, extra, roomId) =>
  set((state) => {
    const updatedPlayers = state.players.map((p) => {
      if (p.id !== id) return p;
      const extras = new Set(p.extras || []);
      if (extras.has(extra)) {
        extras.delete(extra);
      } else {
        extras.add(extra);
      }
      return { ...p, extras: Array.from(extras) };
    });

    if (roomId) {
      localStorage.setItem(`players_${roomId}`, JSON.stringify(updatedPlayers));
    }

    return { players: updatedPlayers };
  }),

updateExtraPayment: (playerId, extraKey, method, amount, roomId) =>
  set((state) => {
    const updatedPlayers = state.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        extraPayments: {
          ...p.extraPayments,
          [extraKey]: { method, amount },
        },
      };
    });

    if (roomId) {
      localStorage.setItem(`players_${roomId}`, JSON.stringify(updatedPlayers));
    }

    return { players: updatedPlayers };
  }),


 loadPlayersFromStorage: (roomId) => {
  console.log('🔄 Loading players from localStorage for:', roomId);
  const stored = localStorage.getItem(`players_${roomId}`);
  if (stored) {
    const parsed: Player[] = JSON.parse(stored);
    console.log('✅ Loaded players:', parsed);
    set({ players: parsed });
  } else {
    console.log('⚠️ No players found for room:', roomId);
  }
}
,
}));
