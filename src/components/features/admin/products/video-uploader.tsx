'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, X, Loader2, Info, Settings2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { compressVideoTo480p } from '@/lib/utils/video-compression';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface VideoUploaderProps {
    initialVideos?: string[];
    onVideosChange: (urls: string[]) => void;
}

export function VideoUploader({ initialVideos = [], onVideosChange }: VideoUploaderProps) {
    const [videos, setVideos] = useState<string[]>(initialVideos);
    const [isUploading, setIsUploading] = useState(false);
    const [compressionStatus, setCompressionStatus] = useState<string | null>(null);
    const [useCompression, setUseCompression] = useState(true);
    const [videoSizes, setVideoSizes] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];
        const newSizes: Record<string, number> = {};

        try {
            const supabase = createClient();

            for (const file of files) {
                let fileToUpload: File | Blob = file;

                if (useCompression) {
                    setCompressionStatus(`圧縮中: ${file.name}`);
                    try {
                        fileToUpload = await compressVideoTo480p(file);
                    } catch (err) {
                        console.error('Compression failed:', err);
                        // Fallback to original if compression fails
                    }
                }

                setCompressionStatus(`アップロード中: ${file.name}`);

                // Check file size (Supabase Free limit is 50MB)
                if (fileToUpload.size > 50 * 1024 * 1024) {
                    alert(`ファイルサイズが大きすぎます: ${file.name} (${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB)\n50MB以下の動画を選択してください。`);
                    continue;
                }

                // Generate unique filename
                const fileExt = fileToUpload.type.split('/').pop() || 'webm';
                const fileName = `videos/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(fileName, fileToUpload, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: fileToUpload.type
                    });

                if (error) {
                    throw error;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
                newSizes[publicUrl] = fileToUpload.size;
            }

            const updatedVideos = [...videos, ...newUrls];
            setVideos(updatedVideos);
            setVideoSizes(prev => ({ ...prev, ...newSizes }));
            onVideosChange(updatedVideos);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('動画のアップロードに失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setIsUploading(false);
            setCompressionStatus(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeVideo = (indexToRemove: number) => {
        const urlToRemove = videos[indexToRemove];
        const updatedVideos = videos.filter((_, index) => index !== indexToRemove);

        setVideos(updatedVideos);
        setVideoSizes(prev => {
            const next = { ...prev };
            delete next[urlToRemove];
            return next;
        });
        onVideosChange(updatedVideos);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Checkbox
                    id="compression-toggle"
                    checked={useCompression}
                    onCheckedChange={(checked) => setUseCompression(!!checked)}
                />
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    <Label htmlFor="compression-toggle" className="text-sm font-medium text-slate-700 cursor-pointer">自動で480pに圧縮する (試作版)</Label>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {videos.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                        <video
                            src={url}
                            className="w-full h-full object-contain"
                            controls
                        />

                        {/* Size Overlay */}
                        {videoSizes[url] && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                                {(videoSizes[url] / (1024 * 1024)).toFixed(2)} MB
                            </div>
                        )}

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
                            <span className="text-xs text-slate-500">{compressionStatus || '処理中...'}</span>
                        </div>
                    ) : (
                        <>
                            <Video className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm font-bold text-slate-500 text-center px-4">動画を追加 (MP4など)</span>
                            <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                <Info className="w-3.5 h-3.5" />
                                <span className="text-xs">無料枠制限: 50MB以下</span>
                            </div>
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
