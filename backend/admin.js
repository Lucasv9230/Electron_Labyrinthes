// Dashboard administration
const db = require('./database');
const bcrypt = require('bcryptjs');

function getUsers() {
  return db.prepare('SELECT id, firstName, lastName, email, role, birthYear, createdAt FROM users ORDER BY createdAt DESC').all();
}

function createUser(firstName, lastName, email, password, birthYear, role = 'user') {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('Email déjà utilisé');
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (firstName, lastName, email, password, birthYear, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(firstName, lastName, email, hash, birthYear || 2000, role);
  return db.prepare('SELECT id, firstName, lastName, email, role, birthYear, createdAt FROM users WHERE id = ?').get(result.lastInsertRowid);
}

function updateUser(id, data) {
  const fields = [];
  const values = [];
  if (data.firstName) { fields.push('firstName = ?'); values.push(data.firstName); }
  if (data.lastName)  { fields.push('lastName = ?');  values.push(data.lastName); }
  if (data.email)     { fields.push('email = ?');     values.push(data.email); }
  if (data.role)      { fields.push('role = ?');      values.push(data.role); }
  if (data.password)  { fields.push('password = ?');  values.push(bcrypt.hashSync(data.password, 10)); }
  if (!fields.length) throw new Error('Aucun champ à modifier');
  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return db.prepare('SELECT id, firstName, lastName, email, role, birthYear, createdAt FROM users WHERE id = ?').get(id);
}

function deleteUser(id) {
  db.prepare('DELETE FROM labyrinths WHERE userId = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

function getAllLabyrinths() {
  return db.prepare(`
    SELECT l.id, l.name, l.size, l.difficulty, l.createdAt,
           u.firstName || ' ' || u.lastName as userName, u.email as userEmail
    FROM labyrinths l
    JOIN users u ON l.userId = u.id
    ORDER BY l.createdAt DESC
  `).all();
}

function deleteLabyrinth(id) {
  db.prepare('DELETE FROM labyrinths WHERE id = ?').run(id);
}

function getStats() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
  const labCount  = db.prepare('SELECT COUNT(*) as count FROM labyrinths').get().count;
  const labByUser = db.prepare(`
    SELECT u.firstName || ' ' || u.lastName as name, COUNT(l.id) as count
    FROM users u
    LEFT JOIN labyrinths l ON l.userId = u.id
    WHERE u.role = 'user'
    GROUP BY u.id
    ORDER BY count DESC
  `).all();
  return { userCount, labCount, labByUser };
}

module.exports = { getUsers, createUser, updateUser, deleteUser, getAllLabyrinths, deleteLabyrinth, getStats };
