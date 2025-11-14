import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linguistic Learning Trips — JB Linguistics",
  description:
    "Combine tourism with daily English coaching. Browse English-speaking destinations and view 7, 10, 14, or 21-day sample itineraries. Max 10 participants; alternative dates offered when full.",
  openGraph: {
    title: "Linguistic Learning Trips — JB Linguistics",
    description:
      "Combine tourism with daily English coaching. English-speaking destinations with 7, 10, 14, or 21-day sample itineraries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linguistic Learning Trips — JB Linguistics",
    description:
      "Combine tourism with daily English coaching. English-speaking destinations with 7, 10, 14, or 21-day sample itineraries.",
  },
};

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white">
      {children}
    </div>
  );
}
