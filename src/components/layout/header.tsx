import Image from 'next/image';
import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
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
                    {/* Removed duplicate Search icon as requested */}
                    <Button variant="ghost" size="icon" className="relative">
                        <ShoppingBag className="w-5 h-5 text-slate-600" />
                        {/* Badge placeholder if needed */}
                    </Button>
                </div>
            </div>
        </header>
    );
}
