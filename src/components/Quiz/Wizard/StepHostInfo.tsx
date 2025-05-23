// components/quiz/wizard/StepHostInfo.tsx
import { useState, type FC } from 'react';
import type { FormEvent } from 'react';
import { useQuizConfig } from '../useQuizConfig';
import { Users, AlertCircle } from 'lucide-react';
import type { WizardStepProps } from './WizardStepProps';

const StepHostInfo: FC<WizardStepProps> = ({ onNext }) => {
  const { config, updateConfig } = useQuizConfig();
  const [hostName, setHostName] = useState(config.hostName || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = hostName.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Host name must be at least 2 characters.');
      return;
    }

    // Sanitize: remove unsafe characters
    const safeName = trimmedName.replace(/[^a-zA-Z0-9 _-]/g, '');

    updateConfig({ hostName: safeName });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 1 of 7: Host Details</h2>

      <div className="relative">
        <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name 
        </label>
        <input
          id="hostName"
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="e.g., QuizMaster3000"
          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          maxLength={30}
          required
        />
        <Users className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-xl transition"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default StepHostInfo;

