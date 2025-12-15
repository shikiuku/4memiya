import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/features/product-card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminProductListPage() {
    const supabase = await createClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return <div className="p-8 text-red-500">エラーが発生しました: {error.message}</div>;
    }

    // Server Action for Deletion
    async function deleteProduct(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        if (!id) return;

        const supabase = await createClient();
        await supabase.from('products').delete().eq('id', id);
        revalidatePath('/dev/products');
        revalidatePath('/products');
        revalidatePath('/');
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-32">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">在庫一覧</h1>
                    <p className="text-sm text-slate-500">登録されている在庫アカウントの管理を行います。</p>
                </div>
                <Link href="/dev/products/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 shadow-lg transform hover:scale-105 transition-all">
                        <Plus className="w-5 h-5 mr-2" />
                        新規在庫追加
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products?.map((product) => (
                    <div key={product.id} className="relative group">
                        {/* Reuse the public ProductCard */}
                        <ProductCard product={product} />

                        {/* Admin Overlay Actions */}
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg backdrop-blur-[1px]">
                            <Link href={`/dev/products/${product.id}/edit`}>
                                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-bold border-0">
                                    <Edit className="w-4 h-4 mr-1" />
                                    編集
                                </Button>
                            </Link>

                            <form action={deleteProduct}>
                                <input type="hidden" name="id" value={product.id} />
                                <Button
                                    size="sm"
                                    className="bg-red-600 text-white hover:bg-red-700 font-bold border-0"
                                    type="submit"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    削除
                                </Button>
                            </form>
                        </div>

                        {/* Status Badge (if needed) */}
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                            No.{product.seq_id}
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
