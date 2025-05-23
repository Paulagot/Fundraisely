import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuizSocket } from '../useQuizSocket';
import { joinQuizRoom } from '../joinQuizSocket';

const JoinQuizWeb3Page = () => {
  const { roomId } = useParams();
  const socket = useQuizSocket();

  useEffect(() => {
    if (socket && roomId) {
      const player = {
        id: socket.id,
        name: 'Alice', // TODO: Replace with actual name from user session or wallet
      };

      joinQuizRoom(socket, roomId, player);
    }
  }, [socket, roomId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">🔗 Joining Quiz Room</h2>
      <p>Room ID: {roomId}</p>
      <p>Waiting for smart contract payment confirmation (if required)...</p>
    </div>
  );
};

export default JoinQuizWeb3Page;

