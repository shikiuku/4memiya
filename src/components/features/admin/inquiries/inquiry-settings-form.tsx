'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateSiteSettings } from '@/actions/admin/settings';

interface Props {
    initialEmail: string;
    initialNote: string;
}

export function InquirySettingsForm({ initialEmail, initialNote }: Props) {
    const [email, setEmail] = useState(initialEmail || '');
    const [note, setNote] = useState(initialNote || '');
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('note', note);

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
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-6 max-w-lg mx-auto">

            <div className="space-y-2">
                <Label htmlFor="email">お問い合わせメールアドレス</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="note">ページ下部の注釈</Label>
                <div className="text-xs text-slate-500 mb-1">
                    ※改行はそのまま反映されます
                </div>
                <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="※ 通常24時間以内に..."
                    className="min-h-[120px]"
                />
            </div>

            {message && (
                <div className={`text-sm p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            <Button type="submit" disabled={isPending} className="bg-[#007bff] hover:bg-[#0069d9]">
                {isPending ? '保存中...' : '設定を保存する'}
            </Button>
        </form>
    );
}
