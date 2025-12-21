'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { AssessmentRule } from '@/types';

/**
 * Fetch all assessment rules
 */
export async function getAssessmentRules() {
    // Determine client based on environment or use standard server client
    // For public access, createServerClient deals with cookie-based auth but also anon access if policy allows.
    const supabase = await createServerClient();

    // Explicitly select columns to ensure no ambiguity
    const { data, error } = await supabase
        .from('assessment_rules')
        .select('*')
        .select('*')
        .order('sort_order', { ascending: true }) // Primary sort by manual order
        .order('category', { ascending: true })
        .order('threshold', { ascending: true }); // Tertiary sort

    if (error) {
        console.error('Error fetching assessment rules:', {
            message: error.message,
            code: error.code,
            details: error.details
        });
        return [];
    }

    return data as AssessmentRule[];
}

/**
 * Save (Insert/Update) an assessment rule
 */
export async function saveAssessmentRule(currentState: any, formData: FormData) {
    // 1. Verify Authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    // 2. Extract Data
    const id = formData.get('id') as string;
    const rule_type = formData.get('rule_type') as 'range' | 'boolean';
    const category = formData.get('category') as string;
    const price_adjustment = parseInt(formData.get('price_adjustment') as string) || 0;

    // Optional fields
    const label = formData.get('label') as string; // For boolean rules
    const thresholdRaw = formData.get('threshold') as string;
    const threshold = thresholdRaw ? parseInt(thresholdRaw) : null;

    // 3. Validation
    if (!category) return { error: 'カテゴリは必須です。' };
    if (rule_type === 'range' && threshold === null) return { error: '数値条件の場合、閾値は必須です。' };
    if (rule_type === 'boolean' && !label) return { error: 'チェックボックス条件の場合、ラベルは必須です。' };

    // 4. Perform Admin Action
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

    const dataToSave = {
        rule_type,
        category,
        label: label || null,
        threshold,
        price_adjustment
    };

    if (id) {
        // UPDATE
        const { error: updateError } = await supabaseAdmin
            .from('assessment_rules')
            .update(dataToSave)
            .eq('id', id);
        error = updateError;
    } else {
        // INSERT
        const { error: insertError } = await supabaseAdmin
            .from('assessment_rules')
            .insert(dataToSave);
        error = insertError;
    }

    if (error) {
        console.error('Save assessment rule error:', error);
        return { error: '保存に失敗しました: ' + error.message };
    }

    revalidatePath('/dev/assessment');
    return { success: true };
}

/**
 * Delete an assessment rule
 */
export async function deleteAssessmentRule(id: string) {
    // 1. Verify Authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    // 2. Perform Admin Action
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

    const { error } = await supabaseAdmin.from('assessment_rules').delete().eq('id', id);

    if (error) {
        return { error: '削除に失敗しました: ' + error.message };
    }

    revalidatePath('/dev/assessment');
    return { success: true };
}

/**
 * Update the sort order of categories
 */
export async function updateCategoryOrder(categories: string[]) {
    // 1. Verify Authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    // 2. Perform Admin Action
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

    // Update each category's sort_order
    // We update ALL rules with that category to have the same order index.
    const updates = categories.map((cat, index) => {
        // Use index * 10 to allow space for future insertion if needed
        const sortOrder = (index + 1) * 10;
        return supabaseAdmin
            .from('assessment_rules')
            .update({ sort_order: sortOrder })
            .eq('category', cat);
    });

    await Promise.all(updates);

    revalidatePath('/dev/assessment');
    return { success: true };
}
