import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Language Teachers | JB Linguistics",
  description: "Meet our network of professional language teachers specializing in aviation English, corporate training, diplomacy, and CEFR-aligned instruction across multiple languages.",
  openGraph: {
    title: "Language Teachers | JB Linguistics",
    description: "Professional language educators for corporate, aviation, and government clients. CEFR-certified instructors in English, German, French, Spanish, and more.",
    url: "https://www.jblinguistics.com/teachers",
  },
};

export default function TeachersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
