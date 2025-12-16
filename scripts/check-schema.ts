import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkSchema() {
    console.log('Checking assessment_rules schema...');

    // Try to select the 'label' column specifically
    const { data, error } = await supabase
        .from('assessment_rules')
        .select('id, label, rule_type')
        .limit(1);

    if (error) {
        console.error('Error selecting label column:', error);
    } else {
        console.log('Successfully selected label column. Data:', data);
    }
}

checkSchema();
