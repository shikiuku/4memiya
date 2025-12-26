import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountForm } from '@/components/features/account/account-form';
import { getLikedProducts } from '@/actions/like';
import { ProductListContainer } from '@/components/features/product-list-container';
import { Separator } from '@/components/ui/separator';

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: appData } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', user.id)
        .single();

    const appUser = appData as any;
    const currentUsername = appUser?.username || '';
    const currentDisplayName = appUser?.display_name || '';

    // Fetch liked products
    const likedProducts = await getLikedProducts();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
            <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">マイページ</h1>

            <section>
                <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                    <span className="text-red-500">❤</span> いいねした商品
                </h2>
                {likedProducts.length > 0 ? (
                    <ProductListContainer products={likedProducts} />
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                        まだ「いいね」した商品はありません。
                    </div>
                )}
            </section>

            <Separator />

            <section>
                <h2 className="text-xl font-bold mb-6 text-slate-800">アカウント設定</h2>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <AccountForm
                        currentUsername={currentUsername}
                        currentDisplayName={currentDisplayName}
                    />
                </div>
            </section>
        </div>
    );
}
