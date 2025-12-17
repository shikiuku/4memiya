import { AccountForm } from '@/components/features/admin/account/account-form';

export default function AccountSettingsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">アカウント設定</h1>
            <div className="max-w-2xl mx-auto">
                <p className="text-slate-600 mb-8 text-center">
                    管理者アカウントのログインID、パスワードを変更できます。<br />
                    変更には現在のパスワードが必要です。
                </p>
                <AccountForm />
            </div>
        </div>
    );
}
