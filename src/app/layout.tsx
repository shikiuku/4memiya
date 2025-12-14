import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NotificationBanner } from "@/components/layout/notification-banner";

export const metadata: Metadata = {
  title: "SNS STORE",
  description: "ゲームアカウント売買プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col">
        <NotificationBanner />
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
