'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, UserPlus, Settings, LogOut, Package, FileText, MessageSquare, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth';
import { createPortal } from 'react-dom';

interface AdminMobileMenuProps {
    user?: any;
}

export function AdminMobileMenu({ user }: AdminMobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navItems = [
        { href: '/dev/products', label: '在庫管理', icon: Package },
        { href: '/dev/assessment', label: '買取査定', icon: FileText },
        { href: '/dev/inquiries', label: 'お問い合わせ', icon: MessageSquare },
        { href: '/dev/terms', label: '利用規約', icon: FileText },
        { href: '/dev/account', label: '設定', icon: Settings },
    ];

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-slate-800"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                <span className="sr-only">{isOpen ? 'メニューを閉じる' : 'メニューを開く'}</span>
            </Button>

            {/* Overlay */}
            {isOpen && (
                typeof document !== 'undefined' ? (
                    createPortal(
                        <div className="fixed inset-0 z-[9999] bg-slate-900 text-white animate-in fade-in duration-200">
                            <div className="flex flex-col h-full">
                                {/* Header in Overlay */}
                                <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 bg-slate-900">
                                    <span className="font-bold text-lg">メニュー</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    >
                                        <X className="w-6 h-6" />
                                        <span className="sr-only">閉じる</span>
                                    </Button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto py-6 px-4 bg-slate-900">
                                    <div className="mb-6">
                                        <Link href="/dev/products/new" className="block">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-base">
                                                <Plus className="w-5 h-5 mr-2" />
                                                新規在庫追加
                                            </Button>
                                        </Link>
                                    </div>

                                    <nav className="space-y-2 mb-8">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border border-transparent",
                                                    pathname === item.href
                                                        ? "bg-slate-800 text-blue-400 border-slate-700 font-bold"
                                                        : "text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
                                                )}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="mt-auto border-t border-slate-800 pt-8">
                                        <p className="text-xs text-slate-500 mb-4 px-4">管理者としてログイン中</p>
                                        <form action={logout} className="px-4">
                                            <Button variant="outline" className="w-full text-red-400 hover:bg-red-950/30 hover:text-red-300 border-slate-700 hover:border-red-900 bg-transparent justify-start gap-3">
                                                <LogOut className="w-4 h-4" />
                                                ログアウト
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                ) : null
            )}
        </div>
    );
}
