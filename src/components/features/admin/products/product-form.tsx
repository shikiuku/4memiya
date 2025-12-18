'use client';

import { useActionState } from 'react'; // or useFormState depending on version
import { saveProduct } from '@/actions/admin/product';
import { Button } from '@/components/ui/button';
import { TagSelector } from '@/components/features/admin/products/tag-selector';
import { ImageUploader } from '@/components/features/admin/products/image-uploader';
import { ImagePlus, Save } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

const initialState = {
    error: '',
    message: ''
};

interface ProductFormProps {
    suggestedTags?: string[];
    initialData?: Product;
    defaultSeqId?: number;
}

export function ProductForm({ suggestedTags = [], initialData, defaultSeqId }: ProductFormProps) {
    const [state, formAction, isPending] = useActionState(saveProduct, initialState);

    return (
        <form action={formAction} className="space-y-8 max-w-4xl mx-auto pb-20">
            {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dev/products">
                        <Button variant="outline" size="sm">
                            ← 一覧へ戻る
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{initialData ? '在庫編集' : '新規在庫追加'}</h1>
                </div>
                <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    <Save className="w-4 h-4 mr-2" />
                    {isPending ? '保存中...' : '保存して公開'}
                </Button>
            </div>

            {state?.error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left: 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <h2 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">基本情報</h2>

                        <div className="grid grid-cols-4 gap-4 items-end">
                            <div className="col-span-3">
                                <label className="block text-sm font-bold text-slate-700 mb-1">商品名 (タイトル)</label>
                                <input
                                    name="title"
                                    defaultValue={initialData?.title}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="例: 【運極300】ルシファー運極 ガチャ限500体"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1">No. (ID)</label>
                                <input
                                    name="seq_id"
                                    type="number"
                                    defaultValue={initialData?.seq_id ?? defaultSeqId}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">価格 (円)</label>
                                <input
                                    name="price"
                                    type="number"
                                    defaultValue={initialData?.price}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="10000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">タグ</label>
                            <TagSelector
                                suggestedTags={suggestedTags}
                                initialTags={initialData?.tags || []}
                            />
                        </div>
                    </div>

                    {/* Account Specs */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <h2 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">アカウント詳細</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">ランク</label>
                                <input
                                    name="rank"
                                    type="number"
                                    defaultValue={initialData?.rank}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="1500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">運極数</label>
                                <input
                                    name="luck_max"
                                    type="number"
                                    defaultValue={initialData?.luck_max}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">ガチャ限数</label>
                                <input
                                    name="gacha_charas"
                                    type="number"
                                    defaultValue={initialData?.gacha_charas}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">平均紋章力</label>
                                <input
                                    name="badge_power"
                                    type="number"
                                    defaultValue={initialData?.badge_power}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="5000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <h2 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">アピールポイント</h2>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">このアカウントのポイント (詳細説明)</label>
                            <textarea
                                name="description_points"
                                defaultValue={initialData?.description_points || ''}
                                rows={6}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="轟絶運極多数！天魔制覇済み！..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">こんな人におすすめ</label>
                            <textarea
                                name="description_recommend"
                                defaultValue={initialData?.description_recommend || ''}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="高難易度をすぐに周回したい方におすすめです。"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right: 1 col) */}
                <div className="space-y-6 order-first lg:order-none">
                    {/* Images */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <h2 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4 flex items-center">
                            <ImagePlus className="w-5 h-5 mr-2" />
                            商品画像
                        </h2>

                        <div className="text-sm text-slate-500 mb-2">
                            商品画像をアップロードしてください。
                        </div>
                        <ImageUploader
                            initialImages={initialData?.images || []}
                            onImagesChange={() => { }} // State handled internally via hidden input for form submission
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
