import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface GameAccessAlertProps {
  message: string;
  onClose: () => void;
}

export function GameAccessAlert({ message, onClose }: GameAccessAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-3 px-6 py-4 bg-red-100 text-red-800 rounded-xl shadow-lg border border-red-200">
        <AlertCircle className="w-5 h-5" />
        <p className="font-medium">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}