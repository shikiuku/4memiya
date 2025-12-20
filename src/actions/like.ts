'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function toggleLike(productId: string) {
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    // Use Admin Client for DB operations to bypass RLS for guest actions
    // allowing us to delete rows by ID even if auth.uid() is null (guest).
    const supabase = createAdminClient();

    let userId = user?.id;
    let guestId: string | undefined;

    // Always attempt to get guestId to handle mixed states
    const cookieStore = await cookies();
    guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) {
        // If no guestId yet, and no user, we create one.
        // Even if user exists, we might want a guestId for continuity, but usually only if needed.
        // For simplicity: ensure guestId exists if we are going to use it.
        // If user is logged in, we rely on user_id primarily, but if we want to "merge" logic later, guestId is useful.
        // For now, only create if we really need it (not logged in).
        if (!userId) {
            guestId = crypto.randomUUID();
            cookieStore.set('guest_id', guestId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }
    }

    // Check for existing like (User OR Guest)
    // We want to toggle.
    // If logged in: check by user_id. (Should we also check guest_id? Maybe user liked it as guest before?)
    // If we find a like by guest_id but we are now user_id, we should probably "claim" it or just toggle it off?
    // User expectation: "I liked it".
    // If I see a like (whether user or guest), I toggle it OFF.
    // If I don't see a like, I toggle it ON (as user if logged in, else guest).

    let query = supabase.from('likes').select('id');

    // Construct OR query if we have both IDs
    if (userId && guestId) {
        query = query.or(`user_id.eq.${userId},guest_id.eq.${guestId}`);
    } else if (userId) {
        query = query.eq('user_id', userId);
    } else if (guestId) {
        query = query.eq('guest_id', guestId);
    } else {
        return; // Should not happen
    }

    // Filter by product
    query = query.eq('product_id', productId);

    const { data: existingLikes } = await query.select('id');
    const isLiked = existingLikes && existingLikes.length > 0;

    if (isLiked) {
        // Unlike: Delete found like(s)
        const ids = existingLikes?.map((l: { id: string }) => l.id) || [];
        const { error } = await supabase
            .from('likes')
            .delete()
            .in('id', ids);

        if (error) {
            console.error("Delete error:", error);
            throw error;
        }
    } else {
        // Like
        const insertData: any = {
            product_id: productId
        };
        if (userId) {
            insertData.user_id = userId;
        } else {
            insertData.guest_id = guestId;
        }

        const { error } = await supabase
            .from('likes')
            .insert(insertData);

        if (error) {
            console.error("Insert error:", error);
            throw error;
        }
    }

    revalidatePath(`/products/${productId}`);
    revalidatePath('/mypage');
}

export async function checkIsLiked(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = user?.id;
    let guestId: string | undefined;

    const cookieStore = await cookies();
    guestId = cookieStore.get('guest_id')?.value;

    if (!userId && !guestId) return false;

    let query = supabase.from('likes').select('id');

    if (userId && guestId) {
        query = query.or(`user_id.eq.${userId},guest_id.eq.${guestId}`);
    } else if (userId) {
        query = query.eq('user_id', userId);
    } else if (guestId) {
        query = query.eq('guest_id', guestId);
    }

    query = query.eq('product_id', productId);

    const { data } = await query.maybeSingle();

    return !!data;
}

export async function getLikeCount(productId: string) {
    const supabase = await createClient();

    const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

    if (error) {
        console.error("Error fetching like count", error);
        return 0;
    }

    return count || 0;
}

export async function getLikedProducts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    // Must have at least one ID
    if (!user && !guestId) return [];

    let query = supabase.from('likes').select('product_id, created_at');

    if (user && guestId) {
        query = query.or(`user_id.eq.${user.id},guest_id.eq.${guestId}`);
    } else if (user) {
        query = query.eq('user_id', user.id);
    } else if (guestId) {
        query = query.eq('guest_id', guestId);
    }

    // If userId exists (logged in), we usually only care about user likes unless we want to merge.
    // User requested "My Page should show liked products".
    // If I liked as guest, then logged in, I expect to see them? 
    // Yes, the query.or handles this.

    const { data: likes } = await query.order('created_at', { ascending: false });

    if (!likes || likes.length === 0) return [];

    // Deduplicate product IDs
    const productIds = Array.from(new Set(likes.map(l => l.product_id)));

    // Fetch products
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

    if (error) {
        console.error("Error fetching liked products", error);
        return [];
    }

    // Sort by like order (recent first)
    const productsMap = new Map(products.map(p => [p.id, p]));
    const result = productIds.map(id => productsMap.get(id)).filter(Boolean);

    return result.map(item => ({
        ...item,
        status: item.status as 'draft' | 'on_sale' | 'sold_out',
    }));
}
