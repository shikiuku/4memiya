'use server';

import { createClient } from '@/lib/supabase/server';
import { Product } from '@/types/index';

// --- Types ---
// Define a type for the raw DB response if it differs slightly, 
// but we'll try to map it to our app's Product type.
// Our DB 'products' table matches the Product type closely, 
// except for date fields which come as strings (timestamptz).

export async function getProducts(options?: { limit?: number }): Promise<Product[]> {
    const supabase = await createClient();

    let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

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
    return data.map(item => ({
        ...item,
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
        ...data,
        status: data.status as 'draft' | 'on_sale' | 'sold_out',
    } as Product;
}
