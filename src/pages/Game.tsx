import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BingoCard } from '../components/BingoCard';
import { NumberCaller } from '../components/NumberCaller';
import { GameControls } from '../components/GameControls';
import { PlayerList } from '../components/PlayerList';
import { WinEffects } from '../components/WinEffects';
import { GameAccessAlert } from '../components/GameAccessAlert';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Gamepad2, Loader2 } from 'lucide-react';

export function Game() {
  const { roomId = '' } = useParams();
  const navigate = useNavigate();
  const [showAccessError, setShowAccessError] = useState(false);
  const [accessErrorMessage, setAccessErrorMessage] = useState('');
  
  // Debug logging to understand component state on load
  console.log('Game component rendering with roomId:', roomId);
  console.log('localStorage state on Game load:', {
    roomCreation: localStorage.getItem('roomCreation'),
    roomJoining: localStorage.getItem('roomJoining'),
    paymentProof: localStorage.getItem('paymentProof')
  });
  
  // Destructure joinError and setJoinError from gameStore
  const { 
    players, 
    playerName, 
    winnerId,
    gameStarted,
    joinError,
    setJoinError
  } = useGameStore();
  
  console.log('Player name from store:', playerName);
  
  // Verify we have necessary data before proceeding
  useEffect(() => {
    if (!playerName) {
      console.log('No player name found, redirecting to landing');
      setAccessErrorMessage('Please enter your name first.');
      setShowAccessError(true);
      setTimeout(() => navigate('/'), 2000);
      return;
    }
    
    // Check if we have either roomCreation or roomJoining data
    const hasRoomData = localStorage.getItem('roomCreation') || localStorage.getItem('roomJoining');
    
    if (!hasRoomData) {
      console.log('No room data found in localStorage, redirecting');
      setAccessErrorMessage('Please create or join a room first.');
      setShowAccessError(true);
      setTimeout(() => navigate('/'), 2000);
      return;
    }
    
    console.log('Valid data found, proceeding with game initialization');
  }, [playerName, navigate]);
  
  // Handle join/create errors from socket
  useEffect(() => {
    if (joinError) {
      console.log('Join/Create error detected:', joinError);
      setAccessErrorMessage(joinError);
      setShowAccessError(true);
      
      // Clear the error after displaying it
      setJoinError('');
      
      // Redirect after error display
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [joinError, navigate, setJoinError]);
  
  // Initialize socket and game
  const socket = useSocket(roomId);
  
  const {
    gameState,
    autoPlay,
    handleCellClick,
    toggleAutoPlay,
  } = useGame(socket, roomId);

  const currentPlayer = players.find(p => p.name === playerName);
  const isHost = currentPlayer?.isHost || false;
  const winnerName = players.find(p => p.id === winnerId)?.name || '';
  const isSinglePlayer = players.length === 1;

  // Keep the original socket error handler for backward compatibility
  useEffect(() => {
    const handleJoinError = ({ message }: { message: string }) => {
      setAccessErrorMessage(message);
      setShowAccessError(true);
      setTimeout(() => navigate('/'), 3000);
    };

    socket?.on('join_error', handleJoinError);
    return () => {
      socket?.off('join_error', handleJoinError);
    };
  }, [socket, navigate]);

  const handleToggleReady = useCallback(() => {
    socket?.emit('toggle_ready', { roomId });
  }, [socket, roomId]);

  const handleStartGame = useCallback(() => {
    socket?.emit('start_game', { roomId });
  }, [socket, roomId]);

  useEffect(() => {
    if (gameState.hasWon) {
      socket?.emit('player_won', { roomId });
    }
  }, [gameState.hasWon, roomId, socket]);

  // Loading state when we have no player name
  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-indigo-50 to-white">
        <AnimatePresence>
          {showAccessError && (
            <GameAccessAlert
              message={accessErrorMessage}
              onClose={() => setShowAccessError(false)}
            />
          )}
        </AnimatePresence>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-lg text-indigo-800 font-medium">Initializing game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <AnimatePresence>
        {showAccessError && (
          <GameAccessAlert
            message={accessErrorMessage}
            onClose={() => setShowAccessError(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-indigo-100 rounded-full mb-4">
            <Gamepad2 className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
            FundRaisley Bingo Game Room
          </h1>
          <p className="text-indigo-900/70">Room Code: <span className="font-semibold">{roomId}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-6">
            {!gameStarted ? (
              <div className="flex items-center justify-center h-48 bg-white rounded-2xl shadow-md p-6">
                <div className="text-center">
                  <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                    {isSinglePlayer ? (
                      <Gamepad2 className="h-8 w-8 text-indigo-600" />
                    ) : (
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl text-gray-700 font-medium px-4">
                    {isSinglePlayer 
                      ? "Ready to play solo! Click 'Start Solo Game' to begin."
                      : "Waiting for players to ready up..."}
                  </h2>
                </div>
              </div>
            ) : (
              <>
                <NumberCaller
                  currentNumber={gameState.currentNumber}
                  calledNumbers={gameState.calledNumbers}
                  autoPlay={autoPlay}
                />

                <AnimatePresence>
                  {winnerId && (
                    <WinEffects
                      isWinner={winnerId === socket?.id}
                      winnerName={winnerName}
                    />
                  )}
                </AnimatePresence>
                
                <BingoCard
                  cells={gameState.card}
                  onCellClick={handleCellClick}
                />

                {isHost && (
                  <GameControls
                    onToggleAutoPlay={toggleAutoPlay}
                    hasWon={!!winnerId}
                    autoPlay={autoPlay}
                  />
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <PlayerList
              players={players}
              currentPlayerId={socket?.id}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartGame}
              gameStarted={gameStarted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}