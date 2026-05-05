╔══════════════════════════════════════════════════════════════════╗
║          CONNECTMAIL — PROMPT MASTER COMPLET (7 PHASES)         ║
║              Plateforme de messagerie web full-stack             ║
╚══════════════════════════════════════════════════════════════════╝

STACK TECHNIQUE GLOBALE :
- Frontend : HTML / CSS / JavaScript vanilla (v1) → React.js (v2)
- Backend  : Node.js + Express.js + Socket.io
- BDD      : PostgreSQL + Redis
- Fichiers : AWS S3 ou Cloudinary
- Sécurité : JWT + bcrypt + helmet.js
- Déploiement : Docker + Nginx + GitHub Actions + Cloudflare

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — VISION & ARCHITECTURE TECHNIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un expert en architecture logicielle et en conception de 
produits numériques.

Je veux créer une plateforme de messagerie web complète appelée 
"ConnectMail". Voici la vision :

FONCTIONNALITÉS PRINCIPALES :
- Inscription / Connexion sécurisée (email + mot de passe, 
  OAuth Google/Facebook)
- Messagerie en temps réel entre utilisateurs enregistrés
- Envoi de : textes, documents (PDF, Word, Excel), photos 
  (JPG/PNG/GIF), vidéos (MP4), notes audio (MP3/WAV)
- Système de blocage d'utilisateurs
- Page de profil personnalisable
- Back-office administrateur (gestion des utilisateurs, 
  modération, statistiques)
- Page d'accueil publique (landing page) présentant le service

TÂCHE : Génère un cahier des charges technique complet avec :
1. Architecture recommandée (frontend, backend, base de données)
2. Liste exhaustive des fonctionnalités avec priorités 
   (Must Have / Should Have / Nice to Have)
3. Modèles de données (entités principales et relations)
4. Flux utilisateur (user flows) pour les 5 actions clés
5. Contraintes de sécurité à respecter
6. Estimation de la charge de travail par phase (sprints de 2 
   semaines)
7. Les risques techniques et comment les mitiger

Stack : Node.js + Express + PostgreSQL + Redis + Socket.io + S3
Frontend v1 : HTML/CSS/JS vanilla — Frontend v2 : React.js

Sois précis, concret et technique. Je veux démarrer immédiatement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — LANDING PAGE (PAGE D'ACCUEIL PUBLIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un designer UI/UX senior spécialisé dans les applications 
web modernes.

Crée une landing page HTML/CSS/JS complète et responsive pour 
"ConnectMail", un service de messagerie web qui permet à tous de :
- Créer un compte gratuitement
- Envoyer des messages, documents, photos, vidéos et notes audio
- Bloquer des utilisateurs indésirables
- Discuter avec n'importe qui dans le monde

SECTIONS OBLIGATOIRES :
1. Header + navigation (logo, lien login, CTA "Créer un compte")
2. Hero section (titre accrocheur, sous-titre, 2 boutons CTA, 
   illustration ou mockup du chat)
3. "Comment ça marche" (3 étapes illustrées avec icônes SVG)
4. "Fonctionnalités" (grille 6 features : messages, documents, 
   photos, vidéos, audio, blocage)
5. "Partagez tout" (focus sur les types de fichiers supportés)
6. "Sécurité & Confidentialité" (blocage, chiffrement, contrôle)
7. Témoignages utilisateurs (3 avis avec photo/avatar, nom, étoiles)
8. Section CTA finale ("Rejoignez ConnectMail aujourd'hui")
9. Footer complet (liens, réseaux sociaux, mentions légales)

CONTRAINTES DESIGN :
- Palette : fond sombre #0d1117, accents #2ea043 (vert) et 
  #58a6ff (bleu), texte #e6edf3
- Police : "Outfit" pour les titres, "DM Sans" pour le corps
  (importer depuis Google Fonts)
- Animations CSS fluides : fade-in au scroll, hover sur les cards
- Totalement responsive (mobile-first, breakpoints 768px/1200px)
- Accessibilité WCAG AA minimum
- Vanilla HTML/CSS/JS uniquement (zéro framework)
- Favicon SVG inclus

Génère le code HTML complet (un seul fichier index.html avec CSS 
et JS intégrés), fonctionnel et prêt à déployer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — AUTHENTIFICATION & GESTION DES COMPTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un développeur backend senior expert en sécurité web.

Développe le système complet d'authentification pour ConnectMail.

PAGES FRONTEND À CRÉER :
1. /register — Page d'inscription :
   - Champs : prénom, nom, nom d'utilisateur unique (@username), 
     email, mot de passe, confirmation du mot de passe
   - Upload photo de profil (optionnel, aperçu avant envoi)
   - Validation en temps réel côté client (force du mot de passe, 
     disponibilité du username via appel API)
   - Case à cocher CGU obligatoire

2. /login — Page de connexion :
   - Email + mot de passe
   - Option "Se souvenir de moi" (30 jours)
   - Lien "Mot de passe oublié"
   - Boutons OAuth Google et Facebook
   - Message d'erreur générique (ne pas indiquer si c'est 
     l'email ou le mot de passe qui est faux)

3. /forgot-password — Récupération mot de passe :
   - Saisie email → envoi lien sécurisé (valable 1h)
   - Page /reset-password/:token (nouveau mot de passe)

4. /verify-email/:token — Vérification adresse email

BACKEND (Node.js + Express + PostgreSQL + Redis) :
Routes API :
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET  /api/auth/verify-email/:token
- GET  /api/auth/oauth/google
- GET  /api/auth/oauth/google/callback

SÉCURITÉ OBLIGATOIRE :
- Hashage bcrypt (salt rounds: 12)
- JWT : access token (15 min) + refresh token (7 jours, stocké 
  en Redis avec possibilité de révocation)
- Rate limiting : max 5 tentatives login / 15 min / IP (Redis)
- CSRF protection (token dans cookie httpOnly)
- Sanitisation inputs (express-validator)
- Headers sécurité (helmet.js)
- Email de vérification avec token UUID signé

SCHÉMA SQL TABLE USERS :
Inclure tous les champs nécessaires avec contraintes et index.

Génère : code backend complet + HTML des 4 pages + schéma SQL + 
fichier .env.example avec toutes les variables nécessaires.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — MESSAGERIE TEMPS RÉEL (CŒUR DU PRODUIT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un architecte fullstack spécialisé dans les applications 
temps réel à fort trafic.

Construis le système de messagerie complet de ConnectMail.

INTERFACE CHAT FRONTEND (/chat) :
Disposition 3 colonnes :
- Colonne gauche (280px) : liste des conversations
  → Photo profil, nom, dernier message tronqué, heure, 
    badge nombre de non-lus, statut en ligne (point vert)
  → Barre de recherche des conversations
  → Bouton "Nouvelle conversation" (rechercher un utilisateur)

- Colonne centrale (flex) : fil de messages
  → Bulles de messages style moderne (envoyés à droite en bleu, 
    reçus à gauche en gris)
  → Affichage des pièces jointes selon leur type :
    * Documents → icône + nom + taille + bouton télécharger
    * Images → thumbnail cliquable (visionneuse plein écran)
    * Vidéos → lecteur vidéo natif HTML5 intégré
    * Audio → lecteur audio compact avec barre de progression
  → Indicateurs : "En train d'écrire..." (3 points animés)
  → Statuts message : envoyé ✓ / livré ✓✓ / lu ✓✓ (bleu)
  → Chargement infini (scroll vers le haut = charger plus)
  → Date de séparation entre les jours

- Barre de saisie (bas) :
  → Textarea auto-redimensionnable (Entrée = nouvelle ligne, 
    Ctrl+Entrée = envoyer)
  → Bouton trombone : sélecteur fichier (filtre par type)
  → Bouton appareil photo : capture photo directe (si dispo)
  → Bouton micro : ENREGISTREMENT AUDIO :
    * Clic → start recording (MediaRecorder API)
    * Affichage durée + waveform animée
    * Clic stop → aperçu + boutons "Envoyer" ou "Supprimer"
  → Bouton émoji (picker basique)
  → Bouton envoi (arrow icon, désactivé si vide)

BACKEND TEMPS RÉEL (Node.js + Express + Socket.io) :
Événements Socket.io :
- join:conversation (rejoindre la room)
- message:send { conversationId, content, attachments[] }
- message:delivered { messageId }
- message:read { conversationId, lastReadMessageId }
- typing:start { conversationId }
- typing:stop { conversationId }
- user:online / user:offline

Routes API REST :
- GET  /api/conversations (liste avec pagination)
- POST /api/conversations (créer ou récupérer existante)
- GET  /api/conversations/:id/messages (historique paginé)
- POST /api/messages (envoyer message texte)
- POST /api/messages/upload (upload fichier → retourne URL)
- DELETE /api/messages/:id (supprimer son message, max 24h)

GESTION UPLOAD FICHIERS :
- Multer pour reception multipart
- Validation stricte : type MIME + extension + taille
  * Documents : PDF/DOC/DOCX/XLS/XLSX → max 25 MB
  * Images : JPG/PNG/GIF/WEBP → max 10 MB (resize si > 2000px)
  * Vidéos : MP4/MOV/AVI → max 100 MB
  * Audio : MP3/WAV/OGG/M4A → max 10 MB
- Upload vers AWS S3 (ou Cloudinary) avec URL signée
- Génération thumbnail pour images et vidéos (sharp.js)
- Scan antivirus basique (vérification magic bytes)

SCHÉMA SQL :
Tables : conversations, messages, message_attachments, 
user_conversations (avec last_read_at, is_archived)
Index : sur conversation_id + created_at, sur user_id

Génère : code frontend complet (1 fichier HTML) + serveur 
Node.js/Socket.io complet + routes API + schéma SQL complet 
avec index + configuration Multer + intégration S3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — PROFILS UTILISATEURS & GESTION SOCIALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un développeur fullstack expert en fonctionnalités sociales.

Développe toutes les fonctionnalités de profil et de gestion 
sociale de ConnectMail.

PAGE PROFIL PUBLIC (/u/:username) :
- Bannière de couverture personnalisable (image ou dégradé)
- Photo de profil ronde + badge statut (en ligne/hors ligne/absent)
- Nom complet + @username + bio (max 160 caractères)
- Localisation optionnelle + date d'inscription
- Statistiques : "Membre depuis le [date]"
- Bouton principal : "Envoyer un message" 
  (désactivé + message si bloqué ou si confidentialité restreinte)
- Menu déroulant : "Bloquer", "Signaler cet utilisateur"
- Si c'est son propre profil : bouton "Modifier le profil"

PAGE PARAMÈTRES (/settings) — onglets :

Onglet "Profil" :
- Modifier photo de profil (crop circulaire avant upload)
- Modifier bannière
- Modifier nom, bio, localisation
- Changer @username (max 1 fois tous les 30 jours)
- Indicateur disponibilité username (debounce 500ms)

Onglet "Compte" :
- Modifier email (confirmation par code envoyé à l'ancien email)
- Modifier mot de passe (ancien requis + nouveau + confirmation)
- Activer/désactiver 2FA (QR code TOTP + codes de secours)
- Télécharger mes données (export JSON de tout le compte)
- Zone danger : "Supprimer définitivement mon compte"
  → Confirmation en 2 étapes : saisir "SUPPRIMER" + mot de passe

Onglet "Confidentialité" :
- Qui peut m'envoyer des messages : Tout le monde / Personne
- Afficher mon statut en ligne : Oui / Non
- Permettre d'être trouvé par email : Oui / Non

Onglet "Notifications" :
- Notifications email : nouveaux messages (Oui/Non)
- Résumé quotidien des messages non lus (Oui/Non)

Onglet "Utilisateurs bloqués" :
- Liste des utilisateurs bloqués (photo + @username + date)
- Bouton "Débloquer" sur chaque entrée

SYSTÈME DE BLOCAGE — LOGIQUE COMPLÈTE :
Quand A bloque B :
1. B ne peut plus envoyer de messages à A
2. B ne peut plus voir le profil de A (page 404)
3. B n'apparaît plus dans les résultats de recherche de A 
   (et inversement)
4. La conversation A↔B est archivée et masquée pour A
5. B ne sait pas qu'il est bloqué (pas de notification)
6. Si B essaie d'écrire à A → erreur générique "impossible"

SYSTÈME DE SIGNALEMENT :
- Motifs : Spam / Harcèlement / Contenu inapproprié / Faux profil
- Commentaire optionnel (max 500 chars)
- Un utilisateur ne peut signaler le même profil qu'une fois

RECHERCHE D'UTILISATEURS :
- Barre de recherche globale dans le header
- Recherche par nom complet OU @username (ILIKE PostgreSQL)
- Exclure les utilisateurs bloqués (dans les deux sens)
- Exclure les utilisateurs ayant restreint leur confidentialité
- Résultats avec photo, nom, username, bouton "Écrire"
- Pagination : 20 résultats par page

ROUTES API :
- GET    /api/users/:username (profil public)
- PUT    /api/users/me (modifier son profil)
- POST   /api/users/:id/block
- DELETE /api/users/:id/block
- GET    /api/users/me/blocked (liste bloqués)
- POST   /api/users/:id/report
- GET    /api/users/search?q=...&page=...
- PUT    /api/settings/privacy
- PUT    /api/settings/notifications
- DELETE /api/account (suppression compte)

SCHÉMA SQL :
Tables : user_profiles, blocked_users, reports, user_settings
Index optimisés pour les requêtes fréquentes.

Génère : pages HTML complètes + routes API + middleware 
vérification blocage (à intégrer sur les routes de messagerie) + 
schéma SQL + logique de suppression de compte (cascade).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — BACK-OFFICE ADMINISTRATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un développeur expert en dashboards d'administration et 
outils de modération à grande échelle.

Crée le back-office complet de ConnectMail (/admin), accessible 
uniquement aux administrateurs authentifiés avec 2FA obligatoire.

DASHBOARD PRINCIPAL (/admin) :
KPIs en temps réel (mise à jour toutes les 30 secondes) :
- Total utilisateurs inscrits | Actifs aujourd'hui | 
  Nouveaux aujourd'hui | Bannis
- Messages envoyés aujourd'hui | Fichiers uploadés | 
  Espace disque utilisé
- Signalements en attente (badge rouge si > 0)

Graphiques (Chart.js) :
- Courbe inscriptions : sélecteur 7j / 30j / 90j / 1 an
- Camembert : répartition types fichiers (docs/images/vidéos/audio)
- Barres : messages par heure (dernières 24h)
- Ligne : utilisateurs actifs par jour (30 derniers jours)

Alertes système (bandeau rouge/orange si actif) :
- Pic d'erreurs 500 (> 1% des requêtes)
- Latence élevée (> 2s moyenne)
- Disque > 80% utilisé
- Signalements urgents non traités depuis > 24h

GESTION DES UTILISATEURS (/admin/users) :
Tableau avec colonnes : Photo | Nom | @username | Email | 
Inscrit le | Dernière connexion | Statut | Actions

Filtres combinables :
- Statut : Tous / Actifs / Bannis / Non vérifiés / Supprimés
- Période d'inscription : Cette semaine / Ce mois / Personnalisée
- Tri : Date d'inscription / Dernière connexion / Nom

Pour chaque utilisateur, actions :
- Voir fiche détaillée (stats : messages, fichiers, signalements)
- Bannir temporairement : 1 jour / 7 jours / 30 jours
- Bannir définitivement (avec motif obligatoire)
- Débannir (avec note)
- Envoyer un email de notification
- Supprimer le compte définitivement
- Réinitialiser le mot de passe (force)

Barre de recherche : par nom, @username, email
Export CSV : toute la liste ou résultats filtrés uniquement

MODÉRATION — SIGNALEMENTS (/admin/reports) :
File de signalements triée par priorité :
- URGENT : harcèlement + utilisateur déjà banni avant
- ÉLEVÉ : harcèlement ou spam répété
- NORMAL : autres motifs

Pour chaque signalement :
- Signaleur : photo + nom + date du signalement
- Signalé : photo + nom + historique de sanctions
- Motif déclaré + commentaire utilisateur
- Aperçu des 10 derniers messages échangés (lecture seule)
- Pièces jointes du signalement (si applicable)

Actions disponibles :
- Ignorer (faux positif) + note interne
- Avertir l'utilisateur signalé (email automatique)
- Supprimer le message/fichier incriminé
- Bannir l'utilisateur signalé (durée au choix)
- Marquer comme "En cours d'examen"

Filtres : En attente / En cours / Traités | Par motif | Par date

GESTION STOCKAGE (/admin/storage) :
- Espace total / utilisé / disponible (barre de progression)
- Top 20 utilisateurs par volume de stockage (avec lien profil)
- Répartition par type de fichier (tableau + graphique)
- Fichiers orphelins (uploadés mais plus liés à aucun message)
- Bouton "Nettoyer les fichiers orphelins" (confirmation requise)
- Vieux fichiers non téléchargés depuis > 1 an (optionnel)

SÉCURITÉ ADMIN :
- Middleware vérifiant rôle admin sur TOUTES les routes /admin
- 2FA TOTP obligatoire (impossible de désactiver pour les admins)
- Session admin expire après 2h d'inactivité
- Rôles : super-admin (tout) / modérateur (users + reports, 
  pas stockage ni autres admins)
- Audit trail : CHAQUE action admin loguée dans DB 
  (qui, quoi, quand, sur qui, résultat)
- IP whitelist optionnelle pour l'accès admin

ROUTES API ADMIN (toutes protégées par middleware admin) :
- GET  /api/admin/stats (KPIs dashboard)
- GET  /api/admin/users (liste paginée + filtres)
- GET  /api/admin/users/:id (fiche détaillée)
- POST /api/admin/users/:id/ban
- POST /api/admin/users/:id/unban
- DELETE /api/admin/users/:id
- GET  /api/admin/reports (file modération)
- PUT  /api/admin/reports/:id (traitement)
- GET  /api/admin/storage (stats stockage)
- POST /api/admin/storage/cleanup (nettoyage orphelins)
- GET  /api/admin/logs (audit trail paginé)

SCHÉMA SQL :
Tables : admin_users (avec rôle), reports (avec statut/historique), 
admin_actions_log (audit trail complet), bans (avec durée/motif)

Génère : dashboard HTML/CSS/JS complet (sidebar + pages) + 
toutes les routes API admin + middleware d'autorisation + 
schéma SQL + seeds pour créer le premier super-admin.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — DÉPLOIEMENT EN PRODUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu es un ingénieur DevOps expert en déploiement d'applications 
Node.js à fort trafic avec haute disponibilité.

Prépare le déploiement complet en production de ConnectMail.

INFRASTRUCTURE CIBLE :
- 2 serveurs app (Node.js) derrière un load balancer
- 1 serveur PostgreSQL primary + 1 replica (lecture seule)
- 1 cluster Redis (sessions + cache + pub/sub pour Socket.io)
- CDN Cloudflare (assets statiques + protection DDoS + WAF)
- Stockage S3 ou Backblaze B2 pour les fichiers utilisateurs
- Serveur SMTP (Mailgun ou Brevo) pour les emails transactionnels

FICHIERS À GÉNÉRER :

1. docker-compose.yml (développement local) :
   Services : app (Node.js), postgres, redis, nginx
   Volumes persistants pour pg_data et redis_data
   Variables d'environnement via .env

2. docker-compose.prod.yml (production) :
   Même structure + secrets Docker + restart: always
   Health checks sur chaque service
   Réseau interne isolé (app ne expose que le port 80/443)

3. Dockerfile (Node.js) :
   Multi-stage build (builder + runner)
   Image de base : node:20-alpine
   Utilisateur non-root (security)
   COPY uniquement les fichiers nécessaires
   CMD avec PM2 (cluster mode, nb workers = nb CPUs)

4. nginx.conf :
   Reverse proxy vers Node.js (upstream avec keepalive)
   SSL/TLS (Let's Encrypt, TLS 1.2 minimum)
   HTTP/2 activé
   Compression gzip (texte, JSON, HTML, CSS, JS)
   Rate limiting Nginx : 100 req/s par IP
   Headers sécurité : HSTS, X-Frame-Options, CSP
   Gestion des WebSockets (upgrade headers pour Socket.io)
   Servir les fichiers statiques directement (bypass Node.js)
   Cache navigateur 1 an pour les assets hashés

5. Pipeline CI/CD (.github/workflows/deploy.yml) :
   Déclencheur : push sur branche main
   Étapes :
   a) Tests unitaires (Jest) + linting (ESLint)
   b) Tests d'intégration (API avec base de données de test)
   c) Build image Docker + push sur registry (GitHub Packages)
   d) Déploiement automatique sur staging (SSH + docker pull)
   e) Smoke tests sur staging (vérifier routes principales)
   f) Déploiement sur production (approbation manuelle requise)
   g) Health check post-déploiement (retry 3x, rollback si KO)

6. Script de backup PostgreSQL (backup.sh) :
   pg_dump + compression gzip + envoi sur S3
   Rétention : 7 backups quotidiens + 4 hebdomadaires + 
   12 mensuels (rotation automatique)
   Alerte email si backup échoue
   Cron : tous les jours à 3h00 UTC

7. Script de restore (restore.sh) :
   Sélection du backup par date
   Confirmation interactive avant écrasement
   Test de cohérence après restore

8. Monitoring stack (docker-compose.monitoring.yml) :
   Prometheus (scraping métriques)
   Grafana (dashboards : latence, CPU, RAM, DB connections, 
   erreurs, messages/sec)
   Alertmanager (email + Slack si seuils dépassés)
   Node Exporter (métriques serveur)
   Postgres Exporter (métriques base de données)

9. Checklist de mise en production (DEPLOY_CHECKLIST.md) :
   Pré-déploiement, déploiement, post-déploiement, rollback

10. Documentation runbook (RUNBOOK.md) :
    Comment redémarrer les services, déboguer les erreurs 
    fréquentes, gérer un incident, restaurer depuis backup

Génère TOUS ces fichiers complets et commentés, prêts à l'emploi.

╔══════════════════════════════════════════════════════════════════╗
║  FIN DU PROMPT MASTER — CONNECTMAIL (7 PHASES COMPLÈTES)       ║
║  Utiliser phase par phase dans des conversations séparées       ║
║  ou à la suite selon la progression du projet.                  ║
╚══════════════════════════════════════════════════════════════════╝
-- ═══════════════════════════════════════════════════════════════
-- ConnectMail — Schéma SQL Phase 5
-- Tables : user_profiles, user_settings, blocked_users, reports,
--          bans, email_change_requests, data_export_requests
-- ═══════════════════════════════════════════════════════════════

-- Activer l'extension pour UUID (si besoin)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ───────────────────────────────────────────────────────────────
-- TABLE : users (mise à jour pour phase 5)
-- Les colonnes de base existent depuis la phase 3. On ajoute ici
-- les colonnes manquantes pour la gestion de profil avancé.
-- ───────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username_changed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status                  VARCHAR(30)  NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'banned', 'suspended', 'scheduled_deletion', 'deleted')),
  ADD COLUMN IF NOT EXISTS scheduled_deletion_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS oauth_google_id          VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS oauth_facebook_id        VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW();

-- ───────────────────────────────────────────────────────────────
-- TABLE : user_profiles — Données de profil affichables
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id      INTEGER       PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio          VARCHAR(160),
  location     VARCHAR(60),
  avatar_url   TEXT,
  cover_url    TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger : créer automatiquement un profil vide à l'inscription
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_profile ON users;
CREATE TRIGGER trg_create_user_profile
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ───────────────────────────────────────────────────────────────
-- TABLE : user_settings — Préférences de confidentialité et notifs
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id              INTEGER       PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Confidentialité
  messages_privacy     VARCHAR(20)   NOT NULL DEFAULT 'everyone'
    CHECK (messages_privacy IN ('everyone', 'nobody')),
  show_online_status   BOOLEAN       NOT NULL DEFAULT TRUE,
  find_by_email        BOOLEAN       NOT NULL DEFAULT TRUE,

  -- Notifications email
  notif_new_messages   BOOLEAN       NOT NULL DEFAULT TRUE,
  notif_daily_digest   BOOLEAN       NOT NULL DEFAULT FALSE,

  -- 2FA
  two_fa_enabled       BOOLEAN       NOT NULL DEFAULT FALSE,
  two_fa_secret        VARCHAR(64),
  two_fa_backup_codes  TEXT[],       -- Codes de secours hashés (bcrypt)

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger : créer les settings par défaut à l'inscription
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_settings ON users;
CREATE TRIGGER trg_create_user_settings
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();

