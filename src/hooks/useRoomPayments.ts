import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

// Payment status type
type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed';

// Hook return type
interface UseRoomPaymentReturn {
  makeRoomPayment: (roomId: string) => Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }>;
  paymentStatus: PaymentStatus;
  transactionHash: string;
  resetPayment: () => void;
  error: string;
}

/**
 * Custom hook to handle payments for room entry
 * 
 * @param amount Amount in ETH to pay (if not provided, uses default)
 * @returns Payment functions and state
 */
export function useRoomPayment(amount?: string): UseRoomPaymentReturn {
  const { isConnected, makePayment } = useWeb3();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Default payment amount
  const paymentAmount = amount || '0.01'; // 0.01 ETH by default

  // Reset payment state
  const resetPayment = () => {
    setPaymentStatus('idle');
    setTransactionHash('');
    setError('');
  };

  // Make payment for room entry
  const makeRoomPayment = async (roomId: string) => {
    // Reset previous error
    setError('');
    
    // Check wallet connection
    if (!isConnected) {
      setError('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // Start payment
      setPaymentStatus('pending');
      
      // Make the payment
      const paymentResult = await makePayment(paymentAmount, roomId);
      
      if (!paymentResult.success) {
        setPaymentStatus('failed');
        setError(paymentResult.error || 'Payment failed');
        return paymentResult;
      }

      // Payment succeeded
      setPaymentStatus('success');
      if (paymentResult.txHash) {
        setTransactionHash(paymentResult.txHash);
      }
      
      return paymentResult;
    } catch (err) {
      setPaymentStatus('failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    makeRoomPayment,
    paymentStatus,
    transactionHash,
    resetPayment,
    error
  };
}