// ── Auth + params ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !user) { window.location.href = 'auth.html'; }

const gameSize       = sessionStorage.getItem('gameSize')       || 'medium';
const gameDifficulty = parseInt(sessionStorage.getItem('gameDifficulty') || '5');

document.getElementById('userName').textContent = user.firstName + ' ' + user.lastName;

// ── État ──────────────────────────────────────────────────────────────────────
let currentMaze  = null;
let player       = { x: 1, y: 1 };
let hasKey       = false;
let keyPos       = null;
let gameOver     = false;
let gameWon      = false;
let playing      = false;
let solutionPath = [];        // chemin optimal start → clé → sortie (révélé en fin de partie)
let revealed     = false;     // true quand la solution doit être dessinée

// ── Mapping difficulté × taille → temps limite (en secondes) ──────────────────
// Curseur 1 = beaucoup de temps, curseur 10 = très peu de temps.
function computeTimeLimit(size, diff) {
  const base = { small: 90, medium: 150, large: 240 }[size] || 150;
  const mini = { small: 20, medium: 30,  large: 50  }[size] || 30;
  // Décroissance linéaire entre base (diff=1) et mini (diff=10)
  const t = base + ((mini - base) * (diff - 1)) / 9;
  return Math.round(t);
}

// ── Chrono / Compte à rebours ─────────────────────────────────────────────────
let timerStart    = null;
let timeLimit     = 60;       // secondes — calculé en fonction de la difficulté
const timerEl     = document.getElementById('timerDisplay');
let timerInterval = null;

