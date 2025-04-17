import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(roomId: string) {
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
  } = useGameStore();

  const socketRef = useRef<Socket | null>(null);
  const roomCreatedRef = useRef(false);

  useEffect(() => {
    if (!playerName) {
      console.log('No player name set, not connecting socket');
      return;
    }

    console.log(`Initializing socket for room: ${roomId}, player: ${playerName}`);

    const roomCreationString = localStorage.getItem('roomCreation');
    const roomJoiningString = localStorage.getItem('roomJoining');
    const paymentProofString = localStorage.getItem('paymentProof');

    let roomCreationData = null;
    let roomJoiningData = null;
    let paymentProofData = null;

    try {
      if (roomCreationString) {
        roomCreationData = JSON.parse(roomCreationString);
      }
      if (roomJoiningString) {
        roomJoiningData = JSON.parse(roomJoiningString);
      }
      if (paymentProofString) {
        paymentProofData = JSON.parse(paymentProofString);
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      setSocket(socketRef.current);
    }

    const newSocket = socketRef.current;

    newSocket.on('connect', () => {
      console.log(`Socket connected with ID: ${newSocket.id}`);

      const storedRoomId = localStorage.getItem('roomId');
      const storedPlayerName = localStorage.getItem('playerName');

      if (storedRoomId && storedPlayerName) {
        console.log(`Emitting rejoin_room for ${storedRoomId} as ${storedPlayerName}`);
        newSocket.emit('rejoin_room', {
          roomId: storedRoomId,
          playerName: storedPlayerName,
        });
      }

      if (roomCreationData && roomCreationData.roomId === roomId && !roomCreatedRef.current) {
        console.log(`Emitting create_room for ${roomId} by ${playerName}`);
        newSocket.emit('create_room', { roomId, playerName });
        localStorage.setItem('roomId', roomId);
        localStorage.setItem('playerName', playerName);
        roomCreatedRef.current = true;
      } else if (roomJoiningData && roomJoiningData.roomId === roomId) {
        console.log(`Emitting join_room for ${roomId} by ${playerName}`);
        let paymentProof = null;
        if (paymentProofData && paymentProofData.roomId === roomId) {
          paymentProof = {
            address: paymentProofData.address,
            txHash: paymentProofData.txHash,
          };
        }
        newSocket.emit('join_room', { roomId, playerName, paymentProof });
        localStorage.setItem('roomId', roomId);
        localStorage.setItem('playerName', playerName);
        localStorage.removeItem('roomJoining');
        if (paymentProofData) {
          localStorage.removeItem('paymentProof');
        }
      } else {
        console.warn(`No valid roomCreation or roomJoining data for room: ${roomId}`);
      }
    });

    newSocket.on('room_update', (roomState) => {
      console.log('Received room_update:', roomState);

      if (roomState.players) {
        if (Array.isArray(roomState.players)) {
          setPlayers(roomState.players);
        } else if (typeof roomState.players === 'object' && roomState.players !== null) {
          try {
            if (typeof roomState.players.values === 'function') {
              const playersArray = Array.from(roomState.players.values());
              setPlayers(playersArray);
            } else {
              const playersArray = Object.values(roomState.players);
              setPlayers(playersArray);
            }
          } catch (e) {
            console.error('Error converting players data to array:', e);
            setPlayers([]);
          }
        } else {
          setPlayers([]);
        }
      } else {
        setPlayers([]);
      }

      setGameStarted(roomState.gameStarted || false);
      setCurrentNumber(roomState.currentNumber || null);
      setCalledNumbers(roomState.calledNumbers || []);
      setAutoPlay(roomState.autoPlay || false);
      setLineWinners(roomState.lineWinners || []);
      setFullHouseWinners(roomState.fullHouseWinners || []);
      setIsPaused(roomState.isPaused || false);
      setLineWinClaimed(roomState.lineWinClaimed || false);

      if (roomCreationData && roomCreatedRef.current) {
        console.log('Room created successfully, clearing roomCreation');
        localStorage.removeItem('roomCreation');
      }
    });

    newSocket.on('resync_state', (resyncData) => {
      console.log('Received resync_state:', resyncData);

      if (Array.isArray(resyncData.players)) {
        setPlayers(resyncData.players);
      } else if (resyncData.players && typeof resyncData.players === 'object') {
        try {
          if (typeof resyncData.players.values === 'function') {
            setPlayers(Array.from(resyncData.players.values()));
          } else {
            setPlayers(Object.values(resyncData.players));
          }
        } catch (e) {
          console.error('Error handling resync players data:', e);
          setPlayers([]);
        }
      }

      setGameStarted(resyncData.gameStarted || false);
      setCurrentNumber(resyncData.currentNumber || null);
      setCalledNumbers(resyncData.calledNumbers || []);
      setAutoPlay(resyncData.autoPlay || false);
      setLineWinners(resyncData.lineWinners || []);
      setFullHouseWinners(resyncData.fullHouseWinners || []);
      setIsPaused(resyncData.isPaused || false);
      setLineWinClaimed(resyncData.lineWinClaimed || false);

      if (resyncData.yourCard) {
        const currentPlayers = useGameStore.getState().players;
        if (Array.isArray(currentPlayers)) {
          const updatedPlayers = currentPlayers.map(player =>
            player.name === playerName ? { ...player, card: resyncData.yourCard } : player
          );
          setPlayers(updatedPlayers);
        }
      }
    });

    newSocket.on('player_card_update', ({ playerId, card }) => {
      const currentPlayers = useGameStore.getState().players;
      if (!Array.isArray(currentPlayers)) {
        return;
      }
      const updatedPlayers = currentPlayers.map(player =>
        player.id === playerId ? { ...player, card } : player
      );
      setPlayers(updatedPlayers);
    });

    newSocket.on('join_error', ({ message }) => {
      console.error('Received join_error:', message);
      setJoinError(message);
    });

    newSocket.on('create_error', ({ message }) => {
      console.error('Received create_error:', message);
      setJoinError(message);
    });

    newSocket.on('number_called', ({ currentNumber, calledNumbers }) => {
      setCurrentNumber(currentNumber);
      setCalledNumbers(calledNumbers);
    });

    newSocket.on('auto_play_update', ({ autoPlay }) => {
      setAutoPlay(autoPlay);
    });

    newSocket.on('game_paused', () => {
      setIsPaused(true);
    });

    newSocket.on('game_unpaused', () => {
      setIsPaused(false);
    });

    newSocket.on('line_winners_proposed', ({ winners }) => {
      setLineWinners(winners);
    });

    newSocket.on('line_winners_declared', ({ winners }) => {
      setLineWinners(winners);
      setLineWinClaimed(true);
    });

    newSocket.on('full_house_winners_proposed', ({ winners }) => {
      setFullHouseWinners(winners);
    });

    newSocket.on('full_house_winners_declared', ({ winners }) => {
      setFullHouseWinners(winners);
      setGameStarted(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connect_error:', error);
      setJoinError('Failed to connect to the server. Please try again later.');
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (roomCreatedRef.current) {
        localStorage.removeItem('roomCreation');
      }
    };
  }, [
    roomId,
    playerName,
    setSocket,
    setJoinError,
    setCurrentNumber,
    setCalledNumbers,
    setAutoPlay,
    setPlayers,
    setGameStarted,
    setLineWinners,
    setFullHouseWinners,
    setIsPaused,
    setLineWinClaimed,
  ]);

  return socketRef.current;
}
