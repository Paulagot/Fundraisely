import type React from 'react';
import { useQuizConfig } from '../../../hooks/quiz/useQuizConfig';

const SetupSummaryPanel: React.FC = () => {
  const { config } = useQuizConfig();

  if (!config) return null;

  const {
    hostName,
    gameType,
    teamBased,
    roundCount,
    timePerQuestion,
    useMedia,
    entryFee,
    paymentMethod,
    fundraisingOptions,
  } = config;

  const activeFundraising = fundraisingOptions
    ? Object.entries(fundraisingOptions)
        .filter(([_, enabled]) => enabled)
        .map(([key]) =>
          key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase())
        )
    : [];

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Quiz Setup Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600">
        <div><strong>Host Name:</strong> {hostName || '—'}</div>
        <div><strong>Game Type:</strong> {gameType || '—'}</div>
        <div><strong>Team Based:</strong> {teamBased ? 'Yes' : 'No'}</div>
        <div><strong>Rounds:</strong> {roundCount ?? '—'}</div>
        <div><strong>Time per Question:</strong> {timePerQuestion ? `${timePerQuestion}s` : '—'}</div>
        <div><strong>Multimedia Enabled:</strong> {useMedia ? 'Yes' : 'No'}</div>
        <div><strong>Entry Fee:</strong> {entryFee || 'Free'}</div>
        <div><strong>Payment Method:</strong> {paymentMethod === 'web3' ? 'Web3 Wallet' : 'Cash or Revolut'}</div>
        <div className="sm:col-span-2">
          <strong>Fundraising Extras:</strong>{' '}
          {activeFundraising.length > 0
            ? activeFundraising.join(', ')
            : 'None selected'}
        </div>
      </div>
    </div>
  );
};

export default SetupSummaryPanel;
