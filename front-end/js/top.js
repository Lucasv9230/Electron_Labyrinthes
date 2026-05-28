function formatTime(s) {
  if (s == null) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const tenth = Math.floor((s * 10) % 10);
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${tenth}`;
}

let currentPeriod = 'all';

async function loadTop() {
  const res = await window.api.top.getPlayers(currentPeriod);
  const tbody = document.getElementById('leaderboardBody');

  if (!res.success || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#95a5a6;">Aucun score pour le moment — sois le premier à finir un labyrinthe !</td></tr>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  tbody.innerHTML = res.data.map((p, i) => `
    <tr class="${i < 3 ? 'top-' + (i + 1) : ''}">
      <td>${medals[i] || (i + 1)}</td>
      <td>${p.name}</td>
      <td style="color:var(--snake-green);font-weight:700">${formatTime(p.bestTime)}</td>
      <td>${p.size} · diff. ${p.difficulty}</td>
    </tr>
  `).join('');
}

window.filterBy = function(period) {
  currentPeriod = period;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('onclick').includes(period)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  loadTop();
};

loadTop();
