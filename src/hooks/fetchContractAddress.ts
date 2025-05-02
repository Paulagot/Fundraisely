// src/hooks/fetchContractAddress.ts
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function fetchContractAddress(roomId: string): Promise<string | null> {
  return new Promise((resolve) => {
    const tempSocket = io(SOCKET_URL, { autoConnect: false });
    tempSocket.connect();

    const timeoutId = setTimeout(() => {
      tempSocket.disconnect();
      resolve(null);
    }, 5000);

    tempSocket.on('contract_address_response', ({ roomId: responseRoomId, contractAddress, error }) => {
      if (responseRoomId === roomId) {
        clearTimeout(timeoutId);
        tempSocket.disconnect();
        if (error) {
          console.warn(`Room ${roomId} contract fetch error: ${error}`);
          resolve(null);
        } else {
          resolve(contractAddress);
        }
      }
    });

    tempSocket.on('connect', () => {
      tempSocket.emit('get_contract_address', { roomId });
    });

    tempSocket.on('connect_error', (err) => {
      console.warn(`Socket connection error for room ${roomId}: ${err.message}`);
      clearTimeout(timeoutId);
      tempSocket.disconnect();
      resolve(null);
    });
  });
}
