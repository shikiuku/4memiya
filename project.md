# Project Specification: Game Account Shop

## 1. 開発目的 (Goal)
参考サイト (`https://ox3sn.com/`) および提供されたスクリーンショットのデザイン・構成を忠実に再現したWebサイトを構築する。
**最重要**: 提供されたスクリーンショットの要素（アコーディオン、追従フッター、通知バー、安心チェックリストなど）を完コピレベルで実装しつつ、将来の機能拡張（決済、チャット等）に耐えうる拡張性の高いコードベースを作成する。

## 2. 技術スタック (Tech Stack)
- **Frontend**: React (Next.js 14+ App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Lucide React for Icons)
- **Backend / Auth**: Supabase (PostgreSQL, Auth)
- **State Management**: React Hooks / Context API
- **Deployment**: Vercel

## 3. ディレクトリ構造 (Scalable Structure)
**`src` ディレクトリを採用**し、UIとロジック（Server Actions）を明確に分離する構成。

```text
.
├── public/                  # 静的画像ファイル (logo, favicon)
├── src/
│   ├── app/                 # ページルーティング (App Router)
│   │   ├── layout.tsx       # 全体レイアウト
│   │   ├── globals.css      # 全体スタイル定義
│   │   ├── page.tsx         # トップページ
│   │   ├── products/        # 商品関連
│   │   │   ├── page.tsx     # 一覧 (検索・フィルタ)
│   │   │   └── [id]/page.tsx# 詳細 (要認証/PW)
│   │   ├── assessment/      # 買取査定
│   │   │   └── page.tsx
│   │   ├── admin/           # 管理者画面
│   │   │   ├── layout.tsx   # 管理画面専用レイアウト
│   │   │   ├── dashboard/   # ダッシュボード
│   │   │   ├── inventory/   # 在庫管理(CRUD)
│   │   │   └── config/      # サイト設定(PW変更等)
│   │   └── auth/            # 認証関連 (Login, Signup)
│   ├── components/          # UIコンポーネント
│   │   ├── ui/              # ボタン、入力欄などの最小単位パーツ (shadcn/ui like)
│   │   ├── features/        # 機能単位のパーツ (ProductCard, AssessmentForm)
│   │   └── layout/          # Header, Footer, BottomNav
│   ├── lib/                 # ライブラリ設定
│   │   ├── supabase/        # Supabase Client (Client/Server)
│   │   └── utils.ts         # classNames結合などのユーティリティ
│   ├── actions/             # Server Actions (DB操作などのバックエンドロジック)
│   │   ├── product.ts       # 商品のCRUD処理
│   │   ├── assessment.ts    # 査定計算ロジック
│   │   └── auth.ts          # ログイン・登録処理
│   ├── types/               # 型定義
│   │   └── index.ts         # Database型など
│   └── constants/           # 定数管理
│       └── config.ts        # サイト設定、査定の基準値など
├── project.md               # 本仕様書
└── next.config.js
4. ページ詳細・デザイン仕様 (/dev details)
src/app/globals.css
Theme: 背景は白(#ffffff)または極めて薄いグレー(#f5f7fa)。アクセントカラーは鮮やかなブルー(#007bff)。

Typography: 日本語フォント（Noto Sans JP等）を使用し、可読性を高くする。

src/app/layout.tsx (Global Layout)
Header: シンプルな構成。戻るボタン(←)やページタイトル（例: "No.343"）を動的に表示。

Notification Banner:

ヘッダー直下に薄い黄色背景のバーを配置。

テキスト: 「新着在庫やお知らせを通知で受け取れます。」

ボタン: 青色の角丸ボタン「通知をオンにする」。

src/app/products/page.tsx (在庫一覧)
View Toggle: リスト表示（詳細あり）とグリッド表示（画像メイン）を切り替えるアイコンボタン（右上に配置）。

Product Card (List View):

左側にサムネイル画像。

右側に情報:

タグ: 「高ランク」「強垢」「運極」などのグレー背景・小文字タグ。

タイトル: 2行制限（例: 【No.343】高ランクで扱いやすい...）。

価格: 太字で明記。

ステータス: 「販売中」の青いボタン。

src/app/products/[id]/page.tsx (詳細ページ)
※アクセス制御: src/actions/auth.ts の checkViewPermission() を呼び出し、権限がない場合は認証画面へリダイレクト。

Hero Image & Gallery:

メインの大きなゲームスクショ。下部にサムネイルリスト（タップで切替）。

Product Info:

タイトル、赤字または強調色の価格 (¥16,000 税込)。

出品者情報（アイコン・認証マーク・TwitterID）。

Spec Table (スペック表):

ランク, 運極数, ガチャ限定キャラ, 平均紋章力 をリスト形式で右寄せ表示。

Accordion Sections (アコーディオン):

「このアカウントのポイント」: 初期は数行表示。「もっと見る」ボタンで全文展開。

「こんな人におすすめ」: 同様に展開可能。

Transaction Flow & Safety (取引の流れと安心設計):

ステップ表示: ①DM送る -> ②確認 -> ③支払い/引渡し。

安心チェックリスト:

[○] (青い丸アイコン): 取引実績多数、初めての方にも...

[×] (赤いバツアイコン): 二重譲渡は行いません...

FAQ Section:

アコーディオン形式。「支払い方法は？」「BANの心配は？」等。

Share Buttons:

「Xでシェア」「LINEでシェア」「URLコピー」の3ボタン並列。

Bottom Fixed Bar (スマホ版):

画面下部に常に固定 (z-index: 50)。

左側: 価格表示。

右側: 大きな青いボタン「DMで相談」（または「購入希望のDMを送る」）。

src/app/assessment/page.tsx (査定)
Logic: 計算ロジックは actions/assessment.ts に定義。入力変更のたびにリアルタイム再計算。

src/app/admin/config/page.tsx (管理者設定)
Site Lock Config:

閲覧パスワード設定: 詳細ページ閲覧用の共通パスワードを設定・変更する機能。

トグル: 「詳細ページ閲覧にパスワード/ログインを必須にする」ON/OFFスイッチ。

5. データベース詳細設計 (Supabase Schema)
Supabase (PostgreSQL) を使用。JSON型に頼りすぎず、検索・ソートが必要な項目はカラムとして独立させる。

app_users Table
メールアドレス不要の独自認証システム用テーブル。

id (UUID, PK): ユーザー識別子

username (Text, Unique): ログインID (6文字以上)

password_hash (Text): ハッシュ化されたパスワード

role (Text): 'admin' または 'user'

created_at (Timestamp)

products Table
商品在庫情報。imagesやtagsは配列型を使用し、スペックは数値型で管理して「ランク順」などのソートに対応する。

id (UUID, PK)

title (Text): 商品名

price (Int): 販売価格

status (Enum): 'draft'(下書き), 'on_sale'(販売中), 'sold_out'(売約済)

rank (Int): ランク

luck_max (Int): 運極数

gacha_charas (Int): ガチャ限所持数

badge_power (Int): 紋章力

images (Text Array): 画像URLリスト (storage/bucket_name/path を格納)

tags (Text Array): 検索用タグ (例: ['高ランク', 'ルシファー所持'])

description_points (Text): アコーディオン「ポイント」の中身

description_recommend (Text): アコーディオン「おすすめ」の中身

assessment_rules Table
買取査定の計算ロジックマスタ。ここを変えれば再デプロイなしで査定額を調整可能。

category (Enum): 'rank', 'luck', 'character_bonus'

threshold_min (Int): 閾値 (例: 1000以上)

bonus_amount (Int): 加算額

character_name (Text): ボーナス対象キャラ名

is_active (Boolean): 有効/無効

app_config Table
サイト全体の動的な設定値。

key (Text, PK):

'view_password': 詳細ページ閲覧用の共通パスワード

'require_auth_for_detail': 詳細閲覧に認証を強制するか ('true'/'false')

value (Text): 設定値の実体

6. ユーザーフロー (Logic Flow)
コード スニペット

graph TD
    User[ユーザー] --> Top[在庫一覧ページ]
    Top --> Click[商品をクリック]
    Click --> Check{閲覧制限ON?}
    
    Check -- OFF --> Detail[商品詳細ページ]
    Check -- ON --> Gate[パスワード/ログイン入力画面]
    
    Gate --> Input{入力判定}
    Input -- 正解/認証OK --> Detail
    Input -- 不正解 --> Error[エラー表示]
    
    Detail --> Action[DMで相談/購入ボタン]
    Action --> External[X または LINEへ遷移]

    %% 買取フロー
    User --> Assess[買取査定ページ]
    Assess --> InputData[ランク/運極数など入力]
    InputData --> Calc(自動計算ロジック)
    Calc --> Result[概算金額表示]
7. 開発フロー (Development Steps)
Environment: プロジェクト作成、Supabase連携、テーブル作成。

UI Construction: src/components でパーツ作成（デザイン再現優先）。

Logic Integration: src/actions にDB操作・認証ロジックを実装。

Wiring: UIとロジックを接続し、動的なサイトにする。

## 8. データベース変更フロー (DB Workflow)
- **マイグレーション**: `supabase/migrations` ディレクトリで管理。
- **反映**: `npx supabase db push` を使用してリモートDBに反映する。この操作には Access Token が必要。
- **禁止事項**: 手動でSQLエディタからスキーマを変更すると、ローカルのマイグレーション履歴と整合性が取れなくなるため避ける。常にコード (Migration File) を正とする。