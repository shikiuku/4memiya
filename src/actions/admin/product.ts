'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createProduct(currentState: any, formData: FormData) {
    const title = formData.get('title') as string;
    const price = parseInt(formData.get('price') as string);
    const images = (formData.get('images') as string).split('\n').map(s => s.trim()).filter(Boolean);
    const tags = (formData.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean);

    // Specs
    const rank = parseInt(formData.get('rank') as string) || 0;
    const badge_power = parseInt(formData.get('badge_power') as string) || 0;
    const luck_max = parseInt(formData.get('luck_max') as string) || 0;
    const gacha_charas = parseInt(formData.get('gacha_charas') as string) || 0;

    // Descriptions
    const description_points = formData.get('description_points') as string;
    const description_recommend = formData.get('description_recommend') as string;

    // 1. Verify Authentication (using normal client)
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    // 2. Perform Admin Action (using service role to bypass RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { error } = await supabaseAdmin.from('products').insert({
        title,
        price,
        images,
        tags,
        rank,
        badge_power,
        luck_max,
        gacha_charas,
        description_points: description_points || null,
        description_recommend: description_recommend || null,
        status: 'on_sale' // Default status
    });

    if (error) {
        console.error('Create product error:', error);
        return { error: '在庫の追加に失敗しました: ' + error.message };
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/dev/products');

    redirect('/dev/products');
}
