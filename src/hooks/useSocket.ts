import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function useSocket(roomId: string) {
  const {
    setSocket,
    socket,
    playerName,
    updateRoomState,
    setWinnerId,
    setHasWon,
    setCurrentNumber,
    setCalledNumbers,
    setAutoPlay,
    setJoinError,
  } = useGameStore();
  
  // Keep track of whether we've emitted the room creation event
  const roomCreatedRef = useRef(false);

  useEffect(() => {
    if (!playerName) {
      console.log('No player name set, not connecting socket');
      return;
    }

    console.log(`Initializing socket for room: ${roomId}, player: ${playerName}`);
    
    // CRITICAL CHANGE: Save the room creation data before creating the socket
    // so we can use it after connection even if other components modify localStorage
    const roomCreationString = localStorage.getItem('roomCreation');
    const roomJoiningString = localStorage.getItem('roomJoining');
    const paymentProofString = localStorage.getItem('paymentProof');
    
    // Parse the data outside the socket connection
    let roomCreationData = null;
    let roomJoiningData = null;
    let paymentProofData = null;
    
    try {
      if (roomCreationString) {
        roomCreationData = JSON.parse(roomCreationString);
        console.log('Stored room creation data:', roomCreationData);
      }
      
      if (roomJoiningString) {
        roomJoiningData = JSON.parse(roomJoiningString);
      }
      
      if (paymentProofString) {
        paymentProofData = JSON.parse(paymentProofString);
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
    }
    
    // Create socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log(`Socket connected with ID: ${newSocket.id}`);
      
      // Don't remove the roomCreation data until we've successfully created the room
      if (roomCreationData && roomCreationData.roomId === roomId && !roomCreatedRef.current) {
        console.log(`Creating room ${roomId} for player ${playerName}`);
        
        // Emit create_room event
        newSocket.emit('create_room', { 
          roomId, 
          playerName
        });
        
        // Mark that we've emitted the create room event
        roomCreatedRef.current = true;
        
        // We'll keep the room creation data for now - don't remove it yet
        // We'll remove it after we receive the room_update event
      } 
      else if (roomJoiningData && roomJoiningData.roomId === roomId) {
        console.log(`Joining room ${roomId} for player ${playerName}`);
        
        // Prepare payment proof if available
        let paymentProof = null;
        if (paymentProofData && paymentProofData.roomId === roomId) {
          paymentProof = {
            address: paymentProofData.address,
            txHash: paymentProofData.txHash
          };
        }
        
        // Emit join_room event
        newSocket.emit('join_room', { 
          roomId, 
          playerName,
          paymentProof
        });
        
        // Clear joining data after emitting
        localStorage.removeItem('roomJoining');
        if (paymentProofData) {
          localStorage.removeItem('paymentProof');
        }
      }
      else if (!roomCreationData && !roomJoiningData) {
        console.log('No room data found, user may have navigated directly to URL');
        setJoinError('Please create or join a room first');
      }
    });

    // Successfully joined or created room - now we can clear localStorage
    newSocket.on('room_update', (roomState) => {
      console.log('Room update received:', roomState);
      
      // Room was successfully created or joined, safe to clear localStorage now
      if (roomCreationData && roomCreatedRef.current) {
        console.log('Room created successfully, clearing localStorage data');
        localStorage.removeItem('roomCreation');
        roomCreatedRef.current = true; // Ensure we don't try to create again
      }
      
      updateRoomState(roomState);
    });

    newSocket.on('join_error', ({ message }) => {
      console.error('Socket event - join_error:', message);
      setJoinError(message);
    });

    newSocket.on('create_error', ({ message }) => {
      console.error('Socket event - create_error:', message);
      setJoinError(message);
    });

    newSocket.on('number_called', ({ currentNumber, calledNumbers }) => {
      setCurrentNumber(currentNumber);
      setCalledNumbers(calledNumbers);
    });

    newSocket.on('auto_play_update', ({ autoPlay }) => {
      setAutoPlay(autoPlay);
    });

    newSocket.on('game_won', ({ winnerId, playerName }) => {
      console.log(`Game won by ${playerName}`);
      setWinnerId(winnerId);
      setHasWon(true);
    });

    newSocket.on('game_reset', () => {
      console.log('Game reset');
      updateRoomState({
        players: [],
        gameStarted: false,
        currentNumber: null,
        calledNumbers: [],
        autoPlay: false,
        winnerId: null
      });
      setHasWon(false);
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
      
      // Only clean up localStorage on component unmount if we're actually navigating away
      // from the game (not just a reconnection)
      if (roomCreatedRef.current) {
        localStorage.removeItem('roomCreation');
      }
    };
  }, [roomId, playerName]);

  return socket;
}