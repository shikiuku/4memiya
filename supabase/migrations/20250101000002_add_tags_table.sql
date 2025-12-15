-- tags table (Managed persistent tags)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tags view" ON tags FOR SELECT USING (true);
CREATE POLICY "Admin tags insert" ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin tags delete" ON tags FOR DELETE USING (true);
