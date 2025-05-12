import React, { useState } from 'react';
import { usePlayerStore } from '../../../hooks/quiz/usePlayerStore';
import { nanoid } from 'nanoid';

const PlayerListPanel: React.FC = () => {
  const { players, addPlayer, togglePaid } = usePlayerStore();
  const [newName, setNewName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'revolut' | 'web3' | 'unknown'>('cash');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPlayer({
      id: nanoid(),
      name: newName.trim(),
      paid: false,
      paymentMethod,
      credits: 0,
    });
    setNewName('');
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Players</h2>

      {/* Add Player */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Player Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500"
        />
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500"
        >
          <option value="cash">Cash</option>
          <option value="revolut">Revolut</option>
          <option value="web3">Web3</option>
          <option value="unknown">Unknown</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
        >
          Add
        </button>
      </div>

      {/* Player List */}
      {players.length === 0 ? (
        <p className="text-gray-600">No players added yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {players.map((player) => (
            <li key={player.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{player.name}</p>
                <p className="text-sm text-gray-500">
                  Payment: {player.paymentMethod} | Status: {player.paid ? '✅ Paid' : '❌ Unpaid'}
                </p>
              </div>
              <button
                onClick={() => togglePaid(player.id)}
                className={`px-4 py-1 rounded-lg text-sm font-medium shadow ${
                  player.paid
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {player.paid ? 'Mark Unpaid' : 'Mark Paid'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerListPanel;
