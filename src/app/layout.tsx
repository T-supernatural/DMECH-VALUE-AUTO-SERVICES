import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CONTACT, ADDRESS_FULL } from "@/lib/contact";
import { StructuredData } from "@/components/seo/StructuredData";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dmechvalueautoservices.netlify.app";
const OG_IMAGE = "/splash/01_cars_road.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DMECH Services Limited | Car Diagnostics, EV Service & Vehicle Sales in Lagos",
    template: "%s | DMECH Services Limited",
  },
  description:
    "DMECH Services Limited offers car diagnostics, EV service, vehicle import, financing, and certified used vehicles in Lagos, Nigeria.",
  keywords: [
    "car diagnostics Lagos",
    "EV service Lagos",
    "used cars Lagos",
    "vehicle import Nigeria",
    "car repair Ajah Lagos",
    "DMECH Services Limited",
    "vehicle financing Nigeria",
    "automotive workshop Lagos",
  ],
  applicationName: "DMECH Services Limited",
  category: "automotive",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DMECH Services Limited | Car Diagnostics, EV Service & Vehicle Sales in Lagos",
    description:
      "DMECH Services Limited offers car diagnostics, EV service, vehicle import, financing, and certified used vehicles in Lagos, Nigeria.",
    siteName: "DMECH Services Limited",
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1080, height: 720 }],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMECH Services Limited | Car Diagnostics, EV Service & Vehicle Sales in Lagos",
    description:
      "DMECH Services Limited offers car diagnostics, EV service, vehicle import, financing, and certified used vehicles in Lagos, Nigeria.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body>
        <StructuredData
          businessName="DMECH Services Limited"
          url={SITE_URL}
          telephone={CONTACT.phoneHref}
          whatsapp={CONTACT.whatsappNumber}
          address={ADDRESS_FULL}
          city="Lagos"
          country="Nigeria"
        />
        {children}
      </body>
    </html>
  );
}
