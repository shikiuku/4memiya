-- Update the 'products' bucket to allow video mime types
-- Setting allowed_mime_types to NULL removes all restrictions
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'products';
