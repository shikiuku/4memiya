'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { uploadImageAction } from '@/actions/admin/upload';

interface ImageUploaderProps {
    initialImages?: string[];
    onImagesChange: (urls: string[]) => void;
}

export function ImageUploader({ initialImages = [], onImagesChange }: ImageUploaderProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                // Use Server Action for upload to bypass RLS
                const formData = new FormData();
                formData.append('file', file);

                const result = await uploadImageAction(formData);

                if (result.error) {
                    throw new Error(result.error);
                }

                if (result.url) {
                    newUrls.push(result.url);
                }
            }

            const updatedImages = [...images, ...newUrls];
            setImages(updatedImages);
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

    const removeImage = (indexToRemove: number) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-50">
                        <Image
                            src={url}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
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
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                            <span className="text-xs font-bold text-slate-500">追加</span>
                        </>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
            />

            {/* Hidden input to ensure data forms submission works if this is used inside a form without AJAX override, 
                though we are using server actions with formData. 
                We might need to use a hidden input field that joins these URLs so that standard form submission works easily if we don't assume the parent handles it fully manually via JS. 
                However, for the server action we mapped `images` field. 
                The `ProductForm` uses formData. Using a hidden textarea/input with the joined string is the easiest way to keep compatibility with the existing server action.
            */}
            <textarea
                name="images"
                value={images.join('\n')}
                readOnly
                className="hidden"
            />
        </div>
    );
}
