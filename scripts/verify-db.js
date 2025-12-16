const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role to ensure we can see everything

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkSchema() {
    console.log('Checking database schema for: assessment_rules');
    console.log('URL:', supabaseUrl);

    // Attempt to select specific columns to test existence
    const { data, error } = await supabase
        .from('assessment_rules')
        .select('id, rule_type, label, threshold')
        .limit(1);

    if (error) {
        console.error('❌ Error querying columns:', error);
        console.log('Full error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Columns exist! Sample data:', data);
    }
}

checkSchema();
