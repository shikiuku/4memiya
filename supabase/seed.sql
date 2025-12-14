-- Initial Admin User (Password: admin123 -> Hash needed, using placeholder)
-- Note: In production, password hashing should be handled by the application logic (bcrypt).
INSERT INTO app_users (username, password_hash, role)
VALUES ('admin_user', '$2b$10$EpOd/..hashed_password_placeholder..', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Dummy Products
INSERT INTO products (title, price, status, rank, luck_max, gacha_charas, badge_power, tags, images, description_points, description_recommend)
VALUES
('【No.343】高ランクで扱いやすい最強アカウント', 16000, 'on_sale', 1500, 300, 150, 5000, ARRAY['高ランク', 'ルシファー所持', '運極多数'], ARRAY['/sample_product.jpg'], 'このアカウントのポイントは...', 'こんな人におすすめ...'),
('【No.344】運極多数！即戦力', 8000, 'sold_out', 800, 500, 80, 2000, ARRAY['運極', '即戦力'], ARRAY['/sample_product.jpg'], '...', '...'),
('【No.345】ガチャ限大量引退垢', 45000, 'on_sale', 400, 50, 800, 1000, ARRAY['ガチャ限', 'コンプ'], ARRAY['/sample_product.jpg'], '...', '...')
ON CONFLICT DO NOTHING;

-- Default Rules
INSERT INTO assessment_rules (category, threshold_min, bonus_amount, character_name)
VALUES
('rank', 500, 1000, NULL),
('rank', 1000, 3000, NULL),
('luck', 100, 500, NULL),
('luck', 500, 5000, NULL),
('character_bonus', 0, 2000, 'ルシファー')
ON CONFLICT DO NOTHING;

-- Default App Config
INSERT INTO app_config (key, value, description)
VALUES
('view_password', '1234', '商品詳細閲覧用パスワード'),
('require_auth_for_detail', 'true', '閲覧制限の有効化')
ON CONFLICT (key) DO NOTHING;
