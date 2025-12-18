import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/features/product-card';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { DeleteButton } from '@/components/features/admin/products/delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminProductListPage() {
    const supabase = await createClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<Product[]>();

    if (error) {
        console.error('Error fetching products:', error);
        return <div className="p-8 text-red-500">エラーが発生しました: {error.message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-32">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">在庫一覧</h1>
                    <p className="text-sm text-slate-500">登録されている在庫アカウントの管理を行います。</p>
                </div>
                <Link href="/dev/products/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md px-4 transition-colors">
                        <Plus className="w-5 h-5 mr-2" />
                        新規在庫追加
                    </Button>
                </Link>
            </div>

            {/* Product List - List View for all devices */}
            <div className="flex flex-col gap-2">
                {products?.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg border border-slate-100 p-2 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                        {/* Product Card Content */}
                        <div className="flex-1 min-w-0">
                            <ProductCard
                                product={product}
                                viewMode="list"
                                customHref={`/dev/products/${product.id}/edit`}
                            />
                        </div>

                        {/* Actions Column */}
                        <div className="flex flex-col gap-2 justify-center shrink-0 w-20 border-l border-slate-50 pl-2">
                            <Link href={`/dev/products/${product.id}/edit`} className="w-full">
                                <Button size="sm" variant="ghost" className="w-full flex-col h-auto py-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                                    <Edit className="w-4 h-4 mb-0.5" />
                                    編集
                                </Button>
                            </Link>
                            <div className="w-full flex justify-center">
                                <DeleteButton
                                    id={product.id}
                                    className="w-full flex-col h-auto py-1 text-xs bg-transparent text-red-500 hover:bg-red-50 hover:text-red-600 border-0"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!products || products.length === 0) && (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-4">まだ在庫が登録されていません。</p>
                    <Link href="/dev/products/new">
                        <Button variant="outline">最初の在庫を追加</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
