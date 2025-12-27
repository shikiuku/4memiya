'use client';

import { useState, useTransition, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleLike } from '@/actions/like';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    productId: string;
    initialIsLiked: boolean;
    initialLikeCount: number;
}

export function LikeButton({ productId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    // サーバーの初期状態からの差分を管理します
    const [countDelta, setCountDelta] = useState(0);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Props（サーバーからの最新データ）が変わったら、ローカル状態をリセットして同期する
    // これにより、router.refresh()でサーバーデータが更新された際、
    // 「サーバーデータ(1) + ローカル差分(1) = 2」のような二重カウントを防ぎます。
    useEffect(() => {
        setIsLiked(initialIsLiked);
        setCountDelta(0);
    }, [initialIsLiked, initialLikeCount]);

    const handleToggle = async () => {
        // 楽観的UI更新（即座に見た目を反映）
        const nextLiked = !isLiked;
        setIsLiked(nextLiked);

        // カウントの見た目を調整
        // 次が「いいね」なら +1、解除なら -1（現在の状態に対して）
        const deltaChange = nextLiked ? 1 : -1;
        setCountDelta(prev => prev + deltaChange);

        startTransition(async () => {
            try {
                await toggleLike(productId);
                router.refresh(); // バックグラウンドでサーバーの状態を同期
            } catch (error) {
                console.error("Like action failed", error);
                // エラー時は元に戻す
                setIsLiked(!nextLiked);
                setCountDelta(prev => prev - deltaChange);
            }
        });
    };

    // 表示する数 = 初期値 + 差分
    const displayCount = Math.max(0, initialLikeCount + countDelta);

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className="group flex items-center gap-1.5 px-3 h-10 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all"
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-colors",
                    isLiked ? "fill-red-500 text-red-500" : "text-slate-400 group-hover:text-red-400"
                )}
            />
            <span className={cn(
                "text-sm font-medium transition-colors",
                isLiked && "text-red-500"
            )}>
                {displayCount}
            </span>
        </Button>
    );
}
