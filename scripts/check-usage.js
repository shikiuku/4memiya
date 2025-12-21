const https = require('https');

const PROJECT_REF = 'vmpjaoylbulirsjxhklw';
const ACCESS_TOKEN = 'sbp_f92cc8adbcd38475a087dba1d8c7cdd9f038af55';

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const usage = JSON.parse(data);
                console.log(JSON.stringify(usage, null, 2));
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        } else {
            console.error(`Error: ${res.statusCode} ${res.statusMessage}`);
            console.error(data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
