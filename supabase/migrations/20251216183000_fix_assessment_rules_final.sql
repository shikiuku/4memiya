-- Consolidated Fix for Assessment Rules
-- Timestamp: 2025-12-16 (Current)

-- 1. Drop the incorrect table
DROP TABLE IF EXISTS public.assessment_rules;

-- 2. Recreate with CORRECT columns
CREATE TABLE public.assessment_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    rule_type text NOT NULL CHECK (rule_type IN ('range', 'boolean')),
    category text NOT NULL,
    label text,
    threshold integer,
    price_adjustment integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT assessment_rules_pkey PRIMARY KEY (id)
);

-- 3. Enable RLS and Policies
ALTER TABLE public.assessment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
    ON public.assessment_rules FOR SELECT
    USING (true);

-- 4. LIMIT CACHE BUSTING
NOTIFY pgrst, 'reload config';

-- 5. Seed Data
INSERT INTO public.assessment_rules (rule_type, category, threshold, price_adjustment) VALUES
('range', 'rank', 1000, 5000),
('range', 'rank', 500, 1000),
('range', 'luck_max', 500, 3000),
('range', 'luck_max', 100, 500),
('range', 'gacha_charas', 1000, 5000),
('range', 'gacha_charas', 500, 2500),
('range', 'gacha_charas', 100, 500);

INSERT INTO public.assessment_rules (rule_type, category, label, price_adjustment) VALUES
('boolean', 'character', 'ルシファー', 3000),
('boolean', 'character', 'ヤクモ', 3000),
('boolean', 'character', 'ネオ', 2500),
('boolean', 'character', 'エクスカリバー', 2000);
