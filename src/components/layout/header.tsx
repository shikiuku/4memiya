import Image from 'next/image';
import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { createClient } from '@/lib/supabase/server';
import { logout } from '@/actions/auth';
import { LogOut, User } from 'lucide-react';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
                {/* Left: Logo & Menu */}
                <div className="flex items-center gap-4 z-10">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                    <Link href="/" className="flex items-center">
                        <div className="relative w-8 h-8 md:w-10 md:h-10">
                            <Image src="/logo.png" alt="SNS STORE" fill className="object-contain" />
                        </div>
                    </Link>
                </div>

                {/* Center: Navigation (Desktop) - Absolutely positioned to ensure true center */}
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

                {/* Right: Actions */}
                <div className="flex items-center gap-2 z-10">
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 mr-2 text-sm font-bold text-slate-700">
                                    <User className="w-4 h-4" />
                                    <span>{user.user_metadata?.username || 'ユーザー'}</span>
                                </div>
                                <form action={logout}>
                                    <Button variant="ghost" className="text-slate-600 font-bold hover:text-red-600 hover:bg-red-50">
                                        <LogOut className="w-4 h-4 mr-1" />
                                        ログアウト
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-600 font-bold hover:text-primary hover:bg-blue-50">
                                        ログイン
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-[#007bff] hover:bg-[#0069d9] text-white font-bold shadow-sm">
                                        新規会員登録
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                    {/* Mobile Menu Button - Moved here or kept on left? The design had menu on left. Let's keep duplicate search/cart out for now or keep cart. */}
                    <Button variant="ghost" size="icon" className="relative md:hidden">
                        {/* Mobile only actions? Or just keep it clean */}
                        <ShoppingBag className="w-5 h-5 text-slate-600" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
