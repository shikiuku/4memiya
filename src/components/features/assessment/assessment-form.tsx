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
import { ShieldCheck, Check, BadgeCheck, X, Gift } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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
    const [showCampaignPopup, setShowCampaignPopup] = useState(false);

    // Show popup on mount if not seen this session
    useEffect(() => {
        const seen = sessionStorage.getItem('campaign_popup_seen');
        if (seen) return;

        // Delay slightly for better feel
        const timer = setTimeout(() => {
            setShowCampaignPopup(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const dismissPopup = (action?: () => void) => {
        sessionStorage.setItem('campaign_popup_seen', 'true');
        setShowCampaignPopup(false);
        if (action) action();
    };

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

    // Pre-calculate defaults for available categories to ensure inputs work immediately
    const initialDynamicRanges = useMemo(() => {
        const ranges: Record<string, any> = {};
        rules.filter(r => r.rule_type === 'range' && !['rank', 'luck_max', 'gacha_charas'].includes(r.category))
            .forEach(r => { ranges[r.category] = undefined; });
        return ranges;
    }, [rules]);

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
            dynamicRanges: initialDynamicRanges,
        },
    });

    // Watch values explicitly for better performance/reliability
    const customRules = watch('customRules');
    const dynamicRanges = watch('dynamicRanges'); // Explicit watch

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
        const rangesByCategory = rangeRules.reduce((acc, rule) => {
            if (!acc[rule.category]) acc[rule.category] = [];
            acc[rule.category].push(rule);
            return acc;
        }, {} as Record<string, AssessmentRule[]>);

        Object.entries(rangesByCategory).forEach(([category, catRules]) => {
            const sorted = catRules.sort((a, b) => (b.threshold || 0) - (a.threshold || 0));

            // Unified input retrieval: All inputs are now mapped to dynamicRanges[category]
            let inputValue = Number(dynamicRanges?.[category] || 0);

            // Fallback for legacy top-level fields if dynamicRanges is empty (though inputs write to dynamicRanges now)
            // This might not be needed if we stick to one source of truth, but safe to remove if we are sure.
            // Actually, let's strictly use dynamicRanges since the UI renders inputs as dynamicRanges.*

            const match = sorted.find(r => inputValue >= (r.threshold || 0));
            if (match) {
                // console.log(`Matched ${category}: input=${inputValue} >= threshold=${match.threshold} (+${match.price_adjustment})`);
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
    }, [rangeRules, booleanRules, JSON.stringify(customRules), JSON.stringify(dynamicRanges)]);

    const handleShare = () => {
        const text = `モンストのアカウントが${currentPrice.toLocaleString()}円で査定されました！！\n\n自動査定はこちら✔︎\nhttps://4memiya.com/assessment\n\nモンスト在庫の確認はこちら✔︎\nhttps://4memiya.com\n\nアカウント売却依頼は @AJAJDNW まで \n\n#モンスト #モンスト買取 #雨宮査定`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };


    return (
        <>
            {/* Campaign Popup */}
            {showCampaignPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <div
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-[#FCF9D9]" />

                        {/* Close Button */}
                        <button
                            onClick={() => dismissPopup()}
                            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="relative p-8 text-center space-y-5 pt-10">
                            <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2">
                                <div className="relative w-full h-full animate-bounce rounded-full overflow-hidden border-2 border-slate-50 shadow-md">
                                    <Image
                                        src="/paypay_icon.png"
                                        alt="PayPay"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-[#854d0e] leading-tight">
                                    PayPay <span className="text-red-600">1,000</span>円分を<br />
                                    <span className="text-red-600">10</span>名様にプレゼント！
                                </h2>
                                <p className="text-[13px] text-slate-500 font-bold">
                                    買取査定キャンペーン開催中
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                                <p className="text-sm font-black text-[#854d0e] leading-relaxed">
                                    査定結果をXでシェアするだけで<br />
                                    <span className="text-[13px] text-slate-500 font-bold">自動で抽選に参加完了！</span>
                                </p>
                                <div className="pt-2 border-t border-slate-200/60 font-bold">
                                    <p className="text-[11px] text-[#854d0e] uppercase tracking-wider">当選発表まで残り</p>
                                    <p className="text-2xl font-black text-slate-800 tabular-nums">
                                        あと <span className="text-red-600 text-3xl">{daysUntilAnnouncement}</span> 日
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <Button
                                    onClick={() => dismissPopup()}
                                    className="w-full h-14 bg-[#007bff] hover:bg-[#0069d9] text-white font-black rounded-2xl text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    査定をスタート
                                </Button>
                                <Link
                                    href="/campaign"
                                    onClick={() => dismissPopup()}
                                    className="block text-xs text-slate-400 font-bold hover:text-slate-600 transition-colors underline underline-offset-4"
                                >
                                    キャンペーンの詳細はこちら
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form className="space-y-2.5" onSubmit={(e) => e.preventDefault()}>

                {/* Live Price Display - Slimmed and Integrated */}
                <div className="sticky top-[52px] z-10 -mx-1 px-1 py-1">
                    <div className="bg-white/80 backdrop-blur-md border border-[#007bff]/10 shadow-sm text-slate-900 p-2 rounded-xl text-center">
                        <p className="text-slate-500 text-[8px] uppercase font-bold tracking-wider mb-0">現在の査定金額</p>
                        <div className="text-2xl font-black tracking-tight text-slate-900">
                            ¥{currentPrice.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Game Title - Compact */}
                    <div className="px-1">
                        <Label htmlFor="gameTitle" className="text-[10px] text-slate-500 font-bold block">ゲームタイトル</Label>
                        <div className="font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded px-3 py-1 text-sm mt-0.5">
                            {watch('gameTitle')}
                        </div>
                    </div>

                    {/* Numeric Inputs Grid - Dynamic Ordering */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* Render inputs in the order they appear in rules (which is sorted by DB sort_order) */}
                        {Array.from(new Set(rangeRules.map(r => r.category))).map(cat => {
                            // Find a rule for this category to get label and placeholder
                            // We use the first rule that has these values
                            const representativeRule = rangeRules.find(r => r.category === cat);

                            // Determine props based on category
                            let inputProps = {
                                name: `dynamicRanges.${cat}` as any,
                                label: representativeRule?.label || cat,
                                placeholder: representativeRule?.input_placeholder || '0',
                                unit: representativeRule?.input_unit || '値'
                            };

                            // Optional: Keep hardcoded defaults if DB value is missing, for backward compatibility or better defaults
                            // Only apply defaults if BOTH placeholder and unit are missing? Or independently?
                            // Let's apply independently but check specific categories.
                            if (cat === 'rank') {
                                if (!representativeRule?.input_placeholder) inputProps.placeholder = '1500';
                                if (!representativeRule?.input_unit) inputProps.unit = 'ランク';
                                // Label override for standard categories if not set in DB (or strictly enforce "Rank" vs "rank")
                                if (!representativeRule?.label) inputProps.label = 'ランク';
                            } else if (cat === 'luck_max') {
                                if (!representativeRule?.input_placeholder) inputProps.placeholder = '500';
                                if (!representativeRule?.input_unit) inputProps.unit = '体';
                                if (!representativeRule?.label) inputProps.label = '運極数';
                            } else if (cat === 'gacha_charas') {
                                if (!representativeRule?.input_placeholder) inputProps.placeholder = '1000';
                                if (!representativeRule?.input_unit) inputProps.unit = '体';
                                if (!representativeRule?.label) inputProps.label = 'ガチャ限数';
                            }

                            return (
                                <div key={cat} className="space-y-0.5">
                                    <Label htmlFor={inputProps.name} className="capitalize text-[10px] font-bold h-3.5 flex items-center">{inputProps.label}</Label>
                                    <div className="relative">
                                        <Input
                                            id={inputProps.name}
                                            type="number"
                                            min="0"
                                            placeholder={inputProps.placeholder}
                                            className="pr-10 h-9 text-sm"
                                            {...register(inputProps.name)}
                                        />
                                        <div className="absolute right-3 top-2 text-[10px] text-slate-400">{inputProps.unit}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Boolean Rules (Checkboxes) - Compact Grid */}
                    {booleanRules.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <Label className="mb-1 block text-[11px] font-bold text-slate-700">プラス査定要素 / その他</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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

                {/* Bottom Actions Area */}
                <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
                    {/* Card 1: Campaign & Share */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 space-y-3">
                        <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg p-2.5 text-center text-[11px] font-bold">
                            <p>
                                シェアで毎月
                                <span className="text-red-600 text-sm mx-0.5">10</span>名に
                                PayPay
                                <span className="text-red-600 text-sm mx-0.5">1,000</span>円プレゼント！
                            </p>
                            <p className="text-sm mt-1 mb-2">
                                当選発表まであと <span className="text-red-600 text-lg">{daysUntilAnnouncement}</span> 日
                            </p>
                            <Link href="/campaign" className="text-xs text-yellow-700 underline hover:text-yellow-900 block mt-1 font-medium">
                                このキャンペーンの詳細はこちら
                            </Link>
                        </div>

                        <Button
                            type="button"
                            onClick={handleShare}
                            className="w-full bg-black hover:bg-slate-800 text-white font-bold rounded-full h-9 text-xs transition-all"
                        >
                            Xで査定結果をシェアする
                        </Button>
                    </div>

                    {/* Card 2: Account Sale Flow & DM */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 space-y-4">
                        {/* Account Sale Flow Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 border-l-4 border-[#007bff] pl-2.5">
                                <h3 className="font-bold text-[18px] text-slate-800">アカウント売却の流れ</h3>
                            </div>

                            <div className="space-y-6 px-1">
                                {/* Step 1 */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007bff] text-white grid place-items-center text-xs font-bold leading-none">1</div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-slate-800">
                                            下のボタンから「売却希望です」とDMを送る
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007bff] text-white grid place-items-center text-xs font-bold leading-none mt-[-1px]">2</div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-slate-800 mb-2">
                                            DMにて、以下の内容を撮影した動画を送信（属性順）
                                        </p>
                                        <div className="text-[13px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2">
                                            <div>
                                                <p className="font-bold text-slate-700">① ガチャ限定キャラ [★5、★6]</p>
                                                <p className="text-slate-500 mt-0.5">
                                                    手順：(表示順変更 → 入手方法 → [プレミアムガチャ] → レアリティ → [最終★6] )
                                                </p>
                                            </div>
                                            <p className="font-bold text-slate-700">② 運極キャラ</p>
                                            <p className="font-bold text-slate-700">③ 紋章ページ</p>
                                            <p className="font-bold text-slate-700">④ アイテム一通り</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007bff] text-white grid place-items-center text-xs font-bold leading-none">3</div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-slate-800">
                                            査定額に納得頂けましたら、アカウント情報の確認を行います
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007bff] text-white grid place-items-center text-xs font-bold leading-none">4</div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-slate-800">
                                            アカウント情報の確認後、希望のお支払い方法で送金致します
                                        </p>
                                    </div>
                                </div>

                                {/* Step 5 */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007bff] text-white grid place-items-center text-xs font-bold leading-none">5</div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-slate-800">
                                            受け取り完了後、「レビューを投稿」をクリック
                                        </p>
                                    </div>
                                </div>

                                {/* Step 6 */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#007bff] text-white grid place-items-center text-xs font-bold leading-none">6</div>
                                    <div className="flex-1">
                                        <p className="text-[15px] font-bold text-slate-800">
                                            レビューの投稿が完了できたら取引終了
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-slate-500 font-medium pt-2">
                                何か質問や相談等ありましたらお気軽にdmください
                            </p>
                        </div>

                        <div className="space-y-3 pt-1">
                            {/* DM Consultation */}
                            <a
                                href="https://x.com/direct_messages/create/AJAJDNW"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <div className="flex items-center justify-center gap-2.5 mb-3">
                                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm">
                                        <Image
                                            src="/amamiya_icon.png"
                                            alt="雨宮"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[13px] font-bold text-slate-900 leading-tight">雨宮 【モンスト垢 買取/販売/代行】</span>
                                            <BadgeCheck className="w-3.5 h-3.5 text-[#007bff] fill-[#007bff] text-white" />
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold">@AJAJDNW</div>
                                    </div>
                                </div>

                                <div className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white font-bold rounded-full h-12 text-base shadow-lg animate-pulse flex items-center justify-center gap-2">
                                    アカウント売却の相談 (DM)
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Submit button removed as per request */}
            </form>
        </>
    );
}
