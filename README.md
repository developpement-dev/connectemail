<div align="center">
  <img src="frontend/assets/logo.svg" alt="ConnectMail Logo" width="100" height="100">
  <h1>ConnectMail</h1>
  <p><strong>Une messagerie instantanée en temps réel moderne, simple et rapide.</strong></p>
</div>

<br />

## 📖 À propos du projet

**ConnectMail** est une application web complète (Full-Stack) de messagerie instantanée permettant aux utilisateurs de s'inscrire, de chercher d'autres utilisateurs et de discuter en temps réel via des WebSockets.

L'interface est conçue pour être fluide, moderne et offrir une expérience utilisateur haut-de-gamme, avec une gestion complète des profils et paramètres utilisateurs.

---

## 🚀 Fonctionnalités Principales

- **💬 Chat en Temps Réel** : Communication instantanée propulsée par *Socket.IO*.
- **👤 Profils Utilisateurs** : Personnalisation de bout en bout (Avatar, Bio, Localisation).
- **🔒 Authentification Sécurisée** : Système de création de compte et de connexion protégé par JSON Web Tokens (JWT).
- **🔍 Recherche Globale** : Retrouvez rapidement tous vos amis ou des inconnus.
- **🛡️ Modération & Blocages** : Signalement de comptes et outils de blocages intégrés.
- **🛠️ Environnement Conteneurisé** : Déploiement simplifié avec *Docker* et *Docker Compose*.

---

## 💻 Stack Technologique

**Frontend :**
- HTML5, CSS3, JavaScript (Vanilla)
- Polices Google Fonts (Outfit, DM Sans)

**Backend :**
- **Node.js** avec **Express.js** (API REST & Routeur)
- **Socket.IO** (WebSockets pour le temps réel)
- **PostgreSQL** (Base de données relationnelle)
- **Redis** (Stockage de sessions / Cache de l'application)
- **Nginx** (Serveur web statique et Proxy inversé)

---

## 🛠️ Installation et Déploiement (Docker)

Tout le projet est configuré pour tourner de manière isolée via **Docker**.

### 1. Prérequis
- Avoir installé [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/).

### 2. Démarrage Rapide

Ouvrez un terminal dans le dossier racine du projet et tapez :

```bash
docker compose up -d --build
```
> Cette commande télécharge les bases de données (PostgreSQL et Redis), construit l'API Express, et lance le serveur Web Nginx.

### 3. Accès à l'application

Une fois les conteneurs démarrés avec succès, ouvrez votre navigateur et accédez à :
👉 **http://localhost**

---

## 📂 Architecture du Projet

```text
📦 connectEmail
 ┣ 📂 backend            # Serveur Node.js (API & WebSockets)
 ┃ ┣ 📂 src              # Code source (Controllers, Routes, Middlewares)
 ┃ ┣ 📜 package.json     # Dépendances Node.js
 ┃ ┗ 📜 Dockerfile       # Instructions de construction backend
 ┣ 📂 frontend           # Interface utilisateur (HTML/CSS/JS)
 ┃ ┣ 📜 index.html       # Landing page
 ┃ ┣ 📜 chat.html        # Fenêtre principale de discussion
 ┃ ┣ 📜 profile.html     # Affichage du profil d'un utilisateur
 ┃ ┗ ...                 
 ┣ 📜 schema.sql         # Structure complète de la base de données PostgreSQL
 ┣ 📜 nginx.conf         # Fichier de configuration Nginx (Clean URLs et Proxy API)
 ┗ 📜 docker-compose.yml # Orchestration des conteneurs pour le lancement en 1 clic
```

---

## 📝 Documentation de l’application

### Préparation de l’environnement
1. Installez les outils suivants :
   - Docker
   - Docker Compose
   - Git
2. Clonez le dépôt :
   ```bash
git clone https://github.com/developpement-dev/connectemail.git connectmail
cd connectmail
```

3. Si vous avez besoin de lier un dépôt Git local à GitHub ou de vérifier le remote :
   ```bash
git remote -v
# si le remote n'existe pas, ajoutez-le :
git remote add origin https://github.com/developpement-dev/connectemail.git
```

4. Copiez le fichier d’exemple d’environnement :
   ```bash
cp backend/.env.example backend/.env
```
4. Vérifiez ou ajustez les variables dans `backend/.env` selon votre configuration locale :
   - `PORT`
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `REDIS_URL`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`

### Installation et lancement
1. Depuis la racine du projet, lancez :
   ```bash
docker compose up -d --build
```
2. Si vous souhaitez arrêter les services :
   ```bash
docker compose down
```
3. Une fois les services démarrés, ouvrez :
   ```text
http://localhost
```

### Architecture technique
- **Frontend** : pages HTML statiques + JavaScript natif
- **Backend** : Node.js + Express
- **Temps réel** : Socket.IO
- **Base de données** : PostgreSQL
- **Cache/session** : Redis
- **Reverse proxy** : Nginx
- **Stockage de fichiers** : dossier `backend/uploads`

### Points d’accès principaux
- **Landing page** : `/`
- **Page de chat** : `/chat`
- **Page de profil** : `/u/:username`
- **Page de recherche** : `/search`
- **Page de paramètres** : `/settings`
- **API de santé** : `/api/health`

### API importantes
- `POST /api/auth/login` : connexion utilisateur
- `POST /api/auth/register` : création de compte
- `GET /api/users/search?q=...` : recherche d’utilisateurs
- `POST /api/upload` : upload de fichier/d’image/audio
- `POST /api/messages` : envoi de message avec pièces jointes
- `GET /api/conversations` : liste des conversations
- `GET /api/conversations/:id/messages` : historique de conversation

### Gestion des fichiers uploadés
Les fichiers sont envoyés par le frontend via la route :
- `POST /api/upload`

Formats acceptés :
- images : `jpeg`, `jpg`, `png`, `gif`, `webp`
- vidéos : `mp4`, `webm`, `ogg`, `quicktime`
- audios : `webm`, `ogg`, `mpeg`, `mp3`, `wav`, `mp4`
- documents : `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `zip`, `txt`

L’upload est stocké dans le dossier local :
- `backend/uploads`

### Dépannage courant
- Si l’application ne démarre pas, vérifiez que Docker a accès au dossier `backend/uploads`.
- Si les fichiers ne s’affichent pas, vérifiez que le backend sert le dossier via `/public/uploads`.
- Si vous avez un problème de token, reconnectez-vous pour actualiser le JWT.

---

## �👨‍💻 Créé par
**Grace Akogo** ([akogoyawograce]( https://github.com/developpement-dev))
