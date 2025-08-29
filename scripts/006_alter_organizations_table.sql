-- Adding missing columns to organizations table for complete CRM functionality
-- Add category column for organization categorization
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add district/sector column for geographical organization
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS district TEXT;

-- Add contact principal (main contact person name)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS contact_principal TEXT;

-- Add contact fonction (main contact person role/function)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS contact_fonction TEXT;

-- Add comment to document the changes
COMMENT ON COLUMN organizations.category IS 'Catégorie de l''établissement (ex: Hôtel, Pharmacie, Restaurant, etc.)';
COMMENT ON COLUMN organizations.district IS 'District ou secteur géographique de l''établissement';
COMMENT ON COLUMN organizations.contact_principal IS 'Nom du contact principal de l''établissement';
COMMENT ON COLUMN organizations.contact_fonction IS 'Fonction/poste du contact principal';

-- Update RLS policies to include new columns (if needed)
-- The existing policies should automatically cover the new columns
