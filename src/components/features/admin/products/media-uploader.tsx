'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Video, X, Loader2, GripVertical, Info, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { uploadImageAction, deleteFileAction, getSignedUploadUrlAction } from '@/actions/admin/upload';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Progress } from '@/components/ui/progress';

export type MediaType = 'image' | 'video';

export interface MediaItem {
    url: string;
    type: MediaType;
    size?: number;
}

interface MediaUploaderProps {
    initialMedia?: MediaItem[];
    onMediaChange: (items: MediaItem[]) => void;
}

interface SortableMediaItemProps {
    id: string;
    item: MediaItem;
    index: number;
    onRemove: (index: number) => void;
}

function SortableMediaItem({ id, item, index, onRemove }: SortableMediaItemProps) {
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
        touchAction: 'none' as const, // Android: Prevent scroll conflict during drag
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-900 ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''
                }`}
        >
            {item.type === 'image' ? (
                <Image
                    src={item.url}
                    alt={`Product media ${index + 1}`}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                        src={item.url}
                        className="w-full h-full object-contain pointer-events-none"
                        muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-10 h-10 text-white/70 bg-black/20 rounded-full" />
                    </div>
                </div>
            )}

            {/* Drag Handle Overlay */}
            <div
                {...attributes}
                {...listeners}
                className={`absolute inset-0 flex items-center justify-center bg-black/20 cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'
                    }`}
            >
                <GripVertical className="w-10 h-10 text-white drop-shadow-md" />
            </div>

            {/* Numbering Badge (Top-Left) */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10 pointer-events-none">
                {index + 1}
            </div>

            {/* Type Icon Overlay (Top-Right under X) */}
            <div className="absolute top-2 right-9 text-white/50 pointer-events-none drop-shadow-sm">
                {item.type === 'image' ? <ImagePlus className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </div>

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full transition-all z-20"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            {item.size && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none z-10">
                    {formatSize(item.size)}
                </div>
            )}
        </div>
    );
}

export function MediaUploader({ initialMedia = [], onMediaChange }: MediaUploaderProps) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [hasMounted, setHasMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // 通知用：ステートが変わったら親に知らせる
    useEffect(() => {
        onMediaChange(mediaItems);
    }, [mediaItems, onMediaChange]);

    // プロップからの初期同期（初回のみ、または長さが変わった時だけ同期）
    useEffect(() => {
        if (initialMedia.length > 0 && mediaItems.length === 0) {
            setMediaItems(initialMedia);
        }
    }, [initialMedia, mediaItems.length]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            // Android: Long press (250ms) to start dragging, preventing scroll conflict
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
            const oldIndex = mediaItems.findIndex(item => item.url === active.id);
            const newIndex = mediaItems.findIndex(item => item.url === over.id);

            const updatedItems = arrayMove(mediaItems, oldIndex, newIndex);
            setMediaItems(updatedItems);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const files = Array.from(e.target.files);

        try {
            const supabase = createClient();

            for (const file of files) {
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');

                let newItem: MediaItem | null = null;
                let uploadFile: File | Blob = file;

                if (isVideo) {
                    if (file.size > 500 * 1024 * 1024) {
                        alert(`動画サイズが500MBを超えています: ${file.name}`);
                        continue;
                    }
                } else if (isImage) {
                    const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1280,
                        useWebWorker: true,
                        onProgress: (percent: number) => {
                            // Compression: 0-10%
                            setUploadProgress(Math.floor(percent * 0.1));
                        }
                    };
                    uploadFile = await imageCompression(file, options);
                }

                const fileExt = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4');
                const folder = isVideo ? 'videos/' : '';
                const fileName = `${folder}${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                // 1. Get Signed URL from Server (Bypass RLS)
                const { signedUrl, error: signError } = await getSignedUploadUrlAction(fileName);
                if (signError) throw new Error(signError);
                if (!signedUrl) throw new Error('Signed URL generated was empty');

                // 2. Upload via XMLHttpRequest for GRANULAR progress
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', signedUrl);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 90);
                            // Real-time byte tracking: 10% (compression) + 0-90% (upload)
                            setUploadProgress(10 + percent);
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network error during upload'));
                    xhr.send(uploadFile);
                });

                setUploadProgress(100);
                await new Promise(resolve => setTimeout(resolve, 300));

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                newItem = { url: publicUrl, type: isVideo ? 'video' : 'image', size: uploadFile.size };

                if (newItem) {
                    setMediaItems(prev => [...prev, newItem!]);
                }
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('アップロードに失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeMedia = async (indexToRemove: number) => {
        const itemToRemove = mediaItems[indexToRemove];
        if (!itemToRemove) return;

        // Extract path from URL
        try {
            const url = new URL(itemToRemove.url);
            const pathParts = url.pathname.split('/products/');
            if (pathParts.length > 1) {
                const storagePath = decodeURIComponent(pathParts[1]);
                // Physical deletion from storage
                await deleteFileAction(storagePath);
            }
        } catch (error) {
            console.error('Error extracting path for deletion:', error);
        }

        const updatedItems = mediaItems.filter((_, index) => index !== indexToRemove);
        setMediaItems(updatedItems);
        onMediaChange(updatedItems);
    };

    if (!hasMounted) return null;
    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={mediaItems.map(item => item.url)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4">
                        {mediaItems.map((item, index) => (
                            <SortableMediaItem
                                key={item.url}
                                id={item.url}
                                item={item}
                                index={index}
                                onRemove={removeMedia}
                            />
                        ))}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                aspect-square rounded-lg border-2 border-dashed border-blue-400 
                                flex flex-col items-center justify-center cursor-pointer 
                                hover:bg-blue-50 transition-colors bg-white
                                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                            `}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-1.5 w-full px-2 text-center">
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                                        <span className="text-[10px] font-bold text-slate-700 leading-none">
                                            {uploadProgress === 100 ? '完了' : `アップロード中 ${uploadProgress}%`}
                                        </span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-1 w-full" />
                                </div>
                            ) : (
                                <>
                                    <ImagePlus className="w-8 h-8 text-blue-400 mb-1" />
                                    <span className="text-sm font-bold text-slate-500">追加</span>
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
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
            />
        </div>
    );
}
