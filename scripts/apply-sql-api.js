const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'vmpjaoylbulirsjxhklw'; // From previous context
const ACCESS_TOKEN = 'sbp_f92cc8adbcd38475a087dba1d8c7cdd9f038af55'; // Provided by user

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20250101000150_guest_likes.sql');

async function run() {
    if (!fs.existsSync(MIGRATION_FILE)) {
        console.error('Migration file not found:', MIGRATION_FILE);
        process.exit(1);
    }

    const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
    console.log(`Applying SQL from ${path.basename(MIGRATION_FILE)} to project ${PROJECT_REF}...`);

    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const text = await response.text();
        console.error('API Request Failed:', response.status, text);
        console.error('Ensure the Project Ref and Access Token are correct.');
        process.exit(1);
    }

    const data = await response.json();
    console.log('Result:', JSON.stringify(data, null, 2));

    // Check for errors in the result "error" field usually?
    // The API usually returns results in keys, or error.
}

run().catch(err => {
    console.error('Script error:', err);
    process.exit(1);
});
