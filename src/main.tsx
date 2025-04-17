import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Web3Provider } from './context/Web3Context';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from './config';

// Payment configuration
const PAYMENT_ADDRESS = '0xb7ACd1159dBed96B955C4d856fc001De9be59844';
const REQUIRED_PAYMENT_AMOUNT = '0.01';

// Create QueryClient for React Query
const queryClient = new QueryClient();

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  projectId,
  metadata,
  networks,
  themeMode: 'light' as const,
  features: {
    analytics: true
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider
          paymentAddress={PAYMENT_ADDRESS}
          requiredPaymentAmount={REQUIRED_PAYMENT_AMOUNT}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Web3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);