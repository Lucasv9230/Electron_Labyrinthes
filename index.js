// Si ELECTRON_RUN_AS_NODE est actif, on relance sans cette variable
if (process.env.ELECTRON_RUN_AS_NODE) {
  const { spawn } = require('child_process');
  const env = Object.assign({}, process.env);
  delete env.ELECTRON_RUN_AS_NODE;
  spawn(process.execPath, ['.'], { env, stdio: 'inherit', cwd: __dirname, detached: false });
  process.exit(0);
}

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Labyrinthes générés par l'admin, partagés avec les joueurs
const adminMazes = { small: null, medium: null, large: null };

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
    icon: path.join(__dirname, 'build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  win.loadFile(path.join(__dirname, 'front-end/html/index.html'));
}

app.whenReady().then(() => {
  setupIPC();
  createWindow();
});

function setupIPC() {
  const auth      = require('./backend/auth');
  const users     = require('./backend/users');
  const adminDb   = require('./backend/admin');
  const { generateMaze, solveMaze } = require('./backend/labyrinth');

  function ok(data)  { return { success: true, data }; }
  function err(e)    { return { success: false, error: e.message }; }
  function checkAdmin(token) {
    const decoded = auth.verifyToken(token);
    if (decoded.role !== 'admin') throw new Error('Accès refusé');
    return decoded;
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  ipcMain.handle('auth:register', async (_, data) => {
    try { return ok(auth.register(data.firstName, data.lastName, data.email, data.password, data.birthYear)); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('auth:login', async (_, data) => {
    try { return ok(auth.login(data.email, data.password)); }
    catch(e) { return err(e); }
  });

  // ── Labyrinthes utilisateur ─────────────────────────────────────────────────
  ipcMain.handle('labyrinth:generate', async (_, data) => {
    try { return ok(generateMaze(data.size, data.difficulty)); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:solve', async (_, data) => {
    try { return ok(solveMaze(data.maze)); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:list', async (_, token) => {
    try {
      const decoded = auth.verifyToken(token);
      return ok(users.getUserLabyrinths(decoded.id));
    } catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:get', async (_, data) => {
    try {
      const decoded = auth.verifyToken(data.token);
      const lab = users.getLabyrinth(data.id, decoded.id);
      if (lab) lab.data = JSON.parse(lab.data);
      return ok(lab);
    } catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:save', async (_, data) => {
    try {
      const decoded = auth.verifyToken(data.token);
      const id = users.saveLabyrinth(decoded.id, data.name, data.size, data.difficulty, data.mazeData);
      return ok(id);
    } catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:update', async (_, data) => {
    try {
      const decoded = auth.verifyToken(data.token);
      users.updateLabyrinth(data.id, decoded.id, data.name);
      return ok(true);
    } catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:delete', async (_, data) => {
    try {
      const decoded = auth.verifyToken(data.token);
      users.deleteLabyrinth(data.id, decoded.id);
      return ok(true);
    } catch(e) { return err(e); }
  });

  // ── Classement ──────────────────────────────────────────────────────────────
  ipcMain.handle('top:getPlayers', async () => {
    try { return ok(users.getTopPlayers()); }
    catch(e) { return err(e); }
  });

  // ── Admin ───────────────────────────────────────────────────────────────────
  ipcMain.handle('admin:getUsers', async (_, token) => {
    try { checkAdmin(token); return ok(adminDb.getUsers()); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('admin:createUser', async (_, data) => {
    try {
      checkAdmin(data.token);
      return ok(adminDb.createUser(data.firstName, data.lastName, data.email, data.password, data.birthYear, data.role));
    } catch(e) { return err(e); }
  });

  ipcMain.handle('admin:updateUser', async (_, data) => {
    try {
      checkAdmin(data.token);
      return ok(adminDb.updateUser(data.id, data.updates));
    } catch(e) { return err(e); }
  });

  ipcMain.handle('admin:deleteUser', async (_, data) => {
    try { checkAdmin(data.token); adminDb.deleteUser(data.id); return ok(true); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('admin:getAllLabyrinths', async (_, token) => {
    try { checkAdmin(token); return ok(adminDb.getAllLabyrinths()); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('admin:deleteLabyrinth', async (_, data) => {
    try { checkAdmin(data.token); adminDb.deleteLabyrinth(data.id); return ok(true); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('admin:getStats', async (_, token) => {
    try { checkAdmin(token); return ok(adminDb.getStats()); }
    catch(e) { return err(e); }
  });

  // ── Labyrinthes admin partagés ──────────────────────────────────────────────
  ipcMain.handle('admin:setMaze', async (_, data) => {
    try {
      checkAdmin(data.token);
      adminMazes[data.size] = data.maze;
      return ok(true);
    } catch(e) { return err(e); }
  });

  ipcMain.handle('admin:getMazes', async (_, token) => {
    try { checkAdmin(token); return ok(adminMazes); }
    catch(e) { return err(e); }
  });

  ipcMain.handle('labyrinth:getAdminMaze', async (_, data) => {
    try {
      auth.verifyToken(data.token);
      const maze = adminMazes[data.size];
      if (maze) return ok(maze);
      // Aucun labyrinthe admin pour cette taille : on en génère un
      return ok(generateMaze(data.size, data.difficulty));
    } catch(e) { return err(e); }
  });

  // ── Scores ──────────────────────────────────────────────────────────────────
  ipcMain.handle('score:save', async (_, data) => {
    try {
      const decoded = auth.verifyToken(data.token);
      users.saveScore(decoded.id, data.size, data.difficulty, data.time);
      return ok(true);
    } catch(e) { return err(e); }
  });
}
