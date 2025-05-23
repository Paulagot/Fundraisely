import React from 'react';
import { useQuizConfig } from '../useQuizConfig';
import { Link } from 'react-router-dom';

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
    fundraisingPrices,
    questionsPerRound,
    startTime,
    roomId,
    prizeMode,
    prizeSplits,
    prizes,
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
    <div className="bg-white p-8 rounded-xl shadow-md space-y-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Quiz Setup Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600">
        <div><strong>Host Name:</strong> {hostName || '—'}</div>
        <div><strong>Game Type:</strong> {gameType || '—'}</div>
        <div><strong>Team Based:</strong> {teamBased ? 'Yes' : 'No'}</div>
        <div><strong>Rounds:</strong> {roundCount ?? '—'}</div>
        <div><strong>Time per Question:</strong> {timePerQuestion ? `${timePerQuestion}s` : '—'}</div>
        <div><strong>Questions per Round:</strong> {questionsPerRound ?? '—'}</div>
        <div><strong>Multimedia Enabled:</strong> {useMedia ? 'Yes' : 'No'}</div>
        <div><strong>Entry Fee:</strong> {entryFee || 'Free'}</div>
        <div><strong>Payment Method:</strong> {paymentMethod === 'web3' ? 'Web3 Wallet' : 'Cash or Revolut'}</div>
        {startTime && (
          <div><strong>Start Time:</strong> {new Date(startTime).toLocaleString()}</div>
        )}
        {roomId && (
          <div className="sm:col-span-2">
            <strong>Room ID:</strong> {roomId}
            <br />
            <strong>Join Link:</strong>{' '}
            <Link
              to={`/join/${roomId}`}
              className="text-indigo-600 hover:underline"
            >
              /join/{roomId}
            </Link>
          </div>
        )}
        <div className="sm:col-span-2">
          <strong>Fundraising Extras:</strong>{' '}
          {activeFundraising.length > 0
            ? activeFundraising.map((key) => {
                const price = fundraisingPrices?.[key.toLowerCase().replace(/ /g, '')] ?? '';
                return `${key}${price ? ` (€${price})` : ''}`;
              }).join(', ')
            : 'None selected'}
        </div>

        <div className="sm:col-span-2">
          <strong>Prize Setup:</strong>{' '}
          {prizeMode === 'split' && prizeSplits ? (
            <ul className="list-disc list-inside text-gray-700">
              {Object.entries(prizeSplits).map(([place, percent]) => (
                <li key={place}>
                  {place} place — {percent}%
                </li>
              ))}
            </ul>
          ) : prizeMode === 'assets' && prizes ? (
            <ul className="list-disc list-inside text-gray-700">
              {prizes.map((prize, idx) => (
                <li key={idx}>
                  {prize.place} place — {prize.description} ({prize.value ? `€${prize.value}` : 'no value'}{prize.sponsor ? `, sponsored by ${prize.sponsor}` : ''})
                </li>
              ))}
            </ul>
          ) : prizeMode === 'cash' && prizes ? (
            <ul className="list-disc list-inside text-gray-700">
              {prizes.map((prize, idx) => (
                <li key={idx}>
                  {prize.place} place — {prize.description} ({prize.value ? `€${prize.value}` : 'no value'}{prize.sponsor ? `, sponsored by ${prize.sponsor}` : ''})
                </li>
              ))}
            </ul>
          ) : (
            'None configured'
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupSummaryPanel;

