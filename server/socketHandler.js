import { clearAutoPlayInterval, startAutoPlay, callNextNumber } from './gameLogic.js';
import { createRoom, getRoom, deleteRoom, emitRoomUpdate } from './roomManager.js';
import { verifyPayment } from './paymentsVerification.js';

// Payment configuration (should be moved to environment variables)
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || '0xb7ACd1159dBed96B955C4d856fc001De9be59844';
const REQUIRED_PAYMENT_AMOUNT = process.env.REQUIRED_PAYMENT_AMOUNT || '0.01'; // ETH
const REQUIRE_PAYMENT = process.env.REQUIRE_PAYMENT === 'true' || false;
const joinAttempts = {};

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // NEW: Room verification handler
    socket.on('verify_room_exists', ({ roomId }) => {
      console.log(`Verifying room ${roomId} exists`);
      
      // Check if room exists
      const roomExists = !!getRoom(roomId);
      
      console.log(`Room ${roomId} exists: ${roomExists}`);
      
      // Send back result to client
      socket.emit('room_verification_result', { 
        roomId,
        exists: roomExists 
      });
    });

    // New socket event for creating a room (no payment required)
    socket.on('create_room', ({ roomId, playerName }) => {
      console.log(`Attempting to create room ${roomId} for player ${playerName}`);
      
      let room = getRoom(roomId);
      
      // Check if room already exists
      if (room) {
        socket.emit('create_error', { 
          message: 'Room with this code already exists' 
        });
        return;
      }
      
      // Create new room and join it
      socket.join(roomId);
      room = createRoom(roomId, socket.id);
      
      // Add creator as first player (host)
      room.players.set(socket.id, {
        id: socket.id,
        name: playerName,
        isHost: true,
        isReady: true,
        card: null
      });
      
      emitRoomUpdate(roomId, io);
      console.log(`Room ${roomId} created by ${playerName}`);
    });

    // Existing join_room event (with payment required for existing rooms)
    socket.on('join_room', async ({ roomId, playerName, paymentProof }) => {
      console.log(`Attempting to join room ${roomId} for player ${playerName}`);
      
      // Add rate limiting
      const clientIP = socket.handshake.address;
      const now = Date.now();
      
      // Initialize or clean up old entries
      if (!joinAttempts[clientIP] || (now - joinAttempts[clientIP].timestamp > 3600000)) {
        joinAttempts[clientIP] = { count: 0, timestamp: now };
      }
      
      // Increment attempt count
      joinAttempts[clientIP].count++;
      
      // Check if too many attempts
      if (joinAttempts[clientIP].count > 10) { // 10 attempts per hour
        socket.emit('join_error', { message: 'Too many join attempts, try again later' });
        return;
      }

      // Get the room
      let room = getRoom(roomId);
      
      // Check if room exists
      if (!room) {
        socket.emit('join_error', { 
          message: 'Room does not exist. Cannot join a non-existent room.' 
        });
        return;
      }
      
      // Check if game already started
      if (room.gameStarted) {
        socket.emit('join_error', { 
          message: 'Cannot join a game that is already in progress' 
        });
        return;
      }
      
      // Payment required to join an existing room
      if (REQUIRE_PAYMENT) {
        // Check if payment proof is provided
        if (!paymentProof) {
          socket.emit('join_error', { 
            message: 'Payment is required to join this room' 
          });
          return;
        }
        
        // Verify the payment
        try {
          const paymentVerified = await verifyPayment({
            txHash: paymentProof.txHash,
            sender: paymentProof.address,
            recipient: PAYMENT_ADDRESS,
            amount: REQUIRED_PAYMENT_AMOUNT
          });
          
          if (!paymentVerified.success) {
            socket.emit('join_error', { 
              message: paymentVerified.error || 'Payment verification failed' 
            });
            return;
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          socket.emit('join_error', { 
            message: 'Payment verification failed' 
          });
          return;
        }
      }
      
      // Payment verification passed or not required, join the room
      socket.join(roomId);
      
      // Add player to the room (never as host)
      room.players.set(socket.id, {
        id: socket.id,
        name: playerName,
        isHost: false,  // Joining players are never hosts
        isReady: false, // Players need to mark themselves ready
        card: null
      });

      emitRoomUpdate(roomId, io);
      console.log(`Player ${playerName} joined existing room ${roomId}`);
    });

    // Rest of your socket handlers remain the same
    socket.on('toggle_ready', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.players.has(socket.id)) return;

      const player = room.players.get(socket.id);
      if (player.isHost) return;
      
      player.isReady = !player.isReady;
      emitRoomUpdate(roomId, io);
    });

    socket.on('start_game', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost) return;

      const allPlayers = Array.from(room.players.values());
      const isSinglePlayer = allPlayers.length === 1;
      const nonHostPlayers = allPlayers.filter(p => !p.isHost);
      const allNonHostPlayersReady = nonHostPlayers.every(p => p.isReady);

      if (isSinglePlayer || allNonHostPlayersReady) {
        room.gameStarted = true;
        console.log(`Host started ${isSinglePlayer ? 'solo' : 'multiplayer'} game in room ${roomId}`);
        emitRoomUpdate(roomId, io);
      }
    });

    socket.on('update_card', ({ roomId, card }) => {
      const room = getRoom(roomId);
      if (!room || !room.players.has(socket.id)) return;

      const player = room.players.get(socket.id);
      player.card = card;
      
      io.to(roomId).emit('player_card_update', {
        playerId: socket.id,
        card
      });
    });

    socket.on('call_number', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.gameStarted) return;

      const newNumber = callNextNumber(room, roomId, io);
      if (newNumber) {
        console.log(`Number ${newNumber} called in room ${roomId}`);
      }
    });

    socket.on('toggle_auto_play', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.gameStarted) return;

      room.autoPlay = !room.autoPlay;
      
      if (room.autoPlay) {
        startAutoPlay(roomId, room, io);
      } else {
        clearAutoPlayInterval(roomId);
      }

      io.to(roomId).emit('auto_play_update', { autoPlay: room.autoPlay });
    });

    socket.on('player_won', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.gameStarted) return;

      room.winnerId = socket.id;
      room.gameStarted = false;
      clearAutoPlayInterval(roomId);

      io.to(roomId).emit('game_won', { 
        winnerId: socket.id,
        playerName: room.players.get(socket.id).name 
      });
    });

    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        const room = getRoom(roomId);
        if (room) {
          room.players.delete(socket.id);
          
          if (room.players.size === 0) {
            deleteRoom(roomId);
            clearAutoPlayInterval(roomId);
          } else if (room.hostId === socket.id) {
            const newHost = room.players.values().next().value;
            newHost.isHost = true;
            newHost.isReady = true;
            room.hostId = newHost.id;
          }
          
          emitRoomUpdate(roomId, io);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}