// src/hooks/useRoomVerification.ts
import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

type VerificationStatus = 'idle' | 'checking' | 'exists' | 'not_exists' | 'error';

interface UseRoomVerificationReturn {
  verifyRoom: (roomId: string) => Promise<{
    exists: boolean;
    chainId?: string | number;
    contractAddress?: string;
    namespace?: string;
    entryFee?: string;
  }>;
  status: VerificationStatus;
  error: string;
}

export function useRoomVerification(): UseRoomVerificationReturn {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string>('');
  const [verificationSocket, setVerificationSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { autoConnect: false });
    setVerificationSocket(socket);

    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
  }, []);

  const verifyRoom = useCallback(
    async (roomId: string): Promise<{
      exists: boolean;
      chainId?: string | number;
      contractAddress?: string;
      namespace?: string;
      entryFee?: string;
    }> => {
      if (!verificationSocket) {
        setError('Verification service not available');
        setStatus('error');
        return { exists: false };
      }

      return new Promise((resolve) => {
        setStatus('checking');
        setError('');

        if (!verificationSocket.connected) {
          verificationSocket.connect();
        }

        const timeoutId = setTimeout(() => {
          setError('Verification timed out');
          setStatus('error');
          resolve({ exists: false });
        }, 5000);

        const handleVerificationResult = (data: {
          roomId: string;
          exists: boolean;
          chainId?: string | number;
          contractAddress?: string;
          namespace?: string;
          entryFee?: string;
        }) => {
          if (data.roomId === roomId) {
            clearTimeout(timeoutId);

            if (data.exists) {
              setStatus('exists');
              resolve({
                exists: true,
                chainId: data.chainId,
                contractAddress: data.contractAddress,
                namespace: data.namespace,
                entryFee: data.entryFee,
              });
            } else {
              setStatus('not_exists');
              setError('Room does not exist');
              resolve({ exists: false });
            }

            verificationSocket.off('room_verification_result', handleVerificationResult);
          }
        };

        verificationSocket.on('room_verification_result', handleVerificationResult);
        verificationSocket.emit('verify_room_exists', { roomId });
      });
    },
    [verificationSocket]
  );

  return {
    verifyRoom,
    status,
    error,
  };
}

