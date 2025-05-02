// src/components/AccessErrorScreen.tsx
import type React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { GameAccessAlert } from './GameAccessAlert';

interface AccessErrorScreenProps {
  showAccessError: boolean;
  accessErrorMessage: string;
  onClose: () => void;
}

export const AccessErrorScreen: React.FC<AccessErrorScreenProps> = ({
  showAccessError,
  accessErrorMessage,
  onClose,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-indigo-50 to-white">
      <AnimatePresence>
        {showAccessError && (
          <GameAccessAlert message={accessErrorMessage} onClose={onClose} />
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-lg text-indigo-800 font-medium">Initializing game...</p>
      </div>
    </div>
  );
};
