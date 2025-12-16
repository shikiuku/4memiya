-- Force reload of PostgREST schema cache
NOTIFY pgrst, 'reload config';
