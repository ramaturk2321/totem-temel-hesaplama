import type { Metadata } from "next";
import "./globals.css";

// Sayfa başlığı/açıklaması/canonical her sayfanın kendi layout'unda (app/(totem), app/yonlendirme).
export const metadata: Metadata = {
  metadataBase: new URL("https://www.eymenreklam.com.tr"),
  title: "Tabela Statik Hesap Araçları | Eymen Reklam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
