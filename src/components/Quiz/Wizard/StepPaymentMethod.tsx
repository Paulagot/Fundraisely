// components/quiz/wizard/StepPaymentMethod.tsx
import { useState, type FC, type FormEvent } from 'react';
import { Wallet, CreditCard, AlertCircle } from 'lucide-react';
import { useQuizConfig } from '../useQuizConfig';
import type { WizardStepProps } from './WizardStepProps';

const StepPaymentMethod: FC<WizardStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const [paymentMethod, setPaymentMethod] = useState<'cash_or_revolut' | 'web3' | ''>(
    config.paymentMethod || ''
  );
  const [entryFee, setEntryFee] = useState(config.entryFee || '');
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol || '€');
  const [error, setError] = useState('');

  const currencyOptions = [
    { symbol: '€', label: 'Euro (EUR)' },
    { symbol: '$', label: 'Dollar' },
    { symbol: '£', label: 'British Pound (GBP)' },
    { symbol: '₹', label: 'Indian Rupee (INR)' },
    { symbol: '¥', label: 'Japanese Yen (JPY)' },];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmed = entryFee.trim();
    const parsed = Number.parseFloat(trimmed);

    if (!paymentMethod) {
      setError('Please choose a payment method.');
      return;
    }

    if (!trimmed || Number.isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid entry fee greater than 0.');
      return;
    }

    const currencyToStore = paymentMethod === 'web3' ? 'USDC' : currencySymbol;

    setError('');
    updateConfig({
      entryFee: trimmed,
      paymentMethod,
      currencySymbol: currencyToStore,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 3 of 7: Entry Fee & Payment Method</h2>

      <div className="grid gap-4">
        <label
          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
            paymentMethod === 'cash_or_revolut'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-400'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cash_or_revolut"
            checked={paymentMethod === 'cash_or_revolut'}
            onChange={() => setPaymentMethod('cash_or_revolut')}
            className="hidden"
          />
          <CreditCard className="h-6 w-6 text-indigo-600" />
          <div>
            <p className="font-medium text-gray-800">Cash or Debit (Revolut)</p>
            <p className="text-sm text-gray-600">You will handle or verify payment manually.</p>
          </div>
        </label>

        <label
          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
            paymentMethod === 'web3'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-400'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="web3"
            checked={paymentMethod === 'web3'}
            onChange={() => setPaymentMethod('web3')}
            className="hidden"
          />
          <Wallet className="h-6 w-6 text-indigo-600" />
          <div>
            <p className="font-medium text-gray-800">Web3 Wallet (USDC)</p>
            <p className="text-sm text-gray-600">Players will pay with crypto via connected wallet.</p>
          </div>
        </label>
      </div>

      {paymentMethod === 'cash_or_revolut' && (
        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium text-gray-700">
            Choose Currency
          </label>
          <select
            id="currency"
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
          >
            {currencyOptions.map((opt) => (
              <option key={opt.symbol} value={opt.symbol}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {paymentMethod && (
        <div className="space-y-2">
          <label htmlFor="entryFee" className="text-sm font-medium text-gray-700">
            Entry Fee ({paymentMethod === 'web3' ? 'USDC' : currencySymbol})
          </label>
          <input
            id="entryFee"
            type="number"
            min="0"
            step="0.01"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            placeholder="e.g., 5"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
          />
        </div>
      )}

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

export default StepPaymentMethod;


