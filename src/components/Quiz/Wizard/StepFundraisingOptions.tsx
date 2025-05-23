import { useState, type FC } from 'react';
import type { FormEvent } from 'react';
import { quizGameTypes } from '../../../constants/quiztypeconstants';
import { useQuizConfig } from './../useQuizConfig';
import type { WizardStepProps } from './WizardStepProps';
import { AlertCircle, CheckCircle } from 'lucide-react';

const StepFundraisingOptions: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const [error, setError] = useState('');

  const selectedType = quizGameTypes.find((t) => t.id === config.gameType);
  const allowedOptions = Object.entries(selectedType?.fundraisingOptions || {});
  const initialOptions = config.fundraisingOptions || {};
  const initialPrices = config.fundraisingPrices || {};
  const currencySymbol = config.currencySymbol || '€';

  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>(
    () =>
      allowedOptions.reduce((acc, [opt]) => {
        acc[opt] = initialOptions[opt] ?? false;
        return acc;
      }, {} as Record<string, boolean>)
  );

  const [priceInputs, setPriceInputs] = useState<Record<string, string>>(
    () =>
      allowedOptions.reduce((acc, [opt]) => {
        acc[opt] = initialPrices[opt]?.toString() || '';
        return acc;
      }, {} as Record<string, string>)
  );

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

    const prices: Record<string, number> = {};
    for (const [key, value] of Object.entries(priceInputs)) {
      if (selectedOptions[key]) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed >= 0) {
          prices[key] = parsed;
        } else {
          setError(`Please enter a valid price for "${key}".`);
          return;
        }
      }
    }

    setError('');
    updateConfig({
      fundraisingOptions: selectedOptions,
      fundraisingPrices: prices,
    });

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 4 of 7: Fundraising Options</h2>
      <p className="text-sm text-gray-600 mb-2">
        Select the fundraising extras you'd like to enable and set a donation amount for each.
      </p>

      <div className="grid gap-5">
        {allowedOptions.map(([option, meta]) => (
          <div key={option} className="space-y-1">
            <label
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
                <span className="capitalize text-gray-800">
                  {option.replace(/([A-Z])/g, ' $1')}
                  <span className="text-xs text-gray-500 ml-2">
                    (Max: {meta.maxPerPlayer}, Use: {meta.usagePhase})
                  </span>
                </span>
              </div>
            </label>

            {selectedOptions[option] && (
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder={`Set price (e.g. ${currencySymbol}2)`}
                value={priceInputs[option]}
                onChange={(e) =>
                  setPriceInputs((prev) => ({
                    ...prev,
                    [option]: e.target.value,
                  }))
                }
                className="mt-2 w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
              />
            )}
          </div>
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


