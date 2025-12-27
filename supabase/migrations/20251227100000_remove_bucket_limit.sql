-- Update the 'products' bucket to remove bucket-level file size limit
-- This allows the global Supabase project limit (e.g., 5GB) to take effect
UPDATE storage.buckets
SET file_size_limit = NULL
WHERE id = 'products';
