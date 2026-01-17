import type { Metadata } from "next";
import { LanguageTrainingStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Corporate Language Training | JB Linguistics",
  description: "Virtual-first language programs for aviation, banking, government, and corporate teams. Executive English coaching, compliance training, and immersive Linguistic Learning Trips.",
  openGraph: {
    title: "Corporate Language Training | JB Linguistics",
    description: "Virtual-first language programs built around your deliverables. Executive English, aviation-specific training, and multilingual leadership coaching.",
    url: "https://www.jblinguistics.com/services/linguistic-learning",
  },
};

export default function LinguisticLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LanguageTrainingStructuredData />
      {children}
    </>
  );
}
