'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side action
export async function register(formData: FormData) {
    const id = (formData.get('id') as string)?.trim();
    const password = (formData.get('password') as string)?.trim();
    const username = (formData.get('username') as string)?.trim();

    if (!id || !password || !username) {
        return { error: 'すべての項目を入力してください' };
    }

    // Server-side validation for ID format
    const idRegex = /^[a-zA-Z0-9_]+$/;
    if (!idRegex.test(id)) {
        return { error: 'IDは半角英数字とアンダースコアのみ使用可能です' };
    }

    // Use Service Role Key to bypass email verification and domain checks
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

    const email = `${id}@4memiya.com`;
    console.log(`[Register] Creating user via Admin API: "${email}"`);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto confirm
        user_metadata: {
            role: 'user',
            username,
        }
    });

    if (error) {
        console.error('Registration error:', error.message);
        return { error: `エラーが発生しました: ${error.message}` };
    }

    // After creating user, we still need to sign them in for the session to be active in the browser
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError) {
        console.error('Auto-login error:', signInError.message);
        redirect('/login?registered=true');
    }

    redirect('/');
}

export async function login(formData: FormData) {
    const id = (formData.get('id') as string)?.trim();
    const password = (formData.get('password') as string)?.trim();

    if (!id || !password) {
        return { error: 'IDとパスワードを入力してください' };
    }

    const supabase = await createClient();

    // Append internal domain
    const email = `${id}@4memiya.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login error:', error.message);
        return { error: 'IDまたはパスワードが間違っています' };
    }

    // Check role and redirect
    const role = data.user?.user_metadata?.role;
    if (role === 'admin') {
        redirect('/dev/products');
    } else {
        redirect('/');
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
