
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dummyProducts = [
    {
        title: '【No.401】ルシファー運極＆ガチャ限500体以上！高難易度即戦力アカウント',
        price: 25000,
        status: 'on_sale',
        rank: 800,
        luck_max: 150,
        gacha_charas: 550,
        badge_power: 12000,
        images: ['https://placehold.jp/3d4070/ffffff/500x500.png?text=MonstRef1', 'https://placehold.jp/3d4070/ffffff/500x500.png?text=List'],
        tags: ['高ランク', 'ルシファー運極', 'ガチャ限多数', '轟絶運極'],
        description_points: 'ルシファー、ヤクモなど環境トップキャラの運極が多数揃っています。天魔の孤城もソロ攻略可能です。魂の紋章も全属性これ以上ないくらい育っています。',
        description_recommend: '高難易度クエストをすぐに楽しみたい方、サブ垢としても超強力なアカウントをお探しの方におすすめです。'
    },
    {
        title: '【No.402】引退品 ガチャ限1000オーバー 運極300体 紋章力平均15000',
        price: 55000,
        status: 'on_sale',
        rank: 1500,
        luck_max: 300,
        gacha_charas: 1020,
        badge_power: 15000,
        images: ['https://placehold.jp/8e3d40/ffffff/500x500.png?text=MonstRef2', 'https://placehold.jp/8e3d40/ffffff/500x500.png?text=Detail'],
        tags: ['廃課金', '引退品', '運極多数', 'ガチャ限1000+'],
        description_points: '総課金額300万以上。リリース初期からのプレイアカウントです。コラボキャラの運極も多数（鬼滅、呪術、ワンピース等）。この価格でこの内容は破格です。',
        description_recommend: 'コレクションとしても価値のあるアカウントや、最強の状態で始めたい方に。'
    },
    {
        title: '【No.403】ネオ・ソロモン艦隊作成可能！初心者おすすめスターターセット',
        price: 8500,
        status: 'on_sale',
        rank: 350,
        luck_max: 20,
        gacha_charas: 150,
        badge_power: 3000,
        images: ['https://placehold.jp/3d8e40/ffffff/500x500.png?text=MonstRef3'],
        tags: ['初心者おすすめ', 'ネオ所持', 'ソロモン所持', 'コスパ最強'],
        description_points: 'ネオ3体、ソロモン4体所持で艦隊が組めます。ノマクエ等はまだ残っているためオーブ回収も大量に可能です。',
        description_recommend: 'これからモンストを始めたい方、強いキャラでサクサク進めたい方にピッタリです。'
    },
    {
        title: '【No.404】天魔完全対応＆禁忌EX所持 ランク1000↑ ガチ勢向け',
        price: 38000,
        status: 'on_sale',
        rank: 1100,
        luck_max: 450,
        gacha_charas: 600,
        badge_power: 18000,
        images: ['https://placehold.jp/703d8e/ffffff/500x500.png?text=MonstRef4'],
        tags: ['高ランク', '天魔適正', '禁忌EX', '運極多数'],
        description_points: 'アーキレット、刹那、那由他などのEXキャラ運極済み。わくわくの実も厳選済み（特L多数）。',
        description_recommend: '最高難易度コンテンツを極めたい玄人の方へ。'
    },
    {
        title: '【No.405】コラボキャラコンプ多数！リゼロ・SAO・ジョジョ好きに捧ぐ',
        price: 18000,
        status: 'on_sale',
        rank: 600,
        luck_max: 80,
        gacha_charas: 300,
        badge_power: 6000,
        images: ['https://placehold.jp/8e703d/ffffff/500x500.png?text=MonstRef5'],
        tags: ['コラボ充実', 'キャラ愛', '中級者向け'],
        description_points: 'リゼロ第1弾・第2弾コンプ、SAO全キャラ所持。ジョジョなどの人気コラボキャラに特化したアカウントです。',
        description_recommend: '特定のタイトルのファンで、コラボキャラを使いたい方におすすめ。'
    },
    {
        title: '【No.406】オーブ2000個所持！年末年始ガチャ用初期垢',
        price: 5000,
        status: 'on_sale',
        rank: 50,
        luck_max: 5,
        gacha_charas: 10,
        badge_power: 500,
        images: ['https://placehold.jp/3d8e8e/ffffff/500x500.png?text=MonstRef6'],
        tags: ['オーブ大量', '初期垢', 'リセマラ不要'],
        description_points: 'ログインボーナスと絆貯めのみで増やしたオーブ2000個（10万円相当）を所持。顔合わせも未使用です。',
        description_recommend: '自分でガチャを引いて最強を目指したい方に。'
    },
    {
        title: '【No.407】マサムネ・マギア運極！最新環境トップ垢',
        price: 72000,
        status: 'on_sale',
        rank: 900,
        luck_max: 210,
        gacha_charas: 480,
        badge_power: 9500,
        images: ['https://placehold.jp/8e3d70/ffffff/500x500.png?text=MonstRef7'],
        tags: ['最新環境', 'マサムネ', 'マギア', '超希少'],
        description_points: '最新の超獣神祭限定マサムネとマギアを運極にしています。これさえあれば当分困ることはありません。',
        description_recommend: '最新キャラで俺TUEEEしたい方専用。'
    },
    {
        title: '【No.408】運極数1000体達成！ボーナス大量＆紋章力極',
        price: 30000,
        status: 'on_sale',
        rank: 850,
        luck_max: 1000,
        gacha_charas: 400,
        badge_power: 20000,
        images: ['https://placehold.jp/555555/ffffff/500x500.png?text=MonstRef8'],
        tags: ['運極1000', '紋章力20000', '運極ボーナス'],
        description_points: '運極達成数ボーナスを全て受け取り済み。SS全開スタート確率Max。運極作成代行業者並みの紋章力を誇ります。',
        description_recommend: '運極作成が面倒な方、最初から最強の恩恵を受けたい方に。'
    }
];

async function seed() {
    console.log(`Starting seed for ${dummyProducts.length} products...`);
    const { data, error } = await supabase.from('products').insert(dummyProducts).select();

    if (error) {
        console.error('Error seeding products:', error);
    } else {
        console.log('Successfully seeded products:', data?.length);
    }
}

seed();
