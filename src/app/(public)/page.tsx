import { getProducts } from '@/actions/product';
import { getReviewStats } from '@/actions/review';
import { ProductListContainer } from '@/components/features/product-list-container';
import { ProductSearch } from '@/components/features/search/product-search';
import { HeroCarousel } from '@/components/features/top/hero-carousel';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : undefined;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;

  // Fetch data for list
  const products = await getProducts({
    query: query,
    tags: tag ? [tag] : undefined
  });

  // Fetch data for carousel (Latest 3)
  const latestProducts = await getProducts({ limit: 3 });

  // Fetch review stats
  const reviewStats = await getReviewStats();

  return (
    <div className="container mx-auto px-4 pt-4 pb-20 max-w-5xl space-y-8">

      {/* Hero Carousel (Only show on top page proper, maybe hide if searching? optional) */}
      {!query && !tag && (
        <section>
          <HeroCarousel latestProducts={latestProducts} reviewStats={reviewStats} />
        </section>
      )}

      {/* Page Title & Search (Header area) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 self-start sm:self-auto">在庫一覧</h1>
        <div className="w-full sm:w-auto">
          <ProductSearch />
        </div>
      </div>

      <ProductListContainer products={products} />
    </div>
  );
}
