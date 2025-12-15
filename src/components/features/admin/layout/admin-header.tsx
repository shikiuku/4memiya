import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Package, Settings, LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';

export function AdminHeader() {
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
                        <span className="font-bold text-lg tracking-tight">管理者画面</span>
                    </Link>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/dev" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        ダッシュボード
                    </Link>
                    <Link href="/dev/products" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <Package className="w-4 h-4" />
                        在庫管理
                    </Link>
                    <Link href="/dev/settings" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <Settings className="w-4 h-4" />
                        サイト設定
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/dev/products/new">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            <Plus className="w-4 h-4 mr-1" />
                            新規在庫追加
                        </Button>
                    </Link>
                    <span className="text-xs text-slate-400 hidden sm:inline-block">管理者としてログイン中</span>
                    <form action={logout}>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800 hover:text-red-300">
                            <LogOut className="w-4 h-4 mr-2" />
                            ログアウト
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    );
}
