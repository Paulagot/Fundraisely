// src/components/WinNotification.tsx
import type React from 'react';

interface WinNotificationProps {
  winnerName: string;
  playerName: string;
  winNotificationType: 'line' | 'fullHouse';
  onClose: () => void;
}

export const WinNotification: React.FC<WinNotificationProps> = ({
  winnerName,
  playerName,
  winNotificationType,
  onClose,
}) => {
  const isLine = winNotificationType === 'line';
  const isWinner = winnerName === playerName;

  return (
    <div className={`relative p-4 my-4 rounded-lg ${isLine ? 'bg-indigo-100' : 'bg-green-100'}`}>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
      <div className="flex items-center justify-center">
        <div className={`mr-3 ${isLine ? 'text-indigo-500' : 'text-green-500'}`}>
          {isLine ? '♥' : '🏆'}
        </div>
        <div>
          <h3 className={`font-bold ${isLine ? 'text-indigo-700' : 'text-green-700'}`}>
            {isWinner ? 'You won!' : `${winnerName} won!`}
          </h3>
          <p className={`${isLine ? 'text-indigo-600' : 'text-green-600'}`}>
            {isLine
              ? 'Congratulations on your line win!'
              : 'Congratulations on your bingo victory!'}
          </p>
        </div>
      </div>
    </div>
  );
};
