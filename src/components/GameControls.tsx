// GameControls.tsx
import { Play, Pause, ArrowLeft, PlayCircle,  CheckCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameControlsProps {
  onToggleAutoPlay: () => void;
  onUnpauseGame: () => void;
  onDeclareLineWinners?: () => void;
  onDeclareFullHouseWinners?: () => void;
  hasWon: boolean;
  autoPlay: boolean;
  isPaused: boolean;
  showDeclarationsButtons?: boolean;
  lineWinners?: Array<{ id: string; name: string }>;
  fullHouseWinners?: Array<{ id: string; name: string }>;
  lineWinClaimed?: boolean;
}

export function GameControls({
  onToggleAutoPlay,
  onUnpauseGame,
  onDeclareLineWinners,
  onDeclareFullHouseWinners,
  hasWon,
  autoPlay,
  isPaused,
  showDeclarationsButtons = false,
  lineWinners = [],
  fullHouseWinners = [],
  lineWinClaimed = false
}: GameControlsProps) {
  const navigate = useNavigate();
  
  const handleReturnToLanding = () => {
    if (window.confirm('Are you sure you want to return to the landing page?')) {
      navigate('/');
    }
  };
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {/* Auto Play Control */}
      <button
        type="button"
        onClick={onToggleAutoPlay}
        disabled={hasWon || isPaused}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {autoPlay ? <Pause size={20} /> : <Play size={20} />}
        {autoPlay ? 'Pause' : 'Auto Play'}
      </button>
      
      {/* Winner Declaration Buttons - Only show when needed */}
      {showDeclarationsButtons && lineWinners.length > 0 && !lineWinClaimed && onDeclareLineWinners && (
        <button
          type="button"
          onClick={onDeclareLineWinners}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
        >
          <CheckCircle size={20} />
          Confirm Line Win & Continue
        </button>
      )}
      
      {showDeclarationsButtons && fullHouseWinners.length > 0 && lineWinClaimed && onDeclareFullHouseWinners && (
        <button
          type="button"
          onClick={onDeclareFullHouseWinners}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md"
        >
          <Award size={20} />
          Confirm Full House Win
        </button>
      )}
      
      {/* Unpause button - only when paused but no winners yet */}
      {isPaused && lineWinners.length === 0 && fullHouseWinners.length === 0 && (
        <button
          type="button"
          onClick={onUnpauseGame}
          disabled={hasWon}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlayCircle size={20} />
          Unpause Game
        </button>
      )}
      
      {/* Return to Landing button */}
      <button
        type="button"
        onClick={handleReturnToLanding}
        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md"
      >
        <ArrowLeft size={20} />
        Return to Landing
      </button>
    </div>
  );
}