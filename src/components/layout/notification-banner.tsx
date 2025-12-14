'use client';

import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function NotificationBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-yellow-50 border-b border-yellow-100 p-3 sm:px-6 relative">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm text-yellow-900">
                    <Bell className="w-4 h-4 text-yellow-600 shrink-0" />
                    <span className="font-medium">
                        新着在庫やお知らせを通知で受け取れます。
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-full font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">
                        通知をオンにする
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
