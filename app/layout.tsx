import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Totem Tabela Temel Hesaplama - Eymen Reklam",
  description:
    "Totem/pylon tabela beton temel boyutu ve hacim hesaplama aracı. Rüzgar direnci hesabı ile güvenli temel ölçüleri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
