-- Creating contracts table for contract management functionality
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled', 'expired')),
  signed_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  assigned_to VARCHAR(255) NOT NULL,
  documents TEXT[], -- Array of document URLs/paths
  notes TEXT,
  -- Using created_at and updated_at to match other tables
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_organization_id ON contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contact_id ON contracts(contact_id);
CREATE INDEX IF NOT EXISTS idx_contracts_assigned_to ON contracts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
-- Using created_at instead of created_date for index
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Users can insert contracts" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update contracts" ON contracts FOR UPDATE USING (true);
CREATE POLICY "Users can delete contracts" ON contracts FOR DELETE USING (true);
