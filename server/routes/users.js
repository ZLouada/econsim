import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import auth from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;
const TOKEN_TTL = '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

// ─── POST /api/users/register ─────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ success: false, error: "'username' is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: "'email' must be a valid email address." });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, error: "'password' must be at least 8 characters." });
    }

    // Check for existing user
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Username or email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username.trim(), email.toLowerCase(), hashedPassword]
    );

    const user = rows[0];
    const token = signToken(user);
    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/users/login ────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "'email' and 'password' are required." });
    }

    const { rows } = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    const { password: _pw, ...safeUser } = user;
    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
