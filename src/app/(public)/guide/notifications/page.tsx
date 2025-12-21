import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationGuidePage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
            <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                トップページに戻る
            </Link>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-white p-6 border-b border-slate-100">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 text-center">
                        iPhoneでの通知設定について
                    </h1>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    <p className="text-slate-600 leading-relaxed">
                        iPhone（iOS）でブラウザ通知を受け取るには、Webサイトを一度<strong>「ホーム画面に追加」</strong>していただく必要があります。<br />
                        お手数ですが、以下の手順で設定をお願いいたします。
                    </p>

                    <div className="rounded-lg p-6 border border-slate-200">
                        <h2 className="font-bold text-slate-900 text-lg mb-4 border-l-4 border-slate-900 pl-3">
                            ホーム画面への追加手順
                        </h2>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm">
                                    1
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">Safariで開く</p>
                                    <p className="text-sm text-slate-600">
                                        現在このページをSafariブラウザで開いていることを確認してください。<br />
                                        <span className="text-xs text-slate-400">※ChromeやLINE等のアプリ内ブラウザでは設定できません。</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm">
                                    2
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">共有ボタンをタップ</p>
                                    <p className="text-sm text-slate-600 flex items-center flex-wrap gap-1">
                                        画面下部（または上部）にある「共有」アイコン
                                        <span className="inline-flex items-center justify-center p-1 rounded">
                                            <Image src="/share-icon.png" width={20} height={20} alt="共有" className="w-5 h-5" />
                                        </span>
                                        をタップします。
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm">
                                    3
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">ホーム画面に追加</p>
                                    <p className="text-sm text-slate-600">
                                        メニューが表示されるので、下にスクロールして「ホーム画面に追加」を探してタップします。
                                    </p>
                                    <div className="mt-2 bg-slate-50 p-3 rounded text-center text-slate-500 text-xs border border-slate-100">
                                        [＋] ホーム画面に追加
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-none w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm">
                                    4
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">完了</p>
                                    <p className="text-sm text-slate-600">
                                        右上の「追加」ボタンをタップすると、ホーム画面にアプリアイコンが追加されます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg text-center">
                        <p className="font-bold text-slate-900 mb-2">設定が終わったら...</p>
                        <p className="text-sm text-slate-600 mb-4">
                            ホーム画面に追加されたアイコンをタップして起動し、再度トップページの「通知設定」ボタンを押してください。
                        </p>
                        <Link href="/">
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full px-8">
                                トップページへ戻る
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
