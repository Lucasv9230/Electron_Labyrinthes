const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !user) { window.location.href = 'auth.html'; }

document.getElementById('userName').textContent = user.firstName + ' ' + user.lastName;

let selectedSize = 'medium';

// Mapping difficulté × taille → temps limite (en secondes).
// Curseur 1 = beaucoup de temps, curseur 10 = très peu de temps.
function computeTimeLimit(size, diff) {
  const base = { small: 90, medium: 150, large: 240 }[size] || 150;
  const mini = { small: 20, medium: 30,  large: 50  }[size] || 30;
  const t = base + ((mini - base) * (diff - 1)) / 9;
  return Math.round(t);
}

function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}min ${String(sec).padStart(2, '0')}s`;
}

function refreshTimePreview() {
  const diff = parseInt(document.getElementById('diffSlider').value);
  const t    = computeTimeLimit(selectedSize, diff);
  const el   = document.getElementById('timePreview');
  if (el) el.textContent = formatSeconds(t);
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('card-' + size).classList.add('selected');
  refreshTimePreview();
}

document.getElementById('diffSlider').addEventListener('input', function () {
  document.getElementById('diffDisplay').textContent = this.value;
  refreshTimePreview();
});

function startGame() {
  const difficulty = document.getElementById('diffSlider').value;
  sessionStorage.setItem('gameSize', selectedSize);
  sessionStorage.setItem('gameDifficulty', difficulty);
  window.location.href = 'game.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'auth.html';
}

refreshTimePreview();
