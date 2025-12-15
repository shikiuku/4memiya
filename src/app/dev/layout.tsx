import { AdminHeader } from '@/components/features/admin/layout/admin-header';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AdminHeader />
            <main>
                {children}
            </main>
        </div>
    );
}
