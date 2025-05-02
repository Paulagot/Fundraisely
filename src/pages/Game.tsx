// src/pages/Game.tsx
import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayerList } from '../components/PlayerList';
import { GameAccessAlert } from '../components/GameAccessAlert';
import { GameOverScreen } from '../components/GameOverScreen';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { WinnerDisplay } from '../components/WinnerDisplay';
import { GameHeader } from '../components/GameHeader';
import { GameLoader } from '../components/GameLoader';

import { GameScreen } from '../components/GameScreen';
import { getRoomCreationData } from '../utils/localStorageUtils';

export function Game() {
  console.log('[Game] 🚀 Mounting Game component', { roomId: useParams().roomId });

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
  const [entryFee, setEntryFee] = useState<number | null>(null);

  console.log('[Game] 📋 Initial state', {
    showAccessError,
    showGameOver,
    lineWinConfirmed,
    fullHouseWinConfirmed,
    showWinNotification,
    winNotificationType,
    winnerName,
    entryFee,
  });

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

  console.log('[Game] 📋 Game store state', {
    players,
    playerName,
    lineWinners,
    fullHouseWinners,
    gameStarted,
    isPaused,
    joinError,
    lineWinClaimed,
  });

  const socket = useSocket(roomId);

  const {
    gameState,
    autoPlay,
    handleCellClick,
    toggleAutoPlay,
    unpauseGame,
  } = useGame(socket, roomId);

  console.log('[Game] 🧩 Socket and game state', {
    socketId: socket?.id,
    gameState,
    autoPlay,
  });

  // 🆕 Step 1: Load entryFee initially from localStorage
  useEffect(() => {
    console.log('[Game] 🔄 useEffect for localStorage entryFee', { roomId, socketId: socket?.id });
    const data = getRoomCreationData();
    if (data?.entryFee) {
      const fee = Number.parseFloat(data.entryFee);
      setEntryFee(fee);
      console.log('[Game] ✅ Set entryFee from localStorage', { entryFee: fee });
    } else {
      console.log('[Game] 🚫 No entryFee in localStorage');
    }
  }, []);

  // 🧩 Step 2: Update entryFee from server 'room_update'
  useEffect(() => {
    console.log('[Game] 🔄 useEffect for room_update', { socketId: socket?.id });
    const handleRoomUpdate = (data: any) => {
      console.log('[Game] 📥 Received room_update for entryFee', data);
      if (data.entryFee) {
        const fee = Number.parseFloat(data.entryFee);
        setEntryFee(fee);
        console.log('[Game] 🔄 Updated entryFee from server', { entryFee: fee });
      }
    };

    if (socket) {
      socket.on('room_update', handleRoomUpdate);
      return () => {
        console.log('[Game] 🧹 Cleaning up room_update listener');
        socket.off('room_update', handleRoomUpdate);
      };
    } else {
      console.log('[Game] 🚫 No socket for room_update listener');
    }
  }, [socket]);

  console.log('[Game] 💰 Entry Fee:', entryFee);

  // 🛡️ Access control
  useEffect(() => {
    console.log('[Game] 🔄 useEffect for access control', { playerName });
    if (!playerName) {
      setAccessErrorMessage('Please enter your name first.');
      setShowAccessError(true);
      console.log('[Game] 🚫 No playerName, showing access error and navigating to /');
      setTimeout(() => {
        console.log('[Game] ➡️ Navigating to /');
        navigate('/');
      }, 2000);
    }
  }, [playerName, navigate]);

  useEffect(() => {
    console.log('[Game] 🔄 useEffect for joinError', { joinError });
    if (joinError) {
      setAccessErrorMessage(joinError);
      setShowAccessError(true);
      setJoinError('');
      console.log('[Game] 🚫 Join error, showing access error and navigating to /', { joinError });
      setTimeout(() => {
        console.log('[Game] ➡️ Navigating to /');
        navigate('/');
      }, 3000);
    }
  }, [joinError, navigate, setJoinError]);

  // 🎯 Socket event listeners for debugging
  useEffect(() => {
    if (!socket) {
      console.log('[Game] 🚫 No socket for event listeners');
      return;
    }

    console.log('[Game] 🔄 useEffect for socket events', { socketId: socket.id });
    const handleConnect = () => {
      console.log('[Game] ✅ Socket connected', { socketId: socket.id });
    };

    const handleDisconnect = (reason: string) => {
      console.error('[Game] 🚫 Socket disconnected', { reason, roomId, playerName, socketId: socket.id });
    };

    const handleRoomUpdate = (data: any) => {
      console.log('[Game] 📥 Received room_update', { data });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room_update', handleRoomUpdate);

    return () => {
      console.log('[Game] 🧹 Cleaning up socket event listeners', { socketId: socket.id });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room_update', handleRoomUpdate);
    };
  }, [socket, roomId, playerName]);

  // 🎯 Handlers
  const handleConfirmLineWin = useCallback(() => {
    console.log('[Game] 📤 Emitting declare_line_winners', { roomId });
    socket?.emit('declare_line_winners', { roomId });
    setLineWinConfirmed(true);
    console.log('[Game] ✅ Set lineWinConfirmed', { lineWinConfirmed: true });
  }, [socket, roomId]);

  const handleConfirmFullHouseWin = useCallback(() => {
    console.log('[Game] 📤 Emitting declare_full_house_winners', { roomId });
    socket?.emit('declare_full_house_winners', { roomId });
    setFullHouseWinConfirmed(true);
    setShowGameOver(true);
    console.log('[Game] ✅ Set fullHouseWinConfirmed and showGameOver', {
      fullHouseWinConfirmed: true,
      showGameOver: true,
    });
  }, [socket, roomId]);

  const handleToggleReady = useCallback(() => {
    console.log('[Game] 📤 Emitting toggle_ready', { roomId });
    socket?.emit('toggle_ready', { roomId });
  }, [socket, roomId]);

  const handleStartGame = useCallback(() => {
    console.log('[Game] 📤 Emitting start_game', { roomId, playerName, socketId: socket?.id });
    socket?.emit('start_game', { roomId });
    console.log('[Game] ✅ Start game emitted');
  }, [socket, roomId, playerName]);

  const closeWinNotification = useCallback(() => {
    console.log('[Game] 🔄 Closing win notification');
    setShowWinNotification(false);
  }, []);

  // 🏆 Win notifications
  useEffect(() => {
    console.log('[Game] 🔍 Checking lineWinners for notification', { lineWinners, showWinNotification });
    if (lineWinners.length > 0 && !showWinNotification) {
      const winner = lineWinners[lineWinners.length - 1];
      setWinnerName(winner.name);
      setWinNotificationType('line');
      setShowWinNotification(true);
      console.log('[Game] ✅ Showing line win notification', { winnerName: winner.name });
    }
  }, [lineWinners, showWinNotification]);

  useEffect(() => {
    console.log('[Game] 🔍 Checking fullHouseWinners for notification', { fullHouseWinners, showWinNotification });
    if (fullHouseWinners.length > 0 && !showWinNotification) {
      const winner = fullHouseWinners[fullHouseWinners.length - 1];
      setWinnerName(winner.name);
      setWinNotificationType('fullHouse');
      setShowWinNotification(true);
      console.log('[Game] ✅ Showing full house win notification', { winnerName: winner.name });
    }
  }, [fullHouseWinners, showWinNotification]);

  useEffect(() => {
    console.log('[Game] 🔍 Checking lineWinConfirmed for notification', { lineWinConfirmed, winNotificationType });
    if (lineWinConfirmed && winNotificationType === 'line') {
      setShowWinNotification(false);
      console.log('[Game] ✅ Closed line win notification');
    }
  }, [lineWinConfirmed, winNotificationType]);

  useEffect(() => {
    console.log('[Game] 🔍 Checking fullHouseWinConfirmed for notification', { fullHouseWinConfirmed, winNotificationType });
    if (fullHouseWinConfirmed && winNotificationType === 'fullHouse') {
      setShowWinNotification(false);
      console.log('[Game] ✅ Closed full house win notification');
    }
  }, [fullHouseWinConfirmed, winNotificationType]);

  // 🎯 Handle game over from server
  useEffect(() => {
    if (!socket) {
      console.log('[Game] 🚫 No socket for game_over listener');
      return;
    }

    console.log('[Game] 🔄 useEffect for game_over', { socketId: socket.id });
    const handleGameOver = () => {
      console.log('[Game] 🏁 Game Over event received');
      setShowGameOver(true);
    };

    socket.on('game_over', handleGameOver);

    return () => {
      console.log('[Game] 🧹 Cleaning up game_over listener');
      socket.off('game_over', handleGameOver);
    };
  }, [socket]);

  const currentPlayer = Array.isArray(players)
    ? players.find((p) => p.name === playerName)
    : undefined;

  const isHost = currentPlayer?.isHost || false;
  const isWinner = lineWinners.some((w) => w.id === socket?.id) || fullHouseWinners.some((w) => w.id === socket?.id);

  console.log('[Game] 📋 Current player and host status', {
    currentPlayer,
    isHost,
    isWinner,
  });

  // 🎯 Calculate dynamic stats
  const realPlayersCount = Math.max(0, (Array.isArray(players) ? players.length : 0) - 1);
  const totalIntake = entryFee ? realPlayersCount * entryFee : 0;
  const hostReward = totalIntake * 0.25;
  const playerPrizePool = totalIntake * 0.60;
  const linePrize = playerPrizePool * 0.30;
  const fullHousePrize = playerPrizePool * 0.70;
  const maxPlayersAllowed = entryFee ? Math.floor(1000 / entryFee) : 0;
  const isRoomFull = maxPlayersAllowed > 0 && realPlayersCount >= maxPlayersAllowed;

  console.log('[Game] 📊 Game stats', {
    realPlayersCount,
    totalIntake,
    hostReward,
    playerPrizePool,
    linePrize,
    fullHousePrize,
    maxPlayersAllowed,
    isRoomFull,
  });

  console.log('[Game] ↩️ Rendering component', { roomId, socketId: socket?.id });

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

      {/* 🏆 Game Header */}
      <GameHeader roomId={roomId} />

      {entryFee && (
        <motion.div
          key={realPlayersCount}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-indigo-100 rounded-xl p-6 mb-8 text-center text-indigo-900 shadow-md"
        >
          <h2 className="text-lg font-bold mb-2">🎯 Game Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">Players</p>
              <p>
                {realPlayersCount} / {maxPlayersAllowed}
              </p>
            </div>
            <div>
              <p className="font-semibold">Total Intake</p>
              <p>{totalIntake.toFixed(2)} USDC</p>
            </div>
            <div>
              <p className="font-semibold">Host Reward</p>
              <p>{hostReward.toFixed(2)} USDC</p>
            </div>
            <div>
              <p className="font-semibold">Line Prize</p>
              <p>{linePrize.toFixed(2)} USDC</p>
            </div>
            <div>
              <p className="font-semibold">Full House Prize</p>
              <p>{fullHousePrize.toFixed(2)} USDC</p>
            </div>
          </div>
        </motion.div>
      )}

      {isRoomFull && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 mb-6 text-center shadow-md">
          🚨 Room Full! No more players can join this event.
        </div>
      )}

      {/* 🏅 Winner Display */}
      <WinnerDisplay
        lineWinners={lineWinners}
        fullHouseWinners={fullHouseWinners}
      />

      {/* 🎯 Main Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="lg:col-span-3 space-y-6">
          {!gameStarted ? (
            <GameLoader isHost={isHost} />
          ) : (
            <GameScreen
              socket={socket}
              gameState={gameState}
              playerName={playerName}
              isHost={isHost}
              isPaused={isPaused}
              isWinner={isWinner}
              autoPlay={autoPlay}
              lineWinners={lineWinners}
              fullHouseWinners={fullHouseWinners}
              lineWinConfirmed={lineWinConfirmed}
              fullHouseWinConfirmed={fullHouseWinConfirmed}
              lineWinClaimed={lineWinClaimed}
              showWinNotification={showWinNotification}
              winNotificationType={winNotificationType as 'line' | 'fullHouse'}
              winnerName={winnerName}
              onConfirmLineWin={handleConfirmLineWin}
              onConfirmFullHouseWin={handleConfirmFullHouseWin}
              onCellClick={handleCellClick}
              onToggleAutoPlay={toggleAutoPlay}
              onUnpauseGame={unpauseGame}
              onCloseWinNotification={closeWinNotification}
              showGameOver={showGameOver}
            />
          )}
        </div>

        {/* 🎮 Player List */}
        <div className="lg:col-span-1">
          <PlayerList
            players={Array.isArray(players) ? players : []}
            currentPlayerId={socket?.id || ''}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            gameStarted={gameStarted}
          />
        </div>
      </div>

      {/* 🛑 Game Over Screen */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <GameOverScreen
            lineWinners={lineWinners}
            fullHouseWinners={fullHouseWinners}
            isHost={isHost}
          />
        </div>
      )}
    </div>
  );
}
