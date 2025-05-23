import React from 'react';
import { usePlayerStore } from '../usePlayerStore';
import { useQuizConfig } from '../useQuizConfig';

const PaymentReconciliationPanel: React.FC = () => {
  const { players } = usePlayerStore();
  const { config } = useQuizConfig();

  const currency = config.currencySymbol || '€';
  const entryFee = parseFloat(config.entryFee || '0');
  const isWeb3 = config.paymentMethod === 'web3';

  const paidPlayers = players.filter((p) => p.paid);
  const unpaidPlayers = players.filter((p) => !p.paid);
  const totalPlayers = players.length;

  const extrasEnabled = config.fundraisingOptions || {};
  const extrasPrices = config.fundraisingPrices || {};

  // Build per-method totals
  const paymentData: Record<
    string,
    { entry: number; extras: number; total: number }
  > = {};

  for (const player of players) {
    const method = player.paymentMethod || 'unknown';

    if (player.paid) {
      if (!paymentData[method]) {
        paymentData[method] = { entry: 0, extras: 0, total: 0 };
      }
      paymentData[method].entry += entryFee;
    }

    if (player.extraPayments) {
      for (const [, val] of Object.entries(player.extraPayments)) {
        const extraMethod = val.method || 'unknown';
        const amount = val.amount || 0;

        if (!paymentData[extraMethod]) {
          paymentData[extraMethod] = { entry: 0, extras: 0, total: 0 };
        }

        paymentData[extraMethod].extras += amount;
      }
    }
  }

  // Finalize totals per method
  for (const method in paymentData) {
    const data = paymentData[method];
    data.total = data.entry + data.extras;
  }

  // Calculate global totals
  const totalEntryReceived = paidPlayers.length * entryFee;
  const totalExtrasReceived = Object.values(paymentData).reduce(
    (sum, val) => sum + val.extras,
    0
  );
  const totalReceived = totalEntryReceived + totalExtrasReceived;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        💰 Payment Reconciliation
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600 mb-6">
        <div>
          <strong>Entry Fee:</strong> {entryFee ? `${currency}${entryFee}` : 'Free'}
        </div>
        <div>
          <strong>Total Players:</strong> {totalPlayers}
        </div>
        <div>
          <strong>Expected Entry:</strong> {currency}
          {(entryFee * totalPlayers).toFixed(2)}
        </div>
        <div>
          <strong>Received Entry:</strong> {currency}
          {totalEntryReceived.toFixed(2)}
        </div>
        <div>
          <strong>Received Extras:</strong> {currency}
          {totalExtrasReceived.toFixed(2)}
        </div>
        <div className="font-semibold text-gray-800">
          <strong>Total Received:</strong> {currency}
          {totalReceived.toFixed(2)}
        </div>
      </div>

      {/* Table Breakdown */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">
          Breakdown by Payment Method:
        </h3>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm text-gray-700 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Payment Method</th>
                <th className="px-4 py-2 border">Entry Fees</th>
                <th className="px-4 py-2 border">Extras</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(paymentData).map(([method, data]) => (
                <tr key={method}>
                  <td className="px-4 py-2 border capitalize">{method}</td>
                  <td className="px-4 py-2 border">
                    {currency}
                    {data.entry.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {currency}
                    {data.extras.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {currency}
                    {data.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">
                    {totalReceived > 0
                      ? `${((data.total / totalReceived) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-2 border">Total</td>
                <td className="px-4 py-2 border">{currency}{totalEntryReceived.toFixed(2)}</td>
                <td className="px-4 py-2 border">{currency}{totalExtrasReceived.toFixed(2)}</td>
                <td className="px-4 py-2 border">{currency}{totalReceived.toFixed(2)}</td>
                <td className="px-4 py-2 border">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Unpaid Players */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">
          🚩 Unpaid Players (Entry):
        </h3>
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



