-- Seed default assessment rules

-- Rank Rules
insert into public.assessment_rules (rule_type, category, threshold, price_adjustment) values
('range', 'rank', 1000, 5000),
('range', 'rank', 500, 1000);

-- Luck (Unkyoku) Rules
insert into public.assessment_rules (rule_type, category, threshold, price_adjustment) values
('range', 'luck_max', 500, 3000),
('range', 'luck_max', 100, 500);

-- Gacha Character Count Rules
insert into public.assessment_rules (rule_type, category, threshold, price_adjustment) values
('range', 'gacha_charas', 1000, 5000),
('range', 'gacha_charas', 500, 2500),
('range', 'gacha_charas', 100, 500);

-- Boolean Character Rules (Samples)
insert into public.assessment_rules (rule_type, category, label, price_adjustment) values
('boolean', 'character', 'ルシファー', 3000),
('boolean', 'character', 'ヤクモ', 3000),
('boolean', 'character', 'ネオ', 2500),
('boolean', 'character', 'エクスカリバー', 2000);
