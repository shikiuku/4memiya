'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { getAdminReviews, deleteReview, updateReviewStatus } from '@/actions/review';
import { Review } from '@/types/index';
import { ReviewCard } from '@/components/features/reviews/review-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AdminReviewListPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        const data = await getAdminReviews(50);
        setReviews(data);
        setLoading(false);
    };

    const refreshReviews = async () => {
        // Silent refresh to keep scroll position
        const data = await getAdminReviews(50);
        setReviews(data);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('本当にこのレビューを削除しますか？')) return;

        const result = await deleteReview(id);
        if (result.success) {
            fetchReviews();
        } else {
            alert('削除に失敗しました: ' + result.error);
        }
    };

    const handleTogglePublish = async (review: Review) => {
        const newStatus = !review.is_published;
        const result = await updateReviewStatus(review.id, newStatus);
        if (result.success) {
            setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_published: newStatus } : r));
        } else {
            alert('更新に失敗しました: ' + result.error);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
            <div className="flex items-center justify-between bg-[#555] text-white p-3 rounded-sm shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
                        <span className="text-[#555] text-sm font-bold">●</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">お客様レビュー管理</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-yellow-400">
                                <span className="text-lg font-bold mr-1">{averageRating}</span>
                                <span className="text-xs text-slate-300">({reviews.length}件)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">読み込み中...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500">レビューがありません。</div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="relative">
                            <ReviewCard
                                review={review}
                                isAdmin={true}
                                onDelete={refreshReviews}
                                onUpdate={refreshReviews}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
