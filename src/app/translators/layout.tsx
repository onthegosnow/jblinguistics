import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Translators | JB Linguistics",
  description: "Certified translators for legal, aviation, banking, and government documents. Sworn translations in Dutch, English, French, German, Mandarin, Spanish, Swedish, and more.",
  openGraph: {
    title: "Professional Translators | JB Linguistics",
    description: "Certified and sworn translators for regulated industries. Court-ready document translation and localization services.",
    url: "https://www.jblinguistics.com/translators",
  },
};

export default function TranslatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
