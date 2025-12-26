import { getSiteSetting } from '@/actions/admin/settings';

export default async function TermsPage() {
    const termsContent = await getSiteSetting('terms_content');

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-100 py-8 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">利用規約</h1>
                <p className="text-slate-600 text-sm">
                    ご利用にあたって
                </p>
            </div>

            <main className="container mx-auto max-w-3xl px-4 py-8">
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {termsContent || '利用規約は現在準備中です。'}
                </div>
            </main>
        </div>
    );
}
