import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, X, Loader2, Info, GripVertical } from 'lucide-react';
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
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 cursor-grab active:cursor-grabbing transition-opacity"
            >
                <GripVertical className="w-10 h-10 text-white drop-shadow-md" />
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
    const [videoSizes, setVideoSizes] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
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
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];
        const newSizes: Record<string, number> = {};

        try {
            const supabase = createClient();

            for (const file of files) {
                // Check file size (Supabase Free limit is 50MB)
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
                newSizes[publicUrl] = file.size;
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
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    <span className="text-xs text-slate-500">アップロード中...</span>
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
