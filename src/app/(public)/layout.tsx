import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NotificationBanner } from "@/components/layout/notification-banner";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <NotificationBanner />
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
