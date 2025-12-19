-- Clean up dangling references first
UPDATE public.reviews
SET user_id = NULL
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM public.app_users);

ALTER TABLE public.reviews
ADD CONSTRAINT fk_reviews_app_users
FOREIGN KEY (user_id)
REFERENCES public.app_users(id)
ON DELETE SET NULL;
