// server/socketHandler.js
console.log('🧠 [socketHandler.js] File loaded');

import { clearAutoPlayInterval, startAutoPlay, callNextNumber } from './gameLogic.js';
import { createRoom, getRoom, deleteRoom, emitRoomUpdate, setPaymentsFinalized } from './roomManager.js';
import { isRateLimited } from './socketRateLimiter.js';
import { setupQuizSocketHandlers } from './quiz/quizSocketHandler.js'



export function setupSocketHandlers(io) {
  console.log('🔌 Setting up socket handlers');

      console.log('🎯 About to initialize quiz namespace...');
  setupQuizSocketHandlers(io.of('/quiz'));
  console.log('✅ Quiz socket handlers registered');

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id, 'from', socket.handshake.address);

    socket.on('get_contract_address', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.contractAddress) {
        socket.emit('contract_address_response', { roomId, error: 'Contract not found' });
        return;
      }
      socket.emit('contract_address_response', { roomId, contractAddress: room.contractAddress });
    });

    socket.on('verify_room_exists', ({ roomId }) => {
      const room = getRoom(roomId);
      socket.emit('room_verification_result', {
        roomId,
        exists: !!room,
        chainId: room?.chainId || null,
        contractAddress: room?.contractAddress || null,
        namespace: room?.namespace || 'eip155',
        entryFee: room?.entryFee || '0',
      });
    });

    socket.on('create_room', ({ roomId, playerName, walletAddress, contractAddress, chainId, namespace, entryFee }) => {
      if (isRateLimited(socket, 'create_room', 3)) {
        socket.emit('create_error', { message: 'Too many room creation attempts. Please wait.' });
        return;
      }
      let room = getRoom(roomId);
      if (room) {
        socket.emit('create_error', { message: 'Room already exists' });
        return;
      }
      socket.join(roomId);
      room = createRoom(roomId, socket.id, contractAddress, chainId, namespace, entryFee);
      room.players.set(socket.id, {
        id: socket.id,
        wallet: walletAddress,
        name: playerName,
        isHost: true,
        isReady: true,
        card: null,
      });
      room.hostWallet = walletAddress;
      emitRoomUpdate(roomId, io);
      socket.emit('room_verification_result', { roomId, exists: true, chainId, contractAddress, namespace, entryFee });
    });

    socket.on('join_room', ({ roomId, playerName, walletAddress }) => {
      if (isRateLimited(socket, 'join_room', 5)) {
        socket.emit('join_error', { message: 'Too many join attempts. Please slow down.' });
        return;
      }
      const room = getRoom(roomId);
      if (!room) {
        socket.emit('join_error', { message: 'Room not found.' });
        return;
      }
      if (room.gameStarted) {
        socket.emit('join_error', { message: 'Cannot join. Game already started.' });
        return;
      }
      socket.join(roomId);
      room.players.set(socket.id, {
        id: socket.id,
        name: playerName,
        isHost: false,
        isReady: false,
        wallet: walletAddress,
        card: null,
      });
      emitRoomUpdate(roomId, io);
    });

    socket.on('rejoin_room', ({ roomId, playerName, walletAddress }) => {
      if (isRateLimited(socket, 'rejoin_room', 5)) {
        socket.emit('join_error', { message: 'Too many reconnect attempts. Please wait.' });
        return;
      }
      const room = getRoom(roomId);
      if (!room) {
        socket.emit('join_error', { message: 'Room not found.' });
        return;
      }
      socket.join(roomId);
      const oldPlayer = [...room.players.values()].find(p => p.wallet?.toLowerCase() === walletAddress?.toLowerCase());
      if (!oldPlayer) {
        socket.emit('join_error', { message: 'Rejoin failed. Please rejoin from frontend.' });
        return;
      }
      room.players.delete(oldPlayer.id);
      const newPlayer = {
        id: socket.id,
        name: oldPlayer.name,
        isHost: oldPlayer.isHost,
        isReady: oldPlayer.isReady,
        wallet: oldPlayer.wallet,
        card: oldPlayer.card,
      };
      room.players.set(socket.id, newPlayer);
      if (newPlayer.isHost) {
        room.hostId = socket.id;
      }
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
        paymentsFinalized: room.paymentsFinalized || false,
        gameOver: room.gameOver || false,
      });
      emitRoomUpdate(roomId, io);
    });

    socket.on('toggle_ready', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`⚠️ toggle_ready: Room ${roomId} not found`);
        return;
      }
      const player = room.players.get(socket.id);
      if (!player) {
        console.warn(`⚠️ toggle_ready: Player ${socket.id} not found in room ${roomId}`);
        return;
      }
      player.isReady = !player.isReady;
      console.log(`✅ Player ${player.name} (${socket.id}) toggled ready to ${player.isReady} in room ${roomId}`);
      emitRoomUpdate(roomId, io);
    });

    socket.on('start_game', ({ roomId }) => {
      console.log(`🎮 start_game request - roomId: ${roomId}, socketId: ${socket.id}`);
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`⚠️ start_game - Room ${roomId} not found`);
        socket.emit('start_game_error', { message: 'Room not found' });
        return;
      }
      const player = room.players.get(socket.id);
      if (!player?.isHost) {
        console.warn(`⚠️ start_game - Player ${socket.id} is not the host of room ${roomId}`);
        socket.emit('start_game_error', { message: 'Only the host can start the game' });
        return;
      }
      if (room.gameStarted) {
        console.warn(`⚠️ start_game - Game in room ${roomId} is already started`);
        socket.emit('start_game_error', { message: 'Game is already started' });
        return;
      }
      const nonHostPlayers = [...room.players.values()].filter(p => !p.isHost);
      const allReady = nonHostPlayers.every(p => p.isReady);
      if (!allReady) {
        console.warn(`⚠️ start_game - Not all players are ready in room ${roomId}`);
        socket.emit('start_game_error', { message: 'All players must be ready to start' });
        return;
      }
      console.log(`🎮 Starting game in room ${roomId}`);
      room.gameStarted = true;
      emitRoomUpdate(roomId, io);
      io.to(roomId).emit('game_started', {
        roomId,
        hostId: room.hostId,
        players: [...room.players.values()],
      });
      console.log(`✅ Game started successfully in room ${roomId}`);
    });

    socket.on('update_card', ({ roomId, card }) => {
      const room = getRoom(roomId);
      if (!room || !room.players.has(socket.id)) return;
      const player = room.players.get(socket.id);
      player.card = card;
      io.to(roomId).emit('player_card_update', { playerId: socket.id, card });
    });

    socket.on('call_number', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const player = room.players.get(socket.id);
      if (!player?.isHost) return;
      if (!room.gameStarted || room.isPaused) return;
      callNextNumber(room, roomId, io);
    });

    socket.on('toggle_auto_play', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room) return;
      const player = room.players.get(socket.id);
      if (!player?.isHost) return;
      if (!room.gameStarted || room.isPaused) return;
      room.autoPlay = !room.autoPlay;
      if (room.autoPlay) {
        startAutoPlay(roomId, room, io);
      } else {
        clearAutoPlayInterval(roomId);
      }
      io.to(roomId).emit('auto_play_update', { autoPlay: room.autoPlay });
    });

    socket.on('player_line_won', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.gameStarted || room.lineWinClaimed) return;
      const player = room.players.get(socket.id);
      if (!player) return;
      if (!room.lineWinners.some(w => w.id === socket.id)) {
        room.lineWinners.push({ id: socket.id, name: player.name, wallet: player.wallet });
      }
      room.isPaused = true;
      clearAutoPlayInterval(roomId);
      io.to(roomId).emit('game_paused');
      io.to(roomId).emit('line_winners_proposed', { winners: room.lineWinners });
    });

    socket.on('player_full_house_won', ({ roomId }) => {
      const room = getRoom(roomId);
      if (!room || !room.gameStarted || !room.lineWinClaimed) return;
      const player = room.players.get(socket.id);
      if (!player) return;
      if (!room.fullHouseWinners.some(w => w.id === socket.id)) {
        room.fullHouseWinners.push({ id: socket.id, name: player.name, wallet: player.wallet });
      }
      room.isPaused = true;
      clearAutoPlayInterval(roomId);
      io.to(roomId).emit('game_paused');
      io.to(roomId).emit('full_house_winners_proposed', { winners: room.fullHouseWinners });
    });

    socket.on('declare_line_winners', ({ roomId }) => {
      console.log(`[Server] 📢 Processing declare_line_winners for room: ${roomId}, Socket: ${socket.id}`);
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`[Server] 🚫 Room not found: ${roomId}`);
        return;
      }
      const player = room.players.get(socket.id);
      if (!player?.isHost) {
        console.warn(`[Server] 🚫 Player ${socket.id} is not the host of room ${roomId}`);
        return;
      }
      if (!room.isPaused) {
        console.warn(`[Server] 🚫 Room ${roomId} is not paused`);
        return;
      }
      room.lineWinClaimed = true;
      console.log(`[Server] ✅ Line win claimed for room: ${roomId}, Winners: ${room.lineWinners.length}`);
      io.to(roomId).emit('line_winners_declared', { winners: room.lineWinners });
      emitRoomUpdate(roomId, io);
    });

    socket.on('declare_full_house_winners', ({ roomId }) => {
      console.log(`[Server] 📢 Processing declare_full_house_winners for room: ${roomId}, Socket: ${socket.id}`);
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`[Server] 🚫 Room not found: ${roomId}`);
        return;
      }
      const player = room.players.get(socket.id);
      if (!player?.isHost) {
        console.warn(`[Server] 🚫 Player ${socket.id} is not the host of room ${roomId}`);
        return;
      }
      if (!room.isPaused) {
        console.warn(`[Server] 🚫 Room ${roomId} is not paused`);
        return;
      }
      room.gameOver = true;
      room.gameStarted = false;
      console.log(`[Server] ✅ Full house win claimed for room: ${roomId}, Winners: ${room.fullHouseWinners.length}`);
      io.to(roomId).emit('full_house_winners_declared', { winners: room.fullHouseWinners });
      io.to(roomId).emit('game_over');
      emitRoomUpdate(roomId, io);
    });

    socket.on('unpause_game', ({ roomId }) => {
      console.log(`[Server] 📢 Processing unpause_game for room: ${roomId}, Socket: ${socket.id}`);
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`[Server] 🚫 Room not found: ${roomId}`);
        return;
      }
      const player = room.players.get(socket.id);
      if (!player?.isHost) {
        console.warn(`[Server] 🚫 Player ${socket.id} is not the host of room ${roomId}`);
        return;
      }
      if (!room.isPaused) {
        console.warn(`[Server] 🚫 Room ${roomId} is not paused`);
        return;
      }
      room.isPaused = false;
      console.log(`[Server] ✅ Room ${roomId} unpaused`);
      if (room.autoPlay) {
        startAutoPlay(roomId, room, io);
      }
      io.to(roomId).emit('game_unpaused');
      emitRoomUpdate(roomId, io);
    });

    socket.on('payments_finalized', ({ roomId, txHash }) => {
      console.log(`[Server] 💰 Processing payments_finalized for room: ${roomId}, txHash: ${txHash}`);
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`[Server] 🚫 Room not found: ${roomId}`);
        return;
      }
      const player = room.players.get(socket.id);
      if (!player?.isHost) {
        console.warn(`[Server] 🚫 Player ${socket.id} is not the host of room ${roomId}`);
        return;
      }
      // Update room state
      setPaymentsFinalized(roomId, true);
      // Broadcast to all clients in the room
      io.to(roomId).emit('payments_finalized', { roomId, txHash });
      console.log(`[Server] ✅ Broadcasted payments_finalized to room ${roomId}`);
      emitRoomUpdate(roomId, io);
    });

    socket.on('leave_room', ({ roomId }) => {
      console.log(`👋 leave_room request - roomId: ${roomId}, socketId: ${socket.id}`);
      console.log(`👋 Socket ${socket.id} leaving room ${roomId}`);
      socket.leave(roomId);
      const room = getRoom(roomId);
      if (!room) {
        console.warn(`⚠️ Leave room - Room ${roomId} not found`);
        return;
      }
      const player = room.players.get(socket.id);
      console.log(`👤 Player ${player?.name || socket.id} leaving room ${roomId}`);
      room.players.delete(socket.id);
      console.log(`➖ Removed player from room. Remaining players: ${room.players.size}`);
      console.log('🏆 Filtering player from winners lists');
      room.lineWinners = room.lineWinners.filter(w => w.id !== socket.id);
      room.fullHouseWinners = room.fullHouseWinners.filter(w => w.id !== socket.id);
      const isHost = room.hostId === socket.id;
      console.log(`👑 Leaving player is host: ${isHost}`);
      if (room.players.size === 0) {
        console.log(`🗑️ No players left in room ${roomId}, deleting room`);
        deleteRoom(roomId);
        clearAutoPlayInterval(roomId);
      } else if (isHost && !room.gameStarted) {
        console.log(`🗑️ Host left before game started in room ${roomId}, deleting room`);
        deleteRoom(roomId);
        clearAutoPlayInterval(roomId);
      } else if (isHost) {
        console.log(`👑 Assigning new host in room ${roomId}`);
        const newHost = room.players.values().next().value;
        if (newHost) {
          console.log(`👑 Player ${newHost.name} is now host in room ${roomId}`);
          newHost.isHost = true;
          newHost.isReady = true;
          room.hostId = newHost.id;
        }
      }
      console.log('📢 Emitting room update after player left');
      emitRoomUpdate(roomId, io);
    });

    socket.on('disconnecting', () => {
      console.log(`🔌 Socket ${socket.id} disconnecting, checking rooms`);
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        console.log(`🔍 Processing disconnection from room ${roomId}`);
        const room = getRoom(roomId);
        if (!room) {
          console.warn(`⚠️ Room ${roomId} not found during disconnection`);
          continue;
        }
        const player = room.players.get(socket.id);
        console.log(`👤 Player ${player?.name || socket.id} disconnecting from room ${roomId}`);
        room.players.delete(socket.id);
        console.log(`➖ Removed player from room. Remaining players: ${room.players.size}`);
        const isHost = room.hostId === socket.id;
        console.log(`👑 Disconnecting player is host: ${isHost}`);
        if (room.players.size === 0) {
          console.log(`🗑️ No players left in room ${roomId}, deleting room`);
          deleteRoom(roomId);
          clearAutoPlayInterval(roomId);
        } else if (isHost && !room.gameStarted) {
          console.log(`🗑️ Host disconnected before game started in room ${roomId}, deleting room`);
          deleteRoom(roomId);
          clearAutoPlayInterval(roomId);
        } else if (isHost) {
          console.log(`👑 Assigning new host in room ${roomId}`);
          const newHost = room.players.values().next().value;
          if (newHost) {
            console.log(`👑 Player ${newHost.name} is now host in room ${roomId}`);
            newHost.isHost = true;
            newHost.isReady = true;
            room.hostId = newHost.id;
          }
        }
        console.log('📢 Emitting room update after player disconnected');
        emitRoomUpdate(roomId, io);
      }
    });

    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id} from ${socket.handshake.address}`);
    });
  });


}
