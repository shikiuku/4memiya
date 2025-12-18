-- Enable RLS
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Public read access for app_config"
ON app_config FOR SELECT
USING (true);

-- Policy for admin write access (using user_metadata)
CREATE POLICY "Admin write access for app_config"
ON app_config FOR ALL
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
