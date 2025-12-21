-- Add 10 dummy reviews for Monster Strike site context
-- Schema: nickname, star, comment, request_type, manual_stock_no, review_date, is_published

INSERT INTO public.reviews (star, nickname, request_type, comment, manual_stock_no, review_date, is_published) VALUES
(5, 'あめみや', 'buyback', '迅速な査定で、モンスト引退垢が高く売れました！対応も丁寧で安心できました。', NULL, '2025-12-20', true),
(5, '名無し', 'purchase', '運極多数の最強アカウントをゲットできました！すぐに対応してくれて感謝です。', 'No.1001', '2025-12-19', true),
(4, 'タナカ', 'buyback', '思ったより高値がつきました。振り込みも早かったです。', NULL, '2025-12-18', true),
(5, 'モンスト好き', 'purchase', '憧れのガチャ限運極が手に入り満足です。また利用したいです。', 'No.1002', '2025-12-17', true),
(3, '匿名配送', 'buyback', '少し連絡が遅かったですが、無事に売却できました。', NULL, '2025-12-16', true),
(5, 'K', 'purchase', '欲しかったコラボキャラが揃っていて最高です！', 'No.1003', '2025-12-15', true),
(5, 'ゲスト', 'buyback', '他店より高く買い取ってもらえました。おすすめです。', NULL, '2025-12-14', true),
(4, 'S.T', 'purchase', 'スムーズに引き継ぎできました。ありがとうございました。', 'No.1004', '2025-12-13', true),
(5, '利用者', 'buyback', '大切に使っていたアカウントなので、価値を分かってもらえて良かったです。', NULL, '2025-12-12', true),
(5, '名無しさん', 'purchase', '対応が神！夜中でもすぐ返信くれました。信頼できる業者さんです。', 'No.1005', '2025-12-11', true);
