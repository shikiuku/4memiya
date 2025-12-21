-- Clean up dangling references first
UPDATE public.reviews
SET user_id = NULL
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM public.app_users);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reviews_app_users') THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT fk_reviews_app_users
    FOREIGN KEY (user_id)
    REFERENCES public.app_users(id)
    ON DELETE SET NULL;
  END IF;
END $$;
