'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ImageGalleryProps = {
    images: string[];
    movies?: string[] | null;
};

export function ImageGallery({ images, movies }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    // Combine images and movies into a single list based on extensions if they are mixed in images.
    // For backward compatibility, if a URL is only in movies, we add it.
    const mediaItems = useMemo(() => {
        // 1. Start with what's in 'images' (new truth for order)
        const items = (images || []).map(url => {
            const isVideo = url.toLowerCase().match(/\.(mp4|mov|webm|m4v|ogg)(\?.*)?$/i);
            return { type: isVideo ? 'video' as const : 'image' as const, url };
        });

        // 2. Add anything that's in 'movies' but NOT in 'images' (legacy/sync)
        if (movies) {
            movies.forEach(url => {
                const exists = items.some(item => item.url === url);
                if (!exists) {
                    items.push({ type: 'video' as const, url });
                }
            });
        }
        return items;
    }, [images, movies]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    // If no media, show placeholder
    if (mediaItems.length === 0) {
        return (
            <div className="w-full aspect-[3/4] bg-slate-100 flex items-center justify-center text-slate-400">
                No Image
            </div>
        );
    }

    const nextImage = () => {
        if (emblaApi) emblaApi.scrollNext();
    };

    const prevImage = () => {
        if (emblaApi) emblaApi.scrollPrev();
    };

    return (
        <div className="w-full">
            {/* Main Media Stage */}
            <div className="relative w-full aspect-square bg-slate-900 group">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full">
                        {mediaItems.map((item, idx) => (
                            <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                                {item.type === 'image' ? (
                                    <Image
                                        src={item.url}
                                        alt={`Product Media ${idx + 1}`}
                                        fill
                                        className="object-contain"
                                        priority={idx === 0}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black">
                                        <video
                                            src={`${item.url}#t=0.001`}
                                            className="w-full h-full object-contain"
                                            controls
                                            playsInline
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons (only if multiple) */}
                {mediaItems.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full z-10"
                            onClick={prevImage}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full z-10"
                            onClick={nextImage}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </>
                )}

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 pointer-events-none">
                    {currentIndex + 1} / {mediaItems.length}
                </div>
            </div>

            {/* Thumbnail List */}
            <div className="flex gap-2 p-4 overflow-x-auto bg-[#1a1a1a]">
                {mediaItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollTo(idx)}
                        className={cn(
                            "relative w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 bg-black flex items-center justify-center",
                            idx === currentIndex ? "border-[#007bff] opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                    >
                        {item.type === 'image' ? (
                            <Image src={item.url} alt="thumb" fill className="object-cover" />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <video
                                    src={`${item.url}#t=0.001`}
                                    className="w-full h-full object-cover opacity-80"
                                    preload="metadata"
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/40 rounded-full p-1 border border-white/40">
                                        <Play className="w-4 h-4 text-white fill-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
