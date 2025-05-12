// components/quiz/wizard/StepFundraisingOptions.tsx
import { useState, type FC } from 'react';
import type { FormEvent } from 'react';
import { quizGameTypes } from '../../../constants/quiztypeconstants';
import { useQuizConfig } from '../../../hooks/quiz/useQuizConfig';
import type { WizardStepProps } from './WizardStepProps';
import { AlertCircle, CheckCircle } from 'lucide-react';

const StepFundraisingOptions: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const [error, setError] = useState('');

  const selectedType = quizGameTypes.find((t) => t.id === config.gameType);

  const allowedOptions = selectedType?.fundraisingOptions || [];
const initial = config.fundraisingOptions || {};

// ✅ Hook now called unconditionally
const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(() => {
  return allowedOptions.reduce((acc, opt) => {
    acc[opt] = initial[opt as keyof typeof initial] ?? false;
    return acc;
  }, {} as Record<string, boolean>);
});

if (!selectedType) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
      <p>Something went wrong. Please go back and choose a quiz type again.</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-4 rounded-lg text-sm"
      >
        Back
      </button>
    </div>
  );
}


  const handleToggle = (option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No required field — just update and continue
    updateConfig({ fundraisingOptions: selectedOptions });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 3 of 5: Fundraising Options</h2>
      <p className="text-sm text-gray-600 mb-2">
        Select the fundraising extras you'd like to enable for this quiz. These can boost donations!
      </p>

      <div className="grid gap-3">
        {allowedOptions.map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
              selectedOptions[option]
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedOptions[option]}
              onChange={() => handleToggle(option)}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {selectedOptions[option] ? (
                <CheckCircle className="h-5 w-5 text-indigo-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-gray-300" />
              )}
              <span className="capitalize text-gray-800">{option.replace(/([A-Z])/g, ' $1')}</span>
            </div>
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

export default StepFundraisingOptions;
