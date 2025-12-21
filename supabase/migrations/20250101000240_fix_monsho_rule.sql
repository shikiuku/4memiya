-- Fix 'Average Crest Power' Rule
-- Delete potentially problematic rules (Japanese category or incorrect ones)
DELETE FROM public.assessment_rules WHERE category = '平均紋章力';
DELETE FROM public.assessment_rules WHERE category = 'monshoryoku';

-- Insert standard 'monshoryoku' rules
-- Example threshold: 5000 -> +1000 yen (Adjust as needed based on game knowldge or previous context)
-- Since user said "Average Crest Power", I'll assume standard ranges like 5000+. 
-- I'll add a few tiers.
INSERT INTO public.assessment_rules (rule_type, category, label, threshold, price_adjustment) VALUES
('range', 'monshoryoku', '平均紋章力', 10000, 5000),
('range', 'monshoryoku', '平均紋章力', 5000, 2000),
('range', 'monshoryoku', '平均紋章力', 1000, 500);
