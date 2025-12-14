'use client';

import { useParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { ProductHeader } from '@/components/features/products/product-header';
import { StickyFooter } from '@/components/features/products/sticky-footer';
import { ImageGallery } from '@/components/features/products/image-gallery';
import { SellerInfo } from '@/components/features/products/seller-info';
import { SpecList } from '@/components/features/products/spec-list';
import { SafetyChecklist } from '@/components/features/products/safety-checklist';
import { TransactionFlow } from '@/components/features/products/transaction-flow';
import { FAQAccordion } from '@/components/features/products/faq-accordion';
import { ReadMoreSection } from '@/components/features/products/read-more-section';
import { Button } from '@/components/ui/button';

// High Fidelity Dummy Data matching Screenshot No.343
const PRODUCT_DATA = {
    id: '343',
    title: '高ランクで扱いやすい強力な基盤を備えた実戦型アカウント',
    price: 16000,
    tags: ['高ランク', '強垢'],
    images: [
        '/sample_product.jpg', // Main screenshot
        '/sample_product.jpg', // Duplicate for gallery demo
    ],
    specs: [
        { label: 'ランク', value: 940 },
        { label: '運極数', value: 362 },
        { label: 'ガチャ限定キャラ', value: 934 },
        { label: '平均紋章力', value: '8,000' },
    ]
};

export default function ProductDetailPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    return (
        <div className="min-h-screen bg-white pb-32">
            <ProductHeader productId={id || PRODUCT_DATA.id} />

            <main className="mx-auto max-w-lg">
                {/* 1. Image Gallery */}
                <ImageGallery images={PRODUCT_DATA.images} />

                <div className="px-4 py-4 space-y-8">
                    {/* 2. Title & Price Area */}
                    <div>
                        <div className="text-sm text-slate-500 mb-2">在庫番号: No.{PRODUCT_DATA.id}</div>
                        <h1 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                            {PRODUCT_DATA.title}
                        </h1>

                        <div className="flex gap-2 mb-4">
                            {PRODUCT_DATA.tags.map(tag => (
                                <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-bold text-[#e60012]">¥{PRODUCT_DATA.price.toLocaleString()}</span>
                                <span className="text-sm text-slate-600 mb-1">円(税込)</span>
                            </div>
                            <Button variant="outline" size="sm" className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 border-0">
                                <Heart className="w-5 h-5 mr-1" />
                                <span className="text-xs">いいね</span>
                            </Button>
                        </div>

                        {/* Large CTA Button (Screenshot Style) */}
                        <Button className="w-full bg-[#007bff] hover:bg-[#0069d9] font-bold h-12 text-base rounded-md">
                            DMで相談
                        </Button>
                    </div>

                    {/* 3. Seller Info */}
                    <section className="border-t border-dashed pt-6">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                            出品者情報
                        </h3>
                        <SellerInfo />
                    </section>

                    {/* 4. Account Info (Specs) */}
                    <section className="border-t border-dashed pt-6">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                            このアカウントの情報
                        </h3>
                        <SpecList specs={PRODUCT_DATA.specs} />
                    </section>

                    {/* 5. Points & Recommendation */}
                    <section className="border-t border-dashed pt-6">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                            このアカウントのポイント
                        </h3>
                        <ReadMoreSection
                            text={`ランク940と育成が進んでおり、日常の周回からイベントコンテンツまで快適に遊べる環境が整っています。ガチャ限934体と手持ちが豊富なため、幅広いクエストで適正不足に悩みにくい構成です。運極数362体は必要な周回基盤として十分に機能し、書庫や常設などもスムーズに進行できます。平均紋章力8000も確保されているため、高難易度に挑む際の強化も行いやすく、育成の余地も残されています。全体としてバランスが良く、すぐに活用できる扱いやすい強垢です。`}
                        />
                    </section>

                    <section className="border-t border-dashed pt-6">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                            こんな人におすすめ
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            高ランクの快適さを求める人や、豊富な手持ちで幅広いクエストに挑みたい人に向いています。
                            復帰勢で無理なく環境へ追いつきたい人や、強すぎず扱いやすい基盤でモンストを楽しみたい人にも適しています。
                        </p>
                    </section>

                    {/* 6. Transaction Details */}
                    <section className="bg-slate-50 -mx-4 px-4 py-8 mt-8 border-t border-slate-100">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-6">
                            取引中のやりとりについて
                        </h3>
                        <SafetyChecklist />
                    </section>

                    <section className="pt-2">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-6">
                            取引の流れ
                        </h3>
                        <TransactionFlow />
                    </section>

                    {/* CTA 2 */}
                    <section className="pt-6 pb-2">
                        <Button className="w-full bg-[#007bff] hover:bg-[#0069d9] font-bold h-14 text-lg rounded-md shadow-md">
                            購入希望のDMを送る
                        </Button>
                    </section>

                    {/* 7. FAQ */}
                    <section className="border-t border-dashed pt-6">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                            よくある質問
                        </h3>
                        <FAQAccordion />
                    </section>

                    {/* 8. Other Products */}
                    <section className="border-t border-dashed pt-6">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                            その他商品
                        </h3>
                        {/* Simplified list for now */}
                        <div className="space-y-4">
                            {/* Placeholder for other products grid/list */}
                        </div>
                    </section>
                </div>
            </main>

            <StickyFooter
                price={PRODUCT_DATA.price}
                onConsult={() => console.log('Consult')}
            />
        </div>
    );
}
