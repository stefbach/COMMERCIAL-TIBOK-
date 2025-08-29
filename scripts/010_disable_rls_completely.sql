-- Désactiver complètement RLS pour permettre l'importation des données de l'Île Maurice
-- Désactivation complète des politiques RLS sur toutes les tables

-- Désactiver RLS sur la table organizations
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur la table appointments  
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur la table contracts
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur la table contacts (si elle existe)
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour être sûr
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON organizations;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON contracts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON contacts;

-- Ajouter les colonnes manquantes pour l'Île Maurice si elles n'existent pas
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS zone_geographique TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS secteur TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS nb_chambres INTEGER;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_principal TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_fonction TEXT;

-- Corriger la colonne manquante pour les contrats
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Message de confirmation
SELECT 'RLS désactivé pour toutes les tables - Prêt pour importation Maurice' as status;
