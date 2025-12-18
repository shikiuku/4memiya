import { getAssessmentRules } from '@/actions/admin/assessment';
import { AssessmentForm } from '@/components/features/assessment/assessment-form';

export default async function AssessmentPage() {
    // Fetch rules from DB
    const rules = await getAssessmentRules();

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-100 py-6 px-4 text-center">
                <h1 className="text-xl font-bold text-slate-900">買取査定</h1>
                <p className="text-xs text-slate-500 mt-1">予想査定金額を表示します</p>
            </div>

            <main className="container mx-auto max-w-xl px-4 py-8">
                <AssessmentForm rules={rules} />
            </main>
        </div>
    );
}
