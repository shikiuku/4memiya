const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfig() {
    console.log('Checking app_config table...');

    // 1. Check if table exists by selecting from it
    const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .limit(1);

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.error('❌ Table "app_config" does not exist.');
            return false;
        }
        console.error('❌ Error querying app_config:', error);
        return false;
    }

    console.log('✅ Table "app_config" exists.');

    // 2. Check for specific key
    const { data: configData, error: configError } = await supabase
        .from('app_config')
        .select('*')
        .eq('key', 'campaign_remaining_winners')
        .single();

    if (configError && configError.code !== 'PGRST116') {
        console.error('❌ Error fetching key:', configError);
    } else if (!configData) {
        console.log('⚠️ Key "campaign_remaining_winners" not found. Initializing...');
        const { error: insertError } = await supabase
            .from('app_config')
            .insert({
                key: 'campaign_remaining_winners',
                value: '10',
                description: '今月のキャンペーン残り当選人数'
            });

        if (insertError) {
            console.error('❌ Failed to insert initial config:', insertError);
        } else {
            console.log('✅ Initialized "campaign_remaining_winners" to 10.');
        }
    } else {
        console.log(`✅ Key "campaign_remaining_winners" exists. Value: ${configData.value}`);
    }

    return true;
}

checkConfig().catch(console.error);
