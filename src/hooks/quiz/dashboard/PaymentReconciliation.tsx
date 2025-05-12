import React from 'react';
import { usePlayerStore } from '../../../hooks/quiz/usePlayerStore';
import { useQuizConfig } from '../../../hooks/quiz/useQuizConfig';

const PaymentReconciliationPanel: React.FC = () => {
  const { players } = usePlayerStore();
  const { config } = useQuizConfig();

  const entryFee = Number.parseFloat(config.entryFee || '0');
  const totalPlayers = players.length;
  const paidPlayers = players.filter((p) => p.paid);
  const unpaidPlayers = players.filter((p) => !p.paid);

  const expectedTotal = entryFee * totalPlayers;
  const receivedTotal = entryFee * paidPlayers.length;

  const paymentMethods = ['cash', 'revolut', 'web3', 'unknown'] as const;

  const methodBreakdown = paymentMethods.map((method) => ({
    method,
    count: paidPlayers.filter((p) => p.paymentMethod === method).length,
  }));

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Payment Reconciliation</h2>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600 mb-6">
        <div><strong>Entry Fee:</strong> {config.entryFee ? `${entryFee} credits` : 'Free'}</div>
        <div><strong>Total Players:</strong> {totalPlayers}</div>
        <div><strong>Expected Total:</strong> {expectedTotal} credits</div>
        <div><strong>Received Total:</strong> {receivedTotal} credits</div>
      </div>

      {/* Breakdown by payment method */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Breakdown by Payment Method:</h3>
        <ul className="space-y-1 text-gray-600">
          {methodBreakdown.map(({ method, count }) => (
            <li key={method}>
              • {method.charAt(0).toUpperCase() + method.slice(1)}: {count} player{count !== 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      </div>

      {/* Unpaid Players */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">🚩 Unpaid Players:</h3>
        {unpaidPlayers.length === 0 ? (
          <p className="text-green-700">All players are paid. Ready to go! ✅</p>
        ) : (
          <ul className="list-disc list-inside text-red-600 space-y-1">
            {unpaidPlayers.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PaymentReconciliationPanel;
