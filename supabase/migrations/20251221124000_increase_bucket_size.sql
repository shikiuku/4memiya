-- Update the 'products' bucket to increase file size limit
-- Setting file_size_limit to 100MB (104857600 bytes)
-- Or NULL for "unlimited" (subject to global project limits)

UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE id = 'products';
