import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_TAGS = [
    '引退',
    'コラボ',
    'ガチャ限運極',
    '高難易度',
    'マニア向け',
    '禁忌',
    '天魔'
];

async function seedTags() {
    console.log('Seeding initial tags...');

    for (const tag of DEFAULT_TAGS) {
        const { error } = await supabase.from('tags').upsert(
            { name: tag },
            { onConflict: 'name', ignoreDuplicates: true }
        );

        if (error) {
            console.error(`Error adding tag "${tag}":`, error.message);
        } else {
            console.log(`Tag "${tag}" added/verified.`);
        }
    }
    console.log('Done.');
}

seedTags();
