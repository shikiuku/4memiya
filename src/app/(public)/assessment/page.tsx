import { getAssessmentRules } from '@/actions/admin/assessment';
import { AssessmentForm } from '@/components/features/assessment/assessment-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

                {/* DEBUG: Temporary Rule/Category Dump */}
                <div className="mt-8 p-4 bg-slate-100 rounded text-[10px] font-mono whitespace-pre-wrap opacity-50">
                    <p>Debug Info:</p>
                    <p>Rules Loaded: {rules.length}</p>
                    <p>Categories: {JSON.stringify(Array.from(new Set(rules.map(r => r.category))), null, 2)}</p>
                </div>


            </main>
        </div>
    );
}
