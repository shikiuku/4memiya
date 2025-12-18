'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/features/product-card';
import { ViewToggle } from '@/components/features/view-toggle';
import { Product } from '@/types';

export function ProductListContainer({ products }: { products: Product[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    return (
        <div>
            <div className="flex items-center justify-between py-3 mb-2">
                <h2 className="text-sm font-bold text-slate-700">すべての在庫</h2>
                <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
            </div>

            <div className={`${viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'
                : 'flex flex-col'
                }`}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
            </div>
        </div>
    );
}
