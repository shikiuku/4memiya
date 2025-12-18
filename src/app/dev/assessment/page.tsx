import { getAssessmentRules } from '@/actions/admin/assessment';
import { getAppConfig } from '@/actions/admin/config';
import { RuleList } from '@/components/features/admin/assessment/rule-list';
import { RuleFormDialog } from '@/components/features/admin/assessment/rule-form-dialog';
import { CampaignConfigForm } from '@/components/features/admin/assessment/campaign-config-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function AssessmentPage() {
    const rules = await getAssessmentRules();
    const remainingWinners = await getAppConfig('campaign_remaining_winners') || '10';

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">買取査定ルール管理</h1>
                    <p className="text-slate-500">
                        自動査定計算に使用するルールを追加・編集します。
                    </p>
                </div>

                {/* Campaign Config Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <CampaignConfigForm initialValue={remainingWinners} />
                </div>
            </div>

            <div className="flex justify-end gap-2 mb-6">
                <RuleFormDialog
                    defaultRuleType="range"
                    trigger={
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            <Plus className="w-4 h-4 mr-2" />
                            新しい数値ルール (Rank等)
                        </Button>
                    }
                />
                <RuleFormDialog
                    defaultRuleType="boolean"
                    trigger={
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold">
                            <Plus className="w-4 h-4 mr-2" />
                            新しいチェックボックス
                        </Button>
                    }
                />
            </div>

            <RuleList rules={rules} />
        </div>
    );
}
