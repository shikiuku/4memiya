-- Clean slate
TRUNCATE TABLE public.assessment_rules;

-- Standard Range Rules
INSERT INTO public.assessment_rules (rule_type, category, label, threshold, price_adjustment) VALUES
-- Rank
('range', 'rank', 'ランク', 2000, 30000),
('range', 'rank', 'ランク', 1500, 15000),
('range', 'rank', 'ランク', 1000, 5000),
('range', 'rank', 'ランク', 500, 1000),

-- Luck Max
('range', 'luck_max', '運極数', 1000, 10000),
('range', 'luck_max', '運極数', 500, 3000),
('range', 'luck_max', '運極数', 100, 500),

-- Gacha Charas
('range', 'gacha_charas', 'ガチャ限数', 2000, 30000),
('range', 'gacha_charas', 'ガチャ限数', 1500, 15000),
('range', 'gacha_charas', 'ガチャ限数', 1000, 5000),
('range', 'gacha_charas', 'ガチャ限数', 500, 2500),
('range', 'gacha_charas', 'ガチャ限数', 100, 500),

-- Average Crest Power (Monshoryoku) - New English key, Japanese label
('range', 'monshoryoku', '平均紋章力', 20000, 10000),
('range', 'monshoryoku', '平均紋章力', 15000, 7000),
('range', 'monshoryoku', '平均紋章力', 10000, 5000),
('range', 'monshoryoku', '平均紋章力', 7000, 3000),
('range', 'monshoryoku', '平均紋章力', 5000, 2000);

-- Character Boolean Rules (Examples)
INSERT INTO public.assessment_rules (rule_type, category, label, price_adjustment) VALUES
('boolean', 'character', 'ルシファー運極', 5000),
('boolean', 'character', 'ヤクモ運極', 3000),
('boolean', 'character', 'ネオ運極', 2500),
('boolean', 'character', 'エクスカリバー運極', 2000);
