import { getProducts, getAllUniqueTags } from '@/actions/product';
import { ProductListContainer } from '@/components/features/product-list-container';
import { ProductSearch } from '@/components/features/search/product-search';

// Force dynamic rendering since we are fetching data based on search
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : undefined;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;

  const [products, allTags] = await Promise.all([
    getProducts({
      query: query,
      tags: tag ? [tag] : undefined
    }),
    getAllUniqueTags()
  ]);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      {/* Page Title & Search (Header area) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <h1 className="text-xl font-bold text-slate-800 mt-2">在庫一覧</h1>
        <ProductSearch availableTags={allTags} />
      </div>

      <ProductListContainer products={products} />
    </div>
  );
}
