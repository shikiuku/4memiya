'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { createReview } from '@/actions/review';

export default function CreateReviewPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        star: '5',
        comment: '',
        nickname: '',
        request_type: 'buyback',
        manual_stock_no: '',
        manual_price: '',
        review_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createReview({
                star: parseInt(formData.star),
                comment: formData.comment,
                nickname: formData.nickname,
                request_type: formData.request_type as 'buyback' | 'purchase',
                manual_stock_no: formData.request_type === 'purchase' && formData.manual_stock_no ? (formData.manual_stock_no.startsWith('No.') ? formData.manual_stock_no : `No.${formData.manual_stock_no}`) : null,
                manual_price: formData.manual_price ? parseInt(formData.manual_price) : null,
                review_date: formData.review_date,
                is_published: true,
                user_id: null // Admin created reviews don't link to a specific app user by default
            });

            if (result.success) {
                router.push('/dev/reviews');
                router.refresh();
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
        <div className="container mx-auto py-10 max-w-2xl space-y-6">
            <div>
                <Link href="/dev/reviews" className="text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    一覧に戻る
                </Link>
                <h1 className="text-3xl font-bold">レビュー新規作成</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>レビュー情報入力</CardTitle>
                        <CardDescription>
                            お客様から頂いた声を元に、表示用のレビューを作成します。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Star Rating */}
                        <div className="space-y-2">
                            <Label>評価（星）</Label>
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

                        {/* Comment */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">コメント内容</Label>
                            <Textarea
                                id="comment"
                                placeholder="すごく丁寧に対応して頂きました！"
                                required
                                value={formData.comment}
                                onChange={(e) => handleChange('comment', e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Request Type */}
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
                                    <SelectItem value="buyback">買取</SelectItem>
                                    <SelectItem value="purchase">購入</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nickname */}
                        <div className="space-y-2">
                            <Label htmlFor="nickname">ニックネーム</Label>
                            <Input
                                id="nickname"
                                value={formData.nickname}
                                onChange={(e) => handleChange('nickname', e.target.value)}
                                placeholder="あなたのニックネームを入力"
                            />
                        </div>

                        {/* Manual Stock No / Price */}
                        <div className="grid grid-cols-2 gap-4">
                            {formData.request_type === 'purchase' && (
                                <div className="space-y-2">
                                    <Label htmlFor="manual_stock_no">在庫番号 (購入時のみ)</Label>
                                    <Input
                                        id="manual_stock_no"
                                        value={formData.manual_stock_no}
                                        onChange={(e) => handleChange('manual_stock_no', e.target.value)}
                                        placeholder="No.123"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="manual_price">買取価格 (任意)</Label>
                                <Input
                                    id="manual_price"
                                    type="number"
                                    value={formData.manual_price}
                                    onChange={(e) => handleChange('manual_price', e.target.value)}
                                    placeholder="50000"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="review_date">日付</Label>
                            <Input
                                id="review_date"
                                type="date"
                                value={formData.review_date}
                                onChange={(e) => handleChange('review_date', e.target.value)}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Link href="/dev/reviews">
                            <Button variant="outline" type="button">キャンセル</Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            作成する
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
