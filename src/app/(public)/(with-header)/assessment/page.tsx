import { getAssessmentRules } from '@/actions/admin/assessment';
import { AssessmentForm } from '@/components/features/assessment/assessment-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AssessmentPage() {
    // Fetch rules from DB
    const rules = await getAssessmentRules();

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <main className="container mx-auto max-w-xl px-4 pt-4 pb-6">
                <AssessmentForm rules={rules} />


            </main>
        </div>
    );
}
