//src/quiz/game/GameControls.tsx

import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuizSocket } from '../useQuizSocket';

const debug = true;

const HostGameControls = () => {
  const { roomId } = useParams();
  const socket = useQuizSocket();

  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [questionsPerRound, setQuestionsPerRound] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [status, setStatus] = useState('Waiting to begin');
  const [canStartNextQuestion, setCanStartNextQuestion] = useState(true);
  const [canStartNextRound, setCanStartNextRound] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [phase, setPhase] = useState<'waiting' | 'in_question' | 'reviewing' | 'complete'>('waiting');

  const questionCounterRef = useRef(0);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Request room configuration on component mount
    socket.emit('request_room_config', { roomId });

    socket.on('room_config', ({ totalRounds, questionsPerRound }) => {
      if (debug) console.log('[Host] 🛠 Received room config:', { totalRounds, questionsPerRound });
      setTotalRounds(totalRounds);
      setQuestionsPerRound(questionsPerRound);
    });

    socket.on('player_joined', () => {
      setTotalPlayers(prev => prev + 1);
    });

    socket.on('player_list_updated', ({ players }) => {
      if (Array.isArray(players)) {
        setTotalPlayers(players.length);
        if (debug) console.log('[Host] 👥 Updated player list:', players);
      }
    });

    socket.on('question', (data) => {
      if (debug) console.log('[Host] 📥 Received question event:', data);
      setCurrentQuestion(data);
      questionCounterRef.current += 1;
      setQuestion(questionCounterRef.current);
      setTimeLeft(data.timeLimit || 30);
      setPhase('in_question');
      setStatus('📤 Question sent');

      // Check if this is the last question in the round
      if (questionCounterRef.current >= questionsPerRound) {
        setCanStartNextQuestion(false);
        setCanStartNextRound(true);
        setPhase('reviewing');
        setStatus('✅ Round complete. Awaiting answer reveal.');
      }
    });

    socket.on('next_round_starting', ({ round }) => {
      if (debug) console.log('[Host] 🔄 Round', round, 'starting');
      setRound(round);
      questionCounterRef.current = 0;
      setQuestion(0);
      setCanStartNextQuestion(true);
      setCanStartNextRound(false);
      setCurrentQuestion(null);
      setPhase('waiting');
      setStatus(`🔁 Round ${round} started`);
    });

    socket.on('quiz_end', ({ message }) => {
      setStatus(`🏁 ${message}`);
      setQuizEnded(true);
      setPhase('complete');
      setCanStartNextQuestion(false);
      setCanStartNextRound(false);
    });

    socket.on('round_limit_reached', ({ round }) => {
      if (debug) console.log(`[Host] 🚫 Max questions reached for round ${round}`);
      setCanStartNextQuestion(false);
      setCanStartNextRound(true);
      setPhase('reviewing');
      setStatus(`✅ Round ${round} complete. Please reveal answers before next round.`);
    });

    socket.on('round_end', ({ round }) => {
      if (debug) console.log(`[Host] 🏁 Round ${round} ended`);
      setCanStartNextQuestion(false);
      setCanStartNextRound(true);
      setPhase('reviewing');
      setStatus(`✅ Round ${round} complete. Ready for next round.`);
    });

    return () => {
      socket.off('room_config');
      socket.off('player_joined');
      socket.off('player_list_updated');
      socket.off('question');
      socket.off('next_round_starting');
      socket.off('quiz_end');
      socket.off('round_limit_reached');
      socket.off('round_end');
    };
  }, [socket, roomId, questionsPerRound]);

  useEffect(() => {
  if (!socket || !roomId) return;

  // 🧠 Host joins room as "player" to receive events
  socket.emit('join_quiz_room', {
    roomId,
    player: {
      id: 'host_' + socket.id,
      name: 'Host',
      isHost: true
    }
  });

  if (debug) console.log('[Host] 🧠 Joined quiz room:', roomId);
}, [socket, roomId]);


  // Timer effect for question countdown
  useEffect(() => {
    if (!timeLeft || phase !== 'in_question') return;
    if (timeLeft <= 0) {
      setStatus(`⏱️ Time's up for question ${question}`);
      return;
    }

    const timer = setTimeout(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, question]);

  const handleNextQuestion = () => {
    if (!socket || !roomId || !canStartNextQuestion || quizEnded) return;
    if (debug) console.log('[Host] ▶️ Emitting start_next_question', { roomId });

    socket.emit('start_next_question', { roomId });
  };

  const handleNextRound = () => {
    if (!socket || !roomId || !canStartNextRound || quizEnded) return;
    if (debug) console.log('[Host] 🔁 Emitting start_next_round', { roomId });

    socket.emit('start_next_round', { roomId });
  };

  const handleEndQuiz = () => {
    if (!socket || !roomId) return;
    if (debug) console.log('[Host] ❌ Emitting end_quiz', { roomId });

    socket.emit('end_quiz', { roomId });
    setQuizEnded(true);
    setPhase('complete');
    setCanStartNextQuestion(false);
    setCanStartNextRound(false);
  };

  const phaseColor = {
    waiting: 'bg-gray-400',
    in_question: 'bg-green-500',
    reviewing: 'bg-yellow-500',
    complete: 'bg-red-600'
  }[phase];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-indigo-800 mb-4">🎛 Host Game Controls</h1>
      <p className="text-sm text-gray-500 mb-4">Room ID: {roomId}</p>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="text-sm text-gray-700 space-y-1">
          <p>🟢 Round: {round} / {totalRounds}</p>
          <p>🔵 Question: {question} / {questionsPerRound}</p>
          <p>👥 Total Players: {totalPlayers}</p>
          <p className="flex items-center gap-2">
            🧭 Phase: <span className={`text-white text-xs font-semibold px-2 py-1 rounded ${phaseColor}`}>{phase.replace('_', ' ').toUpperCase()}</span>
          </p>
          <p className="mt-2 font-medium">📣 Status: {status}</p>
          {timeLeft !== null && phase === 'in_question' && (
            <p className={`text-sm font-semibold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
              ⏳ Time left: {timeLeft}s
            </p>
          )}
        </div>

        {currentQuestion && (
          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-sm font-semibold text-gray-700">📘 Current Question Preview:</p>
            <p className="text-base text-indigo-700 mt-1">{currentQuestion.text}</p>
            {Array.isArray(currentQuestion.options) && (
              <ul className="mt-2 list-disc list-inside text-sm text-gray-800">
                {currentQuestion.options.map((opt: string, idx: number) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mt-4">
          <button
            onClick={handleNextQuestion}
            className={`px-4 py-2 rounded-xl w-full transition text-white font-semibold shadow ${
              canStartNextQuestion 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!canStartNextQuestion || quizEnded}
          >
            ▶️ Next Question
          </button>

          <button
            onClick={handleNextRound}
            className={`px-4 py-2 rounded-xl w-full transition text-white font-semibold shadow ${
              canStartNextRound 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!canStartNextRound || quizEnded}
          >
            🔁 Start Next Round
          </button>

          <button
            onClick={handleEndQuiz}
            className="bg-red-600 text-white px-4 py-2 rounded-xl w-full hover:bg-red-700 transition font-semibold shadow"
            disabled={quizEnded}
          >
            ❌ End Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostGameControls;







