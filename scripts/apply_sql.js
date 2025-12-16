const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const accessToken = process.argv[2];
const sqlFilePath = process.argv[3];

if (!accessToken || !sqlFilePath) {
    console.error('Usage: node apply_sql.js <access_token> <sql_file_path>');
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    process.exit(1);
}

// Extract Project Ref (e.g., https://xyz.supabase.co -> xyz)
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
console.log(`Target Project Ref: ${projectRef}`);

const sql = fs.readFileSync(sqlFilePath, 'utf8');

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Success!');
            console.log(data);
        } else {
            console.error(`Error: ${res.statusCode}`);
            console.error(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
});

req.write(JSON.stringify({ query: sql }));
req.end();
