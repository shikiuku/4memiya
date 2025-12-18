'use client';

import { Bell, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { subscribeToPush } from '@/actions/notification';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
            // Check if already subscribed
            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) setIsSubscribed(true);
                    });
                });
            }
        }
    }, []);

    const handleSubscribe = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('このブラウザはプッシュ通知に対応していません。');
            return;
        }

        setIsProcessing(true);

        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            const newPermission = await Notification.requestPermission();
            setPermission(newPermission);

            if (newPermission === 'granted') {
                const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
                if (!vapidKey) {
                    console.error('VAPID Public Key missing');
                    return;
                }

                const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey)
                });

                const result = await subscribeToPush(JSON.parse(JSON.stringify(subscription)));

                if (result.success) {
                    setIsSubscribed(true);
                    // Send a test notification immediately? Maybe not.
                } else {
                    console.error('Subscription save failed:', result.error);
                }
            }
        } catch (error) {
            console.error('Subscription failed:', error);
            alert('通知の登録に失敗しました。');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isVisible) return null;

    // Hide if already subscribed (optional, or show "On" state)
    // If subscribed, maybe we don't need to show the banner anymore?
    if (isSubscribed) return null;

    // Don't show if denied
    if (permission === 'denied') return null;

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
                    <button
                        onClick={handleSubscribe}
                        disabled={isProcessing}
                        className="text-xs bg-[#007bff] text-white px-3 py-1.5 rounded-full font-bold hover:bg-blue-600 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                        {isProcessing ? '設定中...' : '通知をオンにする'}
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
