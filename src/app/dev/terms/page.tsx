import { getSiteSetting } from '@/actions/admin/settings';
import { TermsSettingsForm } from '@/components/features/admin/terms/terms-settings-form';

export default async function TermsPage() {
    const termsContent = await getSiteSetting('terms_content');

    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-6">利用規約管理</h1>
            <div className="mb-8">
                <TermsSettingsForm initialTerms={termsContent || ''} />
            </div>
        </div>
    );
}
