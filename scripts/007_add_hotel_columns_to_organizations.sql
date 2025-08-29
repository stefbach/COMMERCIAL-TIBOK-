-- Add missing columns for hotel/organization import
-- Columns needed: Region, Zone geographique, Secteur, Nb de chambres

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS zone_geographique text,
ADD COLUMN IF NOT EXISTS secteur text,
ADD COLUMN IF NOT EXISTS nb_chambres integer;

-- Update existing records to have default values if needed
UPDATE organizations 
SET 
  region = COALESCE(region, ''),
  zone_geographique = COALESCE(zone_geographique, ''),
  secteur = COALESCE(secteur, ''),
  nb_chambres = COALESCE(nb_chambres, 0)
WHERE region IS NULL OR zone_geographique IS NULL OR secteur IS NULL OR nb_chambres IS NULL;
