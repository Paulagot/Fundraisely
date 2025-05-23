// components/quiz/wizard/StepReviewLaunch.tsx
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { useQuizConfig } from '../useQuizConfig';
import { useQuizSocket } from '../useQuizSocket';
import { quizGameTypes } from '../../../constants/quiztypeconstants';
import type { WizardStepProps } from './WizardStepProps';

const StepReviewLaunch: FC<WizardStepProps> = ({ onBack }) => {
  const { config, updateConfig } = useQuizConfig();
  const navigate = useNavigate();
  const socket = useQuizSocket();
  const debug = true;

  const selectedGameType = quizGameTypes.find((type) => type.id === config.gameType);
  const fundraisingEnabled = Object.entries(config.fundraisingOptions || {}).filter(
    ([_, enabled]) => enabled
  );

  useEffect(() => {
    if (!socket) {
      if (debug) console.log('[DEBUG] useQuizSocket returned: null');
      return;
    }

    if (debug) console.log('[DEBUG] useQuizSocket returned:', socket);

    const handleCreated = ({ roomId }: { roomId: string }) => {
      if (debug) console.log('[Socket Received] ✅ quiz_room_created:', roomId);
      navigate(`/host-dashboard/${roomId}`);
    };

    const handleError = ({ message }: { message: string }) => {
      console.error('[Socket Error]', message);
    };

    socket.on('quiz_room_created', handleCreated);
    socket.on('quiz_error', handleError);

    return () => {
      socket.off('quiz_room_created', handleCreated);
      socket.off('quiz_error', handleError);
    };
  }, [socket, navigate]);

  const handleLaunch = () => {
    if (!socket || !socket.connected) {
      console.warn('[Socket] ❌ Socket not connected — cannot emit yet.');
      return;
    }

    const roomId = config.roomId || nanoid(10);
    const updatedConfig = { ...config, roomId };
    const hostId = nanoid(); // Replace with real host ID if available

    updateConfig({ roomId });
    localStorage.setItem(`quiz_config_${roomId}`, JSON.stringify(updatedConfig));

    socket.emit('create_quiz_room', {
      roomId,
      hostId,
      config: updatedConfig,
    });

    if (debug) {
      console.log('[Socket Emit] 🚀 create_quiz_room', {
        roomId,
        hostId,
        config: updatedConfig,
      });
    }

    // 🚫 Do not navigate here — wait for 'quiz_room_created' confirmation
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-indigo-800">Final Step: Review & Launch</h2>
      <p className="text-sm text-gray-600 mb-4">
        Here's a summary of your quiz setup. Go back to edit anything before launching.
      </p>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
        <div>
          <h3 className="font-medium text-gray-700 mb-1">Host Name</h3>
          <p className="text-gray-900">{config.hostName || '—'}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-1">Quiz Format</h3>
          <p className="text-gray-900">{selectedGameType?.name || config.gameType}</p>
          <p className="text-sm text-gray-500">{selectedGameType?.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-700 font-medium mb-1">Rounds</h4>
            <p className="text-gray-900">{config.roundCount ?? '—'}</p>
          </div>
          <div>
            <h4 className="text-gray-700 font-medium mb-1">Time Per Question</h4>
            <p className="text-gray-900">{config.timePerQuestion} seconds</p>
          </div>
          {config.questionsPerRound !== undefined && (
            <div>
              <h4 className="text-gray-700 font-medium mb-1">Questions Per Round</h4>
              <p className="text-gray-900">{config.questionsPerRound}</p>
            </div>
          )}
          {config.startTime && (
            <div>
              <h4 className="text-gray-700 font-medium mb-1">Start Time</h4>
              <p className="text-gray-900">{new Date(config.startTime).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-700 font-medium mb-1">Entry Fee</h4>
            <p className="text-gray-900">
              {config.entryFee
                ? `${config.currencySymbol || '€'}${config.entryFee} to join`
                : 'Free'}
            </p>
          </div>
          <div>
            <h4 className="text-gray-700 font-medium mb-1">Payment Method</h4>
            <p className="text-gray-900">
              {config.paymentMethod === 'web3'
                ? 'Web3 Wallet (USDC)'
                : 'Cash or Debit (Revolut)'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-gray-700 font-medium mb-2">Fundraising Extras</h4>
          {fundraisingEnabled.length > 0 ? (
            <ul className="space-y-1">
              {fundraisingEnabled.map(([key]) => (
                <li key={key} className="text-gray-800">
                  • {key.replace(/([A-Z])/g, ' $1')} —{' '}
                  {config.fundraisingPrices?.[key]
                    ? `${config.currencySymbol || '€'}${config.fundraisingPrices[key]}`
                    : 'No price set'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">None selected</p>
          )}
        </div>

        {config.roomId && (
          <div>
            <h4 className="text-gray-700 font-medium mb-1">Room ID</h4>
            <p className="text-gray-800">{config.roomId}</p>
          </div>
        )}
      </div>

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
          type="button"
          onClick={handleLaunch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-xl transition"
        >
          Launch Dashboard
        </button>
      </div>
    </div>
  );
};

export default StepReviewLaunch;



