'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquarePlus, Loader2 } from 'lucide-react';
import { submitReview } from '@/actions/review';

export function ReviewSubmissionDialog() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        star: '5',
        nickname: '',
        comment: '',
        manual_stock_no: '',
        request_type: 'buyback' // Default
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await submitReview({
                star: parseInt(formData.star),
                comment: formData.comment,
                nickname: formData.nickname,
                request_type: formData.request_type as 'buyback' | 'purchase',
                manual_stock_no: formData.request_type === 'purchase' ? `No.${formData.manual_stock_no}` : null
            });

            if (result.success) {
                alert('レビューを投稿しました。');
                setOpen(false);
                setFormData({ star: '5', nickname: '', comment: '', manual_stock_no: '', request_type: 'buyback' });
                // Optional: refresh page to see it
                window.location.reload();
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-200 hover:bg-white/10 h-8 text-xs gap-1">
                    <MessageSquarePlus className="w-3 h-3" />
                    レビューを投稿する
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>レビューを投稿</DialogTitle>
                    <DialogDescription>
                        ご購入いただいた商品の感想をお聞かせください。<br />
                        ※投稿内容は確認後に公開されます。
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
                                <SelectItem value="buyback">買取 (売却)</SelectItem>
                                <SelectItem value="purchase">購入</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nickname">ニックネーム</Label>
                        <Input
                            id="nickname"
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
                            <Label htmlFor="manual_stock_no">商品番号 (数字のみ)</Label>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-500">No.</span>
                                <Input
                                    id="manual_stock_no"
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
                        <Label htmlFor="comment">感想・コメント</Label>
                        <Textarea
                            id="comment"
                            placeholder="丁寧な対応ありがとうございました！"
                            required
                            className="min-h-[100px]"
                            value={formData.comment}
                            onChange={(e) => handleChange('comment', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            投稿する
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}
