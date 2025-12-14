'use client';

import { Button } from '@/components/ui/button';

type StickyFooterProps = {
    price: number;
    onConsult: () => void;
};

export function StickyFooter({ price, onConsult }: StickyFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 safe-area-pb z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto max-w-lg flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#007bff]">● 販売中</span>
                    <div className="font-bold text-2xl text-slate-900">
                        ¥{price.toLocaleString()}
                    </div>
                </div>
                <Button
                    onClick={onConsult}
                    className="flex-1 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold h-12 rounded-lg text-base"
                >
                    DMで相談
                </Button>
            </div>
        </div>
    );
}
