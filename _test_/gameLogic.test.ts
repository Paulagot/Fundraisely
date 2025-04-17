import { generateBingoCard, getLetterForNumber, checkWin } from '../src/utils/gameLogic';
import type { BingoCell } from '../src/types/game';

function createMarkedCard(markedIndexes: number[]): BingoCell[] {
  return Array.from({ length: 25 }, (_, i) => ({
    number: i + 1,
    marked: markedIndexes.includes(i),
  }));
}

describe('generateBingoCard', () => {
  it('should generate 25 unique numbers', () => {
    const card = generateBingoCard();
    const unique = new Set(card);
    expect(card.length).toBe(25);
    expect(unique.size).toBe(25);
  });

  it('should use correct ranges per column', () => {
    const card = generateBingoCard();
    for (let col = 0; col < 5; col++) {
      const min = col * 15 + 1;
      const max = min + 14;
      const column = card.slice(col * 5, col * 5 + 5);
      for (const num of column) {
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
      }
    }
  });
});

describe('getLetterForNumber', () => {
  it('returns correct letters', () => {
    expect(getLetterForNumber(7)).toBe('B');
    expect(getLetterForNumber(28)).toBe('I');
    expect(getLetterForNumber(44)).toBe('N');
    expect(getLetterForNumber(59)).toBe('G');
    expect(getLetterForNumber(70)).toBe('O');
  });

  it('returns empty string for invalid number', () => {
    expect(getLetterForNumber(0)).toBe('');
    expect(getLetterForNumber(100)).toBe('');
  });
});

it('never includes out-of-range numbers in a column', () => {
  const card = generateBingoCard();
  for (let col = 0; col < 5; col++) {
    const rangeMin = col * 15 + 1;
    const rangeMax = rangeMin + 14;
    const columnNumbers = card.slice(col * 5, col * 5 + 5);
    for (const num of columnNumbers) {
      expect(num).toBeGreaterThanOrEqual(rangeMin);
      expect(num).toBeLessThanOrEqual(rangeMax);
    }
  }
});

it('generates unique cards without duplicates (stress test)', () => {
  for (let i = 0; i < 1000; i++) {
    const card = generateBingoCard();
    const unique = new Set(card);
    expect(unique.size).toBe(25);
  }
});

it('does not falsely detect incomplete row as win', () => {
  const card = createMarkedCard([0, 1, 2, 3]); // missing one cell
  const result = checkWin(card, false);
  expect(result.type).toBe('none');
});

it('does not detect full house when one cell is unmarked', () => {
  const card = createMarkedCard([...Array(24).keys()]); // 0–23 marked, 24 not
  const result = checkWin(card, true);
  expect(result.type).toBe('none');
});

it('detects diagonal win from top-left to bottom-right', () => {
  const card = createMarkedCard([0, 6, 12, 18, 24]);
  const result = checkWin(card, false);
  expect(result.type).toBe('line');
  expect(result.pattern).toEqual([0, 6, 12, 18, 24]);
});

it('detects one line win even with multiple patterns', () => {
  const card = createMarkedCard([
    0, 1, 2, 3, 4,   // row
    0, 5, 10, 15, 20 // column
  ]);
  const result = checkWin(card, false);
  expect(result.type).toBe('line');
});

it('returns none if card has fewer than 25 cells', () => {
  const shortCard = createMarkedCard([0, 1, 2]); // Only 3 cells
  const result = checkWin(shortCard, false);
  expect(result.type).toBe('none');
});

// Removed duplicate import for 'checkWin'

const patterns = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

patterns.forEach((pattern, idx) => {
  it(`detects winning pattern ${idx + 1}`, () => {
    const card = Array.from({ length: 25 }, (_, i) => ({
      number: i + 1,
      marked: pattern.includes(i),
    }));
    const result = checkWin(card, false);
    expect(result.type).toBe('line');
  });
});

it('generates sorted columns', () => {
  const card = generateBingoCard();
  for (let i = 0; i < 5; i++) {
    const column = card.slice(i * 5, i * 5 + 5);
    const sorted = [...column].sort((a, b) => a - b);
    expect(column).toEqual(sorted);
  }
});

it('never returns incorrect column letter for valid number', () => {
  for (let i = 1; i <= 75; i++) {
    const letter = getLetterForNumber(i);
    expect(['B', 'I', 'N', 'G', 'O']).toContain(letter);
  }
});
