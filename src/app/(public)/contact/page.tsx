import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-100 py-8 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">お問い合わせ</h1>
                <p className="text-slate-600 text-sm">
                    購入や買取に関するご相談はこちらから
                </p>
            </div>

            <main className="container mx-auto max-w-lg px-4 py-8 space-y-6">

                {/* Primary Contact: DM */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">

                    <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-2">出品者情報</h2>

                    <p className="text-sm text-slate-600 leading-relaxed">
                        購入/買取などのご質問、ご相談は<br />
                        <span className="font-bold text-slate-800">DM (ダイレクトメッセージ)</span> までご連絡ください。
                    </p>

                    <div className="pt-2">
                        <a
                            href="https://twitter.com/direct_messages/create/AJAJDNW"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="w-full bg-black hover:bg-slate-800 text-white font-bold h-12 rounded-full">
                                XでDMを送る
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Secondary Contact: Email Fallback */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">

                    <p className="text-sm text-slate-600 leading-relaxed text-left">
                        24時間経ってもお返事が返ってこない等ありましたら<br />
                        「<span className="font-bold select-all">amemiyarmt@gmail.com</span>」<br />
                        に連絡お願いします。
                    </p>


                </div>

            </main>
        </div>
    );
}
