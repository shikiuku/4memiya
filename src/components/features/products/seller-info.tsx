import { BadgeCheck } from 'lucide-react';
import Image from 'next/image';

export function SellerInfo() {
    return (
        <div className="flex items-center gap-4 py-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                <Image src="/logo.png" alt="Seller Icon" fill className="object-cover" />
            </div>
            <div>
                <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900">しと【モンスト垢 販売/買取】</span>
                    <BadgeCheck className="w-4 h-4 text-[#007bff] fill-[#007bff] text-white" />
                </div>
                <div className="text-xs text-slate-500">@Ox3Sn</div>
            </div>
        </div>
    );
}
