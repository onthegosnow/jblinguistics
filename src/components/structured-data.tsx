// JSON-LD Structured Data for SEO
// These schemas help search engines understand the business and services

const BASE_URL = "https://www.jblinguistics.com";

// Organization/LocalBusiness schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "EducationalOrganization", "LocalBusiness"],
  "@id": `${BASE_URL}/#organization`,
  name: "JB Linguistics LLC",
  alternateName: "JB Linguistics",
  description: "Global language services company offering corporate language training, certified translation, and simultaneous interpretation for aviation, banking, government, and enterprise clients.",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/Brand/JB%20LOGO%20no%20TEXT.png`,
    width: 512,
    height: 512,
  },
  image: `${BASE_URL}/Brand/JB%20LOGO%20no%20TEXT.png`,
  email: "contact@jblinguistics.com",
  foundingDate: "2020",
  founder: {
    "@type": "Person",
    name: "Jonathan Brooks",
    url: `${BASE_URL}/teachers/jonathan-brooks`,
  },
  address: [
    {
      "@type": "PostalAddress",
      addressCountry: "US",
      addressRegion: "United States",
    },
    {
      "@type": "PostalAddress",
      addressCountry: "DE",
      addressRegion: "Germany",
    },
  ],
  areaServed: [
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Germany" },
    { "@type": "Country", name: "Netherlands" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Sweden" },
    { "@type": "Country", name: "Spain" },
    { "@type": "Continent", name: "Europe" },
  ],
  knowsLanguage: [
    "en", "de", "nl", "fr", "sv", "es", "zh", "ja", "ko", "ar", "ru", "it", "pt"
  ],
  serviceType: [
    "Language Training",
    "Corporate Language Programs",
    "Certified Translation",
    "Document Translation",
    "Simultaneous Interpretation",
    "Consecutive Interpretation",
  ],
  sameAs: [
    // Add social media URLs when available
  ],
};

// Service schemas for each main service
export const languageTrainingServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/services/linguistic-learning#service`,
  name: "Corporate Language Training",
  alternateName: "Linguistic Learning Programs",
  description: "Virtual-first language programs for aviation, banking, government, and corporate teams. Executive English coaching, compliance training, and immersive Linguistic Learning Trips.",
  provider: {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "JB Linguistics LLC",
  },
  serviceType: "Language Training",
  areaServed: "Worldwide",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceType: "Virtual and In-Person",
    availableLanguage: ["English", "German", "French", "Dutch", "Spanish", "Swedish", "Mandarin"],
  },
  offers: {
    "@type": "Offer",
    eligibleRegion: "Worldwide",
    availability: "https://schema.org/InStock",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Corporate professionals, executives, aviation crews, government officials",
  },
  url: `${BASE_URL}/services/linguistic-learning`,
};

export const translationServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/services/translation-localization#service`,
  name: "Translation & Localization Services",
  alternateName: "Certified Document Translation",
  description: "Certified document and website translation for regulated industries. Sworn translations, localization, and terminology management in Dutch, English, French, German, Mandarin, Spanish, and Swedish.",
  provider: {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "JB Linguistics LLC",
  },
  serviceType: "Translation Services",
  areaServed: "Worldwide",
  availableChannel: {
    "@type": "ServiceChannel",
    availableLanguage: ["English", "German", "French", "Dutch", "Spanish", "Swedish", "Mandarin"],
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Translation Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Certified Document Translation",
          description: "Court-ready sworn translations for immigration, corporate governance, aviation, and banking documents.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Website Localization",
          description: "Marketing sites, passenger portals, and LMS platforms localized with accessibility and SEO.",
        },
      },
    ],
  },
  url: `${BASE_URL}/services/translation-localization`,
};

export const interpretationServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/services/simultaneous-interpretation#service`,
  name: "Simultaneous Interpretation Services",
  alternateName: "Conference Interpretation",
  description: "Remote-first interpretation for UN briefings, airlines, banks, and regulated industries. Simultaneous, consecutive, and hybrid standby interpretation services.",
  provider: {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "JB Linguistics LLC",
  },
  serviceType: "Interpretation Services",
  areaServed: "Worldwide",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceType: "Remote and On-Site",
    availableLanguage: ["English", "German", "French", "Dutch", "Spanish", "Swedish", "Mandarin"],
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Interpretation Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Remote Simultaneous Interpretation",
          description: "Diplomatic visits, board sessions, and investor days via Zoom, Teams, or Webex.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Consecutive Interpretation",
          description: "C-suite interviews, technical workshops, and negotiations.",
        },
      },
    ],
  },
  url: `${BASE_URL}/services/simultaneous-interpretation`,
};

export const learningTripsServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/trips#service`,
  name: "Linguistic Learning Trips",
  description: "Immersive language learning experiences combining travel with professional instruction. Educational trips with CEFR-aligned curriculum and employer reimbursement documentation.",
  provider: {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "JB Linguistics LLC",
  },
  serviceType: "Educational Travel",
  areaServed: "Worldwide",
  url: `${BASE_URL}/trips`,
};

// Combined schemas for homepage
export const homepageSchemas = [
  organizationSchema,
  languageTrainingServiceSchema,
  translationServiceSchema,
  interpretationServiceSchema,
];

// Component to inject JSON-LD into page head
export function StructuredData({ schemas }: { schemas: object | object[] }) {
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas];

  return (
    <>
      {schemaArray.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// Pre-built components for common pages
export function OrganizationStructuredData() {
  return <StructuredData schemas={organizationSchema} />;
}

export function HomepageStructuredData() {
  return <StructuredData schemas={homepageSchemas} />;
}

export function LanguageTrainingStructuredData() {
  return <StructuredData schemas={[organizationSchema, languageTrainingServiceSchema]} />;
}

export function TranslationStructuredData() {
  return <StructuredData schemas={[organizationSchema, translationServiceSchema]} />;
}

export function InterpretationStructuredData() {
  return <StructuredData schemas={[organizationSchema, interpretationServiceSchema]} />;
}

export function TripsStructuredData() {
  return <StructuredData schemas={[organizationSchema, learningTripsServiceSchema]} />;
}

// Generate Person schema for staff profiles
export function generatePersonSchema(person: {
  name: string;
  slug: string;
  role: string;
  tagline?: string;
  languages?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/teachers/${person.slug}#person`,
    name: person.name,
    jobTitle: person.role === "teacher" ? "Language Instructor" : "Professional Translator",
    description: person.tagline,
    knowsLanguage: person.languages?.split(",").map(l => l.trim()),
    image: person.image,
    worksFor: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "JB Linguistics LLC",
    },
    url: `${BASE_URL}/teachers/${person.slug}`,
  };
}
