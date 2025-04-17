import { motion, AnimatePresence } from 'framer-motion';
import { getLetterForNumber } from '../utils/gameLogic';


interface NumberCallerProps {
  currentNumber: number | null;
  calledNumbers: number[];
  autoPlay: boolean;
}

export function NumberCaller({ currentNumber, calledNumbers, autoPlay }: NumberCallerProps) {
  return (
    <div className="text-center space-y-4 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">Current Number</h2>
      
      <div className="min-h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentNumber ? (
            <motion.div
              key={currentNumber}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="text-xl sm:text-2xl text-indigo-600 font-medium">
                {getLetterForNumber(currentNumber)}
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {currentNumber}
              </div>
            </motion.div>
          ) : (
            <div className="text-gray-400 italic">Waiting for numbers...</div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center">
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100">
          <span className="text-sm font-medium mr-2 text-indigo-800">Auto-Play:</span>
          <div className="flex items-center gap-1">
            {autoPlay ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-600 font-medium">ON</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-red-600 font-medium">OFF</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Last 10 Numbers</h3>
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
          {calledNumbers.length > 0 ? (
            calledNumbers.slice(-10).map((number) => (
              <div
                key={number}
                className="w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center bg-indigo-50 rounded-lg text-sm shadow-sm"
              >
                <span className="text-xs text-indigo-600">{getLetterForNumber(number)}</span>
                <span className="font-medium text-indigo-900">{number}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 italic">No numbers called yet</div>
          )}
        </div>
      </div>
    </div>
  );
}