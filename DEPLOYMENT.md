# Déploiement sur Vercel - CRM Universe App

## Prérequis

1. Compte Vercel
2. Compte Supabase (optionnel - l'app fonctionne en mode démo sans Supabase)
3. Repository Git

## Configuration Supabase (Optionnel)

Si vous souhaitez utiliser Supabase au lieu du mode démo :

1. Créez un projet Supabase
2. Exécutez les scripts SQL dans l'ordre :
   - `scripts/001_create_crm_tables.sql`
   - `scripts/002_create_profile_trigger.sql`
   - `scripts/003_seed_demo_data.sql`
   - `scripts/004_create_appointments_table.sql`
   - `scripts/005_create_contracts_table.sql`

## Variables d'environnement

### Pour Supabase (optionnel)
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

### Pour la production
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## Déploiement sur Vercel

### Méthode 1 : Via l'interface Vercel

1. Connectez votre repository GitHub à Vercel
2. Importez le projet
3. Configurez les variables d'environnement dans les paramètres du projet
4. Déployez

### Méthode 2 : Via Vercel CLI

\`\`\`bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
\`\`\`

## Fonctionnalités

L'application CRM Universe inclut :

- ✅ Gestion des organisations et contacts
- ✅ Système de rendez-vous avec géolocalisation
- ✅ Gestion des contrats avec affectation aux commerciaux
- ✅ Import CSV/Excel avec mapping des colonnes
- ✅ Filtres avancés par statut, priorité, ville, région
- ✅ Mode démo complet (fonctionne sans base de données)
- ✅ Interface responsive et moderne
- ✅ Authentification Supabase (optionnelle)

## Mode Démo

L'application fonctionne automatiquement en mode démo si les variables d'environnement Supabase ne sont pas configurées. Les données sont stockées dans localStorage et incluent :

- 2 organisations d'exemple (Hôtel, Pharmacie)
- 2 contacts avec informations complètes
- 2 rendez-vous planifiés
- 2 contrats en cours
- 2 deals dans le pipeline

## Support

Pour toute question ou problème de déploiement, vérifiez :

1. Les logs de build Vercel
2. Les variables d'environnement
3. La configuration Supabase (si utilisée)
4. Les permissions RLS dans Supabase
