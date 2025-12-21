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
    sort?: string;
}): Promise<Product[]> {
    const supabase = await createClient();

    let query = supabase
        .from('products')
        .select('*');

    // Sorting
    switch (options?.sort) {
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'likes':
            query = query.order('likes_count', { ascending: false });
            break;
        case 'latest':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    // Filter by Keyword (Title)
    // Filter by Keyword (Title or Tags)
    if (options?.query) {
        // Search in title AND seq_id if numeric
        // Note: ilike on array column (tags) caused crash, avoiding that.
        const isNumeric = /^\d+$/.test(options.query);

        if (isNumeric) {
            // Search Title OR Description OR SeqID
            query = query.or(`title.ilike.%${options.query}%,description_points.ilike.%${options.query}%,seq_id.eq.${options.query}`);
        } else {
            // Search Title OR Description
            query = query.or(`title.ilike.%${options.query}%,description_points.ilike.%${options.query}%`);
        }
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

export async function getRandomProducts(limit: number, excludeId: string): Promise<Product[]> {
    const supabase = await createClient();

    // Fetch more items than needed to shuffle (e.g., 3x limit), excluding current
    const fetchLimit = limit * 4;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', excludeId)
        .eq('status', 'on_sale') // Only sellable items
        .limit(fetchLimit);

    if (error) {
        console.error('Error fetching random products:', error);
        return [];
    }

    if (!data || data.length === 0) return [];

    // Shuffle array
    const shuffled = (data as any[]).sort(() => 0.5 - Math.random());

    // Take top N
    const selected = shuffled.slice(0, limit);

    return selected.map(item => ({
        ...(item as any),
        status: item.status as 'draft' | 'on_sale' | 'sold_out',
    })) as Product[];
}
