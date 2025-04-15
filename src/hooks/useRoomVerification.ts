// src/hooks/useRoomVerification.ts

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

type VerificationStatus = 'idle' | 'checking' | 'exists' | 'not_exists' | 'error';

interface UseRoomVerificationReturn {
  verifyRoom: (roomId: string) => Promise<boolean>;
  status: VerificationStatus;
  error: string;
}

/**
 * Hook for verifying if a room exists before joining
 */
export function useRoomVerification(): UseRoomVerificationReturn {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string>('');
  const [verificationSocket, setVerificationSocket] = useState<Socket | null>(null);

  // Initialize socket connection for verification only
  useEffect(() => {
    // Create a separate socket just for room verification to avoid conflicts
    const socket = io(SOCKET_URL, { autoConnect: false });
    setVerificationSocket(socket);

    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  // Verify room exists function
  const verifyRoom = useCallback(async (roomId: string): Promise<boolean> => {
    if (!verificationSocket) {
      setError('Verification service not available');
      setStatus('error');
      return false;
    }

    return new Promise((resolve) => {
      setStatus('checking');
      setError('');

      // Connect socket if not already connected
      if (!verificationSocket.connected) {
        verificationSocket.connect();
      }

      // Set timeout for verification
      const timeoutId = setTimeout(() => {
        setError('Verification timed out');
        setStatus('error');
        resolve(false);
      }, 5000);

      // Listen for verification result
      const handleVerificationResult = (data: { roomId: string; exists: boolean }) => {
        if (data.roomId === roomId) {
          clearTimeout(timeoutId);
          
          if (data.exists) {
            setStatus('exists');
            resolve(true);
          } else {
            setStatus('not_exists');
            setError('Room does not exist');
            resolve(false);
          }
          
          // Clean up listener
          verificationSocket.off('room_verification_result', handleVerificationResult);
        }
      };

      // Set up listener
      verificationSocket.on('room_verification_result', handleVerificationResult);

      // Request verification
      verificationSocket.emit('verify_room_exists', { roomId });
    });
  }, [verificationSocket]);

  return {
    verifyRoom,
    status,
    error
  };
}