// components/quiz/wizard/StepReviewLaunch.tsx
import type { FC } from 'react';
import { useQuizConfig } from '../../../hooks/quiz/useQuizConfig';
import type { WizardStepProps } from './WizardStepProps';
import { useNavigate } from 'react-router-dom';

const StepReviewLaunch: FC<Pick<WizardStepProps, 'onBack'>> = ({ onBack }) => {
  const { config } = useQuizConfig();
  const navigate = useNavigate();

  const {
    hostName,
    gameType,
    entryFee,
    paymentMethod,
    fundraisingOptions = {},
  } = config;

  const handleContinue = () => {
    // ⚠️ Later: You might want to POST this config to your backend here
    navigate('/host-dashboard'); // or `/dashboard/${generatedId}`
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Step 5 of 5: Review Your Quiz Setup</h2>
      <p className="text-sm text-gray-600 mb-4">Please confirm your quiz details before continuing.</p>

      <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm text-gray-800">
        <div>
          <span className="font-medium">Host Name:</span> {hostName || '—'}
        </div>
        <div>
          <span className="font-medium">Quiz Type:</span> {gameType || '—'}
        </div>
        <div>
          <span className="font-medium">Entry Fee:</span> {entryFee ? `${entryFee} credits` : '—'}
        </div>
        <div>
          <span className="font-medium">Payment Method:</span>{' '}
          {paymentMethod === 'web3'
            ? 'Web3 Wallet (USDC)'
            : paymentMethod === 'cash_or_revolut'
            ? 'Cash or Revolut'
            : '—'}
        </div>
        <div>
          <span className="font-medium">Fundraising Options Enabled:</span>{' '}
          {Object.entries(fundraisingOptions)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1'))
            .join(', ') || 'None'}
        </div>
      </div>

      <div className="flex justify-between mt-6">
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
          type="button"
          onClick={handleContinue}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-xl transition"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StepReviewLaunch;
