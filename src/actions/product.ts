'use server';

import { createClient } from '@/lib/supabase/server';
import { Product } from '@/types/index';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/actions/notification';

// --- Types ---
// Define a type for the raw DB response if it differs slightly, 
// but we'll try to map it to our app's Product type.
// Our DB 'products' table matches the Product type closely, 
// except for date fields which come as strings (timestamptz).

export async function getProducts(options?: {
    limit?: number;
    query?: string;
    tags?: string[];
}): Promise<Product[]> {
    const supabase = await createClient();

    let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    // Filter by Keyword (Title)
    // Filter by Keyword (Title or Tags)
    if (options?.query) {
        // Search in title AND tags (casting arrays to text for simple search)
        // Syntax: column.operator.value,column.operator.value
        query = query.or(`title.ilike.%${options.query}%,tags.ilike.%${options.query}%`);
    }

    // Filter by Tags (Array contains)
    // Note: Assuming 'tags' column is a text array (text[])
    if (options?.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    if (!data) return [];

    // Map DB response to Product type
    return (data as any[]).map(item => ({
        ...(item as any),
        status: item.status as 'draft' | 'on_sale' | 'sold_out',
        // seq_id is included in * and mapped automatically via spread
    })) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    if (!data) return null;

    return {
        ...(data as any),
        status: (data as any).status as 'draft' | 'on_sale' | 'sold_out',
    } as Product;
}

export async function getAllUniqueTags(): Promise<string[]> {
    const supabase = await createClient();

    // Fetch all tags. 
    // Optimization: If many products, consider database RPC or separate tags table.
    const { data, error } = await supabase
        .from('products')
        .select('tags')
        .not('tags', 'is', null);

    if (error || !data) return [];

    const allTags = (data as any[]).flatMap(p => p.tags as string[]);
    // Dedup
    return Array.from(new Set(allTags)).sort();
}
