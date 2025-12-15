import { Button } from '@/components/ui/button';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-100 py-8 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">お問い合わせ</h1>
                <p className="text-slate-600 text-sm">
                    ご質問やご相談は、下記メールアドレスまでお願いいたします。
                </p>
            </div>

            <main className="container mx-auto max-w-lg px-4 py-12">
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-6 shadow-sm">

                    <div>
                        <p className="text-sm text-slate-500 mb-2">お問い合わせメールアドレス</p>
                        <a href="mailto:amemiyarmt@gmail.com" className="text-xl md:text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors break-all">
                            メール@gmail.com
                        </a>
                    </div>

                    <div className="pt-4 text-xs text-slate-400 leading-relaxed">
                        ※ 通常24時間以内にご返信いたします。<br />
                        ※ 買取査定に関するお問い合わせは「買取査定」ページからも可能です。
                    </div>
                </div>
            </main>
        </div>
    );
}
