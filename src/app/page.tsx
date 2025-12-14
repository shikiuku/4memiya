'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/features/product-card';
import { ViewToggle } from '@/components/features/view-toggle';
import { Product } from '@/types';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Using dummy data
const DUMMY_PRODUCTS: Partial<Product>[] = [
  {
    id: '1',
    title: '【No.343】高ランクで扱いやすい強力な基盤を備えた実戦型アカウント',
    price: 16000,
    status: 'on_sale',
    images: ['/sample_product.jpg'],
    tags: ['高ランク', '強垢'],
    rank: 1500,
    luck_max: 300,
    gacha_charas: 150
  },
  {
    id: '2',
    title: '【No.339】チェルノボグ運極を備えた高難易度にも強い実戦型アカウント',
    price: 18000,
    status: 'on_sale',
    images: ['/sample_product.jpg'],
    tags: ['チェル運極', '高紋章'],
    rank: 800,
    luck_max: 500,
    gacha_charas: 80
  },
  {
    id: '3',
    title: '【No.336】高難易度対応力と強力な基盤が整った実戦型アカウント',
    price: 38000,
    status: 'on_sale',
    images: ['/sample_product.jpg'],
    tags: ['高ランク', '高級章', '強垢'],
    rank: 400,
    luck_max: 50,
    gacha_charas: 800
  },
  {
    id: '4',
    title: '【No.327】ルシファーラック70所持 + オーブ1355個の超快適スタートアカウント',
    price: 12000,
    status: 'on_sale',
    images: ['/sample_product.jpg'],
    tags: ['ガチャ限超豊富', 'オーブ大量'],
    rank: 200,
    luck_max: 10,
    gacha_charas: 50
  }
];

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      {/* Page Title & Search (Header area) */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-slate-800">在庫一覧</h1>
        <Button variant="ghost" size="icon">
          <Search className="w-5 h-5 text-slate-500" />
        </Button>
      </div>

      <div className="">
        {/* List Header */}
        <div className="flex items-center justify-between py-3 mb-2">
          <h2 className="text-sm font-bold text-slate-700">すべての在庫</h2>
          <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
        </div>

        {/* Product Grid/List */}
        <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 gap-2'
            : 'flex flex-col'
          }`}>
          {DUMMY_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      </div>
    </div>
  );
}