function startTimer() {
  timerStart    = Date.now();
  timerInterval = setInterval(updateTimer, 100);
  updateTimer();
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimer() {
  if (!timerStart) return;
  const elapsed = (Date.now() - timerStart) / 1000;
  const remaining = Math.max(0, timeLimit - elapsed);
  timerEl.textContent = formatTime(remaining);

  // Couleur d'alerte : <10s = orange, <5s = rouge
  if (remaining <= 5)        timerEl.style.color = '#e74c3c';
  else if (remaining <= 10)  timerEl.style.color = '#f39c12';
  else                       timerEl.style.color = '';

  if (playing && remaining <= 0) {
    endGame(false, 'timeout');
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const tenth = Math.floor((s * 10) % 10);
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${tenth}`;
}

function getElapsed() {
  return timerStart ? (Date.now() - timerStart) / 1000 : 0;
}

// ── DOM ───────────────────────────────────────────────────────────────────────
const canvas    = document.getElementById('mazeCanvas');
const ctx       = canvas.getContext('2d');
const statusMsg = document.getElementById('statusMsg');
const endPanel  = document.getElementById('endPanel');

// ── Chargement du labyrinthe ──────────────────────────────────────────────────
async function init() {
  setStatus('Chargement du labyrinthe…', 'info');
  hideEndPanel();
  const res = await window.api.labyrinth.getAdminMaze({ token, size: gameSize, difficulty: gameDifficulty });
  if (!res.success) return setStatus('Erreur de chargement : ' + res.error, 'error');

  currentMaze = res.data;
  drawMaze();
  startGame();
}

// ── Affichage ─────────────────────────────────────────────────────────────────
function getTileSize() {
  const maxW = Math.min(window.innerWidth - 40, 900);
  const maxH = window.innerHeight - 240;
  const byW  = Math.floor(maxW / currentMaze.width);
  const byH  = Math.floor(maxH / currentMaze.height);
  return Math.min(40, byW, byH);
}

function drawMaze() {
  if (!currentMaze) return;
  const ts = getTileSize();
  const { grid, width, height, start, end } = currentMaze;
  canvas.width  = width  * ts;
  canvas.height = height * ts;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.fillStyle = grid[y][x] === 1 ? '#1a472a' : '#0a1a0a';
      ctx.fillRect(x * ts, y * ts, ts, ts);
    }
  }

  // Chemin solution révélé (fin de partie)
  if (revealed && solutionPath.length > 0) {
    ctx.fillStyle = 'rgba(241, 196, 15, 0.55)';
    for (const c of solutionPath) {
      ctx.fillRect(c.x * ts + ts * 0.2, c.y * ts + ts * 0.2, ts * 0.6, ts * 0.6);
    }
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth   = Math.max(2, Math.floor(ts / 6));
    ctx.beginPath();
    solutionPath.forEach((c, i) => {
      const cx = c.x * ts + ts / 2;
      const cy = c.y * ts + ts / 2;
      if (i === 0) ctx.moveTo(cx, cy);
      else         ctx.lineTo(cx, cy);
    });
    ctx.stroke();
  }

  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(start[0] * ts, start[1] * ts, ts, ts);
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(end[0] * ts, end[1] * ts, ts, ts);

  if ((playing || revealed) && keyPos && !hasKey) {
    ctx.font = `${ts}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔑', keyPos.x * ts + ts / 2, keyPos.y * ts + ts / 2);
  }

  if (playing || revealed) {
    ctx.font = `${ts}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐛', player.x * ts + ts / 2, player.y * ts + ts / 2);
  }
}

// ── Démarrage du jeu ──────────────────────────────────────────────────────────
function startGame() {
  if (!currentMaze) return;

  player.x = currentMaze.start[0];
  player.y = currentMaze.start[1];

  const empties = [];
  for (let y = 0; y < currentMaze.height; y++) {
    for (let x = 0; x < currentMaze.width; x++) {
      if (currentMaze.grid[y][x] === 0) empties.push({ x, y });
    }
  }

  const farForKey = empties.filter(c =>
    Math.abs(c.x - player.x) + Math.abs(c.y - player.y) > Math.floor(currentMaze.width / 3)
  );
  keyPos = farForKey[Math.floor(Math.random() * farForKey.length)] || empties[empties.length - 1];

  hasKey       = false;
  gameOver     = false;
  gameWon      = false;
  playing      = true;
  revealed     = false;
  solutionPath = [];

  // ── Limite de temps : définie par le curseur de difficulté + la taille ────
  timeLimit = computeTimeLimit(gameSize, gameDifficulty);

  startTimer();
  hideEndPanel();
  setStatus(`Récupère la 🔑 puis atteins la sortie 🚪 — Difficulté ${gameDifficulty}/10 · ${timeLimit}s`, 'info');
  drawMaze();
}

// ── BFS : chemin entre deux points ────────────────────────────────────────────
function bfsPath(sx, sy, ex, ey) {
  const { grid, width, height } = currentMaze;
  if (grid[sy][sx] !== 0 || grid[ey][ex] !== 0) return [];
  const visited = Array.from({ length: height }, () => new Array(width).fill(false));
  const prev    = Array.from({ length: height }, () => new Array(width).fill(null));
  visited[sy][sx] = true;
  const queue = [{ x: sx, y: sy }];
  while (queue.length) {
    const cur = queue.shift();
    if (cur.x === ex && cur.y === ey) {
      const path = [];
      let c = cur;
      while (c) { path.unshift(c); c = prev[c.y][c.x]; }
      return path;
    }
    for (const [dx, dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 0 && !visited[ny][nx]) {
        visited[ny][nx] = true;
        prev[ny][nx] = cur;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return [];
}

// ── Chemin solution complet : start → clé → sortie (toujours le même) ────────
function buildSolutionPath() {
  if (!currentMaze) return [];
  const [sx, sy] = currentMaze.start;
  const [ex, ey] = currentMaze.end;
  const toKey = bfsPath(sx, sy, keyPos.x, keyPos.y);
  const toEnd = bfsPath(keyPos.x, keyPos.y, ex, ey);
  if (toKey.length && toEnd.length) return toKey.concat(toEnd.slice(1));
  return toKey.length ? toKey : toEnd;
}

// ── Fin de partie ────────────────────────────────────────────────────────────
function endGame(won, reason) {
  if (gameOver || gameWon) return;
  gameOver = !won;
  gameWon  = won;
  playing  = false;
  stopTimer();

  // Chemin optimal complet (start → clé → sortie), révélé dans tous les cas.
  solutionPath = buildSolutionPath();
  revealed     = true;

  if (won) {
    const elapsed = getElapsed();
    setStatus(`🎉 Bravo ! Terminé en ${formatTime(elapsed)} ! Chemin optimal révélé en jaune.`, 'success');
    window.api.score.save({ token, size: gameSize, difficulty: gameDifficulty, time: elapsed });
  } else if (reason === 'timeout') {
    setStatus('⏰ Temps écoulé ! Chemin optimal révélé en jaune.', 'error');
  } else {
    setStatus('Partie abandonnée. Chemin optimal révélé en jaune.', 'info');
  }

  drawMaze();
  showEndPanel(won);
}

// ── Contrôles joueur ──────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (!playing || gameOver || gameWon) return;
  const dirs = {
    ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
    z: [0,-1], s: [0,1], q: [-1,0], d: [1,0],
    Z: [0,-1], S: [0,1], Q: [-1,0], D: [1,0],
  };
  const dir = dirs[e.key];
  if (!dir) return;
  e.preventDefault();

  const nx = player.x + dir[0], ny = player.y + dir[1];
  if (currentMaze.grid[ny]?.[nx] !== 0) return;
  player.x = nx;
  player.y = ny;

  if (!hasKey && player.x === keyPos.x && player.y === keyPos.y) {
    hasKey = true;
    setStatus('Clé récupérée ! Atteins maintenant la sortie rouge 🚪', 'success');
  }

  if (hasKey && player.x === currentMaze.end[0] && player.y === currentMaze.end[1]) {
    endGame(true);
    return;
  }

  drawMaze();
});

// ── Panneau de fin (rejouer / retour lobby) ──────────────────────────────────
function showEndPanel(won) {
  if (!endPanel) return;
  endPanel.style.display = 'flex';
  endPanel.classList.remove('end-win', 'end-lose');
  endPanel.classList.add(won ? 'end-win' : 'end-lose');
}

function hideEndPanel() {
  if (!endPanel) return;
  endPanel.style.display = 'none';
}

async function replay() {
  await init();
}

window.replay = replay;

// ── Utilitaires ───────────────────────────────────────────────────────────────
function setStatus(msg, type = 'info') {
  statusMsg.textContent = msg;
  statusMsg.className   = 'status-msg status-' + type;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'auth.html';
}

window.addEventListener('resize', () => drawMaze());

// ── Lancement ─────────────────────────────────────────────────────────────────
init();
