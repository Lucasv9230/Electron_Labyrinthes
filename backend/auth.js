const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const SECRET = 'labyrinth_jwt_secret_2026';

function register(firstName, lastName, email, password, birthYear) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('Cet email est déjà utilisé');

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (firstName, lastName, email, password, birthYear) VALUES (?, ?, ?, ?, ?)'
  ).run(firstName, lastName, email, hash, birthYear);

  const user = db.prepare('SELECT id, firstName, lastName, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET);
  return { user, token };
}

function login(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) throw new Error('Email ou mot de passe incorrect');

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) throw new Error('Email ou mot de passe incorrect');

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET);
  const { password: _, ...userClean } = user;
  return { user: userClean, token };
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { register, login, verifyToken };
