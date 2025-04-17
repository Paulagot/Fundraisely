// server/roomManager.js
const rooms = new Map();

export function createRoom(roomId, hostId) {
  if (!roomId || !hostId) {
    throw new Error('roomId and hostId are required');
  }
  if (rooms.has(roomId)) {
    throw new Error(`Room ${roomId} already exists`);
  }

  const room = {
    players: new Map(),
    gameStarted: false,
    currentNumber: null,
    calledNumbers: [],
    autoPlay: false,
    hostId,
    lineWinners: [],
    fullHouseWinners: [],
    isPaused: false,
    lineWinClaimed: false,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId) {
  if (!roomId) return null;
  return rooms.get(roomId) || null;
}

export function deleteRoom(roomId) {
  if (!roomId) return false;
  return rooms.delete(roomId);
}

export function addPlayer(roomId, playerId, playerData) {
  const room = getRoom(roomId);
  if (!room) {
    throw new Error(`Room ${roomId} not found`);
  }
  if (room.players.has(playerId)) {
    throw new Error(`Player ${playerId} already in room`);
  }
  room.players.set(playerId, playerData);
  return room;
}

export function removePlayer(roomId, playerId) {
  const room = getRoom(roomId);
  if (!room) return false;
  return room.players.delete(playerId);
}

export function emitRoomUpdate(roomId, io) {
  const room = getRoom(roomId);
  if (!room) return;

  // Convert players Map to array to ensure proper serialization
  const playersArray = Array.from(room.players.values());
  
  // Create a serializable room state object
  const roomState = {
    players: playersArray,
    gameStarted: room.gameStarted,
    currentNumber: room.currentNumber,
    calledNumbers: room.calledNumbers,
    autoPlay: room.autoPlay,
    lineWinners: room.lineWinners,
    fullHouseWinners: room.fullHouseWinners,
    isPaused: room.isPaused,
    lineWinClaimed: room.lineWinClaimed,
    // Include the gameOver flag if it exists
    gameOver: room.gameOver || false
  };

  // Log the structure to ensure it's correctly formatted
  console.log(`Sending room_update for ${roomId} with players:`, playersArray);
  
  // Emit the update to all clients in the room
  io.to(roomId).emit('room_update', roomState);
}

