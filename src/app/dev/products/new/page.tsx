import { ProductForm } from '@/components/features/admin/products/product-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewProductPage() {
    const supabase = await createClient();

    // Fetch specifically defined tags (Persistent Tags)
    const { data: tagsData } = await supabase.from('tags').select('name').order('created_at', { ascending: false }).returns<{ name: string }[]>();

    // Fallback? If table empty, maybe fetch from products? 
    // For now, let's mix both or just rely on 'tags' table if user runs migration.
    // If 'tags' table gives error (doesn't exist), we fail gracefully.

    let allTags: string[] = [];

    if (tagsData) {
        allTags = tagsData.map(t => t.name);
    } else {
        // Fallback to existing behavior if Tags table missing (or empty first run)
        const { data: products } = await supabase.from('products').select('tags').returns<{ tags: string[] }[]>();
        allTags = Array.from(new Set(products?.flatMap(p => p.tags || []) || []));
    }

    // Fetch next seq_id
    const { data: maxSeqData } = await supabase
        .from('products')
        .select('seq_id')
        .order('seq_id', { ascending: false })
        .limit(1)
        .single<{ seq_id: number }>();

    const nextSeqId = (maxSeqData?.seq_id ?? 0) + 1;

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
                defaultSeqId={nextSeqId}
            />
        </div>
    );
}
