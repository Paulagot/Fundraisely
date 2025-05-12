import React from 'react';
import { usePlayerStore } from '../../../hooks/quiz/usePlayerStore';

const CreditTrackerPanel: React.FC = () => {
  const { players, adjustCredits } = usePlayerStore();

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Credit Tracker</h2>

      {players.length === 0 ? (
        <p className="text-gray-600">No players to manage credits for.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {players.map((player) => (
            <li key={player.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="font-medium text-gray-800">{player.name}</p>
                <p className="text-sm text-gray-500">Credits: {player.credits}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => adjustCredits(player.id, 1)}
                  className="bg-green-100 text-green-700 px-4 py-1 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                >
                  +1 Credit
                </button>
                <button
                  onClick={() => adjustCredits(player.id, -1)}
                  className="bg-red-100 text-red-700 px-4 py-1 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                >
                  -1 Credit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreditTrackerPanel;
