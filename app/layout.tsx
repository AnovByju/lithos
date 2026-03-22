import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lithos — Infinite Literature",
  description:
    "Discover poems, quotes, stories, letters and philosophy from history's greatest minds. Infinite scroll through world literature.",
  keywords: ["literature", "poetry", "quotes", "Shakespeare", "Rumi", "reading"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
