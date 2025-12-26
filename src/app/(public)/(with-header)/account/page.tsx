import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountForm } from '@/components/features/account/account-form';

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const currentUsername = user.user_metadata?.username || '';
    const currentDisplayName = user.user_metadata?.displayName || user.user_metadata?.username || '';

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">アカウント設定</h1>
            <p className="text-slate-500 mb-8 text-center">ログイン情報や表示名を変更できます。</p>

            <AccountForm
                currentUsername={currentUsername}
                currentDisplayName={currentDisplayName}
            />
        </div>
    );
}
