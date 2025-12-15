'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function addTag(tagName: string) {
    if (!tagName) return;

    const { error } = await supabaseAdmin.from('tags').upsert(
        { name: tagName },
        { onConflict: 'name', ignoreDuplicates: true }
    );

    if (error) {
        console.error('Error adding tag:', error);
        return { error: error.message };
    }

    revalidatePath('/dev/products/new');
}

export async function deleteTag(tagName: string) {
    if (!tagName) return;

    const { error } = await supabaseAdmin.from('tags').delete().eq('name', tagName);

    if (error) {
        console.error('Error deleting tag:', error);
        return { error: error.message };
    }

    revalidatePath('/dev/products/new');
    return { success: true };
}
