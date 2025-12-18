'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle2 } from 'lucide-react';
import { updateAppConfig } from '@/actions/admin/config';

interface CampaignConfigFormProps {
    initialValue: string;
}

export function CampaignConfigForm({ initialValue }: CampaignConfigFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [value, setValue] = useState(initialValue);

    // Sync with server updates
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setShowSuccess(false);

        try {
            const newValue = formData.get('remaining_winners') as string;
            await updateAppConfig('campaign_remaining_winners', newValue, '今月のキャンペーン残り当選人数');
            setShowSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to update config', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="flex items-end gap-3 relative">
            <div>
                <Label htmlFor="remaining_winners" className="text-xs text-yellow-800 font-bold mb-1 block">
                    キャンペーン残り人数
                </Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="remaining_winners"
                        name="remaining_winners"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-20 bg-white border-yellow-300 h-9"
                        disabled={isLoading}
                    />
                    <span className="text-sm text-yellow-800 font-bold">名</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="submit"
                    size="sm"
                    className={`
                        text-white font-bold h-9 transition-all
                        ${showSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
                    `}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="animate-pulse">保存中...</span>
                    ) : showSuccess ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            保存完了
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-1" />
                            保存
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
