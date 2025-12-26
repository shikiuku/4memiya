'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { uploadImageAction, deleteFileAction, getSignedUploadUrlAction } from '@/actions/admin/upload';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
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
import { Progress } from '@/components/ui/progress';

interface ImageUploaderProps {
    initialImages?: string[];
    onImagesChange: (urls: string[]) => void;
}

interface SortableImageItemProps {
    id: string;
    url: string;
    index: number;
    size?: number;
    onRemove: (index: number) => void;
    formatSize: (bytes: number) => string;
}

function SortableImageItem({ id, url, index, size, onRemove, formatSize }: SortableImageItemProps) {
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
            <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
            />

            {/* Drag Handle Overlay */}
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 bg-black/20 cursor-grab active:cursor-grabbing transition-opacity"
            >
                <GripVertical className="w-8 h-8 text-white drop-shadow-md" />
            </div>

            {/* Mobile Drag Handle (Always visible on touch) */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-1 right-1 bg-white/80 p-1 rounded border border-slate-200 shadow-sm sm:hidden cursor-grab active:cursor-grabbing z-30"
            >
                <GripVertical className="w-4 h-4 text-slate-600" />
            </div>

            {/* Numbering Badge (Top-Left) */}
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

            {size && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-mono z-10">
                    {formatSize(size)}
                </div>
            )}
        </div>
    );
}

export function ImageUploader({ initialImages = [], onImagesChange }: ImageUploaderProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [imageSizes, setImageSizes] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
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
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);

            const updatedImages = arrayMove(images, oldIndex, newIndex);
            setImages(updatedImages);
            onImagesChange(updatedImages);
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
                // Compress image
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                    onProgress: (percent: number) => {
                        setUploadProgress(Math.floor(percent * 0.1));
                    }
                };

                let compressedFile = file;
                try {
                    compressedFile = await imageCompression(file, options);
                } catch (error) {
                    console.error('Compression failed:', error);
                }

                const fileExt = compressedFile.name.split('.').pop() || 'jpg';
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                // 1. Get Signed URL
                const { signedUrl, error: signError } = await getSignedUploadUrlAction(fileName);
                if (signError) throw new Error(signError);
                if (!signedUrl) throw new Error('Signed URL empty');

                // 2. Upload via XHR for progress
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', signedUrl);
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 90);
                            setUploadProgress(10 + percent);
                        }
                    };
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) resolve();
                        else reject(new Error(`Upload failed ${xhr.status}`));
                    };
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send(compressedFile);
                });

                setUploadProgress(100);
                await new Promise(resolve => setTimeout(resolve, 300));

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

                if (publicUrl) {
                    newUrls.push(publicUrl);
                    newSizes[publicUrl] = compressedFile.size;
                }
            }

            const updatedImages = [...images, ...newUrls];
            setImages(updatedImages);
            setImageSizes(prev => ({ ...prev, ...newSizes }));
            onImagesChange(updatedImages);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('画像のアップロードに失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = async (indexToRemove: number) => {
        const urlToRemove = images[indexToRemove];
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

        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        setImages(updatedImages);
        setImageSizes(prev => {
            const newSizes = { ...prev };
            delete newSizes[urlToRemove];
            return newSizes;
        });
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={images}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-2 gap-3">
                        {images.map((url, index) => (
                            <SortableImageItem
                                key={url}
                                id={url}
                                url={url}
                                index={index}
                                size={imageSizes[url]}
                                onRemove={removeImage}
                                formatSize={formatSize}
                            />
                        ))}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                aspect-square rounded-lg border-2 border-dashed border-slate-300 
                                flex flex-col items-center justify-center cursor-pointer 
                                hover:bg-slate-50 hover:border-blue-400 transition-colors
                                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                            `}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-1.5 w-full px-2 text-center">
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                        <span className="text-[10px] font-bold text-slate-700 leading-none">アップロード中 {uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-1 w-full" />
                                </div>
                            ) : (
                                <>
                                    <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                                    <span className="text-xs font-bold text-slate-500">追加</span>
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
                accept="image/*"
                multiple
                onChange={handleFileSelect}
            />

            <textarea
                name="images"
                value={images.join('\n')}
                readOnly
                className="hidden"
            />
        </div>
    );
}
