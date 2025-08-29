-- Add missing columns to organizations table for complete import functionality
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS prospectStatus TEXT DEFAULT 'not_contacted',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Manual';

-- Update existing records to have default values
UPDATE organizations 
SET priority = 'medium' 
WHERE priority IS NULL;

UPDATE organizations 
SET prospectStatus = 'not_contacted' 
WHERE prospectStatus IS NULL;

UPDATE organizations 
SET source = 'Manual' 
WHERE source IS NULL;

-- Add indexes for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_organizations_priority ON organizations(priority);
CREATE INDEX IF NOT EXISTS idx_organizations_prospect_status ON organizations(prospectStatus);
CREATE INDEX IF NOT EXISTS idx_organizations_source ON organizations(source);
CREATE INDEX IF NOT EXISTS idx_organizations_district ON organizations(district);
CREATE INDEX IF NOT EXISTS idx_organizations_secteur ON organizations(secteur);
CREATE INDEX IF NOT EXISTS idx_organizations_category ON organizations(category);
</sql>

```ts file="" isHidden
