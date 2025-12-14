import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-white font-bold text-lg mb-4">SNS STORE</h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                        国内最大級のゲームアカウント売買プラットフォーム。<br />
                        安心・安全な取引をサポートします。
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">サービス</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/products" className="hover:text-white">在庫一覧</Link></li>
                        <li><Link href="/assessment" className="hover:text-white">買取査定</Link></li>
                        <li><Link href="/guide" className="hover:text-white">ご利用ガイド</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">サポート</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/faq" className="hover:text-white">よくある質問</Link></li>
                        <li><Link href="/contact" className="hover:text-white">お問い合わせ</Link></li>
                        <li><Link href="/terms" className="hover:text-white">利用規約</Link></li>
                        <li><Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4">公式SNS</h4>
                    <div className="flex gap-4">
                        {/* Placeholder for social icons */}
                        <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} SNS STORE. All rights reserved.
            </div>
        </footer>
    );
}
