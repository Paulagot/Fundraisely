import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useQuizSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket: Socket = io(import.meta.env.VITE_SOCKET_URL + '/quiz', {
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('[QuizSocket] ✅ Connected:', newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.warn('[QuizSocket] ❌ Disconnected');
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};






