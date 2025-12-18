'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAppConfig(key: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', key)
        .single();

    if (error) {
        console.error(`Error fetching config ${key}:`, error);
        return null;
    }

    return data?.value;
}

export async function updateAppConfig(key: string, value: string, description?: string) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('app_config')
        .upsert({
            key,
            value,
            description,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error(`Error updating config ${key}:`, error);
        return { error: 'Failed to update config' };
    }

    revalidatePath('/assessment'); // Revalidate public page
    revalidatePath('/dev/config'); // Revalidate admin page
    return { success: true };
}
