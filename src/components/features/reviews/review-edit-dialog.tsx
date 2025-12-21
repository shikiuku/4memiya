'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateReviewContent } from '@/actions/review';
import { Review } from '@/types/index';

interface ReviewEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review: Review;
    onUpdate?: () => void;
    isAdmin?: boolean;
}

export function ReviewEditDialog({ open, onOpenChange, review, onUpdate, isAdmin = false }: ReviewEditDialogProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        star: review.star.toString(),
        nickname: review.nickname || '',
        comment: review.comment || '',
        manual_stock_no: review.manual_stock_no?.replace('No.', '') || '',
        request_type: review.request_type || 'buyback',
        is_published: review.is_published ?? true
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await updateReviewContent(review.id, {
                star: parseInt(formData.star),
                comment: formData.comment,
                nickname: formData.nickname,
                request_type: formData.request_type as 'buyback' | 'purchase',
                manual_stock_no: formData.request_type === 'purchase' && formData.manual_stock_no ? `No.${formData.manual_stock_no}` : null,
                is_published: formData.is_published
            });

            if (result.success) {
                alert('レビューを更新しました。');
                onOpenChange(false);
                if (onUpdate) {
                    onUpdate();
                } else {
                    router.refresh();
                }
            } else {
                alert('エラーが発生しました: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('予期せぬエラーが発生しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>レビューを編集</DialogTitle>
                    <DialogDescription>
                        投稿内容を修正できます。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>依頼内容</Label>
                        <Select
                            value={formData.request_type || ''}
                            onValueChange={(v) => handleChange('request_type', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="買取 or購入を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="purchase">購入</SelectItem>
                                <SelectItem value="buyback">買取</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit_nickname">ニックネーム</Label>
                        <Input
                            id="edit_nickname"
                            placeholder="あなたのニックネームを入力"
                            value={formData.nickname}
                            onChange={(e) => handleChange('nickname', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>評価</Label>
                        <Select value={formData.star} onValueChange={(v) => handleChange('star', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="評価を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <SelectItem key={star} value={star.toString()}>
                                        <div className="flex items-center text-yellow-500 font-bold">
                                            {Array(star).fill(0).map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-current mr-1" />
                                            ))}
                                            <span className="text-slate-700 ml-2">({star})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.request_type === 'purchase' && (
                        <div className="space-y-2">
                            <Label htmlFor="edit_manual_stock_no">商品番号 (数字のみ)</Label>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500">No.</span>
                                <Input
                                    id="edit_manual_stock_no"
                                    type="number"
                                    placeholder="123"
                                    required
                                    value={formData.manual_stock_no}
                                    onChange={(e) => handleChange('manual_stock_no', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="edit_comment">感想・コメント</Label>
                        <Textarea
                            id="edit_comment"
                            placeholder="丁寧な対応ありがとうございました！"
                            required
                            className="min-h-[100px]"
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                        />
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-2 pt-2">
                            <Label htmlFor="is_published" className="cursor-pointer">公開ステータス:</Label>
                            <select
                                id="is_published"
                                className="border rounded p-1 text-sm bg-white"
                                value={formData.is_published ? 'true' : 'false'}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.value === 'true' }))}
                            >
                                <option value="true">公開</option>
                                <option value="false">非公開</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            更新する
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
