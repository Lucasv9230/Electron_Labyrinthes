function toggleForms() {
  const login    = document.getElementById('loginForm');
  const register = document.getElementById('registerForm');
  login.classList.toggle('active');
  register.classList.toggle('active');
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(id) {
  document.getElementById(id).style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  hideError('loginError');
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const res = await window.api.auth.login({ email, password });
  if (!res.success) return showError('loginError', res.error);

  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));

  if (res.data.user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'lobby.html';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideError('registerError');

  const firstName  = document.getElementById('registerFirstName').value.trim();
  const lastName   = document.getElementById('registerLastName').value.trim();
  const email      = document.getElementById('registerEmail').value.trim();
  const password   = document.getElementById('registerPassword').value;
  const confirm    = document.getElementById('registerConfirmPassword').value;
  const birthYear  = parseInt(document.getElementById('registerBirthYear').value);

  if (password !== confirm) return showError('registerError', 'Les mots de passe ne correspondent pas');

  const res = await window.api.auth.register({ firstName, lastName, email, password, birthYear });
  if (!res.success) return showError('registerError', res.error);

  // Connexion automatique après inscription
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  window.location.href = 'lobby.html';
}
