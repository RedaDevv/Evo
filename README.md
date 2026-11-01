# 🚀 EVO Study

> Live Demo: [evostudy.app.vercel.app](https://evostudy.app.vercel.app)

**EVO Study** est une application web moderne de gestion d'études et de productivité en temps réel. Conçue pour optimiser les sessions de travail des étudiants, la plateforme regroupe au même endroit le suivi des objectifs, la gestion du temps et un environnement sonore adapté.

---

## 🛠️ Stack Technique & Architecture

L'application repose sur une architecture SPA (Single Page Application) moderne, privilégiant le typage statique strict et la réactivité des données en temps réel :

* **Front-end :** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool & Bundler :** [Vite](https://vitejs.dev/)
* **Styling :** CSS moderne / Tailwind CSS (design responsive & Dark Mode)
* **Back-end & Database :** [Firebase](https://firebase.google.com/) (Firestore Database, Authentication)
* **Intégrations API :** Web Playback SDK [Spotify API](https://developer.spotify.com/documentation/web-api)
* **Déploiement & CI/CD :** Hosté sur [Vercel](https://vercel.com/) avec intégration continue depuis GitHub

---

## ✨ Fonctionnalités Clés

* **Tableau de bord interactif :** Interface fluide pour piloter ses sessions de révision sans distraction.
* **Gestion du temps & Suivi :** Timers de travail personnalisables (technique Pomodoro) et suivi des tâches prioritaires.
* **Intégration Spotify Web SDK :** Contrôle et lecture audio directement intégrés dans le dashboard pour rester concentré.
* **Sync en temps réel :** Persistance et synchronisation immédiate des données utilisateur via Firestore.
* **Authentification sécurisée :** Gestion des sessions utilisateurs via Firebase Auth.

---

## 💻 Installation & Développement Local

Pour faire tourner le projet en local sur votre machine :

### Prérequis
* Node.js (v18.0.0 ou plus récent)
* npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt :**
   ```bash
   git clone [https://github.com/votre-compte/evo-study.git](https://github.com/votre-compte/evo-study.git)
   cd evo-study
