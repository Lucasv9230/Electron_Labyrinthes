// CRUD labyrinthes pour utilisateur normal + classement
const db = require('./database');

function getUserLabyrinths(userId) {
  return db.prepare('SELECT id, name, size, difficulty, createdAt FROM labyrinths WHERE userId = ? ORDER BY createdAt DESC').all(userId);
}

function getLabyrinth(id, userId) {
  return db.prepare('SELECT * FROM labyrinths WHERE id = ? AND userId = ?').get(id, userId);
}

function saveLabyrinth(userId, name, size, difficulty, data) {
  const result = db.prepare(
    'INSERT INTO labyrinths (userId, name, size, difficulty, data) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, name, size, difficulty, JSON.stringify(data));
  return result.lastInsertRowid;
}

function updateLabyrinth(id, userId, name) {
  db.prepare('UPDATE labyrinths SET name = ? WHERE id = ? AND userId = ?').run(name, id, userId);
}

function deleteLabyrinth(id, userId) {
  db.prepare('DELETE FROM labyrinths WHERE id = ? AND userId = ?').run(id, userId);
}

function saveScore(userId, size, difficulty, time) {
  db.prepare('INSERT INTO scores (userId, size, difficulty, time) VALUES (?, ?, ?, ?)').run(userId, size, difficulty, time);
}

function getTopPlayers(period = 'all') {
  let dateCondition = '';
  if (period === 'week') {
    dateCondition = "AND s.createdAt >= datetime('now', '-7 days')";
  } else if (period === 'month') {
    dateCondition = "AND s.createdAt >= datetime('now', '-1 month')";
  }

  return db.prepare(`
    SELECT u.firstName || ' ' || u.lastName as name, MIN(s.time) as bestTime, s.size, s.difficulty
    FROM scores s
    JOIN users u ON u.id = s.userId
    WHERE u.role = 'user' ${dateCondition}
    GROUP BY s.userId
    ORDER BY bestTime ASC
    LIMIT 20
  `).all();
}

module.exports = { getUserLabyrinths, getLabyrinth, saveLabyrinth, updateLabyrinth, deleteLabyrinth, saveScore, getTopPlayers };
