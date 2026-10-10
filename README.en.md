# Electron Labyrinths

**Collaborative School Project**
This project was carried out as a group during our computer science studies at Ynov Campus.

## Project Overview
We developed `Electron Labyrinths`, a maze game as a desktop application. The project combines:
- an Electron interface for display,
- a local Express server for internal APIs,
- an SQLite database for accounts, levels, and scores.

The goal was to offer a game with registration, authentication, and player progression, while remaining lightweight and standalone.

## 🎮 Lore and Concept
You enter an ancient network of corridors, hidden beneath an abandoned citadel. Each labyrinth is alive: it changes, it closes in on itself, and secrets are hidden in the dark.

You play as an explorer who must:
- find the exit,
- collect points,
- avoid invisible traps,
- improve their profile and performance.

The game focuses on progression and replayability. Each level offers a different challenge and encourages players to beat their own records.

## 🚀 Main Features
- Multi-page desktop interface with Electron.
- Authentication: registration, login, and session verification.
- Secure password management with `bcryptjs`.
- Token authentication with `jsonwebtoken`.
- Local data storage with `better-sqlite3`.
- Internal administration to manage levels and users.
- Navigation between: login, registration, lobby, game, statistics, and administration pages.

## 🧱 Project Structure
```text
Electron_Labyrinthes/
├── index.js
├── preload.js
├── package.json
├── backend/
│   ├── admin.js
│   ├── app.js
│   ├── auth.js
│   ├── database.js
│   ├── labyrinth.js
│   ├── level.js
│   └── users.js
└── front-end/
    ├── css/         # Stylesheets (admin, auth, game, lobby, etc.)
    ├── html/        # Application pages
    └── js/          # UI scripts (game, lobby, loading, etc.)
```

## 🧠 Technical Model
### Back-end
We structured the backend as follows:
- `backend/app.js`: initializes the Express server and main routes.
- `backend/auth.js`: authentication logic, token generation, and JWT protection.
- `backend/database.js`: connection to the SQLite database and SQL queries.
- `backend/users.js`: CRUD for users.
- `backend/level.js`: level, score, and progression management.
- `backend/labyrinth.js`: maze structure and game rules.
- `backend/admin.js`: interface and controls for administration.

### Front-end
- `index.js`: launches the Electron application.
- `preload.js`: exposes secure APIs to the frontend.
- HTML/CSS/JS: user interface pages, display, and navigation.

## 📦 Technologies Used
- Electron
- Node.js / CommonJS
- Express
- better-sqlite3
- bcryptjs
- jsonwebtoken
- HTML / CSS / JavaScript

## 🔧 Installation
### Prerequisites
- Node.js and npm installed

### Installing dependencies
In the project root folder, run:
```bash
npm install
```
*(An `install.bat` script is also available on Windows for quick installation of main modules).*

### Launching the application
```bash
npm start
```

## 📦 Generating the executable
To build a Windows executable:
```bash
npx electron-builder
```

## 🧭 Instructions
### Registration and Login
- Create an account with a username and password.
- The password is hashed before being stored in the database.
- Upon login, a JWT token is issued for the session.

### Expected Behavior
- The player progresses through the levels.
- High scores are saved locally via SQLite.

## 📌 Internal API and Data Model
### Main Endpoints
- `POST /api/auth/register`: user registration
- `POST /api/auth/login`: login and token generation
- `GET /api/users`: retrieve users
- `GET /api/levels`: retrieve levels
- `POST /api/scores`: save a score
- `GET /api/admin`: administration

### 👥 Contributors
- Lucas
- Nael
