'use client';

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, ChevronLeft, ChevronRight, MessageSquareQuote, Sparkles, BadgeDollarSign, UserPlus, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/index';
import { Badge } from '@/components/ui/badge';
import { subscribeToPush } from '@/actions/notification';

interface HeroCarouselProps {
    latestProducts: Product[];
    reviewStats?: {
        count: number;
        average: number;
    };
    isLoggedIn?: boolean;
}

export function HeroCarousel({ latestProducts, reviewStats, isLoggedIn = false }: HeroCarouselProps) {
    const router = useRouter();
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);
    const [isSubscribed, setIsSubscribed] = React.useState(false);

    // Check subscription status on mount
    React.useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) setIsSubscribed(true);
                });
            });
        }
    }, []);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const handleEnableNotifications = async () => {
        if (!('serviceWorker' in navigator)) {
            const isIOS = /iPhone|iPad|iPod/i.test((navigator as any).userAgent) || ((navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
            if (isIOS) {
                if (confirm('iPhoneで通知を受け取るには、ホーム画面に追加する必要があります。\n設定方法のページへ移動しますか？')) {
                    router.push('/guide/notifications');
                }
                return;
            }
            alert('お使いのブラウザはプッシュ通知に対応していません。');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                const isIOS = /iPhone|iPad|iPod/i.test((navigator as any).userAgent) || ((navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
                if (isIOS) {
                    if (confirm('iPhoneで通知を受け取るには、ホーム画面に追加する必要があります。\n設定方法のページへ移動しますか？')) {
                        router.push('/guide/notifications');
                    }
                } else {
                    alert('通知権限が許可されませんでした。ブラウザの設定を確認してください。');
                }
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });

            await subscribeToPush(JSON.parse(JSON.stringify(subscription)));
            setIsSubscribed(true);
            alert('通知設定をオンにしました！');
        } catch (error) {
            console.error('Error enabling notifications:', error);
            const isIOS = /iPhone|iPad|iPod/i.test((navigator as any).userAgent) || ((navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
            if (isIOS) {
                if (confirm('iPhoneで通知を受け取るには、ホーム画面に追加する必要があります。\n設定方法のページへ移動しますか？')) {
                    router.push('/guide/notifications');
                }
            } else {
                alert('通知設定の有効化に失敗しました。');
            }
        }
    };

    const scrollToProducts = () => {
        const productSection = document.getElementById('product-list');
        if (productSection) {
            productSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollBy({ top: 500, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group px-1 sm:px-12 md:px-16">
            <div className="overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-200" ref={emblaRef}>
                <div className="flex h-full">
                    {(() => {
                        // Slide 0: New Site Announcement
                        const announcementSlide = (
                            <div key="announcement" className="flex-[0_0_100%] min-w-0 relative">
                                <div className="relative h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full group/slide">
                                    {/* Background Image */}
                                    <Image
                                        src="/images/banner-bg.jpg"
                                        alt="在庫一覧サイト公開"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/50" />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                                        <div className="mb-2 sm:mb-4 bg-white/20 p-1 sm:p-1.5 rounded-full backdrop-blur-sm animate-bounce">
                                            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                                                <Image
                                                    src="/images/banner-icon.png"
                                                    alt="New Icon"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </div>
                                        <h2 className="text-base sm:text-2xl md:text-3xl font-bold mb-2">モンストの買取・販売・代行ならお任せ</h2>
                                        <p className="text-white text-xs sm:text-base mb-4 max-w-md font-medium">
                                            取引実績6000件以上！アカウント査定・相談は無料。<br className="hidden sm:block" />
                                            モンスト専門の安心・安全な取引を提供します。
                                        </p>
                                        <Button
                                            onClick={scrollToProducts}
                                            className="bg-white text-indigo-900 hover:bg-slate-100 font-bold rounded-full text-xs sm:text-base px-6 sm:px-8 shadow-lg"
                                        >
                                            今すぐ在庫をチェック
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );

                        // Slide 1: Notification Promo
                        const notificationSlide = (
                            <div key="notification" className="flex-[0_0_100%] min-w-0 relative">
                                <div className="bg-yellow-50 h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full flex flex-col items-center justify-center text-yellow-900 p-6 text-center">
                                    <div className="mb-2 sm:mb-4 bg-white/50 p-3 sm:p-4 rounded-full backdrop-blur-sm shadow-sm animate-bounce">
                                        <Bell className="w-6 h-6 sm:w-12 sm:h-12 text-yellow-600" />
                                    </div>
                                    <h2 className="text-base sm:text-2xl md:text-3xl font-bold mb-2">新着情報をいち早くGET！</h2>
                                    <p className="text-yellow-800 text-xs sm:text-base mb-0 max-w-md font-medium">
                                        ブラウザ通知をオンにすると、新しい在庫やキャンペーン情報がすぐに届きます。<br />
                                        <span className="text-xs text-yellow-700 mt-1 block">
                                            ※iPhoneの方は「ホーム画面に追加」してから設定ボタンを押してください
                                        </span>
                                    </p>

                                    <div className="mb-2">
                                        <Link href="/guide/notifications" className="text-xs text-blue-600 underline hover:text-blue-800">
                                            詳細なiPhoneでの追加方法はこちら
                                        </Link>
                                    </div>
                                    <Button
                                        onClick={handleEnableNotifications}
                                        disabled={isSubscribed}
                                        className={`font-bold rounded-full text-xs sm:text-base px-6 sm:px-8 shadow-md ${isSubscribed ? 'bg-green-600 text-white' : 'bg-[#007bff] hover:bg-blue-600 text-white'}`}
                                    >
                                        {isSubscribed ? '通知設定済み' : '通知を受け取る'}
                                    </Button>
                                </div>
                            </div>
                        );

                        const assessmentSlide = (
                            <div key="assessment" className="flex-[0_0_100%] min-w-0 relative">
                                <div className="bg-white h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full flex flex-col items-center justify-center text-slate-900 p-6 text-center border-y border-slate-100">
                                    <div className="mb-2 sm:mb-4 bg-slate-50 p-1 sm:p-1.5 rounded-full shadow-sm animate-bounce">
                                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-full">
                                            <Image
                                                src="/amamiya_icon.png"
                                                alt="雨宮"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center mb-2">
                                        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold">
                                            引退・不要アカウントを<br />
                                            高価格で買い取ります！
                                        </h2>
                                    </div>
                                    <p className="text-slate-600 text-xs sm:text-base mb-4 max-w-md font-medium">
                                        多数の取引実績で、安心・安全な取引。
                                    </p>
                                    <Link href="/assessment">
                                        <Button
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-xs sm:text-base px-6 sm:px-8 shadow-lg"
                                        >
                                            買取査定ページ
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );

                        const reviewsSlide = (
                            <div key="reviews" className="flex-[0_0_100%] min-w-0 relative">
                                <div className="bg-[#555555] h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full flex flex-col items-center justify-center text-white p-6 text-center border-l-4 border-transparent">
                                    <div className="mb-2 sm:mb-4 bg-white/10 p-3 sm:p-4 rounded-full backdrop-blur-sm animate-bounce">
                                        <MessageSquareQuote className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                                    </div>
                                    <div className="flex items-end gap-2 mb-2 justify-center">
                                        <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white">みんなのレビュー</h2>
                                        <span className="text-xl sm:text-3xl font-bold text-yellow-400">{reviewStats?.average || 0}</span>
                                        <span className="text-xs sm:text-base text-slate-300 mb-1">({reviewStats?.count || 0}件)</span>
                                    </div>
                                    <p className="text-slate-300 text-xs sm:text-base mb-4 max-w-md font-medium">
                                        {(reviewStats?.count || 0) > 0
                                            ? '実際に購入されたお客様の声を公開中！'
                                            : 'まだレビューがありません。最初のレビューを書きましょう！'
                                        }
                                    </p>
                                    <div className="flex gap-4">
                                        <Link href="/reviews">
                                            <Button
                                                className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full text-xs sm:text-base px-6 sm:px-8 shadow-lg"
                                            >
                                                レビューを見る
                                            </Button>
                                        </Link>
                                        <Link href="/reviews">
                                            <Button
                                                variant="outline"
                                                className="bg-transparent text-white border-white hover:bg-white/10 font-bold rounded-full text-xs sm:text-base px-6 sm:px-8"
                                            >
                                                投稿する
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );

                        const productSlides = latestProducts.map((product) => (
                            <div key={product.id} className="flex-[0_0_100%] min-w-0 relative">
                                <Link href={`/products/${product.id}`} className="block relative h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full bg-slate-900 group/slide">
                                    {/* Image */}
                                    {product.images && product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover opacity-80 group-hover/slide:opacity-60 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                            No Image
                                        </div>
                                    )}

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-red-600 text-white border-none text-xs sm:text-base px-2 sm:px-3 py-1 font-bold shadow-lg animate-bounce">
                                                NEW
                                            </Badge>
                                        </div>
                                        <h3 className="text-white text-sm sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                                            {product.title}
                                        </h3>
                                        <div className="flex justify-end">
                                            <p className="text-yellow-400 font-bold text-lg sm:text-3xl">
                                                ¥{product.price.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ));

                        const registrationSlide = (
                            <div key="register" className="flex-[0_0_100%] min-w-0 relative">
                                <div className="bg-[#007AFE] h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full flex flex-col items-center justify-center text-white p-6 text-center">
                                    <div className="mb-2 sm:mb-4 bg-white/20 p-3 sm:p-4 rounded-full backdrop-blur-sm shadow-sm animate-pulse">
                                        <UserPlus className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                                    </div>
                                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2">簡単！会員登録</h2>
                                    <p className="text-indigo-100 text-xs sm:text-base mb-4 max-w-md font-medium">
                                        メールアドレス不要！<br />
                                        面倒な入力なしですぐに始められます。
                                    </p>
                                    <Link href="/register">
                                        <Button
                                            className="bg-white text-slate-900 hover:bg-slate-50 font-bold rounded-full text-xs sm:text-base px-6 sm:px-8 shadow-lg"
                                        >
                                            今すぐ登録する
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );

                        const orderedSlides = [];
                        orderedSlides.push(announcementSlide); // Always first
                        if (!isSubscribed) orderedSlides.push(notificationSlide);
                        orderedSlides.push(assessmentSlide);
                        orderedSlides.push(reviewsSlide);
                        orderedSlides.push(...productSlides);
                        // Hide registration slide if logged in
                        if (!isLoggedIn) {
                            orderedSlides.push(registrationSlide);
                        }
                        if (isSubscribed) orderedSlides.push(notificationSlide);

                        return orderedSlides;
                    })()}
                </div>
            </div>

            {/* Navigation Arrows (Outside) */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-800 hover:bg-slate-100 hover:text-slate-900 rounded-full z-10"
                onClick={scrollPrev}
            >
                <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-800 hover:bg-slate-100 hover:text-slate-900 rounded-full z-10"
                onClick={scrollNext}
            >
                <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10" />
            </Button>
        </div>
    );
}
