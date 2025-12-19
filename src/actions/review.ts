'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { Review } from '@/types/index';

export type ReviewInput = Omit<Review, 'id' | 'created_at'>;

/**
 * Submit a review from the public form. 
 * Now sets is_published = true (Immediate publish) and includes stock no.
 */
export async function submitReview(data: Omit<ReviewInput, 'is_published' | 'manual_price' | 'review_date' | 'user_id'>) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    let userIdToLink = null;
    if (user) {
        // Verify user exists in public.app_users to avoid FK violation
        const { data: appUser } = await supabase.from('app_users').select('id').eq('id', user.id).single();
        if (appUser) {
            userIdToLink = user.id;
        }
    }

    const submissionData = {
        star: data.star,
        comment: data.comment,
        game_title: data.game_title,
        manual_stock_no: data.manual_stock_no,
        is_published: true,
        review_date: new Date().toISOString().split('T')[0],
        user_id: userIdToLink
    };

    // @ts-ignore: Database types mismatch with manual schema update
    const { error } = await supabase.from('reviews').insert(submissionData);

    if (error) {
        console.error('Error submitting review:', error);
        return { error: error.message };
    }

    revalidatePath('/reviews');
    revalidatePath('/dev/reviews');

    return { success: true };
}

export async function getAdminReviews(limit: number = 50): Promise<Review[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('review_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching admin reviews:', error);
        return [];
    }

    return data as any as Review[];
}

export async function updateReviewStatus(id: number, is_published: boolean) {
    const supabase = await createClient();
    // @ts-ignore: Database types mismatch with manual schema update
    const { error } = await supabase.from('reviews').update({ is_published }).eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/reviews');
    revalidatePath('/dev/reviews');
    return { success: true };
}

export async function getReviews(limit: number = 20): Promise<Review[]> {
    const supabase = await createClient();

    // Fetch reviews with user data
    // Note: Standard join in Supabase
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            user:app_users(username)
        `)
        .eq('is_published', true)
        .order('review_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    // Map result to match Review type if needed, but Supabase Returns compatible structure usually
    // We might need to handle the array vs object for 'user' if 1:1 relation isn't perfectly inferred
    return data as any as Review[];
}

export async function getReviewStats(): Promise<{ count: number; average: number }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select('star')
        .eq('is_published', true);

    if (error || !data || data.length === 0) {
        return { count: 0, average: 0 };
    }

    const reviews = data as any[];
    const count = reviews.length;
    const total = reviews.reduce((acc, curr) => acc + (curr.star || 0), 0);
    const average = parseFloat((total / count).toFixed(1));

    return { count, average };
}

export async function createReview(data: ReviewInput) {
    const supabase = await createClient();

    const reviewData = {
        ...data,
        is_published: data.is_published ?? true // Default to true if not specified (Admin creation)
    };

    // @ts-ignore: Database types mismatch with manual schema update
    const { error } = await supabase.from('reviews').insert(reviewData);

    if (error) {
        console.error('Error creating review:', error);
        return { error: error.message };
    }

    revalidatePath('/reviews');
    revalidatePath('/dev/reviews');
    return { success: true };
}

export async function deleteReview(id: number) {
    const supabase = await createClient();

    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
        console.error('Error deleting review:', error);
        return { error: error.message };
    }

    revalidatePath('/reviews');
    revalidatePath('/dev/reviews');
    return { success: true };
}

export async function updateReviewContent(id: number, data: Omit<ReviewInput, 'manual_price' | 'review_date' | 'user_id'>) {
    const supabase = await createClient();

    // Security check: Ensure current user owns the review
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Fetch review to check owner
    // @ts-ignore
    const { data: reviewData } = await supabase.from('reviews').select('user_id').eq('id', id).single();
    const review = reviewData as any;

    // Allow update if user owns it OR if user is admin
    // Fetch user role
    // @ts-ignore
    const { data: userData } = await supabase.from('app_users').select('role').eq('id', user.id).single();
    const isAdmin = (userData as any)?.role === 'admin';

    if (!isAdmin && (!review || review.user_id !== user.id)) {
        return { error: 'Unauthorized: You can only edit your own reviews' };
    }

    // @ts-ignore
    const { error } = await (supabase as any)
        .from('reviews')
        .update({
            star: data.star,
            comment: data.comment,
            game_title: data.game_title,
            manual_stock_no: data.manual_stock_no,
            is_published: data.is_published
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating review:', error);
        return { error: error.message };
    }

    revalidatePath('/reviews');
    revalidatePath('/dev/reviews');
    return { success: true };
}
