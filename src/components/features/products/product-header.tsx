'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProductHeaderProps = {
    productId: string;
    seqId?: number;
};

export function ProductHeader({ productId, seqId }: ProductHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 h-14 flex items-center px-4">
            <Link href="/" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-slate-700" />
            </Link>
            <h1 className="text-base font-bold text-slate-900 mx-auto transform -translate-x-5">
                No.{seqId ?? productId}
            </h1>
        </header>
    );
}
