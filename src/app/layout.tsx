import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "在庫一覧",
  description: "ゲームアカウント売買プラットフォーム",
  icons: {
    icon: "/amamiya_icon.png",
    apple: "/amamiya_icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "在庫一覧",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
