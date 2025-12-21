-- Add sort_order to assessment_rules
ALTER TABLE public.assessment_rules ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Optional: Seed initial sort order for standard categories if needed
UPDATE public.assessment_rules SET sort_order = 10 WHERE category = 'rank';
UPDATE public.assessment_rules SET sort_order = 20 WHERE category = 'luck_max';
UPDATE public.assessment_rules SET sort_order = 30 WHERE category = 'gacha_charas';
UPDATE public.assessment_rules SET sort_order = 40 WHERE category = 'monshoryoku';
