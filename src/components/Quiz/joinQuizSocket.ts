//src/components/Quiz/joinQuizSocket.ts
import type { Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
}

export function joinQuizRoom(socket: Socket, roomId: string, player: Player) {
  socket.emit('join_quiz_room', { roomId, player });

  socket.on('quiz_error', ({ message }: { message: string }) => {
    alert('Join failed: ' + message);
  });

  socket.on('player_joined', ({ player }: { player: Player }) => {
    console.log(`✅ ${player.name} joined ${roomId}`);
  });

  
}

export function verifyRoomAndPlayer(
  socket: Socket,
  roomId: string,
  playerId: string,
  callback: (data: { roomExists: boolean; playerApproved: boolean }) => void
) {
  socket.emit('verify_quiz_room_and_player', { roomId, playerId });

  socket.once('quiz_room_player_verification_result', (data) => {
    callback(data);
  });
}

