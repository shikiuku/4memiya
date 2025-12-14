'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

// Validation Schema
// Removed contactId as per user request
const formSchema = z.object({
    gameTitle: z.string().default('モンスターストライク'),
    rank: z.coerce.number().min(1, 'ランクを入力してください').max(9999, '正しいランクを入力してください'),
    luckMax: z.coerce.number().min(0, '0以上の数値を入力してください'),
    gachaLimit: z.coerce.number().min(0, '0以上の数値を入力してください'),
});

type FormData = z.infer<typeof formSchema>;

export default function AssessmentPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gameTitle: 'モンスターストライク',
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log(data);
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">査定依頼が完了しました</h2>
                        <p className="text-slate-600">
                            担当者が内容を確認いたします。
                        </p>
                    </div>
                    <Button className="w-full" onClick={() => setIsSuccess(false)}>
                        トップページへ戻る
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-100 py-6 px-4 text-center">
                <h1 className="text-xl font-bold text-slate-900">買取査定</h1>
            </div>

            <main className="container mx-auto max-w-md px-4 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-md border border-slate-200">

                    <div className="space-y-4">
                        {/* Game Title (Fixed) */}
                        <div className="space-y-2">
                            <Label htmlFor="gameTitle">ゲームタイトル</Label>
                            <Input
                                id="gameTitle"
                                {...register('gameTitle')}
                                disabled
                                className="bg-slate-100 text-slate-500 border-slate-200"
                            />
                        </div>

                        {/* Rank */}
                        <div className="space-y-2">
                            <Label htmlFor="rank">ランク</Label>
                            <div className="relative">
                                <Input
                                    id="rank"
                                    type="number"
                                    placeholder="例: 1500"
                                    {...register('rank')}
                                    className={errors.rank ? "border-red-500" : ""}
                                />
                                <div className="absolute right-3 top-2.5 text-xs text-slate-400">ランク</div>
                            </div>
                            {errors.rank && <p className="text-xs text-red-500">{errors.rank.message}</p>}
                        </div>

                        {/* Luck Max */}
                        <div className="space-y-2">
                            <Label htmlFor="luckMax">運極数</Label>
                            <div className="relative">
                                <Input
                                    id="luckMax"
                                    type="number"
                                    placeholder="例: 500"
                                    {...register('luckMax')}
                                    className={errors.luckMax ? "border-red-500" : ""}
                                />
                                <div className="absolute right-3 top-2.5 text-xs text-slate-400">体</div>
                            </div>
                            {errors.luckMax && <p className="text-xs text-red-500">{errors.luckMax.message}</p>}
                        </div>

                        {/* Gacha Limit */}
                        <div className="space-y-2">
                            <Label htmlFor="gachaLimit">ガチャ限数</Label>
                            <div className="relative">
                                <Input
                                    id="gachaLimit"
                                    type="number"
                                    placeholder="例: 1000"
                                    {...register('gachaLimit')}
                                    className={errors.gachaLimit ? "border-red-500" : ""}
                                />
                                <div className="absolute right-3 top-2.5 text-xs text-slate-400">体</div>
                            </div>
                            {errors.gachaLimit && <p className="text-xs text-red-500">{errors.gachaLimit.message}</p>}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] font-bold text-base rounded-md"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '送信中...' : '査定を依頼する'}
                        {!isSubmitting && <ChevronRight className="w-5 h-5 ml-1" />}
                    </Button>

                </form>
            </main>
        </div>
    );
}
