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
    const [category, setCategory] = useState(existingRule?.category || defaultCategory || 'rank');

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        const result = await saveAssessmentRule(null, formData);
        setIsSubmitting(false);

        if (result?.error) {
            alert(result.error);
        } else {
            setOpen(false);
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

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label>名前</Label>
                        <Input
                            name="category"
                            placeholder="例: rank, luck_max, character, option..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <p className="text-xs text-slate-500">
                            システム識別用のIDです (例: rank, badge_power)。同じカテゴリはまとまって表示されます。
                        </p>
                    </div>

                    {/* Conditional Fields */}
                    {ruleType === 'range' ? (
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
                    ) : (
                        <div className="space-y-2">
                            <Label>表示ラベル (項目名)</Label>
                            <Input
                                name="label"
                                placeholder="例: ルシファー所持, 禁止区域解放済み"
                                defaultValue={existingRule?.label ?? ''}
                                required
                            />
                            <p className="text-xs text-slate-500">チェックボックスの横に表示される名前です。</p>
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
