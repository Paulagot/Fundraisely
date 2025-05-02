// src/components/GameHeader.tsx
import type React from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameHeaderProps {
  roomId: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ roomId }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-block p-2 bg-indigo-100 rounded-full mb-4">
        <Gamepad2 className="h-10 w-10 text-indigo-600" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
        FundRaisely Bingo Game Room
      </h1>
      <p className="text-indigo-900/70">
        Room Code: <span className="font-semibold">{roomId}</span>
      </p>
    </div>
  );
};
