// src/hooks/useGame.ts
import { useState, useCallback, useEffect } from 'react';
import { generateBingoCard, checkWin } from '../utils/gameLogic';
import type { WinResult } from '../utils/gameLogic';
import type { GameState } from '../types/game';
import { useGameStore } from '../store/gameStore';

export function useGame(socket: any, roomId: string) {
  console.log('[useGame] 🚀 Initializing useGame hook', { roomId });

  const [gameState, setGameState] = useState<GameState>(() => {
    console.log('[useGame] 🆕 Generating initial game state');
    const numbers = generateBingoCard();
    const initialState = {
      card: numbers.map((number) => ({ number, marked: false })),
      calledNumbers: [],
      currentNumber: null,
      hasWonLine: false,
      hasWonFullHouse: false,
    };
    console.log('[useGame] ✅ Initial game state set', initialState);
    return initialState;
  });

  const {
    autoPlay,
    setAutoPlay,
    calledNumbers: storeCalledNumbers,
    currentNumber: storeCurrentNumber,
    lineWinClaimed,
    setHasWonLine,
    setHasWonFullHouse,
    isPaused,
    lineWinners,
    fullHouseWinners,
    socket: storeSocket,
  } = useGameStore();

  console.log('[useGame] 📋 Game store state', {
    autoPlay,
    storeCalledNumbers,
    storeCurrentNumber,
    lineWinClaimed,
    isPaused,
    lineWinners,
    fullHouseWinners,
    storeSocketId: storeSocket?.id,
  });

  // Sync game state with store
  useEffect(() => {
    console.log('[useGame] 🔄 Syncing game state with store', {
      storeCalledNumbers,
      storeCurrentNumber,
      lineWinners,
      fullHouseWinners,
      storeSocketId: storeSocket?.id,
    });

    setGameState((prev) => {
      const newState = {
        ...prev,
        calledNumbers: storeCalledNumbers,
        currentNumber: storeCurrentNumber,
        hasWonLine: lineWinners.some((w) => w.id === storeSocket?.id),
        hasWonFullHouse: fullHouseWinners.some((w) => w.id === storeSocket?.id),
      };
      console.log('[useGame] ✅ Updated game state', newState);
      return newState;
    });
  }, [storeCalledNumbers, storeCurrentNumber, lineWinners, fullHouseWinners, storeSocket]);

  // Emit card updates
  useEffect(() => {
    if (socket && gameState.card) {
      console.log('[useGame] 📤 Emitting update_card', { roomId, card: gameState.card });
      socket.emit('update_card', { roomId, card: gameState.card });
    } else {
      console.warn('[useGame] 🚫 Skipped update_card emission', {
        hasSocket: !!socket,
        hasCard: !!gameState.card,
      });
    }
  }, [socket, gameState.card, roomId]);

  // Handle cell clicks and win checks
  const handleCellClick = useCallback(
    (index: number) => {
      console.log('[useGame] 🖱️ handleCellClick triggered', { index, isPaused, hasWonFullHouse: gameState.hasWonFullHouse }); // Fix: Use gameState.hasWonFullHouse

      if (gameState.hasWonFullHouse || isPaused) {
        console.warn('[useGame] 🚫 Cell click ignored', {
          hasWonFullHouse: gameState.hasWonFullHouse,
          isPaused,
        });
        return;
      }

      setGameState((prev) => {
        if (!prev.calledNumbers.includes(prev.card[index].number)) {
          console.warn('[useGame] 🚫 Cell number not called', {
            index,
            number: prev.card[index].number,
            calledNumbers: prev.calledNumbers,
          });
          return prev;
        }

        console.log('[useGame] ✅ Processing cell click', { index, number: prev.card[index].number });

        const newCard = [...prev.card];
        newCard[index] = { ...newCard[index], marked: !newCard[index].marked };
        const winResult: WinResult = checkWin(newCard, lineWinClaimed);
        console.log('[useGame] 🏆 Win check result', { winResult, lineWinClaimed });

        const newState = {
          ...prev,
          card: newCard,
          hasWonLine: prev.hasWonLine || winResult.type === 'line',
          hasWonFullHouse: winResult.type === 'full_house',
        };

        // Emit win events
        if (winResult.type === 'line' && !prev.hasWonLine && !lineWinClaimed) {
          console.log('[useGame] 📤 Emitting player_line_won', { roomId });
          socket?.emit('player_line_won', { roomId });
          setHasWonLine(true);
          console.log('[useGame] ✅ Set hasWonLine', { hasWonLine: true });
        } else if (winResult.type === 'full_house' && !prev.hasWonFullHouse) {
          console.log('[useGame] 📤 Emitting player_full_house_won', { roomId });
          socket?.emit('player_full_house_won', { roomId });
          setHasWonFullHouse(true);
          console.log('[useGame] ✅ Set hasWonFullHouse', { hasWonFullHouse: true });
        }

        console.log('[useGame] ✅ New game state after cell click', newState);
        return newState;
      });
    },
    [gameState.hasWonFullHouse, lineWinClaimed, socket, roomId, setHasWonLine, setHasWonFullHouse, isPaused]
  );

  // Host actions
  const unpauseGame = useCallback(() => {
    console.log('[useGame] 📤 Emitting unpause_game', { roomId });
    socket?.emit('unpause_game', { roomId });
  }, [socket, roomId]);

  const callNumber = useCallback(() => {
    console.log('[useGame] 📤 Emitting call_number', { roomId });
    socket?.emit('call_number', { roomId });
  }, [socket, roomId]);

  const startNewGame = useCallback(() => {
    console.log('[useGame] 📤 Emitting new_game', { roomId });
    socket?.emit('new_game', { roomId });

    console.log('[useGame] 🆕 Generating new bingo card');
    const numbers = generateBingoCard();
    const newState = {
      card: numbers.map((number) => ({ number, marked: false })),
      calledNumbers: [],
      currentNumber: null,
      hasWonLine: false,
      hasWonFullHouse: false,
    };
    setGameState(newState);
    console.log('[useGame] ✅ Set new game state', newState);

    console.log('[useGame] 🔄 Resetting game store state');
    useGameStore.setState({
      calledNumbers: [],
      currentNumber: null,
      lineWinners: [],
      fullHouseWinners: [],
      lineWinClaimed: false,
      isPaused: false,
      gameStarted: false,
    });
    console.log('[useGame] ✅ Game store state reset');
  }, [socket, roomId]);

  const toggleAutoPlay = useCallback(() => {
    console.log('[useGame] 📤 Emitting toggle_auto_play', { roomId });
    socket?.emit('toggle_auto_play', { roomId });
  }, [socket, roomId]);

  // Listen for server updates
  useEffect(() => {
    console.log('[useGame] 🔌 Setting up socket listeners', { socketId: socket?.id });

    socket?.on('number_called', ({ currentNumber, calledNumbers }) => {
      console.log('[Socket] 📥 Received number_called', { currentNumber, calledNumbers });
      setGameState((prev) => {
        const newState = { ...prev, currentNumber, calledNumbers };
        console.log('[useGame] ✅ Updated game state for number_called', newState);
        return newState;
      });
      useGameStore.getState().setCalledNumbers(calledNumbers);
      useGameStore.getState().setCurrentNumber(currentNumber);
      console.log('[useGame] ✅ Updated store for number_called', { calledNumbers, currentNumber });
    });

    socket?.on('auto_play_update', ({ autoPlay }) => {
      console.log('[Socket] 📥 Received auto_play_update', { autoPlay });
      setAutoPlay(autoPlay);
      console.log('[useGame] ✅ Set autoPlay', { autoPlay });
    });

    socket?.on('game_paused', () => {
      console.log('[Socket] 📥 Received game_paused');
      useGameStore.getState().setIsPaused(true);
      console.log('[useGame] ✅ Set isPaused', { isPaused: true });
    });

    socket?.on('game_unpaused', () => {
      console.log('[Socket] 📥 Received game_unpaused');
      useGameStore.getState().setIsPaused(false);
      console.log('[useGame] ✅ Set isPaused', { isPaused: false });
    });

    socket?.on('line_winners_proposed', ({ winners }) => {
      console.log('[Socket] 📥 Received line_winners_proposed', { winners });
      useGameStore.getState().setLineWinners(winners);
      console.log('[useGame] ✅ Set lineWinners', { lineWinners: winners });
    });

    socket?.on('line_winners_declared', ({ winners }) => {
      console.log('[Socket] 📥 Received line_winners_declared', { winners });
      useGameStore.getState().setLineWinners(winners);
      useGameStore.getState().setLineWinClaimed(true);
      console.log('[useGame] ✅ Set lineWinners and lineWinClaimed', {
        lineWinners: winners,
        lineWinClaimed: true,
      });
    });

    socket?.on('full_house_winners_proposed', ({ winners }) => {
      console.log('[Socket] 📥 Received full_house_winners_proposed', { winners });
      useGameStore.getState().setFullHouseWinners(winners);
      console.log('[useGame] ✅ Set fullHouseWinners', { fullHouseWinners: winners });
    });

    socket?.on('full_house_winners_declared', ({ winners }) => {
      console.log('[Socket] 📥 Received full_house_winners_declared', { winners });
      useGameStore.getState().setFullHouseWinners(winners);
      console.log('[useGame] ✅ Set fullHouseWinners', { fullHouseWinners: winners });
    });

    return () => {
      console.log('[useGame] 🧹 Cleaning up socket listeners', { socketId: socket?.id });
      socket?.off('number_called');
      socket?.off('auto_play_update');
      socket?.off('game_paused');
      socket?.off('game_unpaused');
      socket?.off('line_winners_proposed');
      socket?.off('line_winners_declared');
      socket?.off('full_house_winners_proposed');
      socket?.off('full_house_winners_declared');
      console.log('[useGame] ✅ Socket listeners removed');
    };
  }, [socket, setAutoPlay]);

  console.log('[useGame] ↩️ Returning game hook values', {
    gameState,
    autoPlay,
    hasSocket: !!socket,
  });

  return {
    gameState,
    autoPlay,
    handleCellClick,
    callNumber,
    startNewGame,
    toggleAutoPlay,
    unpauseGame,
  };
}