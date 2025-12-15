import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log('Setting up storage bucket: products');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const productsBucket = buckets.find(b => b.name === 'products');

    if (productsBucket) {
        console.log('Bucket "products" already exists.');
    } else {
        console.log('Bucket "products" does not exist. Creating...');
        const { data, error } = await supabase.storage.createBucket('products', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (error) {
            console.error('Error creating bucket:', error);
            return;
        }
        console.log('Bucket "products" created successfully.');
    }

    // Since RLS policies for storage are best handled via SQL, 
    // and we cannot execute SQL via JS client easily without a stored procedure,
    // we will rely on the bucket being 'public: true' for reading.
    // For writing, the service role key (used in this script) can write, but the client-side
    // upload uses the user's session.

    // However, we are uploading from the client side using the standard client.
    // Ensure the policy allows authenticated users to upload.
    // NOTE: This usually needs SQL.

    console.log('Note: Please ensure Storage RLS policies allow uploads.');
    console.log('You might need to run the following SQL in the Supabase SQL Editor if uploads still fail for non-admins:');
    console.log(`
-- Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow users to update their own images (optional)
create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'products' and auth.uid() = owner )
  with check ( bucket_id = 'products' and auth.uid() = owner );

-- Allow users to delete their own images (optional)
create policy "Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.uid() = owner );
    `);
}

setupStorage();
