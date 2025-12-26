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
    const { data: tagsData } = await supabase.from('tags').select('name').order('created_at', { ascending: false }).returns<{ name: string }[]>();

    let allTags: string[] = [];
    if (tagsData) {
        allTags = tagsData.map(t => t.name);
    } else {
        const { data: products } = await supabase.from('products').select('tags').returns<{ tags: string[] }[]>();
        allTags = Array.from(new Set(products?.flatMap(p => p.tags || []) || []));
    }

    // Fetch Character Tags (Master)
    const { data: charTagsData } = await supabase.from('character_tags').select('attribute, name').returns<{ attribute: string; name: string }[]>();
    const charTags: Record<string, string[]> = {};

    if (!charTagsData || charTagsData.length === 0) {
        // Fallback: collect from existing products if master table is empty/missing
        const { data: products } = await supabase.from('products').select('attribute_characters').returns<{ attribute_characters: any }[]>();
        products?.forEach(p => {
            const attrs = p.attribute_characters as any;
            if (attrs) {
                Object.entries(attrs).forEach(([attr, value]) => {
                    if (typeof value === 'string') {
                        const names = value.split(',').map(s => s.trim()).filter(Boolean);
                        if (!charTags[attr]) charTags[attr] = [];
                        names.forEach(name => {
                            if (!charTags[attr].includes(name)) charTags[attr].push(name);
                        });
                    }
                });
            }
        });
    } else {
        charTagsData.forEach(tag => {
            if (!charTags[tag.attribute]) charTags[tag.attribute] = [];
            charTags[tag.attribute].push(tag.name);
        });
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductForm
                suggestedTags={allTags}
                suggestedCharacterTags={charTags}
                initialData={product}
            />
        </div>
    );
}
