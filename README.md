# Labyrinthes Electron

**Projet scolaire collaboratif**
Ce projet a été réalisé en groupe dans le cadre de nos études en informatique à Ynov Campus.

## Présentation du projet
Nous avons développé `Labyrinthes Electron`, un jeu de labyrinthe sous forme d'application de bureau. Le projet combine :
- une interface Electron pour l’affichage,
- un serveur Express local pour les API internes,
- une base de données SQLite pour les comptes, niveaux et scores.

L’objectif était de proposer un jeu avec inscription, authentification et progression de joueur, tout en restant léger et autonome.

## 🎮 Lore et concept
Vous entrez dans un ancien réseau de couloirs, caché sous une citadelle abandonnée. Chaque labyrinthe est vivant : il change, il se referme, et les secrets se dissimulent dans l’obscurité.

Vous incarnez un explorateur qui doit :
- trouver la sortie,
- collecter des points,
- éviter les pièges invisibles,
- améliorer son profil et ses performances.

Le jeu met l’accent sur la progression et la rejouabilité. Chaque niveau offre un défi différent et encourage à battre ses propres records.

## 🚀 Fonctionnalités principales
- Interface de bureau multi-pages avec Electron.
- Authentification : inscription, connexion et vérification des sessions.
- Gestion sécurisée des mots de passe avec `bcryptjs`.
- Authentification par jeton avec `jsonwebtoken`.
- Stockage local des données avec `better-sqlite3`.
- Administration interne pour gérer les niveaux et les utilisateurs.
- Navigation entre : page de connexion, inscription, lobby, jeu, statistiques et administration.

## 🧱 Structure du projet
```
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
    ├── css/         # Feuilles de style (admin, auth, game, lobby, etc.)
    ├── html/        # Pages de l'application
    └── js/          # Scripts d'interface (game, lobby, loading, etc.)
```

## 🧠 Modèle technique
### Back-end
Nous avons structuré le backend ainsi :
- `backend/app.js` : initialise le serveur Express et les routes principales.
- `backend/auth.js` : logique d’authentification, génération de jetons et protections JWT.
- `backend/database.js` : connexion à la base SQLite et requêtes SQL.
- `backend/users.js` : CRUD pour les utilisateurs.
- `backend/level.js` : gestion des niveaux, scores et progression.
- `backend/labyrinth.js` : structure des labyrinthes et règles de jeu.
- `backend/admin.js` : interface et contrôles pour l’administration.

### Front-end
- `index.js` : lance l’application Electron.
- `preload.js` : expose des API sécurisées au front-end.
- HTML/CSS/JS : pages de l’interface utilisateur, affichage et navigation.

## 📦 Technologies utilisées
- Electron
- Node.js / CommonJS
- Express
- better-sqlite3
- bcryptjs
- jsonwebtoken
- HTML / CSS / JavaScript

## 🔧 Installation
### Prérequis
- Node.js et npm installés

### Installation des dépendances
Dans le dossier racine du projet, lancez :
```bash
npm install
```
*(Un script `install.bat` est également disponible sous Windows pour une installation rapide des modules principaux).*

### Lancer l’application
```bash
npm start
```

## 📦 Génération de l’exécutable
Pour construire un exécutable Windows :
```bash
npx electron-builder
```

## 🧭 Mode d’emploi
### Inscription et connexion
- Créez un compte avec un nom d’utilisateur et un mot de passe.
- Le mot de passe est hashé avant d’être stocké en base.
- Lors de la connexion, un token JWT est émis pour la session.

### Comportement attendu
- Le joueur progresse dans les niveaux.
- Les meilleurs scores sont enregistrés localement via SQLite.

## 📌 API interne et modèle de données
### Endpoints principaux
- `POST /api/auth/register` : inscription utilisateur
- `POST /api/auth/login` : connexion et génération de token
- `GET /api/users` : récupération des utilisateurs
- `GET /api/levels` : récupération des niveaux
- `POST /api/scores` : enregistrement d’un score
- `GET /api/admin` : administration

### 👥 Contributeurs
- Lucas
- Nael
