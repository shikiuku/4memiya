import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Package, Settings, LayoutDashboard, Plus, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';
import { AdminMobileMenu } from './admin-mobile-menu';

import { createClient } from '@/lib/supabase/server';

export async function AdminHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let username = '管理者';
    if (user) {
        // @ts-ignore
        const { data: appUserData } = await supabase
            .from('app_users')
            .select('username')
            .eq('id', user.id)
            .single();
        const appUser = appUserData as any;
        username = appUser?.username || user.email?.split('@')[0] || '管理者';
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left: Logo & Title */}
                <div className="flex items-center gap-4">
                    <Link href="/dev" className="flex items-center gap-2">
                        <div className="relative w-8 h-8 bg-white rounded-full p-1">
                            {/* Reusing logo but making it fit in dark header */}
                            <Image src="/logo.png" alt="SNS STORE" fill className="object-contain p-1" />
                        </div>
                        <span className="font-bold text-lg tracking-tight whitespace-nowrap md:hidden xl:inline">管理者画面</span>
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-bold mx-4">
                    <Link href="/dev/products" className="flex items-center gap-2 hover:text-blue-300 transition-colors whitespace-nowrap">
                        <Package className="w-4 h-4 ml-1" />
                        在庫管理
                    </Link>
                    <Link href="/dev/assessment" className="flex items-center gap-2 hover:text-blue-300 transition-colors whitespace-nowrap">
                        <FileText className="w-4 h-4" />
                        買取査定
                    </Link>
                    <Link href="/dev/reviews" className="flex items-center gap-2 hover:text-blue-300 transition-colors whitespace-nowrap">
                        <MessageSquare className="w-4 h-4" />
                        レビュー
                    </Link>
                    <Link href="/dev/terms" className="flex items-center gap-2 hover:text-blue-300 transition-colors whitespace-nowrap">
                        <FileText className="w-4 h-4" />
                        利用規約
                    </Link>
                    <Link href="/dev/account" className="flex items-center gap-2 hover:text-blue-300 transition-colors whitespace-nowrap">
                        <Settings className="w-4 h-4" />
                        設定
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/dev/products/new">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-1" />
                                新規在庫追加
                            </Button>
                        </Link>

                        <span className="text-xs text-slate-400 hidden xl:inline-block whitespace-nowrap">
                            {username} としてログイン中
                        </span>
                        <form action={logout}>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800 hover:text-red-300 whitespace-nowrap">
                                <LogOut className="w-4 h-4 mr-2" />
                                ログアウト
                            </Button>
                        </form>
                    </div>

                    {/* Mobile Menu */}
                    <AdminMobileMenu user={user} username={username} />
                </div>
            </div>
        </header>
    );
}
