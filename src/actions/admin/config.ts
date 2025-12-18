'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAppConfig(key: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', key)
        .maybeSingle();

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

    console.log(`Updating config [${key}] to [${value}]`);

    const { error } = await supabase
        .from('app_config')
        .upsert({
            key,
            value,
            description,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

    if (error) {
        console.error(`Error updating config ${key}:`, error);
        return { error: 'Failed to update config' };
    }

    revalidatePath('/assessment');
    revalidatePath('/dev/assessment');
    revalidatePath('/', 'layout'); // Force refresh everywhere
    return { success: true };
}
