'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

interface CleanupResult {
    totalFiles: number;
    activeFiles: number;
    orphanedFiles: number;
    deletedFiles: number;
    errors: string[];
}

export async function cleanupOrphanFilesAction(): Promise<CleanupResult> {
    const result: CleanupResult = {
        totalFiles: 0,
        activeFiles: 0,
        orphanedFiles: 0,
        deletedFiles: 0,
        errors: []
    };

    try {
        // 1. Fetch all products to get valid file paths
        // We select images and movies columns
        const { data: products, error: dbError } = await supabaseAdmin
            .from('products')
            .select('images, movies');

        if (dbError) throw new Error('DB Fetch Error: ' + dbError.message);

        // Collect all active paths
        const activePaths = new Set<string>();

        products.forEach(p => {
            if (p.images && Array.isArray(p.images)) {
                p.images.forEach((url: string) => {
                    extractPathFromUrl(url, activePaths);
                });
            }
            if (p.movies && Array.isArray(p.movies)) {
                p.movies.forEach((url: string) => {
                    extractPathFromUrl(url, activePaths);
                });
            }
        });

        result.activeFiles = activePaths.size;

        // 2. List all files in 'products' bucket
        // Note: Supabase list is paginated (default 100), increasing limit.
        // Also it lists root. If videos are in 'videos/', we need to list that too.
        // We need to list recursively or list specific known folders.
        // Current knowledge: root has images, 'videos/' has videos.
        // And 'video-...' files are at root (old logic) or 'videos/' (new logic)?
        // Ref: uploadImageAction puts at root. VideoUploader puts in 'videos/'.
        // uploadVideoAction put at root with `video-` prefix.

        // List Root
        const { data: rootFiles, error: listRootError } = await supabaseAdmin.storage
            .from('products')
            .list('', { limit: 1000, offset: 0 }); // Assuming < 1000 files for now or we need loop

        if (listRootError) throw new Error('List Root Error: ' + listRootError.message);

        // List 'videos' folder
        const { data: videoFiles, error: listVideoError } = await supabaseAdmin.storage
            .from('products')
            .list('videos', { limit: 1000, offset: 0 });

        if (listVideoError) throw new Error('List Videos Error: ' + listVideoError.message);

        // Combine files
        // Root files: just name. Video files: 'videos/' + name.
        // Exclude folders from rootFiles if any (videos folder itself might appear)
        let allStorageFiles: string[] = [];

        if (rootFiles) {
            rootFiles.forEach(f => {
                if (f.id === null) return; // folder?
                // if it's a file
                if (f.name !== 'videos' && f.name !== '.emptyFolderPlaceholder') {
                    allStorageFiles.push(f.name);
                }
            });
        }

        if (videoFiles) {
            videoFiles.forEach(f => {
                if (f.id === null) return;
                allStorageFiles.push(`videos/${f.name}`);
            });
        }

        result.totalFiles = allStorageFiles.length;

        // 3. Identify Orphans
        const orphans = allStorageFiles.filter(path => !activePaths.has(path));
        result.orphanedFiles = orphans.length;

        // 4. Delete Orphans
        if (orphans.length > 0) {
            // Delete in chunks of 50 just in case
            const chunkSize = 50;
            for (let i = 0; i < orphans.length; i += chunkSize) {
                const chunk = orphans.slice(i, i + chunkSize);
                const { error: deleteError } = await supabaseAdmin.storage
                    .from('products')
                    .remove(chunk);

                if (deleteError) {
                    result.errors.push(`Delete Error (${i}-${i + chunkSize}): ${deleteError.message}`);
                } else {
                    result.deletedFiles += chunk.length;
                }
            }
        }

    } catch (e: any) {
        console.error('Cleanup failed:', e);
        result.errors.push(e.message);
    }

    return result;
}

function extractPathFromUrl(url: string, set: Set<string>) {
    try {
        const urlObj = new URL(url);
        // Pathname: /storage/v1/object/public/products/filename.jpg
        // or /storage/v1/object/public/products/videos/filename.mp4
        const parts = urlObj.pathname.split('/products/');
        if (parts.length > 1) {
            set.add(decodeURIComponent(parts[1]));
        }
    } catch (e) {
        // ignore invalid urls
    }
}
