'use server';


import { createClient } from '@supabase/supabase-js';

// We need a specific client with service role for bypassing RLS during upload if RLS is strict
// But standard Server Action `createClient` uses cookie-based auth. 
// If the user is Admin, we might rely on RLS if we could set it. 
// Since we can't set RLS easily, we use Service Role here solely for the purpose of "Admin Image Upload".

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'No file provided' };
    }

    // Initialize Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
        .from('products')
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: uploadError.message };
    }

    const { data } = supabaseAdmin.storage
        .from('products')
        .getPublicUrl(filePath);

    return { url: data.publicUrl };
}
