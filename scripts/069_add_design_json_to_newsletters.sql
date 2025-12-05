-- Add design_json column to newsletters table for storing Unlayer design
ALTER TABLE newsletters 
ADD COLUMN IF NOT EXISTS design_json JSONB;

-- Add comment
COMMENT ON COLUMN newsletters.design_json IS 'Stores Unlayer editor design JSON for re-editing newsletters';
