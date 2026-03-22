import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lithos — Infinite Literature",
  description: "Discover poems, quotes, stories, letters and philosophy from history's greatest minds.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // This is the key line — fills the iPhone notch/home-bar areas with our background
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ background: "#000" }}>
      <body style={{ background: "#000" }}>{children}</body>
    </html>
  );
}
