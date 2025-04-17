// Game.tsx
import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BingoCard } from '../components/BingoCard';
import { NumberCaller } from '../components/NumberCaller';
import { GameControls } from '../components/GameControls';
import { PlayerList } from '../components/PlayerList';
import { WinEffects } from '../components/WinEffects';
import { GameAccessAlert } from '../components/GameAccessAlert';
import { GameOverScreen } from '../components/GameOverScreen';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Gamepad2, Loader2 } from 'lucide-react';

export function Game() {
  const { roomId = '' } = useParams();
  const navigate = useNavigate();
  const [showAccessError, setShowAccessError] = useState(false);
  const [accessErrorMessage, setAccessErrorMessage] = useState('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [lineWinConfirmed, setLineWinConfirmed] = useState(false);
  const [fullHouseWinConfirmed, setFullHouseWinConfirmed] = useState(false);
  const [showWinNotification, setShowWinNotification] = useState(false);
  const [winNotificationType, setWinNotificationType] = useState('');
  const [winnerName, setWinnerName] = useState('');

  const {
    players,
    playerName,
    lineWinners,
    fullHouseWinners,
    gameStarted,
    isPaused,
    joinError,
    setJoinError,
    lineWinClaimed,
  } = useGameStore();

  useEffect(() => {
    if (!playerName) {
      setAccessErrorMessage('Please enter your name first.');
      setShowAccessError(true);
      setTimeout(() => navigate('/'), 2000);
    }
  }, [playerName, navigate]);

  useEffect(() => {
    if (joinError) {
      setAccessErrorMessage(joinError);
      setShowAccessError(true);
      setJoinError('');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [joinError, navigate, setJoinError]);

  const socket = useSocket(roomId);
  const {
    gameState,
    autoPlay,
    handleCellClick,
    toggleAutoPlay,
    unpauseGame,
    startNewGame,
  } = useGame(socket, roomId);

  // Handler for confirming line win
  const handleConfirmLineWin = useCallback(() => {
    socket?.emit('declare_line_winners', { roomId });
    setLineWinConfirmed(true);
  }, [socket, roomId]);

  // Handler for confirming full house win
  const handleConfirmFullHouseWin = useCallback(() => {
    socket?.emit('declare_full_house_winners', { roomId });
    setFullHouseWinConfirmed(true);
    // Show game over screen for all players
    setShowGameOver(true);
  }, [socket, roomId]);

  // Modified start new game function
  const startNewGameWithReset = useCallback(() => {
    // Navigate to landing page to create a new room/game
    navigate('/');
  }, [navigate]);

  // Effect to show win notifications
  useEffect(() => {
    if (lineWinners.length > 0 && !showWinNotification) {
      const winner = lineWinners[lineWinners.length - 1];
      setWinnerName(winner.name);
      setWinNotificationType('line');
      setShowWinNotification(true);
    }
  }, [lineWinners, showWinNotification]);

  useEffect(() => {
    if (fullHouseWinners.length > 0 && !showWinNotification) {
      const winner = fullHouseWinners[fullHouseWinners.length - 1];
      setWinnerName(winner.name);
      setWinNotificationType('fullHouse');
      setShowWinNotification(true);
    }
  }, [fullHouseWinners, showWinNotification]);

  // Effect to hide win notification when win is confirmed
  useEffect(() => {
    if (lineWinConfirmed && winNotificationType === 'line') {
      setShowWinNotification(false);
    }
  }, [lineWinConfirmed, winNotificationType]);

  useEffect(() => {
    if (fullHouseWinConfirmed && winNotificationType === 'fullHouse') {
      setShowWinNotification(false);
    }
  }, [fullHouseWinConfirmed, winNotificationType]);

  // Effect to show game over screen for all players
  useEffect(() => {
    if (fullHouseWinners.length > 0 && fullHouseWinConfirmed) {
      // Game over screen should appear for all players
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [fullHouseWinners, fullHouseWinConfirmed]);

  // Listen for game state changes from server
  useEffect(() => {
    const handleGameStateUpdate = (data) => {
      // If the server signals game over, show the game over screen for all players
      if (data.gameOver) {
        setShowGameOver(true);
      }
    };

    socket?.on('room_update', handleGameStateUpdate);

    return () => {
      socket?.off('room_update', handleGameStateUpdate);
    };
  }, [socket]);

  const currentPlayer = Array.isArray(players) 
    ? players.find(p => p.name === playerName) 
    : undefined;
    
  const isHost = currentPlayer?.isHost || false;
  const isSinglePlayer = Array.isArray(players) ? players.length === 1 : false;
  const isWinner = lineWinners.some(w => w.id === socket?.id) || fullHouseWinners.some(w => w.id === socket?.id);

  const handleToggleReady = useCallback(() => {
    socket?.emit('toggle_ready', { roomId });
  }, [socket, roomId]);

  const handleStartGame = useCallback(() => {
    socket?.emit('start_game', { roomId });
  }, [socket, roomId]);

  const closeWinNotification = useCallback(() => {
    setShowWinNotification(false);
  }, []);

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
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-indigo-100 rounded-full mb-4">
            <Gamepad2 className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
            FundRaisley Bingo Game Room
          </h1>
          <p className="text-indigo-900/70">
            Room Code: <span className="font-semibold">{roomId}</span>
          </p>
        </div>

        {(lineWinners.length > 0 || fullHouseWinners.length > 0) && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-indigo-800">Winners</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {lineWinners.map(winner => (
                <span key={winner.id} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {winner.name} (Line)
                </span>
              ))}
              {fullHouseWinners.map(winner => (
                <span key={winner.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  {winner.name} (Full House)
                </span>
              ))}
            </div>
          </div>
        )}

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

                {isPaused && (
                  <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <p className="text-yellow-800 font-semibold">
                      Game Paused: {isHost ? "Verify winners and continue the game" : "Waiting for host to continue"}
                    </p>
                  </div>
                )}

                {/* Line Win Confirmation - Only show to host if not already confirmed */}
                {isPaused && isHost && lineWinners.length > 0 && !lineWinConfirmed && !lineWinClaimed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Line Win Claimed!</h3>
                    <p className="text-yellow-700 mb-3">
                      {lineWinners[lineWinners.length - 1]?.name || 'Player'} claimed a line win.
                    </p>
                    <button
                     type="button"
                      onClick={handleConfirmLineWin}
                      className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm Line Win & Continue Game
                    </button>
                  </div>
                )}

                {/* Full House Win Confirmation - Only show to host if not already confirmed */}
                {isPaused && isHost && fullHouseWinners.length > 0 && !fullHouseWinConfirmed && lineWinClaimed && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-4">
                    <h3 className="font-medium text-purple-800 mb-2">Full House Claimed!</h3>
                    <p className="text-purple-700 mb-3">
                      {fullHouseWinners[fullHouseWinners.length - 1]?.name || 'Player'} claimed a full house.
                    </p>
                    <button
                     type="button"
                      onClick={handleConfirmFullHouseWin}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Confirm Full House Win
                    </button>
                  </div>
                )}

                {/* Win notification for all players - auto-dismisses on confirmation */}
                {showWinNotification && (
                  <div className={`relative p-4 my-4 rounded-lg ${winNotificationType === 'line' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                    <button 
                      type="button"
                      onClick={closeWinNotification}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                    <div className="flex items-center justify-center">
                      <div className={`mr-3 ${winNotificationType === 'line' ? 'text-indigo-500' : 'text-green-500'}`}>
                        {winNotificationType === 'line' ? '♥' : '🏆'}
                      </div>
                      <div>
                        <h3 className={`font-bold ${winNotificationType === 'line' ? 'text-indigo-700' : 'text-green-700'}`}>
                          {winnerName === playerName ? 'You won!' : `${winnerName} won!`}
                        </h3>
                        <p className={`${winNotificationType === 'line' ? 'text-indigo-600' : 'text-green-600'}`}>
                          {winNotificationType === 'line' 
                            ? 'Congratulations on your line win!' 
                            : 'Congratulations on your bingo victory!'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <BingoCard
                  cells={gameState.card}
                  onCellClick={handleCellClick}
                />

                {isHost && (
                  <GameControls
                    onToggleAutoPlay={toggleAutoPlay}
                    onUnpauseGame={unpauseGame}
                    hasWon={fullHouseWinners.length > 0}
                    autoPlay={autoPlay}
                    isPaused={isPaused}
                  />
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <PlayerList
              players={Array.isArray(players) ? players : []}
              currentPlayerId={socket?.id}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartGame}
              gameStarted={gameStarted}
            />
          </div>
        </div>
      </div>

      {/* Game Over Screen - shows as a modal overlay when game is complete - for ALL players */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <GameOverScreen
            lineWinners={lineWinners}
            fullHouseWinners={fullHouseWinners}
            onStartNewGame={isHost ? startNewGameWithReset : undefined}
            isHost={isHost}
          />
        </div>
      )}
    </div>
  );
}