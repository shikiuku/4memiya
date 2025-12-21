import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
import { getProductById } from '@/actions/product';
import { checkIsLiked, getLikeCount } from '@/actions/like';
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

import { LikeButton } from '@/components/features/products/like-button';
import { getRandomProducts } from '@/actions/product';
import { ProductCard } from '@/components/features/product-card';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    // SSR Like Data
    const [isLiked, likeCount] = await Promise.all([
        checkIsLiked(product.id),
        getLikeCount(product.id)
    ]);

    // Map DB fields to specs array
    const specs = [
        { label: 'ランク', value: product.rank },
        { label: '運極数', value: product.luck_max },
        { label: 'ガチャ限定キャラ', value: product.gacha_charas },
        { label: '平均紋章力', value: product.badge_power.toLocaleString() },
    ];

    return (
        <div className="min-h-screen bg-white pb-32">
            <ProductHeader productId={product.id} seqId={product.seq_id} />

            <main className="mx-auto max-w-lg">
                {/* 1. Image Gallery */}
                <ImageGallery images={product.images || []} movies={product.movies} />

                <div className="px-4 py-4 space-y-8">
                    {/* 2. Title & Price Area */}
                    <div>
                        <div className="text-sm text-slate-500 mb-2">在庫番号: No.{product.seq_id}</div>
                        <h1 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                            <span className="mr-2">【No.{product.seq_id}】</span>
                            {product.title}
                        </h1>

                        <div className="flex gap-2 mb-4">
                            {product.tags?.map(tag => (
                                <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-bold text-[#e60012]">¥{product.price.toLocaleString()}</span>
                                <span className="text-sm text-slate-600 mb-1">円(税込)</span>
                            </div>
                            <LikeButton
                                productId={product.id}
                                initialIsLiked={isLiked}
                                initialLikeCount={likeCount}
                            />
                        </div>

                        {/* Large CTA Button (Screenshot Style) */}
                        <a href="https://twitter.com/direct_messages/create/AJAJDNW" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full bg-[#007bff] hover:bg-[#0069d9] font-bold h-12 text-base rounded-md">
                                DMで相談
                            </Button>
                        </a>
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
                        <SpecList specs={specs} />
                    </section>

                    {/* 5. Points & Recommendation */}
                    {product.description_points && (
                        <section className="border-t border-dashed pt-6">
                            <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                                このアカウントのポイント
                            </h3>
                            <ReadMoreSection text={product.description_points} />
                        </section>
                    )}

                    {product.description_recommend && (
                        <section className="border-t border-dashed pt-6">
                            <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-4">
                                こんな人におすすめ
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {product.description_recommend}
                            </p>
                        </section>
                    )}

                    {/* 6. Transaction Details */}
                    <section className="bg-slate-50 -mx-4 px-4 py-8 mt-8 border-t border-slate-100">
                        <h3 className="font-bold text-base border-l-4 border-[#007bff] pl-3 mb-6">
                            安心して取引するために
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
                        <a href="https://twitter.com/direct_messages/create/AJAJDNW" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full bg-[#007bff] hover:bg-[#0069d9] font-bold h-14 text-lg rounded-md shadow-md">
                                購入希望のDMを送る
                            </Button>
                        </a>
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
                        <div className="space-y-0">
                            {(await getRandomProducts(3, product.id)).map((otherProduct) => (
                                <ProductCard
                                    key={otherProduct.id}
                                    product={otherProduct}
                                    viewMode="list"
                                    compactStats={true}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <StickyFooter
                price={product.price}
            />
        </div>
    );
}
