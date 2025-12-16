import { getAssessmentRules } from '@/actions/admin/assessment';
import { RuleList } from '@/components/features/admin/assessment/rule-list';
import { RuleFormDialog } from '@/components/features/admin/assessment/rule-form-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function AssessmentPage() {
    const rules = await getAssessmentRules();

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">買取査定ルール管理</h1>
                    <p className="text-slate-500">
                        自動査定計算に使用するルールを追加・編集します。
                    </p>
                </div>

                <div className="flex gap-2">
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
            </div>

            <RuleList rules={rules} />
        </div>
    );
}
