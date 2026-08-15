import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQuestion } from './gameLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static frontend files if they exist (for production/deployment)
app.use(express.static(path.join(__dirname, '../dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store rooms in memory
// rooms[roomCode] = { hostId, settings, players: {}, state, currentQuestion, timer, currentQuestionIndex }
const rooms = {};

const generateRoomCode = () => {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);
  return code;
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- HOST EVENTS ---
  socket.on('createRoom', (settings, callback) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      hostId: socket.id,
      settings: settings || { questionCount: 15, timePerQuestion: 15, categories: ['arithmetic_seq', 'geometric_seq', 'arithmetic_series', 'geometric_series'] },
      players: {}, // socketId -> { name, score, correct, totalAnswered, answers: {} }
      state: 'lobby', // lobby, playing, results
      currentQuestion: null,
      currentQuestionIndex: 0,
      timeLeft: 0,
      intervalId: null
    };
    socket.join(roomCode);
    callback({ roomCode });
  });

  socket.on('startGame', (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.hostId === socket.id) {
      room.state = 'playing';
      room.currentQuestionIndex = 0;
      io.to(roomCode).emit('gameStarted');
      sendNextQuestion(roomCode);
    }
  });

  socket.on('nextQuestion', (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.hostId === socket.id) {
      room.currentQuestionIndex++;
      if (room.currentQuestionIndex < room.settings.questionCount) {
        sendNextQuestion(roomCode);
      } else {
        endGame(roomCode);
      }
    }
  });

  socket.on('endGame', (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.hostId === socket.id) {
      endGame(roomCode);
    }
  });

  socket.on('closeRoom', (roomCode) => {
    const room = rooms[roomCode];
    if (room && room.hostId === socket.id) {
      io.to(roomCode).emit('roomClosed');
      clearInterval(room.intervalId);
      delete rooms[roomCode];
    }
  });

  // --- PLAYER EVENTS ---
  socket.on('joinRoom', ({ roomCode, playerName }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      return callback({ error: 'ไม่พบห้องนี้' });
    }
    if (room.state !== 'lobby') {
      return callback({ error: 'เกมเริ่มไปแล้ว ไม่สามารถเข้าได้' });
    }
    
    // check duplicate name?
    const nameExists = Object.values(room.players).some(p => p.name === playerName);
    if (nameExists) {
      return callback({ error: 'ชื่อนี้มีคนใช้แล้วในห้อง' });
    }

    room.players[socket.id] = {
      id: socket.id,
      name: playerName,
      score: 0,
      correct: 0,
      totalAnswered: 0,
      answers: {} // questionIndex -> boolean
    };
    socket.join(roomCode);
    
    // Broadcast updated player list
    io.to(roomCode).emit('updatePlayers', Object.values(room.players));
    callback({ success: true, roomCode });
  });

  socket.on('submitAnswer', ({ roomCode, answer }) => {
    const room = rooms[roomCode];
    if (!room || room.state !== 'playing' || !room.currentQuestion || room.timeLeft <= 0) return;
    
    const player = room.players[socket.id];
    if (!player) return;

    // Check if already answered this question
    if (player.answers[room.currentQuestionIndex] !== undefined) return;

    player.totalAnswered++;
    const isCorrect = answer === room.currentQuestion.answer;
    player.answers[room.currentQuestionIndex] = isCorrect;

    if (isCorrect) {
      player.correct++;
      const baseScore = 100;
      const speedBonus = Math.floor((room.timeLeft / room.settings.timePerQuestion) * 100);
      player.score += (baseScore + speedBonus);
      socket.emit('answerResult', { correct: true, score: baseScore + speedBonus });
    } else {
      socket.emit('answerResult', { correct: false, score: 0 });
    }

    // Send updated leaderboard to host
    io.to(room.hostId).emit('updateLeaderboard', getLeaderboard(room));
    
    // Check if all players answered
    if (Object.values(room.players).every(p => p.answers[room.currentQuestionIndex] !== undefined)) {
      clearInterval(room.intervalId);
      io.to(roomCode).emit('timeUp', room.currentQuestion.answer); // Everyone answered, auto end question
    }
  });

  // --- DISCONNECT ---
  socket.on('disconnect', () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      if (room.hostId === socket.id) {
        // Host disconnected
        io.to(roomCode).emit('roomClosed', 'Host ได้ปิดห้องนี้แล้ว');
        clearInterval(room.intervalId);
        delete rooms[roomCode];
      } else if (room.players[socket.id]) {
        // Player disconnected
        delete room.players[socket.id];
        io.to(roomCode).emit('updatePlayers', Object.values(room.players));
        io.to(room.hostId).emit('updateLeaderboard', getLeaderboard(room));
      }
    }
  });

  // --- UTILS ---
  const sendNextQuestion = (roomCode) => {
    const room = rooms[roomCode];
    if (room.intervalId) clearInterval(room.intervalId);
    
    room.currentQuestion = generateQuestion(room.settings.categories);
    room.timeLeft = room.settings.timePerQuestion;

    const questionPayload = {
      index: room.currentQuestionIndex + 1,
      total: room.settings.questionCount,
      question: room.currentQuestion.question,
      options: room.currentQuestion.options,
      timePerQuestion: room.settings.timePerQuestion,
      explanation: room.currentQuestion.explanation,
      category: room.currentQuestion.category
    };

    io.to(roomCode).emit('newQuestion', questionPayload);

    room.intervalId = setInterval(() => {
      room.timeLeft--;
      io.to(roomCode).emit('timerUpdate', room.timeLeft);

      if (room.timeLeft <= 0) {
        clearInterval(room.intervalId);
        io.to(roomCode).emit('timeUp', room.currentQuestion.answer);
      }
    }, 1000);
  };

  const endGame = (roomCode) => {
    const room = rooms[roomCode];
    room.state = 'results';
    if (room.intervalId) clearInterval(room.intervalId);
    io.to(roomCode).emit('gameEnded', getLeaderboard(room));
  };

  const getLeaderboard = (room) => {
    const sorted = Object.values(room.players).sort((a, b) => b.score - a.score);
    return sorted.map((p, index) => ({
      rank: index + 1,
      name: p.name,
      score: p.score,
      correct: p.correct,
      totalAnswered: p.totalAnswered,
      accuracy: room.currentQuestionIndex > 0 ? Math.round((p.correct / (room.currentQuestionIndex + 1)) * 100) : 0
    }));
  };
});

// Catch-all route to serve the React app for any other path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
