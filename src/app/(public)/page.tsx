import { getProducts } from '@/actions/product';
import { getReviewStats } from '@/actions/review';
import { ProductListContainer } from '@/components/features/product-list-container';
import { ProductSearch } from '@/components/features/search/product-search';
import { HeroCarousel } from '@/components/features/top/hero-carousel';

import { createClient } from '@/lib/supabase/server';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : undefined;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;

  // Fetch data for list
  const products = await getProducts({
    query: query,
    tags: tag ? [tag] : undefined,
    sort: sort
  });

  // Fetch data for carousel (Latest 3)
  const latestProducts = await getProducts({ limit: 3 });

  // Fetch review stats
  const reviewStats = await getReviewStats();

  // Check login status
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 pt-4 pb-20 max-w-5xl space-y-8">

      {/* Hero Carousel - Always show */}
      <section>
        <HeroCarousel latestProducts={latestProducts} reviewStats={reviewStats} isLoggedIn={!!user} />
      </section>

      {/* Page Title & Search (Header area) */}
      {/* Page Title & Search (Header area) */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800">在庫一覧</h1>
        <div className="sm:w-auto">
          <ProductSearch />
        </div>
      </div>

      <ProductListContainer products={products} />
    </div>
  );
}
