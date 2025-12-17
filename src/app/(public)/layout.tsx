import { Header } from "@/components/layout/header";
import { NotificationBanner } from "@/components/layout/notification-banner";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <NotificationBanner />
            <main className="min-h-screen pb-20">
                {children}
            </main>
        </>
    );
}
