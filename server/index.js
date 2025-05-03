//server/index.js
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupSocketHandlers } from './socketHandler.js';
import { PORT } from './config.js';
import { logAllRooms } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// ✅ Serve static files in development
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Serve pitch deck
app.get('/pitch-deck.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pitch-deck.html'));
});

// ✅ Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

setupSocketHandlers(io);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ✅ Room debug
app.get('/debug/rooms', (req, res) => {
  const roomStates = logAllRooms();
  res.json({
    totalRooms: roomStates.length,
    rooms: roomStates
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
