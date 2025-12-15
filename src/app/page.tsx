import { getProducts } from '@/actions/product';
import { ProductListContainer } from '@/components/features/product-list-container';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      {/* Page Title & Search (Header area) */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-slate-800">在庫一覧</h1>
        <Button variant="ghost" size="icon">
          <Search className="w-5 h-5 text-slate-500" />
        </Button>
      </div>

      <ProductListContainer products={products} />
    </div>
  );
}
