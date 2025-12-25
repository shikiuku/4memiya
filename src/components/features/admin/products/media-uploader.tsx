'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Video, X, Loader2, GripVertical, Info } from 'lucide-react';
import Image from 'next/image';
import { uploadImageAction, uploadVideoAction } from '@/actions/admin/upload';
import imageCompression from 'browser-image-compression';
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
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    size?: number;
}

interface MediaUploaderProps {
    initialImages?: string[];
    initialVideos?: string[];
    onMediaChange?: (items: MediaItem[]) => void;
}

interface SortableMediaItemProps {
    id: string;
    item: MediaItem;
    index: number;
    onRemove: (index: number) => void;
    formatSize: (bytes: number) => string;
}

function SortableMediaItem({ id, item, index, onRemove, formatSize }: SortableMediaItemProps) {
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
            className={`relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-50 ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''
                }`}
        >
            {item.type === 'image' ? (
                <Image
                    src={item.url}
                    alt={`Media ${index + 1}`}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <video
                        src={item.url}
                        className="w-full h-full object-contain pointer-events-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Video className="w-8 h-8 text-white/70" />
                    </div>
                </div>
            )}

            {/* Drag Handle Overlay */}
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 bg-black/20 cursor-grab active:cursor-grabbing transition-opacity"
            >
                <GripVertical className="w-8 h-8 text-white drop-shadow-md" />
            </div>

            {/* Mobile Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-1 right-1 bg-white/80 p-1 rounded border border-slate-200 shadow-sm sm:hidden cursor-grab active:cursor-grabbing z-30"
            >
                <GripVertical className="w-4 h-4 text-slate-600" />
            </div>

            {/* Numbering Badge */}
            <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md z-10 pointer-events-none">
                {index + 1}
            </div>

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full transition-all z-20"
            >
                <X className="w-3 h-3" />
            </button>

            {item.size && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-mono z-10">
                    {formatSize(item.size)}
                </div>
            )}
        </div>
    );
}

export function MediaUploader({ initialImages = [], initialVideos = [], onMediaChange }: MediaUploaderProps) {
    const isVideoUrl = (url: string) => {
        return url.includes('/videos/') || url.includes('video-') || url.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    // Combine initial items carefully
    const combinedInitial: MediaItem[] = (initialImages || []).map(url => ({
        url,
        type: isVideoUrl(url) ? 'video' as const : 'image' as const
    }));

    // Add movies if not already in images list (legacy)
    if (initialVideos) {
        initialVideos.forEach(vUrl => {
            if (!combinedInitial.some(item => item.url === vUrl)) {
                combinedInitial.push({ url: vUrl, type: 'video' as const });
            }
        });
    }

    const [items, setItems] = useState<MediaItem[]>(combinedInitial);
    const [isUploading, setIsUploading] = useState(false);
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

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.url === active.id);
            const newIndex = items.findIndex(item => item.url === over.id);

            const updatedItems = arrayMove(items, oldIndex, newIndex);
            setItems(updatedItems);
            onMediaChange?.(updatedItems);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const newItems: MediaItem[] = [];

        try {
            for (const file of files) {
                let url = '';
                let size = file.size;
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');

                if (isImage) {
                    const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1280,
                        useWebWorker: true,
                    };
                    let compressedFile = file;
                    try {
                        compressedFile = await imageCompression(file, options);
                        size = compressedFile.size;
                    } catch (error) {
                        console.error('Compression failed:', error);
                    }

                    const formData = new FormData();
                    formData.append('file', compressedFile);
                    const result = await uploadImageAction(formData);
                    if (result.error) throw new Error(result.error);
                    url = result.url || '';
                } else if (isVideo) {
                    if (file.size > 50 * 1024 * 1024) {
                        alert(`動画サイズが制限(50MB)を超えています: ${file.name}`);
                        continue;
                    }
                    const formData = new FormData();
                    formData.append('file', file);
                    const result = await uploadVideoAction(formData);
                    if (result.error) throw new Error(result.error);
                    url = result.url || '';
                } else {
                    continue;
                }

                if (url) {
                    newItems.push({ url, type: isImage ? 'image' : 'video', size });
                }
            }

            const updatedItems = [...items, ...newItems];
            setItems(updatedItems);
            onMediaChange?.(updatedItems);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('アップロードに失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeMedia = (indexToRemove: number) => {
        const updatedItems = items.filter((_, index) => index !== indexToRemove);
        setItems(updatedItems);
        onMediaChange?.(updatedItems);
    };

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(item => item.url)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((item, index) => (
                            <SortableMediaItem
                                key={item.url}
                                id={item.url}
                                item={item}
                                index={index}
                                onRemove={removeMedia}
                                formatSize={formatSize}
                            />
                        ))}

                        {/* Unified Add Button */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                aspect-square rounded-lg border-2 border-dashed border-slate-300 
                                flex flex-col items-center justify-center cursor-pointer 
                                hover:bg-slate-50 hover:border-blue-400 transition-colors
                                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                            `}
                        >
                            <div className="flex gap-1 mb-1">
                                <ImagePlus className="w-5 h-5 text-slate-400" />
                                <Video className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">追加 (画像・動画)</span>
                        </div>
                    </div>
                </SortableContext>
            </DndContext>

            {isUploading && (
                <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    アップロード中...
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
            />

            {/* Hidden Inputs for Form Submission */}
            <textarea
                name="images"
                value={items.map(i => i.url).join('\n')}
                readOnly
                className="hidden"
            />
            {/* Still keep movies separately for backend compatibility if it filters them there */}
            <textarea
                name="movies"
                value={items.filter(i => i.type === 'video').map(i => i.url).join('\n')}
                readOnly
                className="hidden"
            />

            <div className="flex items-start gap-1.5 p-3 bg-slate-50 rounded border border-slate-200 text-slate-500">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-relaxed">
                    並び順は自由に入れ替え可能です。1枚目のメディアがトップ画像として表示されます。動画は50MB以下を推奨します。
                </div>
            </div>
        </div>
    );
}
