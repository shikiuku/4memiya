# 実装ステップ (Implementation Steps)

プロジェクトの進捗管理用ドキュメントです。

## 開発ロードマップ

- [x] **STEP 01: 環境構築**
  - [x] Next.js プロジェクト作成 (TypeScript, Tailwind CSS, App Router)
  - [x] ディレクトリ構造の整備 (`src/features`, `src/components` 等)
  - [x] 必要なライブラリのインストール (`lucide-react`, `clsx`, `supabase-js` 等)
  - [x] GitHub リポジトリの初期化

- [ ] **STEP 02: データベース準備** (後回し)
  - [ ] Supabase プロジェクト作成
  - [ ] テーブル定義 (`App Users`, `Products`, `Assessment Rules`, `App Config`)
  - [ ] 初期データ投入 (Seed Data)
  - [ ] 型定義ファイルの生成 (`types/database.ts`)

- [x] **STEP 03: デザイン再現 - 共通・一覧 (Top Page)**
  - [x] グローバルスタイル (`globals.css` - カラー・フォント設定)
  - [x] 共通レイアウト (Header, Footer, Layout)
  - [x] トップページ実装 (在庫一覧・検索UI)
  - [x] 商品カードコンポーネント (Grid/List 表示切り替え)

- [x] **STEP 04: デザイン再現 - 商品詳細 (Detail Page)**
  - [x] ページレイアウト (`app/products/[id]/page.tsx`)
  - [x] 画像スライダー (`ImageSlider`)
  - [x] 商品スペック表 (Grid Layout)
  - [x] アコーディオンメニュー (商品詳細・レビュー)
  - [x] 購入フロー・CTAボタン

- [x] **STEP 05: 買取査定フォーム**
  - [x] フォームUI (リアルタイム査定実装済)

- [ ] **STEP 06: インフラ・デプロイ**
  - [ ] Vercel デプロイ設定
  - [ ] 環境変数設定
  - [ ] 動作確認・修正

## 技術スタック
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Database: Supabase
- Icons: Lucide React