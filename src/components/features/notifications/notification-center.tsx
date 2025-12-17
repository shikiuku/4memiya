'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getRecentNotifications, subscribeToPush } from '@/actions/notification';

// Helper for VAPID key conversion (same as banner)
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface Notification {
    id: number;
    title: string;
    body: string;
    url?: string;
    created_at: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check subscription status
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) setIsSubscribed(true);
                });
            });
        }
    }, []);

    // Fetch notifications when opened
    useEffect(() => {
        if (isOpen) {
            getRecentNotifications().then(data => {
                setNotifications(data as any[] || []);
                // Mark as read mechanism could go here (e.g., store lastReadTime in localstorage)
                localStorage.setItem('lastViewedNotificationTime', new Date().toISOString());
                setUnreadCount(0);
            });
        } else {
            // Check if there are new notifications relative to last view
            getRecentNotifications(20).then(data => {
                if (data && data.length > 0) {
                    const lastViewed = localStorage.getItem('lastViewedNotificationTime');
                    if (!lastViewed) {
                        setUnreadCount(data.length);
                    } else {
                        const lastViewedDate = new Date(lastViewed);
                        const count = data.filter((n: any) => new Date(n.created_at) > lastViewedDate).length;
                        setUnreadCount(count);
                    }
                }
            });
        }
    }, [isOpen]);

    const handleToggleSubscription = async () => {
        if (!('serviceWorker' in navigator)) {
            alert('お使いのブラウザはプッシュ通知に対応していません。');
            return;
        }

        setIsProcessing(true);

        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();

            if (sub) {
                // Unsubscribe
                await sub.unsubscribe();
                setIsSubscribed(false);
                // Ideally also remove from DB via server action, but for now client unsubscribe is enough to stop receiving.
            } else {
                // Subscribe
                const newPermission = await Notification.requestPermission();
                if (newPermission === 'granted') {
                    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
                    if (!vapidKey) throw new Error('VAPID Key missing');

                    const newSub = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidKey)
                    });

                    await subscribeToPush(JSON.parse(JSON.stringify(newSub)));
                    setIsSubscribed(true);
                } else {
                    alert('通知権限が拒否されました。ブラウザの設定から変更してください。');
                }
            }
        } catch (error) {
            console.error('Toggle subscription error:', error);
            alert('エラーが発生しました。');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                    <Bell className="w-5 h-5 md:w-6 md:h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">通知</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 md:w-96 p-0 shadow-xl border-slate-200 bg-white" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">お知らせ</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                            {isSubscribed ? '通知ON' : '通知OFF'}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-7 text-xs px-2",
                                isSubscribed
                                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                            onClick={handleToggleSubscription}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Settings className="w-3 h-3" />
                            )}
                            <span className="ml-1">{isSubscribed ? '解除' : '登録'}</span>
                        </Button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            お知らせはありません
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((note) => (
                                <div key={note.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{note.title}</h4>
                                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{note.body}</p>
                                    {note.url && (
                                        <a
                                            href={note.url}
                                            className="block mt-2 text-xs text-blue-600 hover:underline font-medium"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            詳細を見る &rarr;
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
