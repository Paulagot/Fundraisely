import { Crown, User, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Player } from '../types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  onToggleReady?: () => void;
  onStartGame?: () => void;
  gameStarted: boolean;
}

export function PlayerList({ 
  players, 
  currentPlayerId, 
  onToggleReady,
  onStartGame,
  gameStarted 
}: PlayerListProps) {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const allPlayersReady = players.every(p => p.isReady);
  const readyCount = players.filter(p => p.isReady).length;
  const isSinglePlayer = players.length === 1;
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">Players</h2>
        <div className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100">
          <span className="text-sm text-indigo-800 font-medium">
            {readyCount}/{players.length} Ready
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-5 sm:mb-6 max-h-64 overflow-y-auto pr-1">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl ${
              player.id === currentPlayerId ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {player.isHost ? (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                </div>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
              )}
              <span className="text-sm sm:text-base font-medium text-gray-800">
                {player.name}
                {player.id === currentPlayerId && ' (You)'}
              </span>
            </div>
            
            {player.isReady ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                <span className="text-xs text-gray-400">Waiting</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {!gameStarted && (
        <div className="space-y-3">
          {currentPlayer && !currentPlayer.isHost && !isSinglePlayer && (
            <button
              type="button"
              onClick={onToggleReady}
              className={`w-full py-2.5 px-4 rounded-xl text-sm sm:text-base font-medium transition-all shadow-md ${
                currentPlayer.isReady
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
              }`}
            >
              {currentPlayer.isReady ? 'Cancel Ready' : 'Ready Up'}
            </button>
          )}
          
          {currentPlayer?.isHost && (
            <button
              type="button"
              onClick={onStartGame}
              disabled={!isSinglePlayer && !allPlayersReady}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm sm:text-base font-medium
                         hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isSinglePlayer ? 'Start Solo Game' : 'Start Game'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}