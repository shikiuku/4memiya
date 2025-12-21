'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AssessmentRule } from '@/types';
import { saveAssessmentRule } from '@/actions/admin/assessment';
import { Plus, Edit } from 'lucide-react';

interface RuleFormDialogProps {
    existingRule?: AssessmentRule;
    defaultCategory?: string;
    defaultRuleType?: 'range' | 'boolean';
    trigger?: React.ReactNode;
}

export function RuleFormDialog({ existingRule, defaultCategory, defaultRuleType = 'range', trigger }: RuleFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ruleType, setRuleType] = useState<'range' | 'boolean'>(existingRule?.rule_type || defaultRuleType);
    // Fix: Default to empty string instead of 'rank' so we detect when it's a new custom category
    const [category, setCategory] = useState(existingRule?.category || defaultCategory || '');

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);

        // Auto-generate category ID if creating a new category and none specified
        let finalCategory = formData.get('category') as string;

        if (!finalCategory) {
            // Check if we have a default category passed in props
            if (defaultCategory) {
                finalCategory = defaultCategory;
            } else {
                // Generate ID from label if possible (e.g. "MyCategory" -> "mycategory")
                const label = formData.get('label') as string;
                if (label && /^[a-zA-Z0-9_-]+$/.test(label)) {
                    finalCategory = label.toLowerCase();
                } else {
                    // Fallback to timestamp for Japanese/complex labels
                    finalCategory = `cat_${Date.now()}`;
                }
            }

            formData.set('category', finalCategory);
        }

        const result = await saveAssessmentRule(null, formData);
        setIsSubmitting(false);

        if (result?.error) {
            alert(result.error);
        } else {
            setOpen(false);
            // Reset form for next use if not editing
            if (!existingRule) {
                setCategory('');
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant={existingRule ? "ghost" : "default"}>
                        {existingRule ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4 mr-1" />}
                        {existingRule ? '' : 'ルール追加'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{existingRule ? 'ルールを編集' : '新しいルールを追加'}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    {existingRule && <input type="hidden" name="id" value={existingRule.id} />}

                    {/* Rule Type Selection (only for new rules if not forced) */}
                    <div className="space-y-2">
                        <Label>条件タイプ</Label>
                        <input type="hidden" name="rule_type" value={ruleType} />
                        <Select
                            disabled={!!existingRule}
                            value={ruleType}
                            onValueChange={(v: 'range' | 'boolean') => setRuleType(v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="range">数値条件 (以上)</SelectItem>
                                <SelectItem value="boolean">チェックボックス</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Selection - Hidden for simplification */}
                    {/* User only sees this if explicitly editing an existing rule's category, which is rare/not recommended via this UI anyway */}
                    <input
                        type="hidden"
                        name="category"
                        value={category}
                    />

                    {/* Debug/Advanced toggle could go here, but for now we fully hide it as requested */}

                    {/* Label (Always visible now to allow overriding display name) */}
                    <div className="space-y-2">
                        <Label>表示名 (ラベル)</Label>
                        <Input
                            name="label"
                            placeholder="例: 平均紋章力, ルシファー運極"
                            defaultValue={existingRule?.label ?? ''}
                        />
                        <p className="text-xs text-slate-500">
                            画面に表示される項目名です。空欄の場合はIDが表示されます。
                        </p>
                    </div>

                    {/* Conditional Fields */}
                    {ruleType === 'range' && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>～以上</Label>
                                <Input
                                    name="threshold"
                                    type="number"
                                    placeholder="例: 1000"
                                    defaultValue={existingRule?.threshold ?? ''}
                                    required
                                />
                                <p className="text-xs text-slate-500">この数値以上の場合に適用されます。</p>
                            </div>

                            {/* Added Input Placeholder Configuration */}
                            <div className="space-y-2">
                                <Label>入力欄の初期値 (プレースホルダー)</Label>
                                <Input
                                    name="input_placeholder"
                                    placeholder="例: 0, 1500"
                                    defaultValue={existingRule?.input_placeholder ?? ''}
                                />
                                <p className="text-xs text-slate-500">
                                    ユーザー入力画面に最初から表示されている薄い文字（数値）です。<br />
                                    ※同じカテゴリ内のルールであれば、どれか1つに設定すれば適用されます。
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>加算金額 (円)</Label>
                        <Input
                            name="price_adjustment"
                            type="number"
                            placeholder="例: 5000"
                            defaultValue={existingRule?.price_adjustment ?? ''}
                            required
                        />
                        <p className="text-xs text-slate-500">査定額に加算される金額です。</p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? '保存中...' : '保存'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
