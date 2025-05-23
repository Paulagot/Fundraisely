import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuizSocket } from '../useQuizSocket';
import { joinQuizRoom, verifyRoomAndPlayer } from '../joinQuizSocket';

const JoinQuizWeb2Page = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get('playerId');
  const socket = useQuizSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !roomId || !playerId) return;

    console.log('[JoinQuiz] Verifying room & player...');
    verifyRoomAndPlayer(socket, roomId, playerId, (data) => {
      console.log('[JoinQuiz] Verification result:', data);

      if (!data.roomExists) {
        alert('Room does not exist.');
        return;
      }

      if (!data.playerApproved) {
        alert('You are not approved to join this room.');
        return;
      }

      const player = { id: playerId, name: `Player ${playerId}` };

      if (socket.connected) {
        console.log('✅ Socket connected. Joining room...');
        joinQuizRoom(socket, roomId, player);
      } else {
        console.warn('❌ Socket not connected. Cannot join room.');
        return;
      }

      localStorage.setItem(`quiz_rejoin_${roomId}`, playerId);

      // ⏳ Delay redirect so join_quiz_room finishes
      setTimeout(() => {
        console.log('➡️ Navigating to /quiz/game...');
        navigate(`/quiz/game/${roomId}/${playerId}`);
      }, 1000);
    });
  }, [socket, roomId, playerId]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold mb-2">Joining Room...</h1>
      <p className="text-sm text-gray-500">Room ID: {roomId}</p>
      <p className="text-sm text-gray-500">Player ID: {playerId}</p>
    </div>
  );
};

export default JoinQuizWeb2Page;


