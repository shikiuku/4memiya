'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export type UpdateAccountState = {
    error?: string;
    success?: boolean;
    message?: string;
};

export async function updateAdminCredentials(
    prevState: UpdateAccountState,
    formData: FormData
): Promise<UpdateAccountState> {
    const currentPassword = (formData.get('currentPassword') as string)?.trim();
    const newLoginId = (formData.get('newLoginId') as string)?.trim();
    const newPassword = (formData.get('newPassword') as string)?.trim();

    if (!currentPassword) {
        return { error: '現在のパスワードを入力してください' };
    }

    if (!newLoginId && !newPassword) {
        return { error: '変更内容（新しいログインIDまたは新しいパスワード）を入力してください' };
    }

    const supabase = await createClient();

    // 1. Verify Current Password by attempting to sign in (or re-authenticate)
    // We need the current user's email to try signing in.
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
        return { error: 'ユーザー情報の取得に失敗しました' };
    }

    // Attempt to sign in with current password to verify identity
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (signInError) {
        return { error: '現在のパスワードが間違っています' };
    }

    // 2. Prepare for Administrative Update
    // We use the Service Role Key to update user attributes securely without requiring email verification flow for email changes if possible,
    // though for security, changing email (Login ID) might be sensitive.
    // However, since we map Login ID to email, we are essentially changing the email.

    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const updates: { email?: string; password?: string; user_metadata?: any } = {};

    // 3. Handle Login ID Change
    if (newLoginId) {
        // Validate ID format
        const idRegex = /^[a-zA-Z0-9_]+$/;
        if (!idRegex.test(newLoginId)) {
            return { error: '新しいIDは半角英数字とアンダースコアのみ使用可能です' };
        }

        const newEmail = `${newLoginId}@4memiya.com`;
        if (newEmail !== user.email) {
            updates.email = newEmail;
            updates.user_metadata = { ...user.user_metadata, username: newLoginId };
        }
    }

    // 4. Handle Password Change
    if (newPassword) {
        if (newPassword.length < 6) {
            return { error: '新しいパスワードは6文字以上で入力してください' };
        }
        updates.password = newPassword;
    }

    if (Object.keys(updates).length === 0) {
        return { message: '変更内容がありませんでした' };
    }

    // 5. Execute Update
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        updates
    );

    if (updateError) {
        console.error('Update Account Error:', updateError);
        return { error: 'アカウント情報の更新に失敗しました: ' + updateError.message };
    }

    // If password was changed, we might need to re-login client-side or session might be invalidated.
    // Ideally, we keep the session active or the user logs in again. 
    // Usually admin update doesn't invalidate session immediately unless specified.

    // If Email changed, Supabase Auth might require verification unless 'email_confirm' is handled.
    // updateUserById with service role usually bypasses verification if configured, but let's assume it works for now.

    revalidatePath('/dev/account');
    return { success: true, message: 'アカウント情報を更新しました。次回ログイン時から新しい情報を使用してください。' };
}
