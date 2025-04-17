import { renderHook, act } from '@testing-library/react';
import { useGame } from '../src/hooks/useGame';
import { useGameStore } from '../src/store/gameStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gameLogic from '../src/utils/gameLogic';

// Mock socket
const fakeSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({
    calledNumbers: [],
    currentNumber: null,
    lineWinners: [],
    fullHouseWinners: [],
    lineWinClaimed: false,
    socket: fakeSocket,
  });
});

describe('useGame', () => {
  it('should initialize gameState with 25 cells', () => {
    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));
    expect(result.current.gameState.card).toHaveLength(25);
  });

  it('should not mark uncalled number', () => {
    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));
    act(() => result.current.handleCellClick(0));
    expect(result.current.gameState.card[0].marked).toBe(false);
  });

  it('does not mark cell if number has not been called', () => {
    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));
    act(() => result.current.handleCellClick(0));
    expect(result.current.gameState.card[0].marked).toBe(false);
  });

  it('marks cell if number is in calledNumbers', () => {
    const validCardNumbers = [
      15, 8, 10, 9, 1,      // B
      21, 24, 16, 27, 17,   // I
      32, 40, 42, 35, 45,   // N
      60, 51, 57, 54, 58,   // G
      73, 69, 65, 64, 67    // O
    ];
    vi.spyOn(gameLogic, 'generateBingoCard').mockReturnValue(validCardNumbers);

    const calledNumber = validCardNumbers[0];
    useGameStore.setState({ calledNumbers: [calledNumber], currentNumber: calledNumber });

    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));
    const index = result.current.gameState.card.findIndex(cell => cell.number === calledNumber);

    if (index === -1) throw new Error('No matching number on the card');

    act(() => {
      result.current.handleCellClick(index);
    });

    expect(result.current.gameState.card[index].marked).toBe(true);
  });

  it('emits player_line_won when line is completed', () => {
    const winningLine = [15, 8, 10, 9, 1];
    const mockCardNumbers = [
      ...winningLine,
      21, 24, 16, 27, 17,
      32, 40, 42, 35, 45,
      60, 51, 57, 54, 58,
      73, 69, 65, 64, 67
    ];
    vi.spyOn(gameLogic, 'generateBingoCard').mockReturnValue(mockCardNumbers);

    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));

    act(() => {
      useGameStore.setState({
        calledNumbers: winningLine,
        currentNumber: winningLine[winningLine.length - 1],
        lineWinners: [],
        fullHouseWinners: [],
        lineWinClaimed: false,
        socket: fakeSocket,
      });

      [0, 1, 2, 3, 4].forEach(index => {
        result.current.handleCellClick(index);
      });
    });

    const calls = fakeSocket.emit.mock.calls;
    const lineWinCall = calls.find(([event]) => event === 'player_line_won');

    expect(lineWinCall).toBeDefined();
    expect(lineWinCall[1]).toMatchObject({ roomId: 'room1' });
  });

  it('resets state and emits new_game when startNewGame is called', () => {
    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));
    act(() => {
      result.current.startNewGame();
    });

    expect(fakeSocket.emit).toHaveBeenCalledWith('new_game', { roomId: 'room1' });
    expect(result.current.gameState.card.length).toBe(25);
    expect(useGameStore.getState().lineWinners).toEqual([]);
  });

  it('emits toggle_auto_play when toggleAutoPlay is called', () => {
    const { result } = renderHook(() => useGame(fakeSocket, 'room1'));
    act(() => {
      result.current.toggleAutoPlay();
    });

    expect(fakeSocket.emit).toHaveBeenCalledWith('toggle_auto_play', { roomId: 'room1' });
  });
});
