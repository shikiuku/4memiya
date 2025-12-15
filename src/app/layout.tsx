import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "在庫一覧",
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
        {children}
      </body>
    </html>
  );
}