-- ───────────────────────────────────────────────────────────────
-- TABLE : blocked_users — Relations de blocage
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_id   INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id   INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Index pour les deux sens de recherche
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ───────────────────────────────────────────────────────────────
-- TABLE : reports — Signalements d'utilisateurs
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id             SERIAL        PRIMARY KEY,
  reporter_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reported_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason         VARCHAR(30)   NOT NULL
    CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'fake')),
  comment        VARCHAR(500),
  priority       VARCHAR(10)   NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'high', 'urgent')),
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by    INTEGER       REFERENCES users(id) ON DELETE SET NULL,  -- admin
  resolved_at    TIMESTAMPTZ,
  admin_note     TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Un utilisateur ne peut signaler le même profil qu'une fois
  UNIQUE (reporter_id, reported_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_reported   ON reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_status     ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority   ON reports(priority, status);
CREATE INDEX IF NOT EXISTS idx_reports_created    ON reports(created_at DESC);

-- ───────────────────────────────────────────────────────────────
-- TABLE : bans — Bannissements (temporaires et permanents)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bans (
  id           SERIAL        PRIMARY KEY,
  user_id      INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by    INTEGER       REFERENCES users(id) ON DELETE SET NULL,  -- admin
  reason       TEXT          NOT NULL,
  ban_type     VARCHAR(20)   NOT NULL DEFAULT 'temporary'
    CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at   TIMESTAMPTZ,  -- NULL = permanent
  lifted_at    TIMESTAMPTZ,  -- NULL = toujours actif
  lifted_by    INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  lift_note    TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bans_user_id ON bans(user_id);
CREATE INDEX IF NOT EXISTS idx_bans_active  ON bans(user_id, expires_at) WHERE lifted_at IS NULL;

-- Vue pratique pour les bans actifs
CREATE OR REPLACE VIEW active_bans AS
  SELECT b.*, u.username, u.email
  FROM bans b
  JOIN users u ON u.id = b.user_id
  WHERE b.lifted_at IS NULL
    AND (b.expires_at IS NULL OR b.expires_at > NOW());

-- ───────────────────────────────────────────────────────────────
-- TABLE : email_change_requests — Demandes de changement d'email
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_change_requests (
  user_id      INTEGER       PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  new_email    VARCHAR(320)  NOT NULL,
  code         VARCHAR(6)    NOT NULL,   -- Code à 6 chiffres
  expires_at   TIMESTAMPTZ   NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Nettoyage automatique des demandes expirées
CREATE OR REPLACE FUNCTION cleanup_expired_email_changes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM email_change_requests WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────
-- TABLE : data_export_requests — Demandes d'export RGPD
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_export_requests (
  user_id      INTEGER       PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(20)   NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'downloaded')),
  download_url TEXT,
  expires_at   TIMESTAMPTZ,
  requested_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ready_at     TIMESTAMPTZ
);

-- ───────────────────────────────────────────────────────────────
-- TABLE : user_sessions — Suivi des sessions actives (présence)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  socket_id    VARCHAR(100),
  last_active  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  user_agent   TEXT,
  ip           INET,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id     ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON user_sessions(last_active);

-- ───────────────────────────────────────────────────────────────
-- INDEX SUPPLÉMENTAIRES sur users (recherche optimisée)
-- ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_status         ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_fullname_trgm
  ON users USING GIN (
    (LOWER(first_name || ' ' || last_name)) gin_trgm_ops
  );
-- Nécessite : CREATE EXTENSION pg_trgm;

-- ───────────────────────────────────────────────────────────────
-- FONCTION : Suppression totale des données d'un compte
-- Appelée par le job de suppression 30 jours après la demande
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Anonymiser les messages (ne pas les supprimer pour préserver le contexte des conversations)
  UPDATE messages
  SET content = '[Message supprimé]', is_deleted = TRUE, deleted_at = NOW()
  WHERE sender_id = p_user_id;

  -- Supprimer les pièces jointes de S3 (géré côté application)
  -- Supprimer les fichiers uploadés (référencés dans message_attachments)
  DELETE FROM message_attachments WHERE message_id IN (
    SELECT id FROM messages WHERE sender_id = p_user_id
  );

  -- Supprimer les conversations privées (si l'utilisateur est le seul participant restant)
  -- Note : les conversations multi-users gardent les autres messages

  -- Supprimer les données personnelles
  DELETE FROM blocked_users WHERE blocker_id = p_user_id OR blocked_id = p_user_id;
  DELETE FROM reports WHERE reporter_id = p_user_id;
  DELETE FROM user_profiles WHERE user_id = p_user_id;
  DELETE FROM user_settings WHERE user_id = p_user_id;
  DELETE FROM user_sessions WHERE user_id = p_user_id;
  DELETE FROM refresh_tokens WHERE user_id = p_user_id;

  -- Marquer le compte comme définitivement supprimé
  UPDATE users SET
    status = 'deleted',
    email = 'deleted_' || p_user_id || '@connectmail.invalid',
    first_name = '[Supprimé]',
    last_name = '',
    password_hash = '',
    scheduled_deletion_at = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;

  RAISE NOTICE 'Données de l''utilisateur % supprimées', p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────
-- SEED : Insérer les extensions nécessaires (à exécuter une fois)
-- ───────────────────────────────────────────────────────────────
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- Pour la recherche floue
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- Pour gen_random_uuid()

