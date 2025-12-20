-- Add likes_count column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Function to update likes_count
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE products
    SET likes_count = likes_count + 1
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE products
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes table
DROP TRIGGER IF EXISTS on_like_change ON likes;
CREATE TRIGGER on_like_change
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE PROCEDURE public.update_likes_count();

-- Initial data population
UPDATE products p
SET likes_count = (
  SELECT count(*)
  FROM likes l
  WHERE l.product_id = p.id
);
