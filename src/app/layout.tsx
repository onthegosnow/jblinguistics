import type { Metadata } from "next";
import { TealNav } from "@/components/teal-nav";
import ChatbotWidget from "@/components/chatbot";
import Providers from "@/components/providers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/Brand/IMG_0364.PNG", type: "image/png", sizes: "32x32" },
      { url: "/Brand/IMG_0364.PNG", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/Brand/IMG_0364.PNG", sizes: "180x180" },
      { url: "/Brand/IMG_0364.PNG", sizes: "192x192" },
    ],
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
        <link rel="icon" href="/Brand/IMG_0364.PNG" type="image/png" />
        <link rel="apple-touch-icon" href="/Brand/IMG_0364.PNG" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <TealNav data-layout-nav />
          {children}
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
