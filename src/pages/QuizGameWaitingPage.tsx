// src/pages/QuizGameWaitingPage.tsx
// src/pages/QuizGameWaitingPage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizSocket } from '../components/Quiz/useQuizSocket';
import { joinQuizRoom } from '../components/Quiz/joinQuizSocket';

const QuizGameWaitingPage = () => {
  const { roomId, playerId } = useParams();
  const socket = useQuizSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !roomId || !playerId) return;

    const localKey = `quiz_rejoin_${roomId}`;
    const storedPlayerId = localStorage.getItem(localKey);
    const alreadyJoined = storedPlayerId === playerId;

    const player = {
      id: playerId,
      name: `Player ${playerId}`, // Replace with actual name if available
    };

    if (!alreadyJoined) {
      console.log('[QuizGameWaitingPage] 🔁 Rejoining player...');
      joinQuizRoom(socket, roomId, player);
      localStorage.setItem(localKey, playerId);
    } else {
      console.log('[QuizGameWaitingPage] ✅ Already joined, no rejoin emit');
    }

    socket.on('quiz_started', () => {
      console.log('[QuizGameWaitingPage] 🚀 Quiz started!');
      navigate(`/quiz/play/${roomId}/${playerId}`);
    });

    return () => {
      socket.off('quiz_started');
    };
  }, [socket, roomId, playerId]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">🎉 You're in!</h1>
      <p className="text-lg">Waiting for host to start the quiz...</p>
      <p className="text-sm mt-2 text-gray-600">Room ID: {roomId}</p>
    </div>
  );
};

export default QuizGameWaitingPage;

