import { getSiteSetting } from '@/actions/admin/settings';
import { InquirySettingsForm } from '@/components/features/admin/inquiries/inquiry-settings-form';

export default async function InquiriesPage() {
    const inquiryEmail = await getSiteSetting('inquiry_email');
    const inquiryNote = await getSiteSetting('inquiry_note');

    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-6">お問い合わせ管理</h1>
            <div className="mb-8">
                <h2 className="text-lg font-bold mb-4">設定</h2>
                <InquirySettingsForm
                    initialEmail={inquiryEmail || ''}
                    initialNote={inquiryNote || ''}
                />
            </div>
        </div>
    );
}
