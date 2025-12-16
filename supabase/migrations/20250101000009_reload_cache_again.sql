-- Force reload of PostgREST schema cache AGAIN (after table recreation)
NOTIFY pgrst, 'reload config';
