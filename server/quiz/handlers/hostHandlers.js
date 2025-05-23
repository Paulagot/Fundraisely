// handlers/hostHandlers.js
import {
  getQuizRoom,
  getCurrentRound,
  getCurrentQuestion,
  getTotalRounds,
  advanceToNextQuestion,
  startNextRound,
  resetRoundClueTracking
} from '../quizRoomManager.js';

import { isRateLimited } from '../../socketRateLimiter.js';

const debug = true;

export function setupHostHandlers(socket, namespace) {
  // 🧠 Room creation
  socket.on('create_quiz_room', ({ roomId, hostId, config }) => {
    if (debug) console.log(`[Server] 🧠 create_quiz_room for: ${roomId}, host: ${hostId}`);
    
    // First join the room immediately, before any asynchronous operations
    console.log(`[Server] 🔌 Socket ${socket.id} joining room ${roomId} as host`);
    socket.join(roomId);
    
    // Verify the join was successful
    setTimeout(() => {
      namespace.in(roomId).allSockets().then(clients => {
        console.log(`[Server Debug] Host join verification: Room ${roomId} has clients:`, [...clients]);
      });
    }, 100);
    
    import('../quizRoomManager.js').then(({ createQuizRoom, getQuizRoom }) => {
      // Disabled rate limiting for testing
      /*
      if (isRateLimited(socket, 'create_quiz_room', 10)) {
        socket.emit('quiz_error', { message: 'Too many room creation attempts. Please wait.' });
        return;
      }
      */

      const success = createQuizRoom(roomId, hostId, config);
      if (!success) {
        socket.emit('quiz_error', { message: 'Room already exists' });
        // If failed, leave the room
        socket.leave(roomId);
        return;
      }

      socket.emit('quiz_room_created', { roomId });
      if (debug) console.log(`✅ Room created: ${roomId}`);

      const room = getQuizRoom(roomId);
      if (room) {
        // Double check socket is in the room before emitting
        namespace.in(roomId).allSockets().then(clients => {
          console.log(`[Server] 🧾 Room config: clients in room ${roomId}:`, [...clients]);
          
          // Broadcast room config to all clients in the room
          namespace.to(roomId).emit('room_config', {
            totalRounds: room.config.roundCount || 3,
            questionsPerRound: room.config.questionsPerRound || 5,
          });
          
          // Also send directly to the host socket just in case
          socket.emit('room_config', {
            totalRounds: room.config.roundCount || 3,
            questionsPerRound: room.config.questionsPerRound || 5,
          });
        });
      }
    }).catch(err => {
      console.error(`[Error] Failed in create_quiz_room:`, err);
      socket.emit('quiz_error', { message: 'Internal server error' });
    });
  });

  // 👥 Host adds multiple players manually
  socket.on('add_player', ({ roomId, players }) => {
    import('../quizRoomManager.js').then(({ addPlayerToQuizRoom, getQuizRoom }) => {
      if (debug) console.log(`[Server] 🔄 Received add_player for room ${roomId}`);
      
      const room = getQuizRoom(roomId);
      if (!room) {
        console.warn(`[Server] ⚠️ Room not found: ${roomId}`);
        socket.emit('quiz_error', { message: 'Room not found' });
        return;
      }

      for (const player of players) {
        addPlayerToQuizRoom(roomId, player);
      }

      namespace.to(roomId).emit('player_list_updated', { 
        players: room.players 
      });
      console.log(`[Server] ✅ Updated players for room ${roomId}`);
    });
  });

  // 🟩 Start the next question
  socket.on('start_next_question', async ({ roomId }) => {
    if (debug) console.log(`[Server] ▶️ start_next_question for room ${roomId}`);

    const room = getQuizRoom(roomId);
    if (!room) {
      socket.emit('quiz_error', { message: 'Room not found' });
      return;
    }

    const questionsPerRound = room.config.questionsPerRound || 5;
    const currentIndex = room.currentQuestionIndex || 0;

    if ((currentIndex + 1) >= questionsPerRound) {
      if (debug) console.log(`[Server] 🚫 Max questions reached for round`);
      socket.emit('round_limit_reached', { round: getCurrentRound(roomId) });
      return;
    }

    const clients = await namespace.in(roomId).allSockets();
    if (debug) console.log(`[Server] 👥 Clients in room ${roomId}:`, [...clients]);

    if (room.currentPhase !== 'in_question') {
      room.currentPhase = 'in_question';
      if (debug) console.log(`[Server] ⏯️ Setting in_question phase`);
    }

    const nextQuestion = advanceToNextQuestion(roomId);
    if (!nextQuestion) {
      namespace.to(roomId).emit('round_end', { round: getCurrentRound(roomId) });
      return;
    }

    const currentQuestion = getCurrentQuestion(roomId);
    if (!currentQuestion) {
      socket.emit('quiz_error', { message: 'Failed to fetch question' });
      return;
    }

    const timeLimit = room.config.timePerQuestion || 30;
    if (debug) console.log(`[Server] 📤 Emitting question "${currentQuestion.text}" with ${timeLimit}s`);

    namespace.to(roomId).emit('question', {
      id: currentQuestion.id,
      text: currentQuestion.text,
      options: currentQuestion.options || null,
      timeLimit
    });

    socket.emit('debug_question_emitted', {
      questionText: currentQuestion.text,
      socketCount: [...clients].length
    });

    if ((room.currentQuestionIndex + 1) >= questionsPerRound) {
      if (debug) console.log(`[Server] 🏁 Last question of round ${getCurrentRound(roomId)}`);
    }
  });

  // 🔁 Start the next round
  socket.on('start_next_round', ({ roomId }) => {
    if (debug) console.log(`[Server] 🔁 start_next_round for room ${roomId}`);

    const room = getQuizRoom(roomId);
    if (!room) {
      socket.emit('quiz_error', { message: 'Room not found' });
      return;
    }

    const totalRounds = getTotalRounds(roomId);
    const nextRound = getCurrentRound(roomId) + 1;

    if (nextRound > totalRounds) {
      if (debug) console.log(`[Server] 🏁 All rounds complete. Emitting quiz_end.`);
      namespace.to(roomId).emit('quiz_end', {
        message: 'Quiz complete. Thank you for playing!'
      });
      return;
    }

    resetRoundClueTracking(roomId);
    startNextRound(roomId);
    room.currentPhase = 'waiting';

    if (debug) console.log(`[Server] 🔄 Starting round ${getCurrentRound(roomId)}`);
    namespace.to(roomId).emit('next_round_starting', {
      round: getCurrentRound(roomId)
    });
  });

  // ❌ End the quiz
  socket.on('end_quiz', ({ roomId }) => {
    if (debug) console.log(`[Server] ❌ end_quiz called for room ${roomId}`);

    const room = getQuizRoom(roomId);
    if (!room) {
      socket.emit('quiz_error', { message: 'Room not found' });
      return;
    }

    room.currentPhase = 'complete';

    namespace.to(roomId).emit('quiz_end', {
      message: 'Quiz has been ended by the host.'
    });
  });

  // 📣 Start the review phase (placeholder for now)
  socket.on('start_review_phase', ({ roomId }) => {
    if (debug) console.log(`[Server] 📣 start_review_phase for room ${roomId}`);

    // TODO: Emit first question + correct answer to start the review flow
    // Example:
    // namespace.to(roomId).emit('review_start', { questionId, correctAnswer });

    socket.emit('quiz_error', { message: 'Review phase not yet implemented' });
  });
}
