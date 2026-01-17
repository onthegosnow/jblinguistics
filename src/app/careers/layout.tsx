import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at JB Linguistics | Join Our Team",
  description: "Join our global network of language professionals. We're hiring teachers, translators, and interpreters who specialize in aviation, banking, government, and corporate communications.",
  openGraph: {
    title: "Careers at JB Linguistics",
    description: "Join our team of language professionals. Open positions for teachers, translators, and interpreters worldwide.",
    url: "https://www.jblinguistics.com/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
