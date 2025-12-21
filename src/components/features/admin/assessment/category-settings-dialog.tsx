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
import { Settings } from 'lucide-react';
import { updateCategorySettings } from '@/actions/admin/assessment';

interface CategorySettingsDialogProps {
    category: string;
    currentLabel: string;
    currentPlaceholder: string;
    currentUnit: string;
}

export function CategorySettingsDialog({ category, currentLabel, currentPlaceholder, currentUnit }: CategorySettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);

        const label = formData.get('label') as string;
        const input_placeholder = formData.get('input_placeholder') as string;
        const input_unit = formData.get('input_unit') as string;

        const result = await updateCategorySettings(category, {
            label,
            input_placeholder: input_placeholder || null,
            input_unit: input_unit || null
        });

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
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>カテゴリ設定: {currentLabel}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>表示名 (カテゴリ名)</Label>
                        <Input
                            name="label"
                            placeholder="例: 平均紋章力"
                            defaultValue={currentLabel}
                            required
                        />
                        <p className="text-xs text-slate-500">
                            このカテゴリの表示名を変更します。
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>入力欄の初期値</Label>
                            <Input
                                name="input_placeholder"
                                placeholder="例: 0"
                                defaultValue={currentPlaceholder}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>単位</Label>
                            <Input
                                name="input_unit"
                                placeholder="例: 値, 体, ランク"
                                defaultValue={currentUnit}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        公開ページの入力フォームに表示される初期値（プレースホルダー）と単位を設定します。
                    </p>

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
