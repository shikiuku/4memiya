'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { uploadImageAction } from '@/actions/admin/upload';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
    initialImages?: string[];
    onImagesChange: (urls: string[]) => void;
}

export function ImageUploader({ initialImages = [], onImagesChange }: ImageUploaderProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [imageSizes, setImageSizes] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];
        const newSizes: Record<string, number> = {};

        try {
            for (const file of files) {
                // Compress image
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                let compressedFile = file;
                try {
                    compressedFile = await imageCompression(file, options);
                    console.log(`Compressed: ${file.size} -> ${compressedFile.size}`);
                } catch (error) {
                    console.error('Compression failed:', error);
                    // Continue with original file if compression fails
                }

                // Use Server Action for upload to bypass RLS
                const formData = new FormData();
                formData.append('file', compressedFile);

                const result = await uploadImageAction(formData);

                if (result.error) {
                    throw new Error(result.error);
                }

                if (result.url) {
                    newUrls.push(result.url);
                    newSizes[result.url] = compressedFile.size;
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

    const removeImage = (indexToRemove: number) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        const urlToRemove = images[indexToRemove];
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
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        {imageSizes[url] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-mono">
                                {formatSize(imageSizes[url])}
                            </div>
                        )}
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
