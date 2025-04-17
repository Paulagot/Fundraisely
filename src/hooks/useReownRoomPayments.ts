import { useState } from 'react';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { useWalletClient } from 'wagmi';
import { parseEther } from 'viem';

// Payment status type
type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed';

// Hook return type
interface UseReownRoomPaymentReturn {
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
 * Custom hook to handle payments for room entry using Reown AppKit
 * 
 * @param paymentAddress Address to send payment to
 * @param amount Amount in ETH to pay (if not provided, uses default)
 * @returns Payment functions and state
 */
export function useReownRoomPayment(
  paymentAddress: string,
  amount?: string
): UseReownRoomPaymentReturn {
  const { address, isConnected } = useAppKitAccount();
  const { data: walletClient } = useWalletClient();
  const { open } = useAppKit(); // For reopening the connection dialog
  
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
    if (!isConnected || !address || !walletClient) {
      setError('Please connect your wallet first');
      
      // If wallet client is missing but user appears connected, try to reconnect
      if (isConnected && address && !walletClient) {
        try {
          open({ view: 'Connect' });
          setError('Please reconnect your wallet to authorize transactions');
        } catch (err) {
          console.error('Error opening wallet dialog:', err);
        }
      }
      
      return { success: false, error: 'Wallet not connected or not authorized' };
    }
    
    try {
      // Start payment
      setPaymentStatus('pending');
      
      // Create transaction data with room info
      const messageText = `Join room: ${roomId}`;
      const hexData = `0x${Buffer.from(messageText).toString('hex')}`;
      
      console.log('Attempting transaction with address:', address);
      console.log('Payment amount:', paymentAmount, 'ETH');
      
      // Send transaction using viem/wagmi with a longer timeout
      const txHash = await Promise.race([
        walletClient.sendTransaction({
          to: paymentAddress as `0x${string}`,
          value: parseEther(paymentAmount),
          data: hexData as `0x${string}`,
          account: address as `0x${string}`, // Explicitly set the account
        }),
        // Timeout after 60 seconds to prevent hanging
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Transaction request timed out')), 60000)
        )
      ]) as `0x${string}`;
      
      console.log('Transaction sent:', txHash);
      
      // Transaction sent successfully
      setPaymentStatus('success');
      setTransactionHash(txHash);
      
      return {
        success: true,
        txHash
      };
    } catch (err) {
      setPaymentStatus('failed');
      console.error('Payment error:', err);
      
      // Extract the error message
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = String(err);
      }
      
      // Handle authorization error specifically
      if (errorMessage.includes('not been authorized') || 
          errorMessage.includes('rejected') || 
          errorMessage.includes('declined')) {
        errorMessage = 'Transaction was not authorized. Please approve the transaction in your wallet.';
        
        // Try to reopen the wallet dialog
        try {
          setTimeout(() => {
            open({ view: 'Connect' });
          }, 1000);
        } catch (dialogErr) {
          console.error('Error reopening wallet dialog:', dialogErr);
        }
      }
      
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