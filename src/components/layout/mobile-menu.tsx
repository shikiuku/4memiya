'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, UserPlus, Settings, LogOut, Package, FileText, MessageSquare, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth';

interface MobileMenuProps {
    user: any; // Using any to avoid strict type coupling with supabase user type for now, or could use User type
}

export function MobileMenu({ user }: MobileMenuProps) {
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
        { href: '/', label: '在庫一覧', icon: Package },
        { href: '/assessment', label: '買取査定', icon: FileText },
        { href: '/reviews', label: 'レビュー', icon: MessageSquare },
        { href: '/contact', label: 'お問い合わせ', icon: MessageSquare },
        { href: '/terms', label: '利用規約', icon: FileText },
    ];

    if (user) {
        navItems.push({ href: '/account', label: '設定', icon: Settings });
    }

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-700"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                <span className="sr-only">{isOpen ? 'メニューを閉じる' : 'メニューを開く'}</span>
            </Button>

            {/* Overlay - rendered in Portal, positioned BELOW the header (top-14) */}
            {isOpen && (
                typeof document !== 'undefined' ? (
                    (() => {
                        const { createPortal } = require('react-dom');
                        return createPortal(
                            <div className="fixed inset-0 z-[9999] bg-white animate-in fade-in duration-200">
                                <div className="flex flex-col h-full">
                                    {/* Header in Overlay */}
                                    <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100 p-4">
                                        <span className="font-bold text-lg text-slate-800">メニュー</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsOpen(false)}
                                            className="text-slate-500 hover:text-slate-800"
                                        >
                                            <X className="w-6 h-6" />
                                            <span className="sr-only">閉じる</span>
                                        </Button>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto py-6 px-4">
                                        <nav className="space-y-2">
                                            {navItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                                        pathname === item.href
                                                            ? "bg-blue-50 text-blue-600 font-bold"
                                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                                    )}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </nav>

                                        <div className="mt-8 border-t border-slate-100 pt-8">
                                            {user ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 px-4 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <span className="font-bold text-slate-500 text-lg">
                                                                {(user.user_metadata?.displayName || user.user_metadata?.username || 'U')[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">
                                                                {user.email?.split('@')[0] || user.user_metadata?.displayName || 'ユーザー'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <form action={logout} className="px-4">
                                                        <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 justify-start gap-3">
                                                            <LogOut className="w-4 h-4" />
                                                            ログアウト
                                                        </Button>
                                                    </form>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 px-4">
                                                    <Link href="/login" className="block">
                                                        <Button variant="outline" className="w-full justify-start gap-3 font-bold text-slate-600">
                                                            <LogIn className="w-4 h-4" />
                                                            ログイン
                                                        </Button>
                                                    </Link>
                                                    <Link href="/register" className="block">
                                                        <Button className="w-full justify-start gap-3 font-bold bg-[#007bff] hover:bg-[#0069d9] text-white">
                                                            <UserPlus className="w-4 h-4" />
                                                            新規会員登録
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        );
                    })()
                ) : null
            )}
        </div>
    );
}
