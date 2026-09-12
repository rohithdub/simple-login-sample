const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'data.db'));

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

  res.json({ success: true, id: result.lastInsertRowid });
});

// Simple admin/debug endpoint. Protect this before using it publicly.
app.get('/api/users', (_req, res) => {
  const users = db.prepare(
    'SELECT id, name, age, email, created_at FROM users ORDER BY id DESC'
  ).all();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
