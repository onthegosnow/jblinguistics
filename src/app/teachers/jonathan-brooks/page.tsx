import type { Metadata } from "next";
import { JonathanBrooksProfile } from "./profile-client";

export const metadata: Metadata = {
  title: "Jonathan Brooks — JB Linguistics",
  description:
    "TEFL-certified instructor with diplomatic and government experience. English (native), German B2+, French B2+. Bio, languages, and profile highlights.",
};

export default function JonathanBrooksPage() {
  return <JonathanBrooksProfile />;
}

