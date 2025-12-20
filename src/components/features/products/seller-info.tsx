import { BadgeCheck } from 'lucide-react';
import Image from 'next/image';

export function SellerInfo() {
    return (
        <a
            href="https://x.com/AJAJDNW"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 py-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                <Image src="/logo.png" alt="Seller Icon" fill className="object-cover" />
            </div>
            <div>
                <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900">雨宮 【モンスト垢 買取/販売/代行】</span>
                    <BadgeCheck className="w-4 h-4 text-[#007bff] fill-[#007bff] text-white" />
                </div>
                <div className="text-xs text-slate-500">@AJAJDNW</div>
            </div>
        </a>
    );
}
