import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { logout } from '@/actions/auth';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="w-full px-4 md:px-8 h-14 md:h-16 flex items-center justify-between relative">
                {/* Left: Logo */}
                <div className="flex items-center z-10 shrink-0">
                    <Link href="/" className="flex items-center">
                        <div className="relative w-8 h-8 md:w-10 md:h-10">
                            <Image src="/logo.png" alt="SNS STORE" fill className="object-contain" />
                        </div>
                    </Link>
                </div>

                {/* Mobile Navigation (Inline Scrollable) */}
                <nav className="flex md:hidden flex-1 items-center gap-4 overflow-x-auto scrollbar-hide ml-6 mr-2 text-xs font-bold text-slate-600 whitespace-nowrap">
                    <Link href="/" className="hover:text-primary transition-colors py-2 shrink-0">
                        在庫一覧
                    </Link>
                    <Link href="/assessment" className="hover:text-primary transition-colors py-2 shrink-0">
                        買取査定
                    </Link>
                    <Link href="/contact" className="hover:text-primary transition-colors py-2 shrink-0">
                        お問い合わせ
                    </Link>
                    <Link href="/terms" className="hover:text-primary transition-colors py-2 shrink-0">
                        利用規約
                    </Link>
                </nav>

                {/* Center: Navigation (Desktop) */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="hover:text-primary transition-colors">
                        在庫一覧
                    </Link>
                    <Link href="/assessment" className="hover:text-primary transition-colors">
                        買取査定
                    </Link>
                    <Link href="/contact" className="hover:text-primary transition-colors">
                        お問い合わせ
                    </Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        利用規約
                    </Link>
                </nav>

                {/* Right: Actions (Desktop & Mobile Login/User status) */}
                <div className="flex items-center gap-3 z-10">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-2 mr-2 text-sm font-bold text-slate-700">
                                <User className="w-4 h-4" />
                                <span>{user.user_metadata?.username || 'ユーザー'}</span>
                            </div>
                            <form action={logout}>
                                <Button variant="ghost" className="text-slate-600 font-bold hover:text-red-600 hover:bg-red-50 text-xs md:text-sm px-2 md:px-4">
                                    <LogOut className="w-4 h-4 md:mr-1" />
                                    <span className="hidden md:inline">ログアウト</span>
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-600 font-bold hover:text-primary hover:bg-blue-50 text-xs md:text-sm px-2 md:px-4">
                                    ログイン
                                </Button>
                            </Link>
                            <Link href="/register" className="hidden md:block">
                                <Button className="bg-[#007bff] hover:bg-[#0069d9] text-white font-bold shadow-sm">
                                    新規会員登録
                                </Button>
                            </Link>
                            <Link href="/register" className="md:hidden">
                                <Button size="sm" className="bg-[#007bff] hover:bg-[#0069d9] text-white font-bold shadow-sm text-xs px-3">
                                    会員登録
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>


        </header>
    );
}
