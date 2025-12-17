'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export type UpdateAccountState = {
    error?: string;
    success?: boolean;
    message?: string;
};

export async function updateAccountCredentials(
    prevState: UpdateAccountState,
    formData: FormData
): Promise<UpdateAccountState> {
    const currentPassword = (formData.get('currentPassword') as string)?.trim();
    const newLoginId = (formData.get('newLoginId') as string)?.trim();
    const newPassword = (formData.get('newPassword') as string)?.trim();
    const newUsername = (formData.get('newUsername') as string)?.trim();

    if (!currentPassword) {
        return { error: '現在のパスワードを入力してください' };
    }

    if (!newLoginId && !newPassword && !newUsername) {
        return { error: '変更内容（ログインID、ユーザー名、またはパスワード）を入力してください' };
    }

    const supabase = await createClient();

    // 1. Verify Current Password
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

    // 2. Prepare for Administrative Update (to bypass email confirmation if needed)
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
    const metadataUpdates: any = { ...user.user_metadata };

    // 3. Handle Login ID Change
    if (newLoginId) {
        // Validate ID format
        const idRegex = /^[a-zA-Z0-9_]+$/;
        if (!idRegex.test(newLoginId)) {
            return { error: '新しいIDは半角英数字とアンダースコアのみ使用可能です' };
        }

        const newEmail = `${newLoginId}@4memiya.com`;

        // Basic check to see if it's different (Supabase will error if unique constraint fails)
        if (newEmail !== user.email) {
            updates.email = newEmail;
            metadataUpdates.username = newLoginId; // Assuming username metadata usually tracks login ID too? 
            // Actually user asked for "Account Name" AND "ID". 
            // In header: <span>{user.user_metadata?.username || 'ユーザー'}</span>
            // admin logic: updates.user_metadata = { ...user.user_metadata, username: newLoginId };
            // It seems "username" metadata IS the Login ID in admin logic.
            // But user request says "edit Account Name AND ID". 
            // I should support "displayName" or separate "username" field?
            // Let's assume user_metadata.username is the "ID" (Login ID) visual representation.
            // And maybe they want a separate "Display Name"?
            // The request said: "アカウント名とidとパスワードを変更できるようにして" (Change Account Name AND ID AND Password).
            // This implies they are distinct.
            // Let's add a `displayName` field to metadata. header currently shows `username || 'ユーザー'`.
            // I'll update the header later to prefer `displayName`.
        }
    }

    // 4. Handle Username (Display Name) Change
    if (newUsername) {
        metadataUpdates.displayName = newUsername;
        // If they don't change login ID, we still update metadata
    }

    // Sync metadata updates
    if (newLoginId) {
        metadataUpdates.username = newLoginId; // Keep username synced with Login ID for backward compat
    }

    if (Object.keys(metadataUpdates).length > 0) {
        updates.user_metadata = metadataUpdates;
    }

    // 5. Handle Password Change
    if (newPassword) {
        if (newPassword.length < 6) {
            return { error: '新しいパスワードは6文字以上で入力してください' };
        }
        updates.password = newPassword;
    }

    if (Object.keys(updates).length === 0 && !newUsername) { // Check if only metadata changed
        // Actually updates.user_metadata detects it.
        if (!updates.email && !updates.password && Object.keys(updates).length === 0) {
            return { message: '変更内容がありませんでした' };
        }
    }

    // 6. Execute Update
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        updates
    );

    if (updateError) {
        console.error('Update Account Error:', updateError);
        return { error: 'アカウント情報の更新に失敗しました: ' + updateError.message };
    }

    revalidatePath('/account');
    revalidatePath('/', 'layout'); // Update header
    return { success: true, message: 'アカウント情報を更新しました。' };
}
