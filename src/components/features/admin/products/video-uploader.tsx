'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VideoUploaderProps {
    initialVideos?: string[];
    onVideosChange: (urls: string[]) => void;
}

export function VideoUploader({ initialVideos = [], onVideosChange }: VideoUploaderProps) {
    const [videos, setVideos] = useState<string[]>(initialVideos);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            const supabase = createClient();

            for (const file of files) {
                // Check file size (recommend 50MB, but Supabase limit might be higher or project dependent)
                // Vercel limit doesn't apply here.
                if (file.size > 50 * 1024 * 1024) {
                    alert(`ファイルサイズが大きすぎます: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)\n50MB以下の動画を選択してください。`);
                    continue;
                }

                // Generate unique filename
                const fileExt = file.name.split('.').pop();
                const fileName = `videos/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    throw error;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
            }

            const updatedVideos = [...videos, ...newUrls];
            setVideos(updatedVideos);
            onVideosChange(updatedVideos);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('動画のアップロードに失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeVideo = (indexToRemove: number) => {
        const updatedVideos = videos.filter((_, index) => index !== indexToRemove);
        setVideos(updatedVideos);
        onVideosChange(updatedVideos);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
                {videos.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                        <video
                            src={url}
                            className="w-full h-full object-contain"
                            controls
                        />
                        <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full transition-all z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        aspect-video rounded-lg border-2 border-dashed border-slate-300 
                        flex flex-col items-center justify-center cursor-pointer 
                        hover:bg-slate-50 hover:border-blue-400 transition-colors
                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs text-slate-500">アップロード中...</span>
                        </div>
                    ) : (
                        <>
                            <Video className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm font-bold text-slate-500 text-center px-4">動画を追加 (MP4など)</span>
                            <span className="text-xs text-slate-400 mt-1">推奨: 50MB以下</span>
                        </>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                multiple
                onChange={handleFileSelect}
            />

            <textarea
                name="movies"
                value={videos.join('\n')}
                readOnly
                className="hidden"
            />
        </div>
    );
}
