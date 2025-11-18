export type StaffRole = "teacher" | "translator";

export type StaffMember = {
  slug: string;
  name: string;
  role: StaffRole;
  roles?: StaffRole[];
  languages: string;          // display string
  langs?: string[];           // structured list for filters
  image: string;
  imageFocus?: string;
  imageFit?: "cover" | "contain";
  tagline: string;
  overview: string;
  background: string[];
  linguistics: string[];
  region?: string;            // e.g., "Germany", "USA", "EU", "Latin America"
  location?: string;          // optional city/country for display
  specialties?: string[];     // e.g., ["Business English","Exam Prep"]
  expertise?: string[];       // alias/extra tags for filters
  profilePath?: string;       // optional override path for nav links
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
      "English (native), German (B2+/C1), French (B2+/C1), Russian (B1), Dutch (B1), Swedish (B1), Danish (B1)",
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
    image: "/images/staff/IMG_3166.WEBP",
    imageFocus: "50% 25%",
    tagline: "Founder, CEO, and TEFL-certified linguist trusted by governments, airlines, and Fortune 500 teams.",
    overview:
      "Jonathan is an international affairs specialist, certified linguist, and aviation leader who has built multilingual programs for NATO-aligned NGOs, Lufthansa-adjacent departments, and German governmental partners across 102 countries. He oversees every JB Linguistics curriculum, certified translation, and interpretation engagement to keep delivery fast, secure, and audit-ready.",
    profilePath: "/teachers/jonathan-brooks",
    background: [
      "B.Sc. in World Religion Studies with minor in Biblical Historical Studies",
      "Master’s degree in International Affairs",
      "168-hour TEFL certification",
      "13+ years leading in-flight operations and international program management",
      "Private pilot licenses (EASA & FAA, IFR rated) with Airbus/Boeing exposure",
      "Builder of 150+ person linguist collectives supporting Bundestag-adjacent and Lufthansa programs",
      "Advises on multilingual crisis command centers, language governance, and compliance documentation",
      "Trusted partner for German governmental, aviation, and humanitarian initiatives requiring sworn linguists",
    ],
    linguistics: [
      "Designs rapid language programs for executives, diplomats, NATO volunteers, and airline crews",
      "Architects certified translation, localization, and interpretation workflows across 20+ languages",
      "Provides executive advisement on compliance-ready learning ecosystems and multilingual crisis response",
    ],
  },
  {
    slug: "lauren-allen",
    role: "teacher",
    roles: ["teacher", "translator"],
    name: "Lauren Allen",
    languages: "English (native) · Norwegian (C1) · Latin & Classical Greek · Old English",
    langs: ["English", "Norwegian", "Latin", "Classical Greek", "Old English"],
    region: "Norway / USA",
    location: "Oslo · Remote",
    specialties: ["Latin & Greek", "Norwegian Coaching", "Translation", "Literary Projects", "Grammar Workshops"],
    image: "/images/staff/Lauren_Allen.jpeg",
    imageFocus: "50% 40%",
    tagline: "Classicist and Norwegian coach focused on precise grammar, meaningful resources, and joyful learning.",
    overview:
      "Lauren is a UC San Diego history graduate who has spent the last decade immersed in classical languages—teaching Latin and Attic Greek since 2014, studying Old English, Old Norse, and Gothic, and writing resources that make canonical texts accessible. After relocating to Norway with her family, she became fluent in Norwegian and now volunteers as a Red Cross Norwegian coach for immigrants and refugees, drawing on her own experience acquiring the language as an adult.",
    background: [
      "B.A. History – University of California, San Diego",
      "Formal study of Classical Latin (since 2012) and Attic Greek (since 2014)",
      "Additional work with Old English, Medieval Latin, Homeric Greek, Old Norse, and Gothic",
      "Red Cross volunteer coach and group leader for spoken Norwegian programs supporting immigrants and refugees",
      "Seven years of Latin/Greek instruction plus author of a learner-friendly edition of Ovid’s Metamorphoses",
    ],
    linguistics: [
      "1:1 and cohort instruction in Latin, Attic/Homeric Greek, and historical English variants",
      "Norwegian coaching for adult learners with fluency goals, civic integration, or exam prep",
      "Translation between English, Norwegian, Latin, and Elizabethan/Old English for academic, literary, and heritage projects",
      "Curriculum design emphasizing rigorous grammar, meaningful content, and learner enjoyment",
    ],
  },
  {
    slug: "michelle-brooks",
    role: "teacher",
    name: "Michelle Brooks",
    languages: "English (native)",
    langs: ["English"],
    region: "USA",
    location: "Global / Remote",
    specialties: ["Medical English", "Business English", "Executive Coaching", "Team Workshops", "Career Advancement"],
    image: "/images/staff/Michelle_Brooks.jpeg",
    imageFocus: "50% 35%",
    tagline: "TEFL-certified linguist delivering executive, medical, and professional English with pragmatic warmth.",
    overview:
      "Michelle pairs 40+ years of linguistics instruction with deep experience in medicine, mental health, academia, and corporate leadership. She is TEFL-certified, holds seven university degrees, and designs English programs that mirror the realities of hospitals, boardrooms, and humanitarian teams. Learners appreciate her personable, engaging coaching style and her commitment to practical language growth that drives professional confidence.",
    background: [
      "168-hour TEFL certification with executive communication focus",
      "Seven university degrees spanning clinical psychology, rehabilitation counseling, business administration, and executive career counseling",
      "Holder of 11 post-graduate certificates spanning clinical modalities, executive leadership, and advanced linguistics pedagogy",
      "40+ years of linguistics teaching for medical providers, psychologists, academics, and business leaders",
      "Executive advisement for first-responder and humanitarian missions",
      "Global volunteer work with international medical and mental health teams",
    ],
    linguistics: [
      "Practical English coaching for medical, mental health, and academic professionals",
      "Executive-level Business English, leadership communication, and team-building intensives",
      "Career advancement, interview prep, and professional writing for multidisciplinary experts",
      "Specialized advisement for first-response and humanitarian deployments",
    ],
  },
  {
    slug: "daniela-leonhardt",
    role: "teacher",
    roles: ["teacher", "translator"],
    name: "Daniela Leonhardt",
    languages: "English · German · French (native-level)",
    langs: ["English", "German", "French"],
    region: "Europe",
    location: "Global / Remote",
    specialties: ["Business English", "French Instruction", "German Instruction", "Document Translation", "Interpreting"],
    image: "/images/staff/daniela-leonhardt-2025.jpg",
    imageFocus: "50% 50%",
    imageFit: "contain",
    tagline: "Trilingual instructor and interpreter raised across Foreign Service posts.",
    overview:
      "Having grown up across U.S. Foreign Service postings, Daniela experienced languages, ceremonies, and customs on nearly every continent. Her French and German degrees let her move among English, French, and German as a native speaker, and she supports executives, expatriates, and diplomatic families with the same flexibility in both classrooms and translation assignments.",
    background: [
      "Childhood spent across Europe, Africa, and Latin America in Foreign Service posts",
      "B.A. French Linguistics; B.A. German Studies",
      "15+ years supporting corporate, diplomatic, and NGO teams with multilingual communication",
      "Leads bilingual workshops and immersive coaching for expatriate leaders",
    ],
    linguistics: [
      "1:1 and cohort training in English, French, and German with an emphasis on intercultural fluency",
      "Document translation and editing across English ↔ French ↔ German, from HR policy to executive presentations",
      "Interpretation for diplomatic briefings, investor meetings, and global town halls",
    ],
  },
  {
    slug: "stephanie-hirsch",
    role: "teacher",
    roles: ["teacher", "translator"],
    name: "Stephanie Hirsch",
    languages: "English (native) · Italian (C1) · Spanish (B2)",
    langs: ["English", "Italian", "Spanish"],
    region: "USA / Italy",
    location: "Los Angeles · Milan (virtual)",
    specialties: ["Italian Instruction", "English Coaching", "Translation", "Interview Prep", "Business English"],
    image: "/images/staff/Stephanie_Hirsch.JPEG.jpg",
    imageFocus: "50% 55%",
    imageFit: "contain",
    tagline: "English and Italian instructor with flight operations and CILS-certified translation experience.",
    overview:
      "Stephanie fell in love with Italian long before moving there in her twenties for a three-month solo backpacking immersion. She formally studied Italian at Los Angeles Pierce College and California State University Northridge, tutored university cohorts, and later relocated to northern Italy to continue her education while teaching English. She holds a CILS C1 credential through a University of Siena affiliated institution and blends classroom rigor with the empathy earned from supporting passengers worldwide as a flight attendant.",
    background: [
      "CILS C1 certification (University of Siena affiliated institute)",
      "Italian tutoring and teaching assistant roles at Los Angeles Pierce College and CSU Northridge",
      "English instructor for adults and children in northern Italy (business, interview prep, and foundational English)",
      "Professional flight attendant leveraging Italian and Spanish for safety, service, and cultural support",
    ],
    linguistics: [
      "Italian coaching from beginner through advanced exam and interview preparation",
      "English lessons tailored to bilingual Italian professionals, expatriates, and aviation teams",
      "Translation across English ↔ Italian plus English ↔ Spanish for education, hospitality, and business use cases",
      "Cultural fluency workshops informed by extensive solo travel from Venice to Salerno and beyond",
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
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
    imageFocus: "50% 35%",
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
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    imageFocus: "50% 30%",
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
