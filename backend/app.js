// Point d'entrée backend — les fonctions sont appelées via IPC depuis index.js
module.exports = {
  auth: require('./auth'),
  users: require('./users'),
  admin: require('./admin'),
  labyrinth: require('./labyrinth'),
};
