import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('Starting cleanup via API...');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Fetch valid files from DB
        const { data: products, error: dbError } = await supabase
            .from('products')
            .select('images, movies');

        if (dbError) throw new Error('DB Error: ' + dbError.message);

        const activePaths = new Set<string>();
        products?.forEach((p: any) => {
            if (p.images) {
                p.images.forEach((url: string) => extractPathFromUrl(url, activePaths));
            }
            if (p.movies) {
                p.movies.forEach((url: string) => extractPathFromUrl(url, activePaths));
            }
        });

        // 2. List storage files
        let allStorageFiles: string[] = [];

        // Root
        const { data: rootFiles, error: rootError } = await supabase.storage
            .from('products')
            .list('', { limit: 1000 });

        if (rootError) throw new Error('Storage Root Error: ' + rootError.message);

        rootFiles?.forEach(f => {
            if (f.name !== 'videos' && f.name !== '.emptyFolderPlaceholder') {
                allStorageFiles.push(f.name);
            }
        });

        // Videos
        const { data: videoFiles, error: videoError } = await supabase.storage
            .from('products')
            .list('videos', { limit: 1000 });

        if (videoError) throw new Error('Storage Video Error: ' + videoError.message);

        videoFiles?.forEach(f => {
            allStorageFiles.push(`videos/${f.name}`);
        });

        // 3. Orphans
        const orphans = allStorageFiles.filter(path => !activePaths.has(path));

        // 4. Delete
        let deletedCount = 0;
        let errors: string[] = [];

        if (orphans.length > 0) {
            const { error: delError } = await supabase.storage
                .from('products')
                .remove(orphans);

            if (delError) {
                errors.push(delError.message);
            } else {
                deletedCount = orphans.length;
            }
        }

        return NextResponse.json({
            success: true,
            totalFiles: allStorageFiles.length,
            activeFiles: activePaths.size,
            orphanedFiles: orphans.length,
            deletedFiles: deletedCount,
            errors
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

function extractPathFromUrl(url: string, set: Set<string>) {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/products/');
        if (parts.length > 1) {
            set.add(decodeURIComponent(parts[1]));
        }
    } catch (e) { }
}
