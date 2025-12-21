-- Rename game_title to nickname
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'game_title') THEN
    ALTER TABLE public.reviews RENAME COLUMN game_title TO nickname;
  END IF;
END $$;

-- Add request_type column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'request_type') THEN
    ALTER TABLE public.reviews ADD COLUMN request_type text DEFAULT 'purchase';
  END IF;
END $$;
