import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ImageGalleryProps = {
    images: string[];
};

export function ImageGallery({ images }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If no images, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[3/4] bg-slate-100 flex items-center justify-center text-slate-400">
                No Image
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="w-full">
            {/* Main Image Stage */}
            <div className="relative w-full aspect-[3/4.5] bg-black">
                <Image
                    src={images[currentIndex]}
                    alt={`Product Image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                />

                {/* Navigation Buttons (only if multiple) */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full"
                            onClick={prevImage}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full"
                            onClick={nextImage}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </>
                )}

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnail List */}
            <div className="flex gap-2 p-4 overflow-x-auto bg-[#1a1a1a]">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                            "relative w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                            idx === currentIndex ? "border-[#007bff] opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                    >
                        <Image src={img} alt="thumb" fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
