'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, X, Loader2, Info, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deleteFileAction, getSignedUploadUrlAction } from '@/actions/admin/upload';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Progress } from '@/components/ui/progress';

interface VideoUploaderProps {
    initialVideos?: string[];
    onVideosChange: (urls: string[]) => void;
}

interface SortableVideoItemProps {
    id: string;
    url: string;
    index: number;
    size?: number;
    onRemove: (index: number) => void;
}

function SortableVideoItem({ id, url, index, size, onRemove }: SortableVideoItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-900 ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''
                }`}
        >
            <video
                src={url}
                className="w-full h-full object-contain"
                controls
            />

            {/* Drag Handle Overlay */}
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 bg-black/20 cursor-grab active:cursor-grabbing transition-opacity"
            >
                <GripVertical className="w-10 h-10 text-white drop-shadow-md" />
            </div>

            {/* Mobile Drag Handle (Always visible on touch) */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-2 right-8 bg-white/80 p-1.5 rounded border border-slate-200 shadow-sm sm:hidden cursor-grab active:cursor-grabbing z-30"
            >
                <GripVertical className="w-5 h-5 text-slate-600" />
            </div>

            {/* Numbering Badge (Top-Left) */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10 pointer-events-none">
                {index + 1}
            </div>

            {/* Size Overlay */}
            {size && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none z-10">
                    {(size / (1024 * 1024)).toFixed(2)} MB
                </div>
            )}

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full transition-all z-20"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function VideoUploader({ initialVideos = [], onVideosChange }: VideoUploaderProps) {
    const [videos, setVideos] = useState<string[]>(initialVideos);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [videoSizes, setVideoSizes] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = videos.indexOf(active.id as string);
            const newIndex = videos.indexOf(over.id as string);

            const updatedVideos = arrayMove(videos, oldIndex, newIndex);
            setVideos(updatedVideos);
            onVideosChange(updatedVideos);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const files = Array.from(e.target.files);
        const newUrls: string[] = [];
        const newSizes: Record<string, number> = {};

        try {
            const supabase = createClient();

            for (const file of files) {
                if (file.size > 5 * 1024 * 1024 * 1024) {
                    alert(`ファイルサイズ制限超え (5GBまで): ${file.name}`);
                    continue;
                }

                const fileExt = file.name.split('.').pop() || 'mp4';
                const fileName = `videos/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                // 1. Get Signed URL
                const { signedUrl, error: signError } = await getSignedUploadUrlAction(fileName);
                if (signError) throw new Error(signError);
                if (!signedUrl) throw new Error('Signed URL generated empty');

                // 2. Upload via XHR
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', signedUrl);
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setUploadProgress(percent);
                        }
                    };
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) resolve();
                        else reject(new Error(`Status ${xhr.status}`));
                    };
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send(file);
                });

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                newUrls.push(publicUrl);
                newSizes[publicUrl] = file.size;
                setUploadProgress(100);
                await new Promise(resolve => setTimeout(resolve, 300));
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
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeVideo = async (indexToRemove: number) => {
        const urlToRemove = videos[indexToRemove];
        if (!urlToRemove) return;

        try {
            const url = new URL(urlToRemove);
            const pathParts = url.pathname.split('/products/');
            if (pathParts.length > 1) {
                const storagePath = decodeURIComponent(pathParts[1]);
                await deleteFileAction(storagePath);
            }
        } catch (error) {
            console.error('Error extracting path for deletion:', error);
        }

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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={videos}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="grid grid-cols-1 gap-3">
                        {videos.map((url, index) => (
                            <SortableVideoItem
                                key={url}
                                id={url}
                                url={url}
                                index={index}
                                size={videoSizes[url]}
                                onRemove={removeVideo}
                            />
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
                                <div className="flex flex-col items-center gap-3 w-full px-6 relative">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        <span className="text-sm font-bold text-slate-700">
                                            {uploadProgress === 100 ? '完了！' : `アップロード中... ${uploadProgress || 0}%`}
                                        </span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2 w-full max-w-[200px]" />
                                </div>
                            ) : (
                                <>
                                    <Video className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm font-bold text-slate-500 text-center px-4">動画を追加 (MP4など)</span>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                        <Info className="w-3.5 h-3.5" />
                                        <span className="text-xs">制限: 5GB以下</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </SortableContext>
            </DndContext>

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
