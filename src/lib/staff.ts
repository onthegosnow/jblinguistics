export type StaffRole = "teacher" | "translator";

export type StaffMember = {
  slug: string;
  name: string;
  role: StaffRole;
  roles?: StaffRole[];
  languages: string;          // display string
  langs?: string[];           // structured list for filters
  image: string;
  tagline: string;
  overview: string;
  background: string[];
  linguistics: string[];
  region?: string;            // e.g., "Germany", "USA", "EU", "Latin America"
  location?: string;          // optional city/country for display
  specialties?: string[];     // e.g., ["Business English","Exam Prep"]
  expertise?: string[];       // alias/extra tags for filters
};

export function hasRole(member: StaffMember, role: StaffRole): boolean {
  if (member.roles?.length) {
    return member.roles.includes(role);
  }
  return member.role === role;
}

export const staff: StaffMember[] = [
  {
    slug: "jonathan-brooks",
    role: "teacher",
    roles: ["teacher", "translator"],
    name: "Jonathan Brooks",
    languages:
      "English (native), German (B2+), French (B2+), Russian (B1), Dutch (B1), Swedish (B1), Danish (B1)",
    langs: ["English", "German", "French", "Russian", "Dutch", "Swedish", "Danish"],
    region: "Germany",
    location: "Berlin / Remote",
    specialties: [
      "Business English",
      "Diplomacy & Government",
      "Aviation English",
      "Academic English",
      "Conversation",
    ],
    image: "/Brand/1740435323075.jpeg",
    tagline: "Founder of JB Linguistics LLC and global language educator.",
    overview:
      "Jonathan is an international affairs specialist and language educator who has worked in 86 countries with international volunteer groups, airlines, and government partners.",
    background: [
      "B.Sc. in World Religion Studies with minor in Biblical Historical Studies",
      "Master’s degree in International Affairs",
      "168-hour TEFL certification",
      "Trained in the airline industry on both Airbus and Boeing aircraft",
      "Private pilot license (PPL) in both EASA and FAA systems",
      "Extensive collaboration with German governmental entities and diplomats (Ü1 security clearance)",
    ],
    linguistics: [
      "Designs custom language programs for corporate teams and diplomats",
      "Special focus on English for international relations, aviation, and cross-cultural work",
      "Experience coordinating translation and interpretation across 20+ languages",
    ],
  },
  {
    slug: "anna-mueller",
    role: "teacher",
    name: "Anna Müller",
    languages: "German, English",
    langs: ["German", "English"],
    region: "Germany",
    location: "Berlin / Remote",
    specialties: ["Business German", "Exam Prep", "Pronunciation", "Academic German"],
    image:
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&dpr=2&w=900",
    tagline: "German language coach for professional and academic learners.",
    overview:
      "Anna focuses on helping professionals gain confident German for work, relocation, and higher education in German-speaking countries.",
    background: [
      "M.A. in German as a Foreign Language",
      "Former university lecturer in Berlin",
      "10+ years teaching international professionals and students",
    ],
    linguistics: [
      "German for business, HR, and internal communication",
      "Exam preparation (Goethe / Telc)",
      "Pronunciation and presentation coaching",
    ],
  },
  {
    slug: "james-carter",
    role: "teacher",
    name: "James Carter",
    languages: "English",
    langs: ["English"],
    region: "USA",
    location: "Denver / Remote",
    specialties: ["Intensive Programs", "Conversation", "Travel English", "Assessment"],
    image:
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&dpr=2&w=900",
    tagline: "ESL specialist for intensive group programs and trips.",
    overview:
      "James leads many of the immersive English trips in the US, combining classroom work with real-life practice in cities and national parks.",
    background: [
      "CELTA-certified ESL teacher",
      "Taught in the US, Ireland, and Germany",
      "Experience with corporate and university groups",
    ],
    linguistics: [
      "Intensive English for travel, work, and study",
      "Design of activity-based lessons during trips",
      "Assessment and feedback for learners at all levels",
    ],
  },
  {
    slug: "lukas-schmidt",
    role: "translator",
    name: "Lukas Schmidt",
    languages: "German ↔ English",
    langs: ["German", "English"],
    region: "Germany",
    location: "Bonn / Remote",
    specialties: ["Legal/Compliance", "Government & Policy", "Terminology Management", "Conference Support"],
    image:
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&dpr=2&w=900",
    tagline:
      "Specialized in legal, governmental, and policy translation between German and English.",
    overview:
      "Lukas works closely with government clients and NGOs on sensitive documentation and meeting support.",
    background: [
      "M.A. in Translation Studies",
      "Former in-house translator for a German ministry",
      "Extensive experience with legal and policy documents",
    ],
    linguistics: [
      "Legal and administrative German ↔ English translation",
      "Terminology management and glossaries for institutions",
      "Support for hybrid and online meetings as interpreter",
    ],
  },
  {
    slug: "elena-rossi",
    role: "translator",
    name: "Elena Rossi",
    languages: "Italian ↔ English",
    langs: ["Italian", "English"],
    region: "EU",
    location: "Milan / Remote",
    specialties: ["Conference Interpreting", "Corporate Communications", "Workshops", "Simultaneous/Consecutive"],
    image:
      "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&dpr=2&w=900",
    tagline:
      "Translator and interpreter for corporate and conference settings.",
    overview:
      "Elena supports European companies with multilingual events and internal communication.",
    background: [
      "Conference interpreting diploma",
      "5+ years interpreting at trade fairs and corporate events",
      "Experience moderating multilingual workshops",
    ],
    linguistics: [
      "Simultaneous and consecutive interpreting (Italian / English)",
      "Company-wide translation workflows",
      "On-site and remote conference support",
    ],
  },
  {
    slug: "sofia-hernandez",
    role: "translator",
    name: "Sofia Hernández",
    languages: "Spanish ↔ English",
    langs: ["Spanish", "English"],
    region: "Latin America",
    location: "Madrid / Remote",
    specialties: ["NGO/Nonprofit", "Education", "Localization", "Webinars"],
    image:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&dpr=2&w=900",
    tagline:
      "Bilingual translator for NGOs, education, and social-impact projects.",
    overview:
      "Sofia works with international organizations to make training and outreach materials accessible in both English and Spanish.",
    background: [
      "B.A. in Linguistics and Spanish",
      "NGO translation and localization experience",
      "Work in community education projects",
    ],
    linguistics: [
      "Translation of training materials and reports",
      "Localization for Latin American and European audiences",
      "Remote simultaneous interpretation for webinars",
    ],
  },
];

export const teachers = staff.filter((p) => hasRole(p, "teacher"));
export const translators = staff.filter((p) => hasRole(p, "translator"));

export function getStaffBySlug(slug: string): StaffMember | undefined {
  return staff.find((person) => person.slug === slug);
}
