// src/components/WinConfirmation.tsx
import type React from 'react';

interface WinConfirmationProps {
  type: 'line' | 'fullHouse';
  winnerName: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export const WinConfirmation: React.FC<WinConfirmationProps> = ({
  type,
  winnerName,
  onConfirm,
  disabled = false,
}) => {
  const isLine = type === 'line';

  return (
    <div
      className={`${
        isLine ? 'bg-yellow-50 border border-yellow-200' : 'bg-purple-50 border border-purple-200'
      } rounded-lg p-4 my-4`}
    >
      <h3 className={`font-medium ${isLine ? 'text-yellow-800' : 'text-purple-800'} mb-2`}>
        {isLine ? 'Line Win Claimed!' : 'Full House Claimed!'}
      </h3>
      <p className={`${isLine ? 'text-yellow-700' : 'text-purple-700'} mb-3`}>
        {winnerName || 'Player'} claimed a {isLine ? 'line win' : 'full house'}.
      </p>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className={`w-full py-2 px-4 rounded-lg text-white transition-colors ${
          isLine
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-purple-600 hover:bg-purple-700'
        } disabled:opacity-50`}
      >
        {isLine ? 'Confirm Line Win & Continue Game' : 'Confirm Full House Win & End Game'}
      </button>
    </div>
  );
};
