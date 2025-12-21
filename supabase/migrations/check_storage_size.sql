SELECT 
  count(*) as count,
  sum((metadata->>'size')::bigint) as total_size_bytes,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size_human
FROM storage.objects;
