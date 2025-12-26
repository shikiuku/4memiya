-- Add attribute_characters column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS attribute_characters JSONB DEFAULT '{}'::jsonb;

-- Update existing records to have a default empty object if needed
UPDATE products SET attribute_characters = '{}'::jsonb WHERE attribute_characters IS NULL;
