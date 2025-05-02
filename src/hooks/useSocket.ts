// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Singleton socket instance
const socketInstance = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
});

export function useSocket(roomId: string) {
  console.log('[useSocket] 🚀 useEffect triggered', { roomId });

  const {
    setSocket,
    playerName,
    setPlayers,
    setGameStarted,
    setCurrentNumber,
    setCalledNumbers,
    setAutoPlay,
    setJoinError,
    setLineWinners,
    setFullHouseWinners,
    setIsPaused,
    setLineWinClaimed,
    setPaymentsFinalized,
  } = useGameStore();

  const socketRef = useRef<Socket | null>(socketInstance);
  const roomCreatedRef = useRef(false);
  const hasRejoinedRef = useRef(false);

  useEffect(() => {
    console.log('[useSocket] 🚀 useEffect triggered', { roomId, playerName });

    if (!playerName) {
      console.warn('[useSocket] 🚫 No player name set, skipping socket connection');
      return;
    }

    console.log('[useSocket] 🧩 Initializing socket', { roomId, playerName });

    const roomCreationString = localStorage.getItem('roomCreation');
    const roomJoiningString = localStorage.getItem('roomJoining');
    console.log('[useSocket] 📦 LocalStorage data', {
      roomCreationString,
      roomJoiningString,
    });

    let roomCreationData = null;
    let roomJoiningData = null;

    try {
      if (roomCreationString) {
        roomCreationData = JSON.parse(roomCreationString);
        console.log('[useSocket] ✅ Parsed roomCreationData', roomCreationData);
      }
      if (roomJoiningString) {
        roomJoiningData = JSON.parse(roomJoiningString);
        console.log('[useSocket] ✅ Parsed roomJoiningData', roomJoiningData);
      }
    } catch (e) {
      console.error('[useSocket] ❌ Error parsing localStorage data', e);
      localStorage.removeItem('roomCreation');
      localStorage.removeItem('roomJoining');
      return;
    }

    const newSocket = socketRef.current;
    if (!newSocket.connected) {
      console.log('[useSocket] 📡 Connecting socket');
      newSocket.connect();
    }
    setSocket(newSocket);
    console.log('[useSocket] ✅ Socket set in store', { socketId: newSocket.id });

    newSocket.on('connect', () => {
      console.log('[Socket] ✅ Connected', { socketId: newSocket.id });

      const storedRoomId = localStorage.getItem('roomId');
      const storedPlayerName = localStorage.getItem('playerName');
      const storedWalletAddress = localStorage.getItem('walletAddress') || roomCreationData?.walletAddress || roomJoiningData?.walletAddress || null;
      console.log('[Socket] 📋 Stored data', {
        storedRoomId,
        storedPlayerName,
        storedWalletAddress,
      });

      // Create Room
      if (
        roomCreationData &&
        roomCreationData.roomId === roomId &&
        !roomCreatedRef.current
      ) {
        if (
          roomCreationData.contractAddress &&
          roomCreationData.walletAddress &&
          roomCreationData.chain
        ) {
          const createRoomData = {
            roomId,
            playerName,
            contractAddress: roomCreationData.contractAddress,
            walletAddress: roomCreationData.walletAddress,
            chainId: roomCreationData.chain,
            namespace: roomCreationData.namespace || 'eip155',
            entryFee: roomCreationData.entryFee || '0',
          };
          console.log('[Socket] 🧩 Emitting create_room', createRoomData);
          newSocket.emit('create_room', createRoomData);
          localStorage.setItem('roomId', roomId);
          localStorage.setItem('playerName', playerName);
          localStorage.setItem('contractAddress', roomCreationData.contractAddress);
          localStorage.setItem('walletAddress', roomCreationData.walletAddress);
          roomCreatedRef.current = true;
          console.log('[Socket] ✅ Room creation emitted', { roomCreatedRef: roomCreatedRef.current });
        } else {
          console.error('[Socket] ❌ Invalid roomCreationData fields', roomCreationData);
        }
      }
      // Join Room
      else if (
        roomJoiningData &&
        roomJoiningData.roomId === roomId &&
        !hasRejoinedRef.current
      ) {
        console.log('[Socket] 🙋 Emitting join_room', {
          roomId,
          playerName,
          walletAddress: roomJoiningData.walletAddress,
        });
        newSocket.emit('join_room', {
          roomId,
          playerName,
          walletAddress: roomJoiningData.walletAddress,
        });
        localStorage.setItem('roomId', roomId);
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('walletAddress', roomJoiningData.walletAddress);
        localStorage.removeItem('roomJoining');
        hasRejoinedRef.current = true;
        console.log('[Socket] ✅ Join attempt completed', { hasRejoinedRef: hasRejoinedRef.current });
      }
      // Rejoin Room
      else if (
        !roomCreationData &&
        !roomJoiningData &&
        storedRoomId &&
        storedPlayerName &&
        !hasRejoinedRef.current
      ) {
        console.log('[Socket] 🔁 Emitting rejoin_room', {
          roomId: storedRoomId,
          playerName: storedPlayerName,
          walletAddress: storedWalletAddress,
        });
        newSocket.emit('rejoin_room', {
          roomId: storedRoomId,
          playerName: storedPlayerName,
          walletAddress: storedWalletAddress,
        });
        hasRejoinedRef.current = true;
        console.log('[Socket] ✅ Rejoin attempt completed', { hasRejoinedRef: hasRejoinedRef.current });
      }
      else {
        console.warn('[Socket] 🚫 No valid roomCreation, roomJoining, or rejoin data', { roomId });
      }
    });

    // Room Update
    newSocket.on('room_update', (roomState) => {
      console.log('[Socket] 📦 Received room_update', roomState);

      if (Array.isArray(roomState.players)) {
        console.log('[Socket] ✅ Setting players (array)', roomState.players);
        setPlayers(roomState.players);
      } else if (typeof roomState.players === 'object' && roomState.players !== null) {
        try {
          const playersArray =
            typeof roomState.players.values === 'function'
              ? Array.from(roomState.players.values())
              : Object.values(roomState.players);
          console.log('[Socket] ✅ Setting players (converted object)', playersArray);
          setPlayers(playersArray);
        } catch (e) {
          console.error('[Socket] ❌ Error converting players data', e);
          setPlayers([]);
        }
      } else {
        console.warn('[Socket] 🚫 Invalid players data, setting empty array');
        setPlayers([]);
      }

      console.log('[Socket] 🔄 Updating game state', {
        gameStarted: roomState.gameStarted,
        currentNumber: roomState.currentNumber,
        calledNumbers: roomState.calledNumbers,
        autoPlay: roomState.autoPlay,
        lineWinners: roomState.lineWinners,
        fullHouseWinners: roomState.fullHouseWinners,
        isPaused: roomState.isPaused,
        lineWinClaimed: roomState.lineWinClaimed,
        paymentsFinalized: roomState.paymentsFinalized,
      });

      setGameStarted(roomState.gameStarted || false);
      setCurrentNumber(roomState.currentNumber || null);
      setCalledNumbers(roomState.calledNumbers || []);
      setAutoPlay(roomState.autoPlay || false);
      setLineWinners(roomState.lineWinners || []);
      setFullHouseWinners(roomState.fullHouseWinners || []);
      setIsPaused(roomState.isPaused || false);
      setLineWinClaimed(roomState.lineWinClaimed || false);

      // Do not clear roomCreation here to preserve walletAddress
      if (roomState.paymentsFinalized) {
        console.log('[Socket] 💰 Payments finalized, updating state and localStorage');
        setPaymentsFinalized(true);
        const roomId = localStorage.getItem('roomId');
        if (roomId) {
          localStorage.setItem(`payment_finalized_${roomId}`, 'true');
        }
      }
    });

    // Resync After Reconnect
    newSocket.on('resync_state', (resyncData) => {
      console.log('[Socket] 🔄 Received resync_state', resyncData);

      if (Array.isArray(resyncData.players)) {
        console.log('[Socket] ✅ Setting players for resync', resyncData.players);
        setPlayers(resyncData.players);
      }

      console.log('[Socket] 🔄 Updating resync game state', {
        gameStarted: resyncData.gameStarted,
        currentNumber: resyncData.currentNumber,
        calledNumbers: resyncData.calledNumbers,
        autoPlay: resyncData.autoPlay,
        lineWinners: resyncData.lineWinners,
        fullHouseWinners: resyncData.fullHouseWinners,
        isPaused: resyncData.isPaused,
        lineWinClaimed: resyncData.lineWinClaimed,
        paymentsFinalized: resyncData.paymentsFinalized,
      });

      setGameStarted(resyncData.gameStarted || false);
      setCurrentNumber(resyncData.currentNumber || null);
      setCalledNumbers(resyncData.calledNumbers || []);
      setAutoPlay(resyncData.autoPlay || false);
      setLineWinners(resyncData.lineWinners || []);
      setFullHouseWinners(resyncData.fullHouseWinners || []);
      setIsPaused(resyncData.isPaused || false);
      setLineWinClaimed(resyncData.lineWinClaimed || false);

      if (resyncData.paymentsFinalized) {
        console.log('[Socket] 💰 Resync payments finalized, updating state and localStorage');
        setPaymentsFinalized(true);
        localStorage.setItem(`payment_finalized_${roomId}`, 'true');
      }
    });

    // Payments Finalized
    newSocket.on('payments_finalized', (data) => {
      console.log('[Socket] 💰 Received payments_finalized', data);
      setPaymentsFinalized(true);
      const roomId = localStorage.getItem('roomId');
      if (roomId) {
        console.log('[Socket] ✅ Setting payment_finalized in localStorage', { roomId });
        localStorage.setItem(`payment_finalized_${roomId}`, 'true');
      }
    });

    // Errors
    newSocket.on('join_error', ({ message }) => {
      console.error('[Socket] ❌ join_error', { message });
      setJoinError(message);
      if (message.includes('Room not found')) {
        console.log('[Socket] 🗑️ Clearing localStorage due to Room not found');
        localStorage.removeItem('roomId');
        localStorage.removeItem('roomCreation');
        localStorage.removeItem('roomJoining');
      }
    });

    newSocket.on('create_error', ({ message }) => {
      console.error('[Socket] ❌ create_error', { message });
      setJoinError(message);
      if (message.includes('already exists')) {
        console.log('[Socket] 🗑️ Clearing roomCreation due to room already exists');
        localStorage.removeItem('roomCreation');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] ❌ connect_error', error);
      setJoinError('Failed to connect to the server. Please try again later.');
    });

    // Add listener for unexpected disconnections
    newSocket.on('disconnect', (reason) => {
      console.error('[Socket] 🚫 Disconnected', { reason, roomId, playerName, socketId: newSocket.id });
      console.log('[Socket] 📋 Socket state at disconnect', {
        connected: newSocket.connected,
        disconnected: newSocket.disconnected,
        active: newSocket.active,
      });
    });

    return () => {
      console.log('[useSocket] 💨 Cleaning up useEffect', { roomId });
      console.log('[useSocket] 🧹 Keeping socket connected for reconnection', { socketId: newSocket.id });
      // Do not disconnect socket to allow reconnection
      hasRejoinedRef.current = false;
      console.log('[useSocket] ✅ Cleanup complete', { hasRejoinedRef: hasRejoinedRef.current });
    };
  }, [roomId, playerName]);

  console.log('[useSocket] ↩️ Returning socket', { socketId: socketRef.current?.id });
  return socketRef.current;
}