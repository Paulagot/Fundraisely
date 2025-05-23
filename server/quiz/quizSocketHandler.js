//server/quiz/quizSocketHandler.js
// Import handlers
import { setupHostHandlers } from './handlers/hostHandlers.js';
import { setupPlayerHandlers } from './handlers/playerHandlers.js';
import { setupSharedHandlers } from './handlers/sharedUtils.js';



// This is still needed for the main handler setup
import { isRateLimited } from '../socketRateLimiter.js';

const debug = true;

export function setupQuizSocketHandlers(quizNamespace) {
  if (debug) console.log('📡 [quiz] Quiz socket handlers setting up');

  // Add an explicit connection event handler
  quizNamespace.on('connection', (socket) => {
    if (debug) console.log(`🧠 [quiz] Client connected: ${socket.id}`);

    // Get rooms that the socket is in
    const socketRooms = socket.rooms ? [...socket.rooms] : [];
    console.log(`[Debug] Socket ${socket.id} is in rooms:`, socketRooms);

    // 🧩 Modular socket event registration
    setupHostHandlers(socket, quizNamespace);
    setupPlayerHandlers(socket, quizNamespace);
    setupSharedHandlers(socket, quizNamespace);

    socket.on('disconnect', () => {
      console.log(`❌ [quiz] Client disconnected: ${socket.id}`);
    });
    
    // Add a ping handler to keep connections alive
    socket.on('ping', () => {
      socket.emit('pong', { time: Date.now() });
    });
  });

  // Add a global error handler for the namespace
  quizNamespace.on('error', (err) => {
    console.error(`[SocketError] Namespace error:`, err);
  });
}



