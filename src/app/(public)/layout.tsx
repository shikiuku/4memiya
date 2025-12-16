import { Header } from "@/components/layout/header";
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="min-h-screen pt-16 pb-20">
                {children}
            </main>
        </>
    );
}
