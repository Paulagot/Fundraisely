// components/quiz/wizard/StepGameType.tsx
import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { quizGameTypes } from '../../../constants/quiztypeconstants';
import { useQuizConfig } from '../useQuizConfig';
import type { WizardStepProps } from './WizardStepProps';
import { AlertCircle } from 'lucide-react';

const StepGameType: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const [selectedType, setSelectedType] = useState(config.gameType || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      setError('Please select a quiz type to continue.');
      return;
    }

    const selected = quizGameTypes.find((g) => g.id === selectedType);
    if (!selected) {
      setError('Invalid quiz type selected.');
      return;
    }

    updateConfig({
      gameType: selected.id,
      teamBased: selected.defaultConfig.teamBased ?? false,
      roundCount: selected.defaultConfig.roundCount ?? 0,
      timePerQuestion: selected.defaultConfig.timePerQuestion ?? 30,
      useMedia: selected.defaultConfig.useMedia ?? false,
      fundraisingOptions: {},
    });

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 2 of 7: Choose Quiz Type</h2>

      <div className="grid gap-4">
        {quizGameTypes.map((type) => (
          <label
            key={type.id}
            className={`block p-4 rounded-lg border-2 transition cursor-pointer ${
              selectedType === type.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-400'
            }`}
          >
            <input
              type="radio"
              name="quizType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={() => {
                setSelectedType(type.id);
                setError('');
              }}
              className="hidden"
            />
            <div className="font-medium text-indigo-800">{type.name}</div>
            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
          </label>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-xl transition"
          >
            Back
          </button>
        )}
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

export default StepGameType;
