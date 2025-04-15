
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Web3Provider } from './context/Web3Context';

// Payment configuration
const PAYMENT_ADDRESS = '0xb7ACd1159dBed96B955C4d856fc001De9be59844'; // Replace with your address
const REQUIRED_PAYMENT_AMOUNT = '0.01'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider 
      paymentAddress={PAYMENT_ADDRESS}
      requiredPaymentAmount={REQUIRED_PAYMENT_AMOUNT}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3Provider>
  </StrictMode>
);