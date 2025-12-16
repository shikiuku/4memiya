'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';

interface MobileMenuProps {
    user: any; // Using any for simplicity with Supabase user type, or could import User
}

export function MobileMenu({ user }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
                <Menu className="w-6 h-6" />
                <span className="sr-only">メニューを開く</span>
            </Button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-left-50 duration-200 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <span className="font-bold text-lg">メニュー</span>
                        <Button variant="ghost" size="icon" onClick={toggleMenu}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex flex-col space-y-4">
                            <Link href="/" onClick={toggleMenu} className="text-lg font-medium text-slate-700 hover:text-primary">
                                在庫一覧
                            </Link>
                            <Link href="/assessment" onClick={toggleMenu} className="text-lg font-medium text-slate-700 hover:text-primary">
                                買取査定
                            </Link>
                            <Link href="/contact" onClick={toggleMenu} className="text-lg font-medium text-slate-700 hover:text-primary">
                                お問い合わせ
                            </Link>
                            <Link href="/terms" onClick={toggleMenu} className="text-lg font-medium text-slate-700 hover:text-primary">
                                利用規約
                            </Link>
                        </div>

                        <div className="border-t pt-6 space-y-4">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 font-bold text-slate-700 mb-4">
                                        <User className="w-5 h-5" />
                                        <span>{user.user_metadata?.username || 'ユーザー'}</span>
                                    </div>
                                    <form action={async () => {
                                        await logout();
                                        toggleMenu();
                                    }}>
                                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            ログアウト
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <Link href="/login" onClick={toggleMenu}>
                                        <Button variant="outline" className="w-full">
                                            ログイン
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={toggleMenu}>
                                        <Button className="w-full bg-[#007bff] hover:bg-[#0069d9]">
                                            新規会員登録
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}
