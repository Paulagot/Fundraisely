// gameLogic.js
const AUTO_CALL_INTERVAL = 5000;

const autoPlayIntervals = new Map();

export function clearAutoPlayInterval(roomId) {
  if (autoPlayIntervals.has(roomId)) {
    clearInterval(autoPlayIntervals.get(roomId));
    autoPlayIntervals.delete(roomId);
  }
}

export function startAutoPlay(roomId, room, io) {
  if (!room || !room.autoPlay) return;

  clearAutoPlayInterval(roomId);

  const intervalId = setInterval(() => {
    if (!room.gameStarted || !room.autoPlay || room.isPaused || room.fullHouseWinners.length > 0) {
      clearAutoPlayInterval(roomId);
      return;
    }

    callNextNumber(room, roomId, io);
  }, AUTO_CALL_INTERVAL);

  autoPlayIntervals.set(roomId, intervalId);
}

export function callNextNumber(room, roomId, io) {
  if (room.isPaused || room.fullHouseWinners.length > 0) return null;

  const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1).filter(
    num => !room.calledNumbers.includes(num)
  );

  if (availableNumbers.length === 0) {
    clearAutoPlayInterval(roomId);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  const newNumber = availableNumbers[randomIndex];

  room.currentNumber = newNumber;
  room.calledNumbers.push(newNumber);

  io.to(roomId).emit('number_called', {
    currentNumber: newNumber,
    calledNumbers: room.calledNumbers,
  });

  return newNumber;
}