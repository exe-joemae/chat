require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const db = require('./db');
const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);

async function ensureTables() {
  const fs = require('fs');
  const path = require('path');
  const sql = fs.readFileSync(path.join(__dirname, 'models.sql')).toString();
  await db.query(sql);
}
ensureTables().catch(console.error);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('unauthorized'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join', async ({ roomId }) => {
    socket.join(`room_${roomId}`);
    const messages = await db.query('SELECT m.id, m.body, m.created_at, u.username FROM messages m LEFT JOIN users u ON m.user_id = u.id WHERE m.room_id=$1 ORDER BY m.created_at ASC', [roomId]);
    socket.emit('history', messages.rows);
  });

  socket.on('message', async ({ roomId, body }) => {
    if (!socket.user) return;
    const res = await db.query('INSERT INTO messages (room_id, user_id, body) VALUES ($1, $2, $3) RETURNING id, created_at', [roomId, socket.user.id, body]);
    const msg = { id: res.rows[0].id, body, created_at: res.rows[0].created_at, username: socket.user.username };
    io.to(`room_${roomId}`).emit('message', msg);
  });

  socket.on('leave', ({ roomId }) => {
    socket.leave(`room_${roomId}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
