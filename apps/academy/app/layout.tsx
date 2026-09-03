import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import { AcademyShell } from "../components/AcademyShell";

const ACADEMY_URL = "https://training.dmechservices.ng";

export const metadata: Metadata = {
  title: "DMECH Academy",
  description: "Professional automotive technician training by DMECH.",
  metadataBase: new URL(ACADEMY_URL),
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DMECH Academy",
    description: "Professional automotive technician training by DMECH.",
    url: ACADEMY_URL,
    siteName: "DMECH Academy",
    images: [{ url: "/workshop/exterior.jpeg", width: 1400, height: 800 }],
    locale: "en_NG",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0c1a23" };

export default function AcademyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AcademyShell>{children}</AcademyShell></body>
    </html>
  );
}
