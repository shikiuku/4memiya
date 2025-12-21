const { createClient } = require('@supabase/supabase-js');

const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vmpjaoylbulirsjxhklw.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sbp_f92cc8adbcd38475a087dba1d8c7cdd9f038af55'; // Using the token provided earlier might not work as service key. Wait, user provided ACCESS_TOKEN which is likely a PAT or service role?
// The user provided "sbp_..." which looks like a Personal Access Token (PAT).
// But for storage deletion we usually need a Service Role Key or a user with admin rights.
// However, the PAT might have admin rights.
// Let's try with the provided key. If it fails, I'll ask.
// Actually, I should check if I have the Service Role Key in .env.local?
// I don't have access to .env.local usually.
// But I saw `process.env.SUPABASE_SERVICE_ROLE_KEY` used in code.
// I will assume I need to hardcode the key I saw earlier or use the one I have.
// Wait, I saw "ACCESS_TOKEN = 'sbp_...'" in `apply-sql-api.js`. That is a PAT.
// Storage operations (list/remove) can be done via Supabase JS Client with that token if it has permissions.
// Or I can use the Service Key if I can find it.
// I will try to use the PAT.

const supabase = createClient(PROJECT_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('Starting cleanup...');

    // 1. Fetch all DB products to get valid files
    const { data: products, error: dbError } = await supabase
        .from('products')
        .select('images, movies');

    if (dbError) {
        console.error('DB Error:', dbError);
        return;
    }

    const activeFiles = new Set();
    products.forEach(p => {
        if (p.images) {
            p.images.forEach(url => extractPath(url, activeFiles));
        }
        if (p.movies) {
            p.movies.forEach(url => extractPath(url, activeFiles));
        }
    });

    console.log(`Found ${activeFiles.size} active files in DB.`);

    // 2. List all files in storage
    let allFiles = [];

    // List root
    const { data: rootFiles, error: rootError } = await supabase.storage
        .from('products')
        .list('', { limit: 1000 });

    if (rootError) {
        console.error('List Root Error:', rootError);
        return;
    }

    rootFiles.forEach(f => {
        if (f.name !== 'videos' && f.name !== '.emptyFolderPlaceholder') {
            allFiles.push(f.name);
        }
    });

    // List videos folder
    const { data: videoFiles, error: videoError } = await supabase.storage
        .from('products')
        .list('videos', { limit: 1000 });

    if (videoError) {
        console.error('List Video Error:', videoError);
    } else {
        videoFiles.forEach(f => {
            allFiles.push(`videos/${f.name}`);
        });
    }

    console.log(`Found ${allFiles.length} total files in Storage.`);

    // 3. Find Orphans
    const orphans = allFiles.filter(path => !activeFiles.has(path));
    console.log(`Found ${orphans.length} orphaned files.`);

    if (orphans.length > 0) {
        console.log('Deleting orphans...');
        const chunkSize = 50;
        for (let i = 0; i < orphans.length; i += chunkSize) {
            const chunk = orphans.slice(i, i + chunkSize);
            const { error: delError } = await supabase.storage
                .from('products')
                .remove(chunk);

            if (delError) {
                console.error('Delete Error:', delError);
            } else {
                console.log(`Deleted ${chunk.length} files.`);
            }
        }
    } else {
        console.log('No orphans to delete.');
    }
}

function extractPath(url, set) {
    try {
        // URL: .../products/filename
        const parts = url.split('/products/');
        if (parts.length > 1) {
            set.add(decodeURIComponent(parts[1]));
        }
    } catch (e) { }
}

main();
