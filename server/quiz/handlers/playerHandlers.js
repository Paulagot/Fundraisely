// handlers/playerHandlers.js
import { isRateLimited } from '../../socketRateLimiter.js';

const debug = true;

// Track failed attempts per IP to avoid excessive rate limiting
const joinAttempts = new Map();

export function setupPlayerHandlers(socket, namespace) {
  // 👤 Player joins quiz room
  socket.on('join_quiz_room', ({ roomId, player }) => {
    if (debug) console.log(`[Player] 👤 join_quiz_room for ${roomId} as ${player.name || 'unknown'}`);
    
    // Temporarily disable rate limiting for testing
    /*
    if (isRateLimited(socket, 'join_quiz_room', 20)) {
      socket.emit('quiz_error', { message: 'Too many join attempts. Please slow down.' });
      return;
    }
    */
    
    // Important: Join room synchronously, before any async operations
    console.log(`[JoinRoom] Socket ${socket.id} joining room ${roomId}`);
    socket.join(roomId);
    
    // Add a brief delay to ensure the join completes
    setTimeout(() => {
      namespace.in(roomId).allSockets().then(clients => {
        console.log(`[JoinDebug] After join, clients in room ${roomId}:`, [...clients]);
      });
    }, 100);
    
    import('../quizRoomManager.js').then(({ getQuizRoom, addPlayerToQuizRoom }) => {
      const room = getQuizRoom(roomId);
      if (!room) {
        socket.emit('quiz_error', { message: 'Room not found.' });
        socket.leave(roomId); // Leave room if it doesn't exist
        return;
      }

      const success = addPlayerToQuizRoom(roomId, player);
      if (!success) {
        console.log(`[Player] ⚠️ Failed to add player ${player.name} to room ${roomId}`);
        // Continue anyway - they may already be added
      }

      // Emit events about the player joining
      namespace.to(roomId).emit('player_joined', { player });
      namespace.to(roomId).emit('player_list_updated', {
        players: room.players || []
      });

      // Double check that the socket is actually in the room
      namespace.in(roomId).allSockets().then(clients => {
        const isInRoom = clients.has(socket.id);
        console.log(`[Player] 👥 Socket ${socket.id} is ${isInRoom ? 'in' : 'NOT in'} room ${roomId}`);
        
        if (!isInRoom) {
          console.log(`[Player] 🔄 Re-joining socket ${socket.id} to room ${roomId}`);
          socket.join(roomId);
        }
        
        console.log(`[Player] ✅ Player ${player.name} joined room ${roomId}`);
        console.log(`[Player] 👥 Current clients in room:`, [...clients]);
      });
    });
  });

  // 📝 Player submits an answer
  socket.on('submit_answer', ({ roomId, playerId, answer }) => {
    import('../quizRoomManager.js').then(({ getQuizRoom, getCurrentQuestion }) => {
      if (debug) console.log(`[Player] 📝 ${playerId} submitted answer for ${roomId}:`, answer);

      const room = getQuizRoom(roomId);
      if (!room) {
        socket.emit('quiz_error', { message: 'Room not found' });
        return;
      }

      const question = getCurrentQuestion(roomId);
      if (!question) {
        socket.emit('quiz_error', { message: 'No current question' });
        return;
      }

      const playerData = room.playerData[playerId];
      if (!playerData) {
        socket.emit('quiz_error', { message: 'Player not found' });
        return;
      }

      const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

      // Save answer result
      playerData.answers[question.id] = {
        submitted: answer,
        correct: isCorrect
      };

      // Optional scoring (if you want real-time points):
      playerData.score = (playerData.score || 0) + (isCorrect ? 1 : 0);

      if (debug) {
        console.log(`[Player] ✅ Answer recorded: ${isCorrect ? 'Correct' : 'Wrong'}`);
      }

      socket.emit('answer_received', {
        correct: isCorrect,
        submitted: answer
      });
    });
  });
}
