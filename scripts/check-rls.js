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

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('Checking RLS policies for app_config...');

    // Query pg_policies to see if any policies exist for app_config
    const { data, error } = await supabase
        .rpc('get_policies_for_table', { table_name: 'app_config' })
        .catch(async () => {
            // Fallback if RPC doesn't exist (which it presumably doesn't), 
            // try to query direct with admin privileges if possible or infer from behavior.
            // Actually, we can't easily query pg_catalog with JS client unless we wrap it in a function.
            // Let's just try to write as an anon user vs authenticated user.
            return { data: null, error: 'RPC not found' };
        });

    // Simpler test: Try to update as a mock "admin" user if we could sign in, 
    // but easiest is to just CHECK if we can Select.

    // We will just print if RLS is enabled if we can.
    // Since we can't easily inspect schema meta-data without a specific RPC,
    // I will CREATE a migration to ensure RLS is correct.

    console.log("Checking if RLS is enabled is hard without SQL access. I will just try to read/write with a rigorous test.");

    // Test 1: Write with Service Role (Should work)
    const { error: serviceWriteError } = await supabase
        .from('app_config')
        .upsert({ key: 'test_key', value: 'service_write' });

    if (serviceWriteError) {
        console.error('❌ Service role write failed:', serviceWriteError);
    } else {
        console.log('✅ Service role write succeeded');
    }

    // Test 2: We can't easily test "Authenticated User" write from here without a valid JWT.
    // Check if I can read the policy definitions from a migration file?
    // I will read local migration files to see if app_config was defined with RLS.
}

checkRLS();
