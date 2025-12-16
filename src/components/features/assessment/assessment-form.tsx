'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Check } from 'lucide-react';
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


    return (
        <form className="space-y-6 bg-white p-6 rounded-md border border-slate-200" onSubmit={(e) => e.preventDefault()}>

            {/* Live Price Display */}
            <div className="bg-slate-50 border border-slate-200 text-slate-900 p-6 rounded-md text-center transform transition-all duration-300">
                <p className="text-slate-500 text-xs mb-1">現在の査定金額</p>
                <div className="text-4xl font-bold tracking-tight">
                    ¥{currentPrice.toLocaleString()}
                </div>
            </div>

            <div className="space-y-4">
                {/* Game Title */}
                <div className="space-y-2">
                    <Label htmlFor="gameTitle">ゲームタイトル</Label>
                    <Input
                        id="gameTitle"
                        {...register('gameTitle')}
                        disabled
                        className="bg-slate-100 text-slate-500 border-slate-200"
                    />
                </div>

                {/* Numeric Inputs */}
                <div className="space-y-2">
                    <Label htmlFor="rank">ランク</Label>
                    <div className="relative">
                        <Input
                            id="rank"
                            type="number"
                            min="0"
                            placeholder="例: 1500"
                            {...register('rank')}
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-slate-400">ランク</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="luckMax">運極数</Label>
                    <div className="relative">
                        <Input
                            id="luckMax"
                            type="number"
                            min="0"
                            placeholder="例: 500"
                            {...register('luckMax')}
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-slate-400">体</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gachaLimit">ガチャ限数</Label>
                    <div className="relative">
                        <Input
                            id="gachaLimit"
                            type="number"
                            min="0"
                            placeholder="例: 1000"
                            {...register('gachaLimit')}
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-slate-400">体</div>
                    </div>
                </div>

                {/* Dynamic Range Inputs for Custom Categories */}
                {extraRangeCategories.map(cat => (
                    <div key={cat} className="space-y-2">
                        <Label htmlFor={`dynamicRanges.${cat}`} className="capitalize">{cat}</Label>
                        <div className="relative">
                            <Input
                                id={`dynamicRanges.${cat}`}
                                type="number"
                                min="0"
                                placeholder={`例: 100`}
                                {...register(`dynamicRanges.${cat}` as any)}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-slate-400">値</div>
                        </div>
                    </div>
                ))}

                {/* Boolean Rules (Checkboxes) - Always at bottom */}
                {booleanRules.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                        <Label className="mb-3 block">プラス査定要素 / その他</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {booleanRules.map(rule => (
                                <div key={rule.id}
                                    className="relative flex items-center justify-between space-x-3 border border-slate-200 p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        const current = customRules?.[rule.id] ?? false;
                                        setValue(`customRules.${rule.id}`, !current, { shouldDirty: true });
                                    }}
                                >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        {/* Visual Checkbox Replacement to avoid Radix errors */}
                                        <div
                                            className={`
                                                h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center pointer-events-none transition-colors
                                                ${(customRules?.[rule.id])
                                                    ? 'bg-[#007bff] border-[#007bff] text-white'
                                                    : 'border-slate-300 bg-white'
                                                }
                                            `}
                                        >
                                            {(customRules?.[rule.id]) && <Check className="h-3 w-3" strokeWidth={3} />}
                                        </div>
                                        <span className="text-sm font-medium leading-tight text-slate-700 break-words">
                                            {rule.label || '指定なし'}
                                            {rule.category !== 'character' && (
                                                <span className="text-xs text-slate-400 font-normal ml-1">({rule.category})</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-[#e60012] whitespace-nowrap shrink-0">
                                        +{rule.price_adjustment.toLocaleString()}円
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Submit button removed as per request */}
        </form>
    );
}
