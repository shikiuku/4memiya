'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * Get a site setting by key
 */
export async function getSiteSetting(key: string) {
    const supabase = await createServerClient();
    // Cast to any to bypass TS error since site_settings is new
    const { data, error } = await (supabase.from('site_settings' as any) as any)
        .select('value')
        .eq('key', key)
        .single();

    if (error) return null;
    return data.value;
}

/**
 * Update site settings (email, note, terms)
 */
export async function updateSiteSettings(prevState: any, formData: FormData) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: '認証エラー: ログインしてください。' };
    }

    const email = formData.get('email') as string | null;
    const note = formData.get('note') as string | null;
    const terms = formData.get('terms') as string | null;

    // Use Service Role for Admin Write
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

    // Update Email (if present in formData)
    if (email !== null) {
        if (!email.trim()) return { error: 'メールアドレスは必須です。' };

        const { error: emailError } = await (supabaseAdmin.from('site_settings' as any) as any)
            .upsert({
                key: 'inquiry_email',
                value: email.trim(),
                updated_at: new Date().toISOString()
            });

        if (emailError) {
            console.error('Update email error details:', JSON.stringify(emailError, null, 2));
            return { error: `メールアドレスの保存に失敗しました: ${emailError.message}` };
        }
    }

    // Update Note (if present in formData)
    if (note !== null) {
        const { error: noteError } = await (supabaseAdmin.from('site_settings' as any) as any)
            .upsert({
                key: 'inquiry_note',
                value: note.trim(),
                updated_at: new Date().toISOString()
            });

        if (noteError) {
            console.error('Update note error details:', JSON.stringify(noteError, null, 2));
            return { error: `注釈の保存に失敗しました: ${noteError.message}` };
        }
    }

    // Update Terms (if present in formData)
    if (terms !== null) {
        const { error: termsError } = await (supabaseAdmin.from('site_settings' as any) as any)
            .upsert({
                key: 'terms_content',
                value: terms.trim(),
                updated_at: new Date().toISOString()
            });

        if (termsError) {
            console.error('Update terms error details:', JSON.stringify(termsError, null, 2));
            return { error: `利用規約の保存に失敗しました: ${termsError.message}` };
        }
        revalidatePath('/terms');
    }

    revalidatePath('/dev/inquiries');
    revalidatePath('/dev/terms');
    revalidatePath('/contact');

    return { success: true, message: '設定を更新しました。' };
}
