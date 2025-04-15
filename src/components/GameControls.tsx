import React from 'react';
import { Play, Pause, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameControlsProps {
  onToggleAutoPlay: () => void;
  hasWon: boolean;
  autoPlay: boolean;
}

export function GameControls({ 
  onToggleAutoPlay,
  hasWon,
  autoPlay 
}: GameControlsProps) {
  const navigate = useNavigate();
  
  const handleReturnToLanding = () => {
    if (window.confirm('Are you sure you want to return to the landing page?')) {
      navigate('/');
    }
  };
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      <button
        type="button"
        onClick={onToggleAutoPlay}
        disabled={hasWon}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {autoPlay ? <Pause size={20} /> : <Play size={20} />}
        {autoPlay ? 'Pause' : 'Auto Play'}
      </button>
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