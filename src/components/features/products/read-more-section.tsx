'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReadMoreSectionProps = {
    text: string;
    maxHeight?: string; // e.g. "h-24" or arbitrary px value
};

export function ReadMoreSection({ text, maxHeight = 'h-24' }: ReadMoreSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            <div
                className={cn(
                    "text-sm text-slate-600 leading-relaxed whitespace-pre-wrap transition-all duration-300 ease-in-out overflow-hidden relative",
                    !isExpanded ? maxHeight : "h-auto"
                )}
            >
                {text}

                {/* Gradient Overlay when collapsed */}
                {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
            </div>

            <Button
                variant="outline"
                className="w-full mt-3 text-slate-500 font-normal hover:bg-slate-50 border-slate-200"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        閉じる
                    </>
                ) : (
                    <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        もっと見る
                    </>
                )}
            </Button>
        </div>
    );
}
