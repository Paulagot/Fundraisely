// server/socketsHandler.js
import { clearAutoPlayInterval, startAutoPlay, callNextNumber } from './gameLogic.js';
import { createRoom, getRoom, deleteRoom, emitRoomUpdate } from './roomManager.js';
import { verifyPayment } from './paymentsVerification.js';

const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || '0xb7ACd1159dBed96B955C4d856fc001De9be59844';
const REQUIRED_PAYMENT_AMOUNT = process.env.REQUIRED_PAYMENT_AMOUNT || '0.01';
const REQUIRE_PAYMENT = process.env.REQUIRED_PAYMENT === 'true' || false;
const joinAttempts = {};

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Add this new event handler for room verification
    socket.on('verify_room_exists', ({ roomId }) => {
      console.log(`Verifying if room ${roomId} exists`);
      const room = getRoom(roomId);
      const exists = !!room;
      console.log(`Room ${roomId} exists: ${exists}`);
      socket.emit('room_verification_result', { roomId, exists });
    });

    socket.on('create_room', ({ roomId, playerName }) => {
      console.log(`Attempting to create room ${roomId} for player ${playerName}`);
      let room = getRoom(roomId);
      if (room) {
        console.log(`Room ${roomId} already exists`);
        socket.emit('create_error', { message: 'Room with this code already exists' });
        return;
      }
      socket.join(roomId);
      room = createRoom(roomId, socket.id);
      room.players.set(socket.id, {
        id: socket.id,
        name: playerName,
        isHost: true,
        isReady: true,
        card: null
      });
      console.log(`Created room ${roomId} with host ${playerName}`);
      emitRoomUpdate(roomId, io);
      console.log(`Emitted room_update for ${roomId}, players:`, Array.from(room.players.values()));
    });

    // Rest of your event handlers remain unchanged
    socket.on('join_room', async ({ roomId, playerName, paymentProof }) => {
      console.log(`Attempting to join room ${roomId} for player ${playerName}`);
      const clientIP = socket.handshake.address;
      const now = Date.now();
      if (!joinAttempts[clientIP] || (now - joinAttempts[clientIP].timestamp > 3600000)) {
        joinAttempts[clientIP] = { count: 0, timestamp: now };
      }
      joinAttempts[clientIP].count++;
      if (joinAttempts[clientIP].count > 10) {
        console.log(`Too many join attempts from ${clientIP}`);
        socket.emit('join_error', { message: 'Too many join attempts, try again later' });
        return;
      }
      const room = getRoom(roomId);
      if (!room) {
        console.log(`Room ${roomId} does not exist`);
        socket.emit('join_error', { message: 'Room does not exist.' });
        return;
      }
      if (room.gameStarted) {
        console.log(`Room ${roomId} game already started`);
        socket.emit('join_error', { message: 'Cannot join a game that is already in progress' });
        return;
      }
      if (REQUIRE_PAYMENT) {
        if (!paymentProof) {
          console.log(`No payment proof provided for room ${roomId}`);
          socket.emit('join_error', { message: 'Payment is required to join this room' });
          return;
        }
        try {
          console.log(`Verifying payment for ${playerName}:`, paymentProof);
          const paymentVerified = await verifyPayment({
            txHash: paymentProof.txHash,
            sender: paymentProof.address,
            recipient: PAYMENT_ADDRESS,
            amount: REQUIRED_PAYMENT_AMOUNT
          });
          if (!paymentVerified.success) {
            console.log(`Payment verification failed: ${paymentVerified.error}`);
            socket.emit('join_error', { message: paymentVerified.error || 'Payment verification failed' });
            return;
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          socket.emit('join_error', { message: 'Payment verification failed' });
          return;
        }
      }
      socket.join(roomId);
      room.players.set(socket.id, {
        id: socket.id,
        name: playerName,
        isHost: false,
        isReady: false,
        card: null
      });
      console.log(`Player ${playerName} joined room ${roomId}`);
      emitRoomUpdate(roomId, io);
      console.log(`Emitted room_update for ${roomId}, players:`, Array.from(room.players.values()));
    });

    // Rest of your original socket handlers...
    socket.on('toggle_ready', ({ roomId }) => {
      console.log(`Received toggle_ready for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.has(socket.id)) return;
      const player = room.players.get(socket.id);
      if (player.isHost) return;
      player.isReady = !player.isReady;
      emitRoomUpdate(roomId, io);
    });

    socket.on('start_game', ({ roomId }) => {
      console.log(`Received start_game for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost) return;
      const allPlayers = Array.from(room.players.values());
      const isSinglePlayer = allPlayers.length === 1;
      const nonHostPlayers = allPlayers.filter(p => !p.isHost);
      const allNonHostPlayersReady = nonHostPlayers.every(p => p.isReady);
      if (isSinglePlayer || allNonHostPlayersReady) {
        room.gameStarted = true;
        emitRoomUpdate(roomId, io);
      }
    });

    socket.on('update_card', ({ roomId, card }) => {
      console.log(`Received update_card for room ${roomId} from ${socket.id}`);
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
      console.log(`Received call_number for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.gameStarted || room.isPaused) return;
      callNextNumber(room, roomId, io);
    });

    socket.on('toggle_auto_play', ({ roomId }) => {
      console.log(`Received toggle_auto_play for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.gameStarted || room.isPaused) return;
      room.autoPlay = !room.autoPlay;
      if (room.autoPlay) {
        startAutoPlay(roomId, room, io);
      } else {
        clearAutoPlayInterval(roomId);
      }
      io.to(roomId).emit('auto_play_update', { autoPlay: room.autoPlay });
    });

    socket.on('player_line_won', ({ roomId }) => {
      console.log(`Received player_line_won for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.gameStarted || room.lineWinClaimed) return;
      const player = room.players.get(socket.id);
      if (!player) return;
      if (!room.lineWinners.some(w => w.id === socket.id)) {
        room.lineWinners.push({ id: socket.id, name: player.name });
      }
      room.isPaused = true;
      clearAutoPlayInterval(roomId);
      io.to(roomId).emit('game_paused');
      io.to(roomId).emit('line_winners_proposed', { winners: room.lineWinners });
    });

    socket.on('player_full_house_won', ({ roomId }) => {
      console.log(`Received player_full_house_won for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.gameStarted || !room.lineWinClaimed) return;
      const player = room.players.get(socket.id);
      if (!player) return;
      if (!room.fullHouseWinners.some(w => w.id === socket.id)) {
        room.fullHouseWinners.push({ id: socket.id, name: player.name });
      }
      room.isPaused = true;
      clearAutoPlayInterval(roomId);
      io.to(roomId).emit('game_paused');
      io.to(roomId).emit('full_house_winners_proposed', { winners: room.fullHouseWinners });
    });

    socket.on('declare_line_winners', ({ roomId }) => {
      console.log(`Received declare_line_winners for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.isPaused) return;
      room.lineWinClaimed = true;
      io.to(roomId).emit('line_winners_declared', { winners: room.lineWinners });
      emitRoomUpdate(roomId, io);
    });

    socket.on('declare_full_house_winners', ({ roomId }) => {
      console.log(`Received declare_full_house_winners for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.isPaused) return;
      room.gameOver = true;
      room.gameStarted = false;
      io.to(roomId).emit('full_house_winners_declared', { winners: room.fullHouseWinners });
      emitRoomUpdate(roomId, io);
    });

    socket.on('unpause_game', ({ roomId }) => {
      console.log(`Received unpause_game for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost || !room.isPaused) return;
      room.isPaused = false;
      if (room.autoPlay) {
        startAutoPlay(roomId, room, io);
      }
      io.to(roomId).emit('game_unpaused');
      emitRoomUpdate(roomId, io);
    });

    socket.on('new_game', ({ roomId }) => {
      console.log(`Received new_game for room ${roomId} from ${socket.id}`);
      const room = getRoom(roomId);
      if (!room || !room.players.get(socket.id)?.isHost) return;
      room.gameStarted = false;
      room.currentNumber = null;
      room.calledNumbers = [];
      room.autoPlay = false;
      room.lineWinners = [];
      room.fullHouseWinners = [];
      room.isPaused = false;
      room.lineWinClaimed = false;
      for (const player of room.players.values()) {
        player.card = null;
        if (!player.isHost) player.isReady = false;
      }
      clearAutoPlayInterval(roomId);
      emitRoomUpdate(roomId, io);
    });

    socket.on('rejoin_room', ({ roomId, playerName }) => {
      console.log(`Rejoin requested: ${playerName} for room ${roomId}`);
    
      const room = getRoom(roomId);
      if (!room) {
        console.log(`Room ${roomId} not found`);
        socket.emit('join_error', { message: 'Room not found.' });
        return;
      }
    
      socket.join(roomId);
    
      // Try to find previous player entry by name
      const oldPlayer = [...room.players.values()].find(p => p.name === playerName);
    
      if (oldPlayer) {
        room.players.delete(oldPlayer.id); // remove old socket.id
      }
    
      // Reassign player with new socket ID
      const newPlayer = {
        id: socket.id,
        name: playerName,
        isHost: oldPlayer?.isHost || false,
        isReady: oldPlayer?.isReady || false,
        card: oldPlayer?.card || null,
      };
    
      room.players.set(socket.id, newPlayer);
    
      if (newPlayer.isHost) {
        room.hostId = socket.id;
      }
    
      console.log(`Player ${playerName} rejoined room ${roomId}`);
      
      // Emit full state only to the rejoining player
      socket.emit('resync_state', {
        players: [...room.players.values()],
        gameStarted: room.gameStarted,
        currentNumber: room.currentNumber,
        calledNumbers: room.calledNumbers,
        autoPlay: room.autoPlay,
        lineWinners: room.lineWinners,
        fullHouseWinners: room.fullHouseWinners,
        isPaused: room.isPaused,
        lineWinClaimed: room.lineWinClaimed,
        yourCard: newPlayer.card,
      });
    
      // Let others know player is back
      emitRoomUpdate(roomId, io);
    });
    

    socket.on('disconnecting', () => {
      console.log(`User disconnecting: ${socket.id}`);
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        const room = getRoom(roomId);
        if (room) {
          room.players.delete(socket.id);
          room.lineWinners = room.lineWinners.filter(w => w.id !== socket.id);
          room.fullHouseWinners = room.fullHouseWinners.filter(w => w.id !== socket.id);
          if (room.players.size === 0) {
            console.log(`Room ${roomId} empty, will delete in 60 seconds if no one reconnects`);
          
            // Delay deletion to allow reconnection
            setTimeout(() => {
              const checkRoom = getRoom(roomId);
              if (checkRoom && checkRoom.players.size === 0) {
                console.log(`Room ${roomId} still empty after timeout, deleting`);
                deleteRoom(roomId);
                clearAutoPlayInterval(roomId);
              } else {
                console.log(`Room ${roomId} had players rejoin, skipping deletion`);
              }
            }, 60000); // 60 seconds
          }
          
          } else if (room.hostId === socket.id) {
            const newHost = room.players.values().next().value;
            if (newHost) {
              console.log(`Assigning new host ${newHost.id} for room ${roomId}`);
              newHost.isHost = true;
              newHost.isReady = true;
              room.hostId = newHost.id;
            } else {
              console.log(`No players left in room ${roomId}, deleting`);
              deleteRoom(roomId);
              clearAutoPlayInterval(roomId);
            }
          }
          emitRoomUpdate(roomId, io);
        }
      
    

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
})}