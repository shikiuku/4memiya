'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function saveProduct(currentState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const price = parseInt(formData.get('price') as string);
    // Unified Media: the 'images' field now contains all media URLs in order
    const imagesRaw = formData.get('images') as string;
    const images = imagesRaw ? imagesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

    // 1. 統合されたメディアリスト(images)から動画(movies)を抽出
    const movies = images.filter(url =>
        url.toLowerCase().match(/\.(mp4|mov|webm|m4v|ogg)(\?.*)?$/i)
    );

    console.log('[saveProduct] Syncing Media State:', {
        productId: id || 'NEW',
        totalMedia: images.length,
        detectedVideos: movies.length,
        allUrls: images
    });

    // 2. その他の商品情報を取得
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const rank = parseInt(formData.get('rank') as string) || 0;
    const badge_power = parseInt(formData.get('badge_power') as string) || 0;
    const luck_max = parseInt(formData.get('luck_max') as string) || 0;
    const gacha_charas = parseInt(formData.get('gacha_charas') as string) || 0;

    const description_points = formData.get('description_points') as string;
    const description_recommend = formData.get('description_recommend') as string;
    const seq_id = formData.get('seq_id') ? parseInt(formData.get('seq_id') as string) : undefined;

    // ... (rest of auth check)
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let error;

    if (id) {
        // UPDATE
        const updateData: any = {
            title,
            price,
            images,
            movies, // 明示的に最新の動画リストで上書き
            tags,
            rank,
            badge_power,
            luck_max,
            gacha_charas,
            description_points: description_points || null,
            description_recommend: description_recommend || null,
        };

        if (seq_id !== undefined) updateData.seq_id = seq_id;

        const { error: updateError } = await supabaseAdmin.from('products').update(updateData).eq('id', id);
        error = updateError;
    } else {
        // INSERT
        const insertData: any = {
            title,
            price,
            images,
            movies, // 明示的に最新の動画リストを保存
            tags,
            rank,
            badge_power,
            luck_max,
            gacha_charas,
            description_points: description_points || null,
            description_recommend: description_recommend || null,
            status: 'on_sale',
        };
        if (seq_id !== undefined) insertData.seq_id = seq_id;

        const { data: newProduct, error: insertError } = await supabaseAdmin
            .from('products')
            .insert(insertData)
            .select()
            .single();

        error = insertError;

        if (!error && newProduct) {
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

    const { data: product, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('images, movies')
        .eq('id', id)
        .single();

    if (product) {
        const filesToDelete: string[] = [];

        // Extract paths from images
        if (product.images && Array.isArray(product.images)) {
            product.images.forEach((url: string) => {
                // Assuming URL format: .../storage/v1/object/public/products/path/to/file
                // or just "path/to/file" if relative? Based on uploader, we store full URL?
                // check uploadImageAction: return { url: data.publicUrl } -> full URL.
                // We need to extract the path relative to the bucket.

                try {
                    const urlObj = new URL(url);
                    // Standard Supabase URL: /storage/v1/object/public/products/filename
                    // We need 'filename'
                    const pathParts = urlObj.pathname.split('/products/');
                    if (pathParts.length > 1) {
                        // pathParts[1] is the file path inside the bucket
                        // Need to decode URI component in case of spaces etc?
                        filesToDelete.push(decodeURIComponent(pathParts[1]));
                    }
                } catch (e) {
                    console.error('Error parsing image URL:', url, e);
                }
            });
        }

        // Extract paths from movies
        if (product.movies && Array.isArray(product.movies)) {
            product.movies.forEach((url: string) => {
                try {
                    const urlObj = new URL(url);
                    // Expected: .../products/videos/filename
                    const pathParts = urlObj.pathname.split('/products/');
                    if (pathParts.length > 1) {
                        filesToDelete.push(decodeURIComponent(pathParts[1]));
                    }
                } catch (e) {
                    console.error('Error parsing video URL:', url, e);
                }
            });
        }

        if (filesToDelete.length > 0) {
            console.log('Deleting storage files:', filesToDelete);
            const { error: storageError } = await supabaseAdmin.storage
                .from('products')
                .remove(filesToDelete);

            if (storageError) {
                console.error('Error cleaning up storage files:', storageError);
                // Don't block DB deletion, just log it.
            }
        }
    }

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
