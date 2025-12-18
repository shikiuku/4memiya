import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { Image as ImageIcon } from 'lucide-react';

type ProductCardProps = {
    product: Partial<Product>;
    viewMode?: 'grid' | 'list';
};

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
    const isList = viewMode === 'list';
    const imageSrc = product.images?.[0];

    return (
        <Link
            href={`/products/${product.id}`}
            className={`group block bg-white ${isList
                ? 'flex gap-2 px-2 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors'
                : 'rounded-md overflow-hidden border border-slate-100 hover:border-slate-300 transition-colors'
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

                {/* Status Badge (Grid Only - List has button) */}
                {!isList && product.status === 'sold_out' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">SOLD OUT</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-col ${isList ? 'flex-1 min-w-0 justify-between py-1' : 'p-4 md:p-5'}`}>
                <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        {product.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h3 className={`font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors ${isList ? 'text-sm mb-1 truncate' : 'text-sm line-clamp-2 mb-2'
                        }`}>
                        {product.seq_id && <span className="mr-1">【No.{product.seq_id}】</span>}
                        {product.title}
                    </h3>
                </div>

                <div className={`flex items-end justify-between ${!isList && 'mt-2'}`}>
                    <div className="font-bold text-lg text-slate-900">
                        {product.price?.toLocaleString()}<span className="text-xs font-normal ml-0.5">円</span>
                    </div>

                    {isList && (
                        <div className="shrink-0 ml-2">
                            {product.status === 'on_sale' ? (
                                <span className="bg-[#007bff] text-white text-xs font-bold px-3 py-1 rounded inline-block whitespace-nowrap">
                                    販売中
                                </span>
                            ) : (
                                <span className="bg-slate-400 text-white text-xs font-bold px-3 py-1 rounded inline-block whitespace-nowrap">
                                    売り切れ
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
