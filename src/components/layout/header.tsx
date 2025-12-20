import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { NotificationCenter } from '@/components/features/notifications/notification-center';
import { MobileMenu } from '@/components/layout/mobile-menu';

import { createClient } from '@/lib/supabase/server';
import { logout } from '@/actions/auth';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let username = 'ユーザー';
    if (user) {
        // @ts-ignore
        const { data: appData } = await supabase
            .from('app_users')
            .select('username')
            .eq('id', user.id)
            .single();
        const appUser = appData as any;
        username = appUser?.username || user.email?.split('@')[0] || 'ユーザー';
    }

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


                {/* Center: Navigation (Desktop) */}
                {/* Center: Navigation (Desktop) */}
                <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-bold text-slate-600 mx-4">
                    <Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">
                        在庫一覧
                    </Link>
                    <Link href="/assessment" className="hover:text-primary transition-colors whitespace-nowrap">
                        買取査定
                    </Link>
                    <Link href="/reviews" className="hover:text-primary transition-colors whitespace-nowrap">
                        レビュー
                    </Link>
                    <Link href="/contact" className="hover:text-primary transition-colors whitespace-nowrap">
                        お問い合わせ
                    </Link>
                    <Link href="/terms" className="hover:text-primary transition-colors whitespace-nowrap">
                        利用規約
                    </Link>
                    {user && (
                        <Link href="/mypage" className="hover:text-primary transition-colors whitespace-nowrap">
                            マイページ
                        </Link>
                    )}
                </nav>

                {/* Right: Actions (Desktop & Mobile Login/User status) */}
                <div className="flex items-center gap-3 z-10">
                    <div className="mr-2">
                        <NotificationCenter />
                    </div>
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-2 mr-2 text-sm font-bold text-slate-700">
                                <User className="w-4 h-4 ml-2" />
                                <span>{username}</span>
                            </div>
                            <form action={logout} className="hidden md:block">
                                <Button variant="ghost" className="text-slate-600 font-bold hover:text-red-600 hover:bg-red-50 text-xs md:text-sm px-2 md:px-4">
                                    <LogOut className="w-4 h-4 md:mr-1" />
                                    <span className="hidden md:inline">ログアウト</span>
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-600 font-bold hover:text-primary hover:bg-blue-50 text-xs md:text-sm px-2 md:px-4">
                                    ログイン
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-[#007bff] hover:bg-[#0069d9] text-white font-bold shadow-sm">
                                    新規会員登録
                                </Button>
                            </Link>
                        </div>
                    )}
                    <MobileMenu user={user} username={username} />
                </div>
            </div>


        </header>
    );
}
