# Strava Club Tracker

Application de suivi des activités du Club Blanko sur Strava, construite avec Astro et Tailwind CSS.

## Fonctionnalités

- **Authentification Strava OAuth** : Connexion sécurisée via l'API Strava
- **Vérification d'appartenance au club** : Seuls les membres du club peuvent voir les données
- **Statistiques des membres** : Tableau détaillé des performances individuelles
- **Statistiques cumulatives** : Vue d'ensemble des performances du groupe
- **Filtres par période** : Semaine, mois, année, et depuis toujours
- **Interface responsive** : Design moderne avec Tailwind CSS

## Prérequis

- Node.js 18+ 
- Un compte Strava avec accès au Club Blanko (ID: 1452985)
- Une application Strava créée sur [https://www.strava.com/settings/api](https://www.strava.com/settings/api)

## Installation

1. Cloner le projet :
```bash
git clone <repository-url>
cd strava-club-tracker
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos informations Strava :
```
# Strava API Configuration
STRAVA_CLIENT_ID=votre_client_id
STRAVA_CLIENT_SECRET=votre_client_secret
STRAVA_REDIRECT_URI=http://localhost:4321/auth/callback

# Club Configuration
STRAVA_CLUB_ID=1452985

# Session Secret
SESSION_SECRET=votre_secret_de_session
```

4. Démarrer le serveur de développement :
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:4321`

## Configuration de l'API Strava

1. Créer une application sur [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Configurer l'URL de callback : `http://localhost:4321/auth/callback`
3. Demander les permissions nécessaires :
   - `read` : Lire les données de base
   - `activity:read` : Lire les activités
   - `profile:read_all` : Lire le profil complet

## Structure du projet

```
src/
├── components/     # Composants réutilisables
├── lib/           # Bibliothèques et utilitaires
│   ├── strava.ts  # Client API Strava
│   ├── session.ts # Gestion des sessions
│   └── utils.ts   # Fonctions utilitaires
├── pages/         # Pages Astro
│   ├── index.astro      # Page d'accueil
│   ├── members.astro    # Statistiques des membres
│   ├── group.astro      # Statistiques du groupe
│   ├── auth/
│   │   └── callback.astro # Callback OAuth
│   └── logout.astro     # Déconnexion
├── layouts/       # Mises en page
└── styles/        # Styles CSS
```

## Pages

### Page d'accueil (`/`)
- Interface de connexion Strava
- Vérification d'appartenance au club
- Navigation vers les statistiques

### Statistiques des membres (`/members`)
- Tableau des membres avec leurs statistiques
- Filtres par période (semaine, mois, année, total)
- Colonnes : distance, temps, calories, dénivelé

### Statistiques du groupe (`/group`)
- Statistiques cumulatives du club
- Cartes avec les métriques principales
- Tableau détaillé par période

## Déploiement

Pour le déploiement en production :

1. Configurer les variables d'environnement de production
2. Builder l'application :
```bash
npm run build
```

3. Déployer le dossier `dist/` sur votre plateforme d'hébergement

## Sécurité

- Les tokens d'accès sont stockés en mémoire serveur
- Sessions avec expiration automatique
- Vérification systématique de l'appartenance au club
- Pas de stockage des informations sensibles côté client

## API Strava utilisées

- `/oauth/authorize` : Authentification OAuth
- `/oauth/token` : Échange de code contre token
- `/athlete` : Informations sur l'athlète
- `/clubs/{id}/members` : Liste des membres du club
- `/clubs/{id}/activities` : Activités du club

## Contribuer

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pusher vers la branche
5. Créer une Pull Request

## Licence

Ce projet est sous licence MIT.
