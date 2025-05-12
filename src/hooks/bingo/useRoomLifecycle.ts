// src/hooks/bingo/useRoomLifecycle.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../../store/gameStore';
import {
  clearAllRoomData,
} from '../../utils/localStorageUtils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket: Socket = io(SOCKET_URL, { autoConnect: false });

export function useRoomLifecycle() {
  const [roomId, setRoomId] = useState('');
  const [currentChainId, setCurrentChainId] = useState<string | number>('');
  const [joinError, setJoinError] = useState('');

  const navigate = useNavigate();
  const { setPlayerName, resetGameState } = useGameStore((state) => ({
    setPlayerName: state.setPlayerName,
    resetGameState: state.resetGameState,
  }));

  useEffect(() => {
    const handleConnect = () => console.log('[Socket] ✅ Connected:', socket.id);
    const handleDisconnect = (reason: string) => console.warn('[Socket] ⚠️ Disconnected:', reason);
    const handleError = (error: unknown) => console.error('[Socket] ❌ Error:', error);

    console.log('[useRoomLifecycle] 🛠️ Setting up socket listeners');
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    return () => {
      console.log('[useRoomLifecycle] 🧹 Cleaning up socket listeners');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
    };
  }, []);

  useEffect(() => {
    console.log('[useRoomLifecycle] 🔁 Initializing lifecycle');
    resetGameState();
    clearAllRoomData();

    try {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('@appkit/portfolio_cache');
      localStorage.removeItem('lace-wallet-mode');
      localStorage.removeItem('debug');
      console.log('[useRoomLifecycle] 🧼 Cleared localStorage items');
    } catch (e) {
      console.error('[useRoomLifecycle] ❌ Failed to clear localStorage', e);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('[useRoomLifecycle] 🎲 Generated roomId:', result);
    setRoomId(result);

    console.log('[useRoomLifecycle] 📡 Connecting socket');
    socket.connect();

    return () => {
      console.log('[useRoomLifecycle] 🔌 Disconnecting socket');
      socket.disconnect();
    };
  }, [resetGameState]);

  return {
    roomId,
    currentChainId,
    setCurrentChainId,
    joinError,
    setJoinError,
    navigate,
    setPlayerName,
  };
}

