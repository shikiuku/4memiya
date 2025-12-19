import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number; // 1-5
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function StarRating({ rating, size = 'md', className }: StarRatingProps) {
    const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

    return (
        <div className={cn("flex items-center text-yellow-500", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        starSize,
                        star <= rating ? "fill-current" : "text-slate-300 fill-slate-200"
                    )}
                />
            ))}
        </div>
    );
}
