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

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve pitch deck HTML file
app.get('/pitch-deck.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pitch-deck.html'));
});

// For your React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

setupSocketHandlers(io);

// ✅ Heartbeat route for health checking
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/debug/rooms', (req, res) => {
  const roomStates = logAllRooms(); // Now returns an array
  res.json({
    totalRooms: roomStates.length,
    rooms: roomStates
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});