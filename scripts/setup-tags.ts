import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTags() {
    console.log('Setting up tags table...');

    // 1. Check/Create Table (using raw SQL if possible, but JS client has limits on DDL)
    // We will assume the user has to run SQL, OR we use the 'rpc' hack if available, 
    // BUT for now, since we are in a 'dev' environment, we can try to use standard table operations 
    // or just inform the user. 
    // ACTUALLY, to truly create a table from here without migrations is hard.
    // However, I can use the existing `products` table's `tags` column as a seed, 
    // and just create a separate table if I CAN. 
    // If I cannot create a table via JS, I will have to ask the user to run SQL.

    // START SQL BLOCK
    const sql = `
    create table if not exists tags (
        id uuid default gen_random_uuid() primary key,
        name text unique not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- RLS
    alter table tags enable row level security;
    
    create policy "Public tags view" on tags for select using (true);
    create policy "Admin tags insert" on tags for insert with check (true); -- Simplified for now, should be admin only ideally
    create policy "Admin tags delete" on tags for delete using (true);
    `;
    // END SQL BLOCK

    console.log('Please run the following SQL in your Supabase SQL Editor to create the tags table:');
    console.log(sql);
    console.log('-----------------------------------');
    console.log('Attempting to migrate existing tags to the new table (if it exists)...');

    // 2. Fetch existing tags from products
    const { data: products } = await supabase.from('products').select('tags');
    const existingTags = Array.from(new Set(
        products?.flatMap(p => p.tags || []) || []
    ));

    console.log(`Found ${existingTags.length} unique tags in products.`);

    if (existingTags.length > 0) {
        const { error } = await supabase.from('tags').upsert(
            existingTags.map(tag => ({ name: tag })),
            { onConflict: 'name', ignoreDuplicates: true }
        );

        if (error) {
            console.error('Error migrating tags (Table might not exist yet):', error.message);
        } else {
            console.log('Successfully migrated tags to "tags" table.');
        }
    }
}

setupTags();
