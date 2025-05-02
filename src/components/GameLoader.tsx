// src/components/GameLoader.tsx
import type React from 'react';
import { Loader2 } from 'lucide-react';

interface GameLoaderProps {
  isHost: boolean;
}

export const GameLoader: React.FC<GameLoaderProps> = ({ isHost }) => {
  return (
    <div className="flex items-center justify-center h-48 bg-white rounded-2xl shadow-md p-6">
      <div className="text-center">
        <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
        <h2 className="text-xl sm:text-2xl text-gray-700 font-medium px-4">
          Waiting for players to ready up...
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isHost
            ? "The game will start once all players are ready"
            : "Please click 'Ready Up' when you're ready to play"}
        </p>
      </div>
    </div>
  );
};
