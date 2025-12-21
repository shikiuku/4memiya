import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CampaignPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="container mx-auto px-4 py-4">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-800 text-sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    トップページに戻る
                </Link>
            </div>

            {/* Header */}
            <div className="bg-white border-b border-slate-100 py-6 px-4 text-center">
                <h1 className="text-xl font-bold text-slate-900 mb-2">
                    毎月10名様に<br />PayPay 1,000円分プレゼント！
                </h1>
                <p className="text-xs text-slate-500">
                    買取査定シェアキャンペーン開催中
                </p>
            </div>

            <main className="container mx-auto max-w-md px-4 py-8 space-y-8">

                {/* Campaign Overview */}
                <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-2">
                        キャンペーン概要
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        当サイトでモンストアカウントの査定を行い、その結果をX（旧Twitter）でシェアしていただいた方の中から、
                        <span className="font-bold text-yellow-700">毎月抽選で10名様</span>に
                        <span className="font-bold text-yellow-700">PayPay 1,000円分</span>をプレゼントいたします！
                    </p>
                </section>

                {/* How to Apply */}
                <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">
                        応募方法
                    </h2>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">1</div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">査定を行う</h3>
                                <p className="text-sm text-slate-600">
                                    トップページからお手持ちのアカウント情報を入力し、査定金額を確認してください。
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">2</div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">結果をシェア</h3>
                                <p className="text-sm text-slate-600">
                                    査定結果画面にある「Xでシェア」ボタンから投稿してください。
                                    <br />
                                    <span className="text-xs text-slate-400 mt-1 block">
                                        ※自動でハッシュタグ <b>#雨宮査定</b> が付与されます。
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">3</div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">応募完了！</h3>
                                <p className="text-sm text-slate-600">
                                    これだけで応募は完了です。当選連絡をお待ちください。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Schedule & Notes */}
                <section className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2 border-b pb-2">当選発表</h3>
                        <p className="text-sm text-slate-600">
                            <span className="font-bold text-slate-900">毎月末日</span>に抽選および発表を行います。
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-2 border-b pb-2">当選連絡・賞品送付</h3>
                        <p className="text-sm text-slate-600">
                            Xの<span className="font-bold">DM（ダイレクトメッセージ）</span>にてご連絡いたします。
                            賞品はPayPayの送付リンクをお送りします。
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            ※DMを受け取れる設定にしてお待ちください。
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <div className="pt-4">
                    <Link href="/assessment" className="block w-full">
                        <Button className="w-full bg-black hover:bg-slate-800 text-white font-bold h-12 rounded-full">
                            今すぐ査定して応募する
                        </Button>
                    </Link>
                </div>

            </main>
        </div>
    );
}
