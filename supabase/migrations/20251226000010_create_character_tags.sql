-- Create character_tags table
CREATE TABLE IF NOT EXISTS character_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(attribute, name)
);

-- Enable RLS
ALTER TABLE character_tags ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to character_tags" ON character_tags
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert character_tags" ON character_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete character_tags" ON character_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
