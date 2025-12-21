'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Review } from '@/types/index';
import { deleteReview } from '@/actions/review';
import { Button } from '@/components/ui/button';
import { StarRating } from './star-rating';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil } from 'lucide-react';
import { ReviewEditDialog } from './review-edit-dialog';

interface ReviewCardProps {
    review: Review;
    currentUserId?: string | null;
    isAdmin?: boolean;
    onDelete?: () => void;
    onUpdate?: () => void;
}

export function ReviewCard({ review, currentUserId, isAdmin = false, onDelete, onUpdate }: ReviewCardProps) {
    const [editOpen, setEditOpen] = useState(false);
    const isNew = React.useMemo(() => {
        if (!review.review_date) return false;
        const reviewDate = new Date(review.review_date);
        const today = new Date();
        const diffTime = today.getTime() - reviewDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays <= 7;
    }, [review.review_date]);

    // Check ownership OR admin status
    const canEdit = isAdmin || (currentUserId && review.user_id === currentUserId);

    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('本当にこのレビューを削除しますか？')) return;

        const result = await deleteReview(review.id);
        if (result.success) {
            alert('削除しました');
            if (onDelete) {
                onDelete();
            } else {
                router.refresh();
            }
        } else {
            alert('エラー: ' + result.error);
        }
    };

    return (
        <div className={`p-4 rounded-sm shadow-sm space-y-3 relative ${!review.is_published ? 'bg-slate-100' : isNew ? 'bg-[#FFFaf0]' : 'bg-white'}`}>
            {/* Header: Stars & Title & User Info */}
            <div className={`flex flex-wrap items-center justify-between ${canEdit ? 'pr-16' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                    <StarRating rating={review.star} size="sm" />
                    <span className="font-bold text-slate-800">{review.nickname || '名無し'}</span>

                    {isNew && (
                        <Badge className="bg-[#EAB308] hover:bg-[#CA8A04] text-white font-bold text-xs rounded-sm px-1.5 py-0.5 border-none">
                            NEW
                        </Badge>
                    )}
                    {isAdmin && !review.is_published && (
                        <Badge variant="outline" className="text-slate-500 border-slate-400 font-bold text-xs rounded-sm px-1.5 py-0.5">
                            非公開
                        </Badge>
                    )}
                </div>
            </div>

            {/* Top Right Zone: Type Badge & Actions */}
            <div className="absolute top-4 right-3 flex items-start gap-3 z-10">
                {/* Request Type Badge */}
                {review.request_type && (
                    <Badge
                        variant="outline"
                        className="px-2.5 py-0.5 text-xs font-medium border rounded-md bg-slate-50 text-slate-600 border-slate-200"
                    >
                        {review.request_type === 'buyback' ? '買取' : '購入'}
                    </Badge>
                )}

                {/* Actions (Edit/Delete) */}
                {canEdit && (
                    <div className="flex flex-col gap-3">
                        <button
                            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-700 transition-colors group"
                            onClick={() => setEditOpen(true)}
                        >
                            <div className="border border-slate-300 rounded p-1 group-hover:bg-slate-50">
                                <Pencil className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold">編集</span>
                        </button>

                        <button
                            className="flex flex-col items-center gap-0.5 text-red-500 hover:text-red-600 transition-colors group"
                            onClick={handleDelete}
                        >
                            <div className="border border-red-200 rounded p-1 group-hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold">削除</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Comment */}
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap pr-12">
                {review.comment}
            </p>

            {/* Footer: Date & Game */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex gap-4">
                    <span className="font-bold text-slate-800 tracking-wide">{review.review_date?.replace(/-/g, '/')}</span>
                    {review.manual_stock_no && <span className="font-medium text-slate-600">{review.manual_stock_no}</span>}
                </div>
            </div>

            <ReviewEditDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                review={review}
                onUpdate={onUpdate}
                isAdmin={isAdmin}
            />
        </div>
    );
}
