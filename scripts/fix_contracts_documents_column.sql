-- Fix contracts table documents column type
-- Change from ARRAY to JSONB to properly store document objects

-- First, let's see what data exists (if any)
-- SELECT id, documents FROM contracts WHERE documents IS NOT NULL;

-- Drop the existing column and recreate it as JSONB
ALTER TABLE contracts DROP COLUMN IF EXISTS documents;
ALTER TABLE contracts ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the change
COMMENT ON COLUMN contracts.documents IS 'Stores contract documents as JSON array of objects with file metadata';
