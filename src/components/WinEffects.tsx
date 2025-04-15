import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Trophy, Heart, X } from 'lucide-react';

interface WinEffectsProps {
  isWinner: boolean;
  winnerName: string;
}

export function WinEffects({ isWinner, winnerName }: WinEffectsProps) {
  const [showEffect, setShowEffect] = useState(true);

  useEffect(() => {
    if (isWinner) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timer = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isWinner]);

  if (!showEffect) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={`relative flex items-center justify-center gap-4 mb-8 p-6 rounded-xl shadow-lg ${
        isWinner 
          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
          : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800'
      }`}
    >
      {isWinner ? (
        <>
          <Trophy size={36} className="text-yellow-300" />
          <div>
            <h3 className="text-2xl font-bold">You won!</h3>
            <p className="text-white/80">Congratulations on your bingo victory!</p>
          </div>
        </>
      ) : (
        <>
          <Heart size={32} className="text-pink-500" />
          <div>
            <h3 className="text-xl font-medium">{winnerName} won!</h3>
            <p className="text-indigo-600">Better luck next time!</p>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => setShowEffect(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <X size={16} className="opacity-75 hover:opacity-100" />
      </button>
    </motion.div>
  );
}