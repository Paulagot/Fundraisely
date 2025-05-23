import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizConfig } from '../useQuizConfig';
import { usePlayerStore } from '../usePlayerStore';

import SetupSummaryPanel from './SetupSummaryPanel';
import PlayerListPanel from './PlayerListPanel';
import FundraisingExtrasPanel from './FundraisingExtrasPanel';
import PaymentReconciliationPanel from './PaymentReconciliation';

import HostGameControls from '../game/GameControls';

const HostDashboard: React.FC = () => {
  const { config, updateConfig, resetConfig } = useQuizConfig();
  const { resetPlayers, loadPlayersFromStorage } = usePlayerStore(); // ✅ import load method
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ✅ Load config and players from localStorage if Zustand is empty
useEffect(() => {
  if (!roomId) return;

  // Load config if Zustand is empty or mismatched
  if (!config.roomId || config.roomId !== roomId) {
    const storedConfig = localStorage.getItem(`quiz_config_${roomId}`);
    if (storedConfig) {
      updateConfig(JSON.parse(storedConfig));
    } else {
      console.warn('No quiz config found in localStorage for room:', roomId);
      navigate('/');
    }
  }

  // Always attempt to load players (Zustand resets on refresh)
  loadPlayersFromStorage(roomId);
}, [roomId]);


  const handleCancelQuiz = () => {
    resetConfig();
    resetPlayers();
    if (roomId) {
      localStorage.removeItem(`quiz_config_${roomId}`);
      localStorage.removeItem(`players_${roomId}`); // ✅ Clear players too
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-10">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎙️ Host Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {config?.hostName || 'Host'} — manage your quiz event below.
          </p>
        </div>

        <SetupSummaryPanel />
        <PlayerListPanel />
        <FundraisingExtrasPanel />
        <PaymentReconciliationPanel />
        <HostGameControls />
    

        <div className="text-center pt-8">
          <button
            onClick={handleCancelQuiz}
            className="bg-red-100 text-red-700 px-6 py-2 rounded-xl font-medium hover:bg-red-200 transition"
          >
            ❌ Cancel Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;



