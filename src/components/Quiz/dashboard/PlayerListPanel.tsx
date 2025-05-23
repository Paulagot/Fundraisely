import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayerStore } from '../usePlayerStore';
import { useQuizConfig } from '../useQuizConfig';
import { QRCodeCanvas } from 'qrcode.react';
import { nanoid } from 'nanoid';
import { useQuizSocket } from '../useQuizSocket';

const PlayerListPanel: React.FC = () => {
  const { config } = useQuizConfig();
  const { roomId } = useParams();
  const { players, addPlayer, togglePaid } = usePlayerStore();
  const [newName, setNewName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'revolut' | 'web3' | 'unknown'>('cash');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const socket = useQuizSocket();
  const debug = true;

  const emitPlayersUpdate = () => {
    if (!roomId || !players.length || !socket?.connected) return;

    // Verify room exists before emitting
    socket.emit('verify_quiz_room', { roomId });
    socket.once('quiz_room_verification_result', ({ exists }) => {
      if (exists) {
        socket.emit('add_player', { roomId, players });
        if (debug) console.log('[Socket Emit] add_player', players);
      } else {
        if (debug) console.warn(`[Socket Emit] ❌ Cannot add_player - room ${roomId} not found`);
      }
    });
  };

  const handleAdd = () => {
    if (!newName.trim() || !roomId) return;
    addPlayer(
      {
        id: nanoid(),
        name: newName.trim(),
        paid: false,
        paymentMethod,
        credits: 0,
      },
      roomId
    );
    setNewName('');
  };

  useEffect(() => {
    if (players.length > 0 && socket?.connected && roomId) {
      emitPlayersUpdate();
    }
  }, [players, socket?.connected, roomId]);

  const isWeb3 = config.paymentMethod === 'web3';
  const baseJoinUrl = `${window.location.origin}/join/${roomId}`;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Players</h2>

      {!isWeb3 && (
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
      )}

      {players.length === 0 ? (
        <p className="text-gray-600">No players {isWeb3 ? 'have joined yet.' : 'added yet.'}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {players.map((player) => {
            const joinLink = `${baseJoinUrl}?playerId=${player.id}`;
            const isShowingQR = selectedPlayerId === player.id;

            return (
              <li key={player.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-500">
                    Payment: {player.paymentMethod} | Status: {player.paid ? '✅ Paid' : '❌ Unpaid'}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {!isWeb3 && (
                    <button
                      onClick={() => togglePaid(player.id, roomId || '')}
                      className={`px-4 py-1 rounded-lg text-sm font-medium shadow ${
                        player.paid
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {player.paid ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPlayerId(isShowingQR ? null : player.id)}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    🔗 Invite
                  </button>
                </div>

                {isShowingQR && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    <QRCodeCanvas value={joinLink} size={128} />
                    <p className="mt-2 text-xs text-gray-500 break-all">{joinLink}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(joinLink);
                      }}
                      className="text-indigo-600 text-xs mt-1 hover:underline"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PlayerListPanel;



