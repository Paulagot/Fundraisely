//src/server/quiz/quizRoomManager.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const quizRooms = new Map();
const debug = true;

function loadQuestionsForGameType(gameType) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const filePath = path.join(__dirname, '../data/questions', `${gameType}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[loadQuestions] ❌ Failed for gameType: ${gameType}`, err);
    return [];
  }
}

export function createQuizRoom(roomId, hostId, config) {
  if (quizRooms.has(roomId)) {
    console.log(`[createQuizRoom] ❌ Room already exists: ${roomId}`);
    return false;
  }

  const gameType = config.gameType;
  console.log(`[loadQuestionsForGameType] 🧪 Requested: ${gameType}`);
  const questions = loadQuestionsForGameType(config.gameType);

  if (!questions.length) {
    console.error(`[createQuizRoom] ❌ No questions loaded for game type: ${config.gameType}`);
    return false; // stop room creation if empty
  }

  // Set default values for missing configuration
  const finalConfig = {
    ...config,
    roundCount: config.roundCount || 3,
    questionsPerRound: config.questionsPerRound || 5,
    timePerQuestion: config.timePerQuestion || 30
  };

  quizRooms.set(roomId, {
    hostId,
    config: finalConfig,
    currentQuestionIndex: -1, // Start at -1 so first advanceToNextQuestion gives index 0
    currentRound: 1,
    questions,
    players: [],
    playerData: {},
    currentPhase: 'waiting',
    createdAt: Date.now()
  });

  console.log(`[createQuizRoom] ✅ Created room ${roomId} with ${questions.length} questions`);
  return true;
}

export function getQuizRoom(roomId) {
  return quizRooms.get(roomId);
}

export function addPlayerToQuizRoom(roomId, player) {
  const room = quizRooms.get(roomId);
  if (!room) return false;

  // Check if player already exists to avoid duplicates
  const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
  
  if (existingPlayerIndex >= 0) {
    // Update existing player
    room.players[existingPlayerIndex] = {
      ...room.players[existingPlayerIndex],
      ...player
    };
  } else {
    // Add new player
    room.players.push(player);
  }

  const extras = player.extras || [];

  // Initialize or update player data
  room.playerData[player.id] = room.playerData[player.id] || {
    status: 'active',
    usedClues: 0,
    usedCluesThisRound: 0,
    usedLifeline: false,
    usedSecondChance: false,
    score: 0,
    answers: {},
    purchases: {
      lifeline: extras.includes('lifeline'),
      secondChance: extras.includes('secondChance')
    }
  };

  return true;
}

export function useClue(roomId, playerId) {
  const room = quizRooms.get(roomId);
  if (!room) return { success: false, reason: 'Room not found' };

  const clueLimits = room.config.fundraisingOptions?.buyHint || { maxPerPlayer: 3, usagePhase: 'perRound' };

  const pdata = room.playerData[playerId];
  if (!pdata) return { success: false, reason: 'Player not found' };

  if (pdata.usedClues >= clueLimits.maxPerPlayer) {
    return { success: false, reason: 'Max clues used' };
  }

  if (clueLimits.usagePhase === 'perRound' && pdata.usedCluesThisRound >= 1) {
    return { success: false, reason: 'Only one clue allowed per round' };
  }

  // Find current question
  const q = room.questions[room.currentQuestionIndex];
  if (!q || !q.clue) {
    return { success: false, reason: 'No clue for this question' };
  }

  // Update tracking
  pdata.usedClues++;
  pdata.usedCluesThisRound++;

  return {
    success: true,
    clue: q.clue
  };
}

export function resetRoundClueTracking(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return;

  for (const playerId of Object.keys(room.playerData)) {
    room.playerData[playerId].usedCluesThisRound = 0;
  }
  
  if (debug) console.log(`[resetRoundClueTracking] 🔄 Reset clue tracking for room ${roomId}`);
}

