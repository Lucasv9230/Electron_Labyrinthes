// ── Auth admin ────────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');
if (!token || !user || user.role !== 'admin') { window.location.href = 'auth.html'; }

document.getElementById('adminName').textContent = user.firstName + ' ' + user.lastName;

// ── Onglets ───────────────────────────────────────────────────────────────────
function showTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  if (tab === 'mazes')       loadAdminMazes();
  if (tab === 'stats')       loadStats();
  if (tab === 'users')       loadUsers();
}

// ── Grille de labyrinthes admin ───────────────────────────────────────────────
const PREVIEW_SIZE = 240; // px max pour le canvas de preview

function drawPreview(canvasId, maze) {
  const canvas = document.getElementById(canvasId);
  if (!maze) {
    canvas.width  = 0;
    canvas.height = 0;
    return;
  }
  const ts = Math.floor(PREVIEW_SIZE / maze.width);
  canvas.width  = maze.width  * ts;
  canvas.height = maze.height * ts;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      ctx.fillStyle = maze.grid[y][x] === 1 ? '#1a472a' : '#0a1a0a';
      ctx.fillRect(x * ts, y * ts, ts, ts);
    }
  }
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(maze.start[0] * ts, maze.start[1] * ts, ts, ts);
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(maze.end[0] * ts, maze.end[1] * ts, ts, ts);
}

async function loadAdminMazes() {
  const res = await window.api.admin.getMazes(token);
  if (!res.success) return;
  const mazes = res.data;
  for (const size of ['small', 'medium', 'large']) {
    const maze = mazes[size];
    const canvasId = 'preview' + size.charAt(0).toUpperCase() + size.slice(1);
    const statusId = 'status'  + size.charAt(0).toUpperCase() + size.slice(1);
    drawPreview(canvasId, maze);
    document.getElementById(statusId).textContent = maze
      ? `Actif — diff. ${maze.difficulty}`
      : 'Aucun labyrinthe actif';
  }
}

async function adminGenerate(size) {
  const difficulty = Math.floor(Math.random() * 5) + 3; // diff aléatoire 3-7
  const res = await window.api.labyrinth.generate({ size, difficulty });
  if (!res.success) return alert('Erreur génération : ' + res.error);

  const maze = res.data;
  const setRes = await window.api.admin.setMaze({ token, size, maze });
  if (!setRes.success) return alert('Erreur mise à jour : ' + setRes.error);

  const cap = size.charAt(0).toUpperCase() + size.slice(1);
  drawPreview('preview' + cap, maze);
  document.getElementById('status' + cap).textContent = `Actif — diff. ${maze.difficulty}`;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
  const res = await window.api.admin.getStats(token);
  if (!res.success) return;
  const { userCount, labCount, labByUser } = res.data;
  document.getElementById('statUsers').textContent = userCount;
  document.getElementById('statLabs').textContent  = labCount;

  const tbody = document.getElementById('statsTable');
  tbody.innerHTML = labByUser.map(r => `
    <tr><td>${r.name}</td><td>${r.count}</td></tr>
  `).join('') || '<tr><td colspan="2">Aucune donnée</td></tr>';
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────
async function loadUsers() {
  const res = await window.api.admin.getUsers(token);
  if (!res.success) return;
  const tbody = document.getElementById('usersTable');
  tbody.innerHTML = res.data.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.firstName} ${u.lastName}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td>${u.birthYear || '—'}</td>
      <td>${new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
      <td class="action-btns">
        <button onclick="editUser(${u.id},'${u.firstName}','${u.lastName}','${u.email}','${u.role}')" class="btn-sm">✏️</button>
        <button onclick="deleteUser(${u.id})" class="btn-sm btn-danger">🗑</button>
      </td>
    </tr>
  `).join('');
}

function showCreateUser() { document.getElementById('createUserForm').style.display = 'block'; }
function hideCreateUser()  {
  document.getElementById('createUserForm').style.display = 'none';
  document.getElementById('createUserForm').reset();
}

async function submitCreateUser(e) {
  e.preventDefault();
  const data = {
    token,
    firstName: document.getElementById('newFirstName').value.trim(),
    lastName:  document.getElementById('newLastName').value.trim(),
    email:     document.getElementById('newEmail').value.trim(),
    password:  document.getElementById('newPassword').value,
    birthYear: parseInt(document.getElementById('newBirthYear').value) || 2000,
    role:      document.getElementById('newRole').value,
  };
  const res = await window.api.admin.createUser(data);
  if (!res.success) return alert('Erreur : ' + res.error);
  hideCreateUser();
  loadUsers();
}

function editUser(id, firstName, lastName, email, role) {
  const newFirst = prompt('Prénom :', firstName);
  if (newFirst === null) return;
  const newLast  = prompt('Nom :', lastName);
  if (newLast === null) return;
  const newEmail = prompt('Email :', email);
  if (newEmail === null) return;
  const newRole  = prompt('Rôle (user/admin) :', role);
  if (newRole === null) return;
  const newPwd   = prompt('Nouveau mot de passe (vide = inchangé) :', '');

  const updates = { firstName: newFirst, lastName: newLast, email: newEmail, role: newRole };
  if (newPwd) updates.password = newPwd;

  window.api.admin.updateUser({ token, id, updates }).then(res => {
    if (!res.success) return alert('Erreur : ' + res.error);
    loadUsers();
  });
}

async function deleteUser(id) {
  if (!confirm('Supprimer cet utilisateur et tous ses labyrinthes ?')) return;
  const res = await window.api.admin.deleteUser({ token, id });
  if (!res.success) return alert('Erreur : ' + res.error);
  loadUsers();
}



// ── Déconnexion ───────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'auth.html';
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadAdminMazes();
