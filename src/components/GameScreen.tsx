import type React from 'react';
import { NumberCaller } from './NumberCaller';
import { BingoCard } from './BingoCard';
import { GameControls } from './GameControls';
import { WinEffects } from './WinEffects';
import { WinConfirmation } from './WinConfirmation';
import { AnimatePresence } from 'framer-motion';
import type { Socket } from 'socket.io-client';

interface GameScreenProps {
  socket: Socket | null;
  gameState: any;
  playerName: string;
  isHost: boolean;
  isPaused: boolean;
  isWinner: boolean;
  autoPlay: boolean;
  lineWinners: any[];
  fullHouseWinners: any[];
  lineWinConfirmed: boolean;
  fullHouseWinConfirmed: boolean;
  lineWinClaimed: boolean;
  showWinNotification: boolean;
  winNotificationType: 'line' | 'fullHouse';
  winnerName: string;
  onConfirmLineWin: () => void;
  onConfirmFullHouseWin: () => void;
  onCellClick: (index: number) => void;
  onToggleAutoPlay: () => void;
  onUnpauseGame: () => void;
  onCloseWinNotification: () => void;
  showGameOver: boolean;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  socket,
  gameState,
  playerName,
  isHost,
  isPaused,
  isWinner,
  autoPlay,
  lineWinners,
  fullHouseWinners,
  lineWinConfirmed,
  fullHouseWinConfirmed,
  lineWinClaimed,
  showWinNotification,
  winNotificationType,
  winnerName,
  onConfirmLineWin,
  onConfirmFullHouseWin,
  onCellClick,
  onToggleAutoPlay,
  onUnpauseGame,
  onCloseWinNotification,
  showGameOver,
}) => {
  const roomId = localStorage.getItem('roomId') || '';

  const handleDeclareLineWinners = () => {
    if (!roomId || !socket) return;
    socket.emit('declare_line_winners', { roomId });
  };

  const handleDeclareFullHouseWinners = () => {
    if (!roomId || !socket) return;
    socket.emit('declare_full_house_winners', { roomId });
  };

  return (
    <>
      <NumberCaller
        currentNumber={gameState.currentNumber}
        calledNumbers={gameState.calledNumbers}
        autoPlay={autoPlay}
      />

      {showGameOver && (
        <div className="text-center p-4 bg-green-100 rounded-lg mt-4">
          <p className="text-green-800 font-bold">🎉 Game Over! Waiting for prize distribution...</p>
        </div>
      )}

      {!showGameOver && isPaused && (
        <div className="text-center p-4 bg-yellow-100 rounded-lg">
          <p className="text-yellow-800 font-semibold">
            Game Paused: {isHost ? "Verify winners and continue the game" : "Waiting for host to continue"}
          </p>
        </div>
      )}

      {!showGameOver && isPaused && isHost && lineWinners.length > 0 && !lineWinConfirmed && !lineWinClaimed && (
        <WinConfirmation
          type="line"
          winnerName={lineWinners[lineWinners.length - 1]?.name || 'Player'}
          onConfirm={onConfirmLineWin}
        />
      )}

      {!showGameOver && isPaused && isHost && fullHouseWinners.length > 0 && !fullHouseWinConfirmed && lineWinClaimed && (
        <WinConfirmation
          type="fullHouse"
          winnerName={fullHouseWinners[fullHouseWinners.length - 1]?.name || 'Player'}
          onConfirm={onConfirmFullHouseWin}
        />
      )}

      <AnimatePresence>
        {showWinNotification && !showGameOver && (
          <WinEffects
            isWinner={isWinner}
            winnerName={winnerName}
            playerName={playerName}
            winNotificationType={winNotificationType}
            onClose={onCloseWinNotification}
          />
        )}
      </AnimatePresence>

      {!showGameOver && !isHost && (
        <BingoCard
          cells={gameState.card}
          onCellClick={onCellClick}
        />
      )}

      {!showGameOver && isHost && (
        <GameControls
          onToggleAutoPlay={onToggleAutoPlay}
          onUnpauseGame={onUnpauseGame}
          onDeclareLineWinners={handleDeclareLineWinners}
          onDeclareFullHouseWinners={handleDeclareFullHouseWinners}
          showDeclarationsButtons={true}
          lineWinners={lineWinners}
          fullHouseWinners={fullHouseWinners}
          lineWinClaimed={lineWinClaimed}
          hasWon={fullHouseWinners.length > 0}
          autoPlay={autoPlay}
          isPaused={isPaused}
        />
      )}
    </>
  );
};


