'use client';

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/index';
import { Badge } from '@/components/ui/badge';
import { subscribeToPush } from '@/actions/notification';

interface HeroCarouselProps {
    latestProducts: Product[];
}

export function HeroCarousel({ latestProducts }: HeroCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const handleEnableNotifications = async () => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });

            await subscribeToPush(JSON.parse(JSON.stringify(subscription)));
            alert('通知設定をオンにしました！');
        } catch (error) {
            console.error('Error enabling notifications:', error);
            alert('通知設定の有効化に失敗しました。ブラウザの設定を確認してください。');
        }
    };

    return (
        <div className="relative group px-12 md:px-16">
            <div className="overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-200" ref={emblaRef}>
                <div className="flex h-full">
                    {/* Slide 1: Notification Promo */}
                    <div className="flex-[0_0_100%] min-w-0 relative">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-full min-h-[200px] sm:min-h-[250px] md:min-h-[320px] w-full flex flex-col items-center justify-center text-white p-6 text-center">
                            <div className="mb-2 sm:mb-4 bg-white/20 p-3 sm:p-4 rounded-full backdrop-blur-sm">
                                <Bell className="w-6 h-6 sm:w-12 sm:h-12 text-yellow-300 fill-yellow-300 animate-pulse" />
                            </div>
                            <h2 className="text-base sm:text-2xl md:text-3xl font-bold mb-2">新着情報をいち早くGET！</h2>
                            <p className="text-blue-100 text-xs sm:text-base mb-4 max-w-md">
                                ブラウザ通知をオンにすると、新しい在庫やキャンペーン情報がすぐに届きます。
                            </p>
                            <Button
                                onClick={handleEnableNotifications}
                                className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-full text-xs sm:text-base px-6 sm:px-8 shadow-lg"
                            >
                                通知を受け取る
                            </Button>
                        </div>
                    </div>

                    {/* Slides 2+: Latest Products */}
                    {latestProducts.map((product) => (
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
                                    <h3 className="text-white text-sm sm:text-xl md:text-2xl font-bold line-clamp-2 md:line-clamp-1 mb-1 sm:mb-2">
                                        {product.title}
                                    </h3>
                                    <p className="text-yellow-400 font-bold text-lg sm:text-3xl">
                                        ¥{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows (Outside) */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-800 hover:bg-slate-100 hover:text-slate-900 rounded-full"
                onClick={scrollPrev}
            >
                <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-800 hover:bg-slate-100 hover:text-slate-900 rounded-full"
                onClick={scrollNext}
            >
                <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </Button>
        </div>
    );
}
