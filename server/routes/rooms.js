const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

router.get('/', authMiddleware, async (req, res) => {
  const result = await db.query('SELECT id, name, password_hash IS NOT NULL AS locked, created_by FROM rooms ORDER BY created_at DESC');
  res.json({ rooms: result.rows });
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, password } = req.body;
  try {
    let hash = null;
    if (password) hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query('INSERT INTO rooms (name, password_hash, created_by) VALUES ($1, $2, $3) RETURNING id, name', [name, hash, req.user.id]);
    res.json({ room: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/:id/join', authMiddleware, async (req, res) => {
  const { password } = req.body;
  const roomId = req.params.id;
  try {
    const r = await db.query('SELECT id, name, password_hash FROM rooms WHERE id=$1', [roomId]);
    const room = r.rows[0];
    if (!room) return res.status(404).json({ error: 'room not found' });
    if (room.password_hash) {
      const ok = await bcrypt.compare(password || '', room.password_hash);
      if (!ok) return res.status(401).json({ error: 'invalid room password' });
    }
    res.json({ room: { id: room.id, name: room.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
