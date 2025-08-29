-- Add missing columns to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS send_date TIMESTAMP WITH TIME ZONE;

-- Update existing contracts with default values
UPDATE contracts 
SET contract_type = 'Contrat entreprise' 
WHERE contract_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN contracts.contract_type IS 'Type de contrat: Contrat de partenariat ou Contrat entreprise';
COMMENT ON COLUMN contracts.send_date IS 'Date d envoi du contrat au client';
