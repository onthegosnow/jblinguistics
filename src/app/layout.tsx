import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { TealNav } from "@/components/teal-nav";
import ChatbotWidget from "@/components/chatbot";
import Providers from "@/components/providers";
import { OrganizationStructuredData } from "@/components/structured-data";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://www.jblinguistics.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JB Linguistics LLC",
  description: "Global Teaching · Translation · Interpretation",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/Brand/JB%20LOGO%20no%20TEXT.png", type: "image/png", sizes: "32x32" },
      { url: "/Brand/JB%20LOGO%20no%20TEXT.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/Brand/JB%20LOGO%20no%20TEXT.png", sizes: "180x180" },
      { url: "/Brand/JB%20LOGO%20no%20TEXT.png", sizes: "192x192" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "JB Linguistics LLC",
    url: siteUrl,
    title: "JB Linguistics LLC",
    description: "Global Teaching · Translation · Interpretation",
    images: [
      {
        url: "/Brand/JB%20LOGO%20no%20TEXT.png",
        width: 1200,
        height: 630,
        alt: "JB Linguistics LLC logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JB Linguistics LLC",
    description: "Global Teaching · Translation · Interpretation",
    images: ["/Brand/JB%20LOGO%20no%20TEXT.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Brand/JB%20LOGO%20no%20TEXT.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Brand/JB%20LOGO%20no%20TEXT.png" />
        <OrganizationStructuredData />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <TealNav data-layout-nav />
          {children}
          <ChatbotWidget />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
