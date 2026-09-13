const express = require('express');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'data.db'));

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const sessions = new Map();

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.warn('\nWARNING: ADMIN_EMAIL / ADMIN_PASSWORD are not set.');
  console.warn(`Learning-mode admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.warn('Set these as environment variables before using this publicly.\n');
}

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isValidSession(token) {
  const expiresAt = token && sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_session;
  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }
  next();
}

function safeEqualText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Parse only the cookie we issue for this learning app.
app.use((req, _res, next) => {
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map(v => v.trim()).find(v => v.startsWith('admin_session='));
  req.cookies = {};
  if (match) req.cookies.admin_session = decodeURIComponent(match.slice('admin_session='.length));
  next();
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.post('/api/users', (req, res) => {
  const name = String(req.body.name || '').trim();
  const age = Number(req.body.age);
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!name || !Number.isInteger(age) || age < 1 || age > 120 || !email) {
    return res.status(400).json({ error: 'Please enter a valid name, age, and email.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const result = db.prepare(
    'INSERT INTO users (name, age, email) VALUES (?, ?, ?)'
  ).run(name, age, email);

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

app.post('/api/admin/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!safeEqualText(email, ADMIN_EMAIL) || !safeEqualText(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid admin email or password.' });
  }

  const token = createSession();
  res.setHeader(
    'Set-Cookie',
    `admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );

  res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.admin_session;
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  res.json({ success: true });
});

app.get('/api/admin/me', requireAdmin, (_req, res) => {
  res.json({ authenticated: true, email: ADMIN_EMAIL });
});

app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const users = db.prepare(
    'SELECT id, name, age, email, created_at FROM users ORDER BY id DESC'
  ).all();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
