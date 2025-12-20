'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Check, BadgeCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { AssessmentRule } from '@/types';

// Base schema for fixed fields
const baseSchema = z.object({
    gameTitle: z.string().default('モンスターストライク'),
    rank: z.coerce.number().min(0),
    luckMax: z.coerce.number().min(0),
    gachaLimit: z.coerce.number().min(0),
    customRules: z.record(z.string(), z.boolean()),
    dynamicRanges: z.record(z.string(), z.coerce.number().min(0)).optional(),
});

type FormData = z.infer<typeof baseSchema>;

interface AssessmentFormProps {
    rules: AssessmentRule[];
}

export function AssessmentForm({ rules }: AssessmentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Calculate days until end of month (Announcement Date)
    const daysUntilAnnouncement = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        // 0th day of next month is the last day of current month
        const lastDay = new Date(year, month + 1, 0);

        // Reset hours to compare dates only
        const todayMidnight = new Date(year, month, today.getDate());
        const lastDayMidnight = new Date(year, month, lastDay.getDate());

        const diffTime = lastDayMidnight.getTime() - todayMidnight.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(baseSchema) as any,
        defaultValues: {
            gameTitle: 'モンスターストライク',
            rank: undefined as any,
            luckMax: undefined as any,
            gachaLimit: undefined as any,
            customRules: {},
            dynamicRanges: {},
        },
    });

    const watchedValues = watch();
    const { rank, luckMax, gachaLimit, customRules, dynamicRanges } = watchedValues;

    // Separate rules by type
    const { rangeRules, booleanRules, extraRangeCategories } = useMemo(() => {
        const rRules = rules.filter(r => r.rule_type === 'range');
        const bRules = rules.filter(r => r.rule_type === 'boolean');

        // Identify categories that are NOT standard
        const standardCats = ['rank', 'luck_max', 'gacha_charas'];
        const uniqueCats = Array.from(new Set(rRules.map(r => r.category)));
        const extra = uniqueCats.filter(c => !standardCats.includes(c));

        return {
            rangeRules: rRules,
            booleanRules: bRules,
            extraRangeCategories: extra
        };
    }, [rules]);

    // Real-time Calculation Logic
    const currentPrice = useMemo(() => {
        let price = 0;

        // 1. Range Rules (Highest Threshold Wins per Category)
        // Group by category first
        const rangesByCategory = rangeRules.reduce((acc, rule) => {
            if (!acc[rule.category]) acc[rule.category] = [];
            acc[rule.category].push(rule);
            return acc;
        }, {} as Record<string, AssessmentRule[]>);

        // Evaluate each category
        Object.entries(rangesByCategory).forEach(([category, catRules]) => {
            // Sort by threshold descending to find the highest match easily
            const sorted = catRules.sort((a, b) => (b.threshold || 0) - (a.threshold || 0));

            let inputValue = 0;
            if (category === 'rank') inputValue = rank;
            else if (category === 'luck_max') inputValue = luckMax;
            else if (category === 'gacha_charas') inputValue = gachaLimit;
            else {
                // Dynamic category value
                inputValue = dynamicRanges?.[category] || 0;
            }

            const match = sorted.find(r => inputValue >= (r.threshold || 0));
            if (match) {
                price += match.price_adjustment;
            }
        });

        // 2. Boolean Rules
        booleanRules.forEach(rule => {
            if (customRules && customRules[rule.id]) {
                price += rule.price_adjustment;
            }
        });

        return price;
    }, [rangeRules, booleanRules, rank, luckMax, gachaLimit, JSON.stringify(customRules), dynamicRanges]);

    const handleShare = () => {
        const text = `モンストアカウントが${currentPrice.toLocaleString()}円で査定されました！\n#モンスト買取 #雨宮査定`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };


    return (
        <form className="space-y-6 bg-white p-6 rounded-md border border-slate-200" onSubmit={(e) => e.preventDefault()}>

            {/* Live Price Display */}
            <div className="bg-slate-50 border border-slate-200 text-slate-900 p-6 rounded-md text-center transform transition-all duration-300">
                <p className="text-slate-500 text-xs mb-1">現在の査定金額</p>
                <div className="text-4xl font-bold tracking-tight mb-4">
                    ¥{currentPrice.toLocaleString()}
                </div>

            </div>

            <div className="space-y-4">
                {/* Game Title - Compact */}
                <div>
                    <Label htmlFor="gameTitle" className="text-xs text-slate-500">ゲームタイトル</Label>
                    <div className="font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded px-3 py-2 text-sm mt-1">
                        {watch('gameTitle')}
                    </div>
                </div>

                {/* Numeric Inputs Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="rank" className="text-xs">ランク</Label>
                        <div className="relative">
                            <Input
                                id="rank"
                                type="number"
                                min="0"
                                placeholder="1500"
                                className="pr-10"
                                {...register('rank')}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-slate-400">ランク</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="luckMax" className="text-xs">運極数</Label>
                        <div className="relative">
                            <Input
                                id="luckMax"
                                type="number"
                                min="0"
                                placeholder="500"
                                className="pr-8"
                                {...register('luckMax')}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-slate-400">体</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="gachaLimit" className="text-xs">ガチャ限数</Label>
                        <div className="relative">
                            <Input
                                id="gachaLimit"
                                type="number"
                                min="0"
                                placeholder="1000"
                                className="pr-8"
                                {...register('gachaLimit')}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-slate-400">体</div>
                        </div>
                    </div>

                    {/* Dynamic Range Inputs within same grid */}
                    {extraRangeCategories.map(cat => (
                        <div key={cat} className="space-y-1">
                            <Label htmlFor={`dynamicRanges.${cat}`} className="capitalize text-xs">{cat}</Label>
                            <div className="relative">
                                <Input
                                    id={`dynamicRanges.${cat}`}
                                    type="number"
                                    min="0"
                                    placeholder="100"
                                    className="pr-8"
                                    {...register(`dynamicRanges.${cat}` as any)}
                                />
                                <div className="absolute right-3 top-2.5 text-xs text-slate-400">値</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Boolean Rules (Checkboxes) - Compact Grid */}
                {booleanRules.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                        <Label className="mb-2 block text-sm font-bold text-slate-700">プラス査定要素 / その他</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {booleanRules.map(rule => (
                                <div key={rule.id}
                                    className="relative flex items-center space-x-2 border border-slate-200 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                                    onClick={() => {
                                        const current = customRules?.[rule.id] ?? false;
                                        setValue(`customRules.${rule.id}`, !current, { shouldDirty: true });
                                    }}
                                >
                                    {/* Checkbox Visual */}
                                    <div
                                        className={`
                                            h-4 w-4 shrink-0 rounded border flex items-center justify-center pointer-events-none transition-colors
                                            ${(customRules?.[rule.id])
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-slate-300 bg-white'
                                            }
                                        `}
                                    >
                                        {(customRules?.[rule.id]) && <Check className="h-3 w-3" strokeWidth={3} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-700 truncate leading-tight">
                                            {rule.label || '指定なし'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                                            {rule.category !== 'checkbox' && `(${rule.category})`}
                                            <span className="font-bold text-[#e60012] ml-1">+{rule.price_adjustment.toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign Banner & Actions - Moved to Bottom */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md p-3 text-center text-xs font-bold animate-pulse">
                    <p>シェアで毎月10人にPayPay1,000円プレゼント！</p>
                    <p className="text-sm mt-1 mb-2">
                        当選発表まであと <span className="text-red-600 text-lg">{daysUntilAnnouncement}</span> 日
                    </p>
                    <Link href="/campaign" className="text-xs text-yellow-700 underline hover:text-yellow-900 block mt-1">
                        このキャンペーンの詳細はこちら
                    </Link>
                </div>

                <div className="space-y-4">
                    {/* Share Button (Less Prominent) */}
                    <Button
                        type="button"
                        onClick={handleShare}
                        className="w-full bg-black hover:bg-slate-800 text-white font-bold rounded-full h-12 text-base"
                    >
                        Xで査定結果をシェア
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                    </div>

                    {/* DM Consultation (Primary Prominence) */}
                    <a
                        href="https://twitter.com/direct_messages/create/AJAJDNW"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full pt-2"
                    >
                        {/* User Profile for Trust */}
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                                <Image
                                    src="/amamiya_icon.png"
                                    alt="雨宮"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-slate-900 leading-tight">雨宮 【モンスト垢 買取/販売/代行】</span>
                                    <BadgeCheck className="w-4 h-4 text-[#007bff] fill-[#007bff] text-white" />
                                </div>
                                <div className="text-xs text-slate-500 font-medium">@AJAJDNW</div>
                            </div>
                        </div>

                        <Button className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white font-bold rounded-full h-14 text-lg shadow-md animate-pulse">
                            アカウント売却の相談 (DM)
                        </Button>
                    </a>
                </div>
            </div>

            {/* Submit button removed as per request */}
        </form>
    );
}
