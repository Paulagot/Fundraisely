import React from 'react';
import { useQuizConfig } from '../../../hooks/quiz/useQuizConfig'; // ✅ Correct import path for Zustand
import SetupSummaryPanel from './SetupSummaryPanel';
import EditableSettingsPanel from './EditableSettingsPanel';
// Placeholder components (create or stub these files)
import PlayerListPanel from './PlayerListPanel';
import CreditTrackerPanel from './CreditTrackerPanel';
import PaymentReconciliationPanel from './PaymentReconciliation';
// import OptionalContractPanel from './OptionalContractPanel';

const HostDashboard: React.FC = () => {
  const { config } = useQuizConfig(); // ✅ Correct destructuring from Zustand

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-10">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎙️ Host Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {config?.hostName || 'Host'} — manage your quiz event below.
          </p>
        </div>

        {/* 1. Quiz Setup Summary */}
        <SetupSummaryPanel />

        {/* 2. Editable Game Settings */}
        <EditableSettingsPanel />

        {/* 3. Player Management */}
        <PlayerListPanel />

        {/* 4. Credit & Fundraising Extras */}
        <CreditTrackerPanel />

        {/* 5. Payment Reconciliation */}
        <PaymentReconciliationPanel />

        {/* 6. Optional Web3 Contract Panel */}
        {/* {config?.paymentMethod === 'web3' && <OptionalContractPanel />} */}
        
      </div>
    </div>
  );
};

export default HostDashboard;