export function submitAnswerForSurvivor(roomId, playerId, answer) {
  const room = quizRooms.get(roomId);
  if (!room) return { success: false, reason: 'Room not found' };

  const q = room.questions[room.currentQuestionIndex];
  if (!q) return { success: false, reason: 'No current question' };

  const player = room.playerData[playerId];
  if (!player) return { success: false, reason: 'Player not found' };

  if (player.status === 'eliminated') {
    return { success: false, reason: 'Player already eliminated' };
  }

  // Save answer
  player.answers[q.id] = answer;

  // Evaluate
  const correct = answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

  if (correct) {
    return { success: true, eliminated: false, correct: true };
  } else {
    // Only eliminate if lifeline hasn't been used
    if (player.usedLifeline) {
      player.status = 'eliminated';
      return { success: true, eliminated: true, correct: false };
    } else {
      // Wait for player to manually use lifeline — they are still "at risk"
      return { success: true, eliminated: false, atRisk: true, correct: false };
    }
  }
}

export function listQuizRooms() {
  return Array.from(quizRooms.entries()).map(([id, room]) => ({
    id,
    hostId: room.hostId,
    players: room.players.length,
    started: room.currentRound > 1 || room.currentQuestionIndex > 0
  }));
}

// function to delete a quiz room
export function removeQuizRoom(roomId) {
  if (quizRooms.has(roomId)) {
    quizRooms.delete(roomId);
    console.log(`[removeQuizRoom] ✅ Removed room ${roomId}`);
    return true;
  }
  console.log(`[removeQuizRoom] ❌ Room not found: ${roomId}`);
  return false;
}

export function advanceToNextQuestion(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return null;

  // Increment the question index
  room.currentQuestionIndex = (room.currentQuestionIndex || 0) + 1;
  
  const { questions, currentQuestionIndex } = room;
  
  // Check if we've gone beyond available questions
  if (currentQuestionIndex >= questions.length) {
    if (debug) console.log(`[advanceToNextQuestion] ⚠️ No more questions available in room ${roomId}`);
    return null;
  }

  // Check if we've reached the end of the round
  const questionsPerRound = room.config.questionsPerRound || 5;
  const questionNumberInRound = (currentQuestionIndex % questionsPerRound) + 1;
  
  if (debug) {
    console.log(`[advanceToNextQuestion] 🔄 Advanced to question ${questionNumberInRound} of round ${room.currentRound}`);
  }

  return questions[currentQuestionIndex];
}

export function isEndOfRound(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return false;

  const { currentQuestionIndex = 0, config } = room;
  const questionsPerRound = config.questionsPerRound || 5;
  
  // Check if the current question is the last one in the round
  const questionNumberInRound = (currentQuestionIndex % questionsPerRound) + 1;
  const isLast = questionNumberInRound >= questionsPerRound;
  
  if (debug && isLast) {
    console.log(`[isEndOfRound] ✅ Reached end of round for room ${roomId}`);
  }
  
  return isLast;
}

export function startNextRound(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return false;

  // Increment round counter
  room.currentRound = (room.currentRound || 1) + 1;
  
  // Reset question index for the new round
  // We set to -1 because advanceToNextQuestion will increment it to 0
  room.currentQuestionIndex = -1;
  
  // Reset phase
  room.currentPhase = 'waiting';
  
  if (debug) {
    console.log(`[startNextRound] 🔄 Starting round ${room.currentRound} for room ${roomId}`);
  }
  
  return true;
}

export function getCurrentQuestion(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return null;
  
  const { questions, currentQuestionIndex } = room;
  
  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
    if (debug) {
      console.log(`[getCurrentQuestion] ⚠️ Invalid question index ${currentQuestionIndex} for room ${roomId}`);
    }
    return null;
  }
  
  return questions[currentQuestionIndex];
}

export function getTotalRounds(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return 1;
  return room.config.roundCount || 3;
}

export function getCurrentRound(roomId) {
  const room = quizRooms.get(roomId);
  if (!room) return 1;
  return room.currentRound || 1;
}






