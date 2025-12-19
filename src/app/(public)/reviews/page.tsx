import React from 'react';
import { getReviews } from '@/actions/review';
import { ReviewCard } from '@/components/features/reviews/review-card';
import { ReviewSubmissionDialog } from '@/components/features/reviews/review-submission-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const reviews = await getReviews(100);
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-[#555] text-white p-3 rounded-sm shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center">
                        <span className="text-[#555] text-sm font-bold">●</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">みんなのレビュー</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-yellow-400">
                                <span className="text-lg font-bold mr-1">{averageRating}</span>
                                <span className="text-xs text-slate-300">({reviews.length}件)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* "Place to write review" - Dialog Popup */}
                <ReviewSubmissionDialog />
            </div>

            {/* Review List */}
            {reviews.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-xl">
                    まだレビューがありません。
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
