import { motion } from 'framer-motion';
import type { BingoCell } from '../types/game';
import { cn } from '../utils/cn';

interface BingoCardProps {
  cells: BingoCell[];
  onCellClick: (index: number) => void;
}

export function BingoCard({ cells, onCellClick }: BingoCardProps) {
  const getColumnCells = (colIndex: number) =>
    Array.from({ length: 5 }, (_, row) => cells[row * 5 + colIndex]);
  
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 p-4 sm:p-6 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto">
      {['B', 'I', 'N', 'G', 'O'].map((letter) => (
        <div
          key={letter}
          className="flex items-center justify-center h-10 sm:h-12 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg sm:text-xl md:text-2xl font-bold rounded-lg"
        >
          {letter}
        </div>
      ))}
      {['B', 'I', 'N', 'G', 'O'].map((_, colIndex) =>
        getColumnCells(colIndex).map((cell, rowIndex) => {
          const index = rowIndex * 5 + colIndex;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCellClick(index)}
              className={cn(
                "h-10 sm:h-12 md:h-16 rounded-lg text-base sm:text-lg md:text-xl font-semibold transition-colors duration-200 shadow",
                cell.marked
                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              )}
            >
              {cell.number}
            </motion.button>
          );
        })
      )}
    </div>
  );
}