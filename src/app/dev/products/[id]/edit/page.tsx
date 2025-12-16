import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/features/admin/products/product-form';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch Product Data
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        if (error) console.error('Error fetching product:', error);
        notFound();
    }

    // Fetch Tags for suggestions (reusing the logic from new page)
    const { data: tagsData } = await supabase.from('tags').select('name').order('created_at', { ascending: false });

    let allTags: string[] = [];
    if (tagsData) {
        allTags = tagsData.map(t => t.name);
    } else {
        const { data: products } = await supabase.from('products').select('tags');
        allTags = Array.from(new Set(products?.flatMap(p => p.tags || []) || []));
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductForm
                suggestedTags={allTags}
                initialData={product}
            />
        </div>
    );
}
