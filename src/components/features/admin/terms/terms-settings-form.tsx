'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateSiteSettings } from '@/actions/admin/settings';

interface Props {
    initialTerms: string;
}

export function TermsSettingsForm({ initialTerms }: Props) {
    const [terms, setTerms] = useState(initialTerms || '');
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const formData = new FormData();
        formData.append('terms', terms);

        startTransition(async () => {
            const result = await updateSiteSettings(null, formData);
            if (result?.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: result?.message || '更新しました' });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-6 max-w-3xl">
            <div className="space-y-2">
                <Label htmlFor="terms">利用規約の内容</Label>
                <div className="text-xs text-slate-500 mb-1">
                    ※改行はそのまま反映されます
                </div>
                <Textarea
                    id="terms"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="規約内容を入力..."
                    className="min-h-[400px] font-mono text-sm"
                />
            </div>

            {message && (
                <div className={`text-sm p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            <Button type="submit" disabled={isPending} className="bg-[#007bff] hover:bg-[#0069d9]">
                {isPending ? '保存中...' : '規約を保存する'}
            </Button>
        </form>
    );
}
