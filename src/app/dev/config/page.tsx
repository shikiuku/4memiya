import { getAppConfig, updateAppConfig } from '@/actions/admin/config';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ConfigPage() {
    const remainingWinners = await getAppConfig('campaign_remaining_winners') || '10';

    async function updateCampaign(formData: FormData) {
        'use server';
        const value = formData.get('remaining_winners') as string;
        await updateAppConfig('campaign_remaining_winners', value, '今月のキャンペーン残り当選人数');
        revalidatePath('/dev/config');
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">サイト設定</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">
                    買取査定キャンペーン設定
                </h2>

                <form action={updateCampaign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            今月の残り当選枠 (人数)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                name="remaining_winners"
                                type="number"
                                defaultValue={remainingWinners}
                                className="w-32 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-slate-600">名</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            査定ページに「今月残り○名」として表示されます。
                        </p>
                    </div>

                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        <Save className="w-4 h-4 mr-2" />
                        設定を保存
                    </Button>
                </form>
            </div>
        </div>
    );
}
