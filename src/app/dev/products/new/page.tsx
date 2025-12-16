import { ProductForm } from '@/components/features/admin/products/product-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewProductPage() {
    const supabase = await createClient();

    // Fetch specifically defined tags (Persistent Tags)
    const { data: tagsData } = await supabase.from('tags').select('name').order('created_at', { ascending: false });

    // Fallback? If table empty, maybe fetch from products? 
    // For now, let's mix both or just rely on 'tags' table if user runs migration.
    // If 'tags' table gives error (doesn't exist), we fail gracefully.

    let allTags: string[] = [];

    if (tagsData) {
        allTags = tagsData.map(t => t.name);
    } else {
        // Fallback to existing behavior if Tags table missing (or empty first run)
        const { data: products } = await supabase.from('products').select('tags');
        allTags = Array.from(new Set(products?.flatMap(p => p.tags || []) || []));
    }

    // Fetch next seq_id
    const { data: maxSeqData } = await supabase
        .from('products')
        .select('seq_id')
        .order('seq_id', { ascending: false })
        .limit(1)
        .single();

    const nextSeqId = (maxSeqData?.seq_id ?? 0) + 1;

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductForm
                suggestedTags={allTags}
                defaultSeqId={nextSeqId}
            />
        </div>
    );
}
