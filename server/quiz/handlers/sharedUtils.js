// handlers/sharedUtils.js
import { getQuizRoom } from '../quizRoomManager.js';
import { isRateLimited } from '../../socketRateLimiter.js';

const debug = true;

export function setupSharedHandlers(socket, namespace) {
  // 🧾 Send config on demand
  socket.on('request_room_config', ({ roomId }) => {
    import('../quizRoomManager.js').then(({ getQuizRoom }) => {
      const room = getQuizRoom(roomId);
      if (room) {
        socket.emit('room_config', {
          totalRounds: room.config.roundCount || 3,
          questionsPerRound: room.config.questionsPerRound || 5,
        });
        if (debug) console.log(`[Server] 🧾 Sent room_config for ${roomId}`);
      } else {
        socket.emit('quiz_error', { message: 'Room not found' });
      }
    });
  });

  // ✅ Room exists? What's the payment method?
  socket.on('verify_quiz_room', ({ roomId }) => {
    import('../quizRoomManager.js').then(({ getQuizRoom }) => {
      console.log('[Server] 🧠 Received verify_quiz_room for:', roomId);
    
      const room = getQuizRoom(roomId);
      if (!room) {
        console.log('[Server] ❌ Room not found:', roomId);
        socket.emit('quiz_room_verification_result', {
          exists: false,
          paymentMethod: 'cash',
        });
      } else {
        console.log('[Server] ✅ Room found:', roomId, 'Payment method:', room.config?.paymentMethod);
        socket.emit('quiz_room_verification_result', {
          exists: true,
          paymentMethod: room.config?.paymentMethod || 'cash',
        });
      }
    });
  });

  // ✅ Is this player approved?
  socket.on('verify_quiz_room_and_player', ({ roomId, playerId }) => {
    import('../quizRoomManager.js').then(({ getQuizRoom }) => {
      const room = getQuizRoom(roomId);

      if (!room) {
        socket.emit('quiz_room_player_verification_result', {
          roomExists: false,
          playerApproved: false,
        });
        return;
      }

      const playerApproved = room.players?.some(p => p.id === playerId);

      socket.emit('quiz_room_player_verification_result', {
        roomExists: true,
        playerApproved,
      });
    });
  });

  // 🧠 Clue logic
  socket.on('use_clue', ({ roomId, playerId }) => {
    import('../quizRoomManager.js').then(({ useClue, getQuizRoom }) => {
      const result = useClue(roomId, playerId);

      if (result.success) {
        const room = getQuizRoom(roomId);
        socket.emit('clue_revealed', {
          questionId: room?.questions[room.currentQuestionIndex]?.id,
          clue: result.clue
        });
      } else {
        socket.emit('clue_error', { reason: result.reason });
      }
    });
  });
}

// Export shared utility functions that might be used by multiple handlers
export function resetRoundClueTrackingWrapper(roomId) {
  return import('../quizRoomManager.js').then(({ resetRoundClueTracking }) => {
    return resetRoundClueTracking(roomId);
  });
}