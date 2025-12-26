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

export async function addCharacterTag(attribute: string, name: string) {
    if (!attribute || !name) return;

    const { error } = await supabaseAdmin.from('character_tags').upsert(
        { attribute, name },
        { onConflict: 'attribute,name', ignoreDuplicates: true }
    );

    if (error) {
        console.error('Error adding character tag:', error);
        return { error: error.message };
    }

    revalidatePath('/dev/products/new');
    revalidatePath('/dev/products/[id]/edit', 'page');
}

export async function deleteCharacterTag(attribute: string, name: string) {
    if (!attribute || !name) return;

    const { error } = await supabaseAdmin.from('character_tags').delete().match({ attribute, name });

    if (error) {
        console.error('Error deleting character tag:', error);
        return { error: error.message };
    }

    revalidatePath('/dev/products/new');
    revalidatePath('/dev/products/[id]/edit', 'page');
    return { success: true };
}
