'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function saveProduct(currentState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const price = parseInt(formData.get('price') as string);
    // Handle images: if empty string, make it empty array
    const imagesRaw = formData.get('images') as string;
    const images = imagesRaw ? imagesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

    // Handle tags
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Handle movies
    const moviesRaw = formData.get('movies') as string;
    const movies = moviesRaw ? moviesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

    // Specs
    const rank = parseInt(formData.get('rank') as string) || 0;
    const badge_power = parseInt(formData.get('badge_power') as string) || 0;
    const luck_max = parseInt(formData.get('luck_max') as string) || 0;
    const gacha_charas = parseInt(formData.get('gacha_charas') as string) || 0;

    // Descriptions
    const description_points = formData.get('description_points') as string;
    const description_recommend = formData.get('description_recommend') as string;

    // Optional seq_id Override
    const seq_id = formData.get('seq_id') ? parseInt(formData.get('seq_id') as string) : undefined;

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

    let error;

    if (id) {
        // UPDATE
        const updateData: any = {
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
        };

        // Movies added to updateData
        updateData.movies = movies;

        if (seq_id !== undefined) updateData.seq_id = seq_id;

        const { error: updateError } = await supabaseAdmin.from('products').update(updateData).eq('id', id);
        error = updateError;
    } else {
        // INSERT
        const insertData: any = {
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
            status: 'on_sale', // Default status
            movies: movies // Defined above in previous edit block? No, variable scope issue.
        };
        if (seq_id !== undefined) insertData.seq_id = seq_id;

        const { data: newProduct, error: insertError } = await supabaseAdmin
            .from('products')
            .insert(insertData)
            .select()
            .single();

        error = insertError;

        // Send Push Notification for new products
        if (!error && newProduct) {
            // We don't await this to keep UI responsive? Or maybe we should log errors.
            // Using logic from previous plan:
            const { sendPushNotification } = await import('@/actions/notification');
            await sendPushNotification({
                title: '新着在庫が入荷しました！',
                body: `${title} - ¥${price.toLocaleString()}`,
                url: `/products/${newProduct.id}`
            });
        }
    }

    if (error) {
        console.error('Save product error:', error);
        return { error: '在庫の保存に失敗しました: ' + error.message };
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/dev/products');

    if (id) {
        revalidatePath(`/products/${id}`);
        revalidatePath(`/dev/products/${id}/edit`);
    }

    redirect('/dev/products');
}

export async function deleteProduct(id: string) {
    // 1. Verify Authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    // 2. Perform Admin Action (using service role)
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

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) {
        console.error('Delete product error:', error);
        return { error: '在庫の削除に失敗しました: ' + error.message };
    }

    revalidatePath('/dev/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
}
