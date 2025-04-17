// GameOverScreen.tsx
import { useNavigate } from 'react-router-dom';
import { Trophy, Home, Gamepad2 } from 'lucide-react';

interface GameOverScreenProps {
  lineWinners: Array<{ id: string; name: string }>;
  fullHouseWinners: Array<{ id: string; name: string }>;
  onStartNewGame?: () => void;
  isHost: boolean;
}

export function GameOverScreen({ 
  lineWinners, 
  fullHouseWinners, 
  onStartNewGame,
  isHost
}: GameOverScreenProps) {
  const navigate = useNavigate();
  
  const handleReturnToLobby = () => {
    navigate('/');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
          <Trophy className="h-12 w-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h1>
        <p className="text-gray-600">Thank you for playing FundRaisely Bingo</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Winners</h2>
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-indigo-800 mb-2">Line Winners</h3>
          {lineWinners.length > 0 ? (
            <ul className="list-disc list-inside">
              {lineWinners.map(winner => (
                <li key={winner.id} className="text-indigo-600">{winner.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No line winners</p>
          )}
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-medium text-purple-800 mb-2">Full House Winners</h3>
          {fullHouseWinners.length > 0 ? (
            <ul className="list-disc list-inside">
              {fullHouseWinners.map(winner => (
                <li key={winner.id} className="text-purple-600">{winner.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No full house winners</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {isHost && onStartNewGame && (
          <button
            type="button"
            onClick={onStartNewGame}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Gamepad2 className="h-5 w-5" />
            Start New Game
          </button>
        )}
        <button
          type="button"
          onClick={handleReturnToLobby}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md flex items-center justify-center gap-2"
        >
        
          <Home className="h-5 w-5" />
          Return to Lobby
        </button>
      </div>
    </div>
  );
}