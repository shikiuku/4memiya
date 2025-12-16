'use client';

import { AssessmentRule } from '@/types';
import { RuleFormDialog } from './rule-form-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteAssessmentRule } from '@/actions/admin/assessment';
import { useTransition } from 'react';

interface RuleListProps {
    rules: AssessmentRule[];
}

const CATEGORY_LABELS: Record<string, string> = {
    'rank': 'ランク',
    'luck_max': '運極数',
    'gacha_charas': 'ガチャ限数',
    'character': 'キャラクター',
    // Add defaults for others if needed
};

export function RuleList({ rules }: RuleListProps) {
    // Group rules by category
    const groupedRules = rules.reduce((acc, rule) => {
        const cat = rule.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(rule);
        return acc;
    }, {} as Record<string, AssessmentRule[]>);

    const categories = Object.keys(groupedRules).sort((a, b) => {
        const order = ['rank', 'luck_max', 'gacha_charas'];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);

        // If both are in the priority list, sort by index
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // If only a is in priority, it comes first
        if (aIndex !== -1) return -1;
        // If only b is in priority, it comes first
        if (bIndex !== -1) return 1;

        // 'character' should be last
        if (a === 'character') return 1;
        if (b === 'character') return -1;

        // Default alphabetical for others
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-8">
            {categories.map(category => (
                <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <h2 className="text-lg font-bold capitalize text-slate-800">
                            {CATEGORY_LABELS[category] || category}
                        </h2>
                        {/* Add Rule Button for this category */}
                        <RuleFormDialog defaultCategory={category} />
                    </div>

                    <div className="space-y-2">
                        {groupedRules[category].map(rule => (
                            <RuleItem key={rule.id} rule={rule} />
                        ))}
                    </div>
                </div>
            ))}

            {categories.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                    まだルールがありません。「新規ルール追加」から作成してください。
                </div>
            )}
        </div>
    );
}

function RuleItem({ rule }: { rule: AssessmentRule }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm('このルールを削除しますか？')) return;
        startTransition(async () => {
            const result = await deleteAssessmentRule(rule.id);
            if (result?.error) alert(result.error);
        });
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors">
            <div className="flex-1">
                <div className="font-bold text-slate-700 flex items-center gap-2">
                    {rule.rule_type === 'range' ? (
                        <span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">数値</span>
                            {rule.threshold?.toLocaleString()} 以上
                        </span>
                    ) : (
                        <span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mr-2">チェックボックス</span>
                            {rule.label}
                        </span>
                    )}
                    <span className="text-slate-400">→</span>
                    <span className="text-[#e60012]">+ {rule.price_adjustment.toLocaleString()} 円</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <RuleFormDialog existingRule={rule} />
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
