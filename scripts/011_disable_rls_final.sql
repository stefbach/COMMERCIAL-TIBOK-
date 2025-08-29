-- Désactiver complètement les politiques RLS pour permettre l'importation
-- Script pour l'Île Maurice - Structures hôtelières

-- Désactiver RLS sur toutes les tables
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE commerciaux DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON organizations;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON contracts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON admins;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON commerciaux;

-- Supprimer toutes les autres politiques qui pourraient exister
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Ajouter les colonnes manquantes pour les contrats
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables qui en ont besoin
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérifier que les colonnes existent pour les organisations mauriciennes
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS zone_geographique TEXT,
ADD COLUMN IF NOT EXISTS secteur TEXT,
ADD COLUMN IF NOT EXISTS nb_chambres INTEGER,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS contact_principal TEXT,
ADD COLUMN IF NOT EXISTS contact_fonction TEXT;

-- Message de confirmation
SELECT 'RLS désactivé sur toutes les tables - Importation autorisée pour structures mauriciennes' as status;
