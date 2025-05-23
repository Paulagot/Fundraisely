import { useState, type FC, type FormEvent } from 'react';
import { useQuizConfig } from '../useQuizConfig';
import type { WizardStepProps } from './WizardStepProps';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

const StepPrizes: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const [error, setError] = useState('');

  const isWeb3 = config.paymentMethod === 'web3';
  const currency = isWeb3 ? 'USDC' : config.currencySymbol || '€';
  const [prizeMode, setPrizeMode] = useState<'split' | 'assets' | 'cash'>(
    isWeb3 ? config.prizeMode || 'split' : 'cash'
  );

  const [splits, setSplits] = useState<Record<number, number>>(config.prizeSplits || { 1: 100 });
  const [prizes, setPrizes] = useState(config.prizes || []);

  const handleSplitChange = (place: number, value: number) => {
    setSplits((prev) => ({ ...prev, [place]: value }));
  };

  const handlePrizeChange = (index: number, field: string, value: string | number) => {
    const updated = [...prizes];
    (updated[index] as any)[field] = value;
    setPrizes(updated);
  };

  const handleAddPrize = () => {
    if (prizes.length >= 10) return;
    setPrizes([...prizes, { place: prizes.length + 1, description: '', value: 0 }]);
  };

  const handleRemovePrize = (index: number) => {
    const updated = [...prizes];
    updated.splice(index, 1);
    setPrizes(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isWeb3 && prizeMode === 'split') {
      const total = Object.values(splits).reduce((acc, val) => acc + val, 0);
      if (!splits[1]) {
        return setError('At least a 1st place split is required.');
      }
      if (total > 100) {
        return setError('Total prize percentage cannot exceed 100%.');
      }
      updateConfig({ prizeMode: 'split', prizeSplits: splits, prizes: [] });
      return onNext();
    }

    if (!prizes.find((p) => p.place === 1)) {
      return setError('At least a 1st place prize must be defined.');
    }

    updateConfig({ prizeMode, prizes, prizeSplits: undefined });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 5 of 7: Prizes</h2>

      {isWeb3 && (
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="prizeMode"
              checked={prizeMode === 'split'}
              onChange={() => setPrizeMode('split')}
            />
            <span>Split the prize pool by %</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="prizeMode"
              checked={prizeMode === 'assets'}
              onChange={() => setPrizeMode('assets')}
            />
            <span>Give away digital assets</span>
          </label>
        </div>
      )}

      {prizeMode === 'split' && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((place) => (
            <div key={place}>
              <label className="text-sm font-medium text-gray-700">
                {place} Place (% of pool)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={splits[place] || ''}
                onChange={(e) => handleSplitChange(place, parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          ))}
        </div>
      )}

      {(prizeMode === 'assets' || prizeMode === 'cash') && (
        <div className="space-y-4">
          {prizes.map((prize, index) => (
            <div key={index} className="border p-4 rounded-xl bg-white shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <strong>{prize.place} Place</strong>
                <button type="button" onClick={() => handleRemovePrize(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <label className="text-sm font-medium text-gray-700">Prize Description</label>
              <input
                type="text"
                value={prize.description || ''}
                onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />

              {prizeMode === 'assets' && (
                <>
                  <label className="text-sm font-medium text-gray-700">Token/Contract Address</label>
                  <input
                    type="text"
                    value={prize.tokenAddress || ''}
                    onChange={(e) => handlePrizeChange(index, 'tokenAddress', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </>
              )}

              <label className="text-sm font-medium text-gray-700">Sponsor (optional)</label>
              <input
                type="text"
                value={prize.sponsor || ''}
                onChange={(e) => handlePrizeChange(index, 'sponsor', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />

              <label className="text-sm font-medium text-gray-700">Value ({currency})</label>
              <input
                type="number"
                min={0}
                value={prize.value || ''}
                onChange={(e) => handlePrizeChange(index, 'value', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          ))}

          {prizes.length < 10 && (
            <button
              type="button"
              onClick={handleAddPrize}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-4 h-4" /> Add Prize
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
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

export default StepPrizes;

