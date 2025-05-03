import { useState, useCallback, useEffect } from 'react';
import { generateBingoCard, checkWin } from '../utils/gameLogic';
import type { WinResult } from '../utils/gameLogic';
import type { GameState } from '../types/game';
import { useGameStore } from '../store/gameStore';
import type { Socket } from 'socket.io-client';

interface NumberCalledPayload {
  currentNumber: number;
  calledNumbers: number[];
}

interface WinnersPayload {
  winners: { id: string; name: string }[];
}

interface AutoPlayPayload {
  autoPlay: boolean;
}

export function useGame(socket: Socket | null, roomId: string) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const numbers = generateBingoCard();
    return {
      card: numbers.map((number) => ({ number, marked: false })),
      calledNumbers: [],
      currentNumber: null,
      hasWonLine: false,
      hasWonFullHouse: false,
    };
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

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      calledNumbers: storeCalledNumbers,
      currentNumber: storeCurrentNumber,
      hasWonLine: lineWinners.some((w) => w.id === storeSocket?.id),
      hasWonFullHouse: fullHouseWinners.some((w) => w.id === storeSocket?.id),
    }));
  }, [storeCalledNumbers, storeCurrentNumber, lineWinners, fullHouseWinners, storeSocket]);

  useEffect(() => {
    if (socket && gameState.card) {
      socket.emit('update_card', { roomId, card: gameState.card });
    }
  }, [socket, gameState.card, roomId]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (gameState.hasWonFullHouse || isPaused) return;

      setGameState((prev) => {
        if (!prev.calledNumbers.includes(prev.card[index].number)) return prev;

        const newCard = [...prev.card];
        newCard[index] = { ...newCard[index], marked: !newCard[index].marked };
        const winResult: WinResult = checkWin(newCard, lineWinClaimed);

        const newState = {
          ...prev,
          card: newCard,
          hasWonLine: prev.hasWonLine || winResult.type === 'line',
          hasWonFullHouse: winResult.type === 'full_house',
        };

        if (winResult.type === 'line' && !prev.hasWonLine && !lineWinClaimed) {
          socket?.emit('player_line_won', { roomId });
          setHasWonLine(true);
        } else if (winResult.type === 'full_house' && !prev.hasWonFullHouse) {
          socket?.emit('player_full_house_won', { roomId });
          setHasWonFullHouse(true);
        }

        return newState;
      });
    },
    [gameState.hasWonFullHouse, lineWinClaimed, socket, roomId, setHasWonLine, setHasWonFullHouse, isPaused]
  );

  const unpauseGame = useCallback(() => {
    socket?.emit('unpause_game', { roomId });
  }, [socket, roomId]);

  const callNumber = useCallback(() => {
    socket?.emit('call_number', { roomId });
  }, [socket, roomId]);

  const startNewGame = useCallback(() => {
    socket?.emit('new_game', { roomId });
    const numbers = generateBingoCard();
    setGameState({
      card: numbers.map((number) => ({ number, marked: false })),
      calledNumbers: [],
      currentNumber: null,
      hasWonLine: false,
      hasWonFullHouse: false,
    });
    useGameStore.setState({
      calledNumbers: [],
      currentNumber: null,
      lineWinners: [],
      fullHouseWinners: [],
      lineWinClaimed: false,
      isPaused: false,
      gameStarted: false,
    });
  }, [socket, roomId]);

  const toggleAutoPlay = useCallback(() => {
    socket?.emit('toggle_auto_play', { roomId });
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('number_called', ({ currentNumber, calledNumbers }: NumberCalledPayload) => {
      setGameState((prev) => ({ ...prev, currentNumber, calledNumbers }));
      useGameStore.getState().setCalledNumbers(calledNumbers);
      useGameStore.getState().setCurrentNumber(currentNumber);
    });

    socket.on('auto_play_update', ({ autoPlay }: AutoPlayPayload) => {
      setAutoPlay(autoPlay);
    });

    socket.on('game_paused', () => {
      useGameStore.getState().setIsPaused(true);
    });

    socket.on('game_unpaused', () => {
      useGameStore.getState().setIsPaused(false);
    });

    socket.on('line_winners_proposed', ({ winners }: WinnersPayload) => {
      useGameStore.getState().setLineWinners(winners);
    });

    socket.on('line_winners_declared', ({ winners }: WinnersPayload) => {
      useGameStore.getState().setLineWinners(winners);
      useGameStore.getState().setLineWinClaimed(true);
    });

    socket.on('full_house_winners_proposed', ({ winners }: WinnersPayload) => {
      useGameStore.getState().setFullHouseWinners(winners);
    });

    socket.on('full_house_winners_declared', ({ winners }: WinnersPayload) => {
      useGameStore.getState().setFullHouseWinners(winners);
    });

    return () => {
      socket.off('number_called');
      socket.off('auto_play_update');
      socket.off('game_paused');
      socket.off('game_unpaused');
      socket.off('line_winners_proposed');
      socket.off('line_winners_declared');
      socket.off('full_house_winners_proposed');
      socket.off('full_house_winners_declared');
    };
  }, [socket, setAutoPlay]);

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
