import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizSocket } from '../useQuizSocket';

interface Props {
  onClose: () => void;
}

const JoinQuizModal: React.FC<Props> = ({ onClose }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const socket = useQuizSocket();
  const navigate = useNavigate();

 const handleJoin = () => {
  if (!roomId || !playerName) {
    setError('Please enter both room ID and name.');
    return;
  }

  setError('');
  setLoading(true);
  console.log('[JoinQuizModal] 🔍 Verifying room ID:', roomId);

  socket?.emit('verify_quiz_room', { roomId });

  socket?.once('quiz_room_verification_result', (data: any) => {
    console.log('[JoinQuizModal] ✅ Received room verification:', data);
    setLoading(false);

    if (!data.exists) {
      setError('Room not found.');
      return;
    }

    const paymentMethod = data.paymentMethod || 'cash';
    console.log('[JoinQuizModal] 🚦 Routing based on payment method:', paymentMethod);

    if (paymentMethod === 'web3') {
      navigate(`/quiz/join/${roomId}`);
    } else {
      navigate(`/quiz/join/${roomId}/${encodeURIComponent(playerName)}`);
    }

    onClose();
  });
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">🙋 Join a Quiz</h2>

        <label className="block mb-2 text-sm font-medium">Room ID</label>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.trim())}
          className="w-full mb-4 border rounded-lg px-3 py-2"
          placeholder="Enter Room Code"
        />

        <label className="block mb-2 text-sm font-medium">Your Name</label>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full mb-4 border rounded-lg px-3 py-2"
          placeholder="Enter Your Name"
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {loading && <p className="text-sm text-gray-600 mb-2">Checking room...</p>}

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinQuizModal;
