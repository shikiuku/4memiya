
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

type ProductCardProps = {
    product: Partial<Product>;
    viewMode?: 'grid' | 'list';
    customHref?: string;
    compactStats?: boolean; // New prop for conditional styling
};

export function ProductCard({ product, viewMode = 'grid', customHref, compactStats = false }: ProductCardProps) {
    const isList = viewMode === 'list';
    // Find the first actual image for the thumbnail
    const imageSrc = product.images?.find(url => !url.toLowerCase().match(/\.(mp4|mov|webm|m4v)(\?.*)?$/));
    // Check if there are any videos in either images or movies array
    const hasVideo = (product.movies && product.movies.length > 0) ||
        (product.images && product.images.some(url => url.toLowerCase().match(/\.(mp4|mov|webm|m4v)(\?.*)?$/)));
    const linkHref = customHref || `/products/${product.id}`;

    return (
        <Link
            href={linkHref}
            className={`group bg-white ${isList
                ? 'flex gap-2 px-2 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors'
                : 'flex flex-col rounded-md overflow-hidden border border-slate-100 hover:border-slate-300 transition-colors'
                }`}
        >
            {/* Thumbnail */}
            <div className={`relative bg-slate-100 overflow-hidden shrink-0 ${isList ? 'w-28 h-28 rounded-md' : 'aspect-square w-full'
                }`}>
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Image
                    </div>
                )}

                {/* Video Indicator */}
                {hasVideo && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full z-10">
                        <VideoIcon className="w-3 h-3" />
                    </div>
                )}

                {/* Sold Out Overlay (Keep for clarity) */}
                {product.status === 'sold_out' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">SOLD OUT</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-col min-w-0 flex-1 ${isList ? 'self-stretch py-0 justify-between' : 'p-3.5 md:p-4 gap-2'}`}>
                {/* 1. Tags (TOP) */}
                <div className="min-w-0">
                    <div className="flex flex-wrap gap-1">
                        {product.tags?.map((tag, i) => (
                            <span key={i} className="text-[9px] bg-slate-50 text-slate-500 px-1 py-0.5 rounded border border-slate-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 2. Title */}
                <h3 className={`font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors ${isList ? 'text-[13px] line-clamp-2' : 'text-sm line-clamp-3'
                    }`}>
                    {product.seq_id && <span className="mr-1">【No.{product.seq_id}】</span>}
                    {product.title}
                </h3>

                {/* 3. Stats */}
                <div className={`flex flex-wrap items-center gap-1 font-medium text-slate-500 text-[10px] ${!isList ? 'mb-1 mt-0.5' : ''}`}>
                    <span className="bg-slate-50 rounded px-1 py-0.5 text-slate-600 border border-slate-200/60 whitespace-nowrap">
                        ランク:{product.rank ?? '-'}
                    </span>
                    <span className="bg-slate-50 rounded px-1 py-0.5 text-slate-600 border border-slate-200/60 whitespace-nowrap">
                        運極:{product.luck_max ?? '-'}
                    </span>
                    <span className="bg-slate-50 rounded px-1 py-0.5 text-slate-600 border border-slate-200/60 whitespace-nowrap">
                        ガチャ限:{product.gacha_charas ?? '-'}
                    </span>
                </div>

                {/* 4. Footer Group (Badge + Price) -> BOTTOM */}
                <div className="flex items-center justify-between">
                    {/* Status Badge */}
                    <div className="shrink-0">
                        {product.status === 'on_sale' ? (
                            <span className="bg-[#007bff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                販売中
                            </span>
                        ) : product.status === 'sold_out' && (
                            <span className="bg-slate-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                売り切れ
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="font-bold text-lg text-slate-900 leading-none">
                        {product.price?.toLocaleString()}<span className="text-[10px] font-normal ml-0.5">円</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
