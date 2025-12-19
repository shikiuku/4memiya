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

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
            {/* Header Section matching image style */}
            <div className="flex items-center justify-between bg-[#555] text-white p-3 rounded-sm shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                        <span className="text-[#555] text-xs font-bold">●</span>
                    </div>
                    <h1 className="text-lg font-bold">新着レビュー</h1>
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
