# CRM Universe App

*Application CRM complète avec gestion des organisations, contacts, rendez-vous et contrats*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bachs-projects-25b173f6/v0-crm-universe-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/ZuNoJjEhu2w)

## 🚀 Fonctionnalités

### Gestion Complète des Prospects
- **Organisations** : Gestion des entreprises clientes avec informations détaillées
- **Contacts** : Fiches prospects complètes avec notes et historique
- **Filtres Avancés** : Recherche par type d'activité, statut, priorité, ville, région
- **Import/Export** : Support CSV et Excel avec mapping intelligent des colonnes

### Planification et Suivi
- **Rendez-vous** : Planification avec géolocalisation et types personnalisés
- **Contrats** : Gestion complète avec affectation aux commerciaux
- **Pipeline** : Suivi des deals et statistiques de performance
- **Activités** : Historique des interactions et communications

### Interface Moderne
- **Design Responsive** : Interface adaptée mobile et desktop
- **Mode Démo** : Fonctionne sans configuration (données en localStorage)
- **Authentification** : Intégration Supabase optionnelle
- **Thème Sombre/Clair** : Interface personnalisable

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 19, TypeScript
- **UI/UX** : Tailwind CSS, Radix UI, Lucide Icons
- **Base de Données** : Supabase (optionnel, mode démo disponible)
- **Déploiement** : Vercel
- **Import/Export** : SheetJS (xlsx)

## 📦 Installation Locale

\`\`\`bash
# Cloner le repository
git clone https://github.com/your-username/crm-universe-app.git
cd crm-universe-app

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
\`\`\`

L'application sera accessible sur `http://localhost:3000`

## 🔧 Configuration

### Mode Démo (Par défaut)
L'application fonctionne automatiquement en mode démo avec des données d'exemple stockées dans localStorage. Aucune configuration requise !

### Mode Production avec Supabase
Pour utiliser Supabase en production, configurez les variables d'environnement :

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

Puis exécutez les scripts SQL dans l'ordre :
1. `scripts/001_create_crm_tables.sql`
2. `scripts/002_create_profile_trigger.sql`
3. `scripts/003_seed_demo_data.sql`
4. `scripts/004_create_appointments_table.sql`
5. `scripts/005_create_contracts_table.sql`

## 🚀 Déploiement

### Déploiement Automatique
Votre projet est automatiquement déployé sur Vercel à chaque modification depuis v0.app :

**[https://vercel.com/bachs-projects-25b173f6/v0-crm-universe-app](https://vercel.com/bachs-projects-25b173f6/v0-crm-universe-app)**

### Déploiement Manuel
\`\`\`bash
# Via Vercel CLI
npm i -g vercel
vercel login
vercel --prod
\`\`\`

## 📱 Utilisation

### Démarrage Rapide
1. **Mode Démo** : L'application charge automatiquement des données d'exemple
2. **Navigation** : Utilisez la sidebar pour accéder aux différents modules
3. **Import** : Importez vos données via CSV/Excel avec mapping des colonnes
4. **Filtres** : Utilisez les filtres avancés pour organiser vos prospects

### Modules Principaux
- **Dashboard** : Vue d'ensemble des statistiques
- **Organisations** : Gestion des entreprises clientes
- **Rendez-vous** : Planification et suivi des RDV
- **Contrats** : Gestion des contrats et signatures
- **Activités** : Historique des interactions

## 🔄 Synchronisation v0.app

Ce repository reste synchronisé avec vos déploiements sur [v0.app](https://v0.app).
Toute modification apportée à votre application déployée sera automatiquement poussée vers ce repository.

**Continuer le développement sur :**
[https://v0.app/chat/projects/ZuNoJjEhu2w](https://v0.app/chat/projects/ZuNoJjEhu2w)

## 📄 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez les logs de build Vercel
2. Consultez la documentation Supabase (si utilisé)
3. Vérifiez les variables d'environnement
webhook test
