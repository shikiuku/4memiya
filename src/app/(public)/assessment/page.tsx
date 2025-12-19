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

                <div className="mt-8 text-center">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                        実際の買取実績・お客様の声
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                        4memiyaをご利用いただいたお客様からのレビューをご覧いただけます。
                    </p>
                    <a href="/reviews" className="inline-block bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3 px-8 rounded-full shadow-sm transition-all">
                        お客様の声を見る
                    </a>
                </div>
            </main>
        </div>
    );
}
