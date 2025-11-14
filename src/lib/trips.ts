// src/lib/trips.ts
export type Destination = {
    slug: string;
    name: string;
    region?: string;
    hero?: string;
    blurb?: string;
    lengths?: number[]; // default: 14
    highlights?: string[];
  };
  
export const DEFAULT_LENGTHS = [7, 10, 14];

export const destinations: Destination[] = [
  // Florida + destination (dual-city)
  {
    slug: "florida-nyc",
    name: "Florida + New York City (2 weeks)",
    region: "North America",
    lengths: [14],
    blurb:
      "Week 1 in Florida focuses on hospitality labs and coastal fluency; Week 2 shifts to Manhattan presentations, museum dialogues, and corporate visits. Max 10 travelers.",
    highlights: [
      "Florida coastal immersion & hospitality English",
      "NYC museums, finance district briefings, and public-speaking labs",
      "Daily 2–3h coaching + curated excursions",
    ],
    hero: "/images/trips/florida-nyc.jpg",
  },
  {
    slug: "florida-bermuda",
    name: "Florida + Bermuda (2 weeks)",
    region: "Atlantic",
    lengths: [14],
    blurb:
      "Split the fortnight between Florida’s innovation corridor and Bermuda’s marine heritage. Ideal for tourism/service teams and NGO delegations.",
    highlights: [
      "Coastal role-plays & service English in Florida",
      "Bermuda heritage walks, marine labs, and diplomacy briefings",
      "Daily coaching, reef excursions, and cultural hosting",
    ],
    hero: "/images/trips/florida-bermuda.jpg",
  },
  {
    slug: "florida-grand-canyon",
    name: "Florida + Grand Canyon (2 weeks)",
    region: "North America",
    lengths: [14],
    blurb:
      "Week 1: Florida coastal fluency. Week 2: American Southwest travel dialogues and national park storytelling culminating at the Grand Canyon.",
    highlights: [
      "Hospitality & aviation English in Florida",
      "Grand Canyon & Sedona field labs focused on storytelling",
      "Coach 2–3h/day + guided hikes and ranger briefings",
    ],
    hero: "/images/trips/florida-grand-canyon.jpg",
  },

  // Florida-only departures
  {
    slug: "florida-immersion-winter",
    name: "Florida Immersion — Winter Cohort (2 weeks)",
    region: "North America",
    lengths: [14],
    blurb:
      "January/February 2026 cohort based in Tampa & St. Petersburg. Focus on executive fluency, aviation, and customer experience.",
    highlights: [
      "Morning coaching blocks + afternoon site visits",
      "Aviation briefing at Tampa International",
      "Inclusive excursions: Salvador Dali Museum, mangrove kayaking",
    ],
    hero: "/images/trips/florida-immersion-winter.jpg",
  },
  {
    slug: "florida-immersion-autumn",
    name: "Florida Immersion — Autumn Cohort (2 weeks)",
    region: "North America",
    lengths: [14],
    blurb:
      "September 2026 cohort around Miami & Fort Lauderdale. Designed for corporate teams and NGO field staff needing fast-track fluency.",
    highlights: [
      "Business English strategy labs each morning",
      "On-site dialogues at PortMiami & Wynwood innovation spaces",
      "Everglades & Little Havana cultural immersions",
    ],
    hero: "/images/trips/florida-immersion-autumn.jpg",
  },

  // Long Beach programs
  {
    slug: "long-beach-ca",
    name: "Long Beach, California (2 weeks)",
    region: "North America",
    lengths: [14],
    blurb:
      "Two-week coastal immersion anchored in Long Beach and sunny Orange County, with day trips into Los Angeles (Getty, Griffith, Hollywood). Ideal for leadership teams who want structured coaching plus real-world practice.",
    highlights: [
      "Morning coaching blocks aboard the Queen Mary & Aquarium of the Pacific briefings",
      "Shoreline Village and Naples canals conversation labs",
      "Orange County day trip through Laguna Beach + LA excursions (Hollywood, Griffith, Getty)",
    ],
    hero: "/images/trips/long-beach.jpg",
  },
  {
    slug: "long-beach-hawaii",
    name: "Long Beach + Hawaii (3 weeks)",
    region: "North America",
    lengths: [21],
    blurb:
      "Week 1 along the Long Beach waterfront with LA cultural visits, Weeks 2–3 in Honolulu for island-based hospitality and service English. Max 10 participants.",
    highlights: [
      "Leadership English intensives across Long Beach & Orange County",
      "Honolulu base with optional inter-island day trips",
      "Certified ESL lead present 8–10h daily for facilitation",
    ],
    hero: "/images/trips/long-beach-hawaii.jpg",
  },

  // Dublin single-week tracks
  {
    slug: "dublin-heritage",
    name: "Dublin Heritage Immersion (7 days)",
    region: "Europe",
    lengths: [7],
    blurb:
      "Culture-forward itinerary anchored in museums, Trinity College, and literary walking tours. Great for educators and public institutions.",
    highlights: [
      "Book of Kells private briefing",
      "Howth coastal negotiations lab",
      "Evening theatre debrief circles",
    ],
    hero: "/images/trips/dublin-heritage.jpg",
  },
  {
    slug: "dublin-business",
    name: "Dublin Business & Tech (7 days)",
    region: "Europe",
    lengths: [7],
    blurb:
      "Focus on tech sector communication with site visits to Docklands, innovation campuses, and multinational HQs.",
    highlights: [
      "Pitch coaching inside Silicon Docks",
      "Enterprise Ireland briefing",
      "Nightly networking simulations",
    ],
    hero: "/images/trips/dublin-business.jpg",
  },
  {
    slug: "dublin-startup",
    name: "Dublin Startup Sprint (7 days)",
    region: "Europe",
    lengths: [7],
    blurb:
      "For founders and NGO project leads who want agile communication drills, coworking days, and mentor feedback.",
    highlights: [
      "Coworking passes & mentor drop-ins",
      "Storytelling bootcamp with Irish facilitators",
      "Weekend excursions to Galway or Belfast",
    ],
    hero: "/images/trips/dublin-startup.jpg",
  },

  // Custom / negotiated project slot
  {
    slug: "custom-tailored",
    name: "Custom Delegation Programs (7–21 days)",
    region: "Global",
    lengths: [7, 10, 14, 21],
    blurb:
      "Need London + Brussels? Singapore + Sydney? We assemble bespoke itineraries aligned to your operational goals, compliance needs, or Bildungsurlaub requirements.",
    highlights: [
      "Choice of English-speaking destinations beyond the core list",
      "Curriculum mapped to your KPIs and regulatory needs",
      "Dedicated project manager + certified ESL lead 8–10h daily",
    ],
    hero: "/images/trips/custom-bespoke.jpg",
  },
];

// Region-level templates (customized beyond the generic fallback)
const regionTemplates: Record<string, { themes: string[]; activities: string[] }> = {
  "Europe": {
    themes: [
      "Cultural Fluency",
      "Listening & Pronunciation",
      "Business English",
      "Meetings & Negotiations",
      "Presentations & Storytelling",
      "Reading & Museum Dialogues",
      "Writing & Email Etiquette",
    ],
    activities: [
      "old town walking tour",
      "museum debate & curation task",
      "market negotiation role‑play",
      "university/innovation campus visit",
      "parks conversation lab",
      "food hall tastings & dialogues",
      "theatre or concert debrief",
    ],
  },
  "North America": {
    themes: [
      "Conversational Fluency",
      "Accent & Listening",
      "Workplace English",
      "Customer & Service Language",
      "Presentations",
      "Email & Docs",
      "Networking & Small Talk",
    ],
    activities: [
      "city neighborhood interviews",
      "national museum discussion",
      "company visit & shadowing",
      "park challenge & scavenger",
      "food hall negotiation game",
      "harbor/skyline tour",
      "capstone reflection",
    ],
  },
  "Caribbean": {
    themes: [
      "Travel English",
      "Service Dialogs",
      "Hospitality & Tourism English",
      "Listening & Pronunciation",
      "Presentations",
      "Email & Messaging",
      "Cultural Fluency",
    ],
    activities: [
      "beach conversations & role‑plays",
      "harbor/snorkel excursion briefings",
      "local cuisine tasting lab",
      "heritage site visit & narration",
      "market bargaining workshop",
      "nature/mangrove tour",
      "sunset capstone discussion",
    ],
  },
  "Atlantic": {
    themes: [
      "Travel English",
      "Service Dialogs",
      "Workplace English",
      "Presentations",
      "Listening & Pronunciation",
      "Email & Messaging",
      "Cultural Fluency",
    ],
    activities: [
      "coastal trail & vocabulary lab",
      "marine life excursion",
      "old town heritage walk",
      "cuisine tasting & dialogue",
      "market negotiation game",
      "art/culture center visit",
      "sunset capstone",
    ],
  },
  "Oceania": {
    themes: [
      "Conversational Fluency",
      "Travel English",
      "Listening & Pronunciation",
      "Workplace English",
      "Presentations",
      "Reading & Discussion",
      "Email & Messaging",
    ],
    activities: [
      "harbor or coastal walk",
      "island history museum",
      "market challenge",
      "nature reserve excursion",
      "company/tech hub visit",
      "local cuisine tasting",
      "island capstone",
    ],
  },
  "Asia": {
    themes: [
      "Business & Tech English",
      "Listening & Pronunciation",
      "Meetings & Negotiations",
      "Presentations",
      "Email & Messaging",
      "Cultural Fluency",
      "Travel English",
    ],
    activities: [
      "financial district/tech park visit",
      "heritage quarters walk",
      "hawker/market negotiation lab",
      "museum case-study discussion",
      "riverfront/skyline tour",
      "temple/site cultural debrief",
      "capstone reflection",
    ],
  },
  "Africa": {
    themes: [
      "Conversational Fluency",
      "Listening & Pronunciation",
      "Workplace English",
      "NGO & Development English",
      "Presentations",
      "Email & Reports",
      "Cultural Fluency",
    ],
    activities: [
      "city heritage walk",
      "market bargaining workshop",
      "museum/history center",
      "company/NGO site visit",
      "nature or safari reserve trip",
      "music & arts evening",
      "capstone reflection",
    ],
  },
};

export function itineraryFor(
  d: Destination,
  length: number = 14
): { days: { title: string; lesson: string; activity: string }[] } {
  const bySlug: Record<string, { themes: string[]; activities: string[] }> = {
    "florida": {
      themes: [
        "Conversational Fluency",
        "Hospitality & Service English",
        "Listening & Pronunciation",
        "Presentations",
        "Email & Messaging",
        "Cultural Fluency",
        "Travel English",
      ],
      activities: [
        "coastal boardwalk conversation lab",
        "museum & aquarium discussion",
        "market negotiation workshop",
        "nature reserve excursion",
        "company/airport visit (where applicable)",
        "food hall tasting dialogs",
        "sunset capstone",
      ],
    },
    "florida-nyc": {
      themes: [
        "Conversational Fluency",
        "Hospitality & Service English",
        "Business English",
        "Meetings & Negotiations",
        "Presentations",
        "Email & Docs",
        "Networking & Small Talk",
      ],
      activities: [
        "Florida coastal walk & role‑plays",
        "aquarium/park lab",
        "NYC museum debate",
        "financial district walk",
        "company/campus visit",
        "food hall negotiation",
        "skyline/harbor tour",
      ],
    },
    "florida-bermuda": {
      themes: [
        "Travel English",
        "Service Dialogs",
        "Workplace English",
        "Listening & Pronunciation",
        "Presentations",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "Florida coastal conversation lab",
        "museum/culture center",
        "Bermuda heritage walk",
        "marine excursion briefings",
        "market negotiation",
        "railway trail/Glass Beach",
        "sunset capstone",
      ],
    },
    "florida-grand-canyon": {
      themes: [
        "Travel English",
        "Presentations & Storytelling",
        "Listening & Pronunciation",
        "Email & Messaging",
        "Workplace English",
        "Cultural Fluency",
        "Conversational Fluency",
      ],
      activities: [
        "Florida coastal conversation lab",
        "museum visit & discussion",
        "national park orientation",
        "Grand Canyon rim walk",
        "heritage center visit",
        "market/food hall dialogs",
        "capstone reflection",
      ],
    },
    "long-beach-ca": {
      themes: [
        "Conversational Fluency",
        "Listening & Pronunciation",
        "Workplace English",
        "Presentations",
        "Travel English",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "Queen Mary waterfront walk",
        "Aquarium of the Pacific session",
        "Shoreline Village role‑plays",
        "Naples canals conversation lab",
        "LA day trip (Getty/Griffith/Hollywood)",
        "Harbor cruise dialogs",
        "capstone reflection",
      ],
    },
    "long-beach-hawaii": {
      themes: [
        "Conversational Fluency",
        "Service & Hospitality English",
        "Travel English",
        "Listening & Pronunciation",
        "Presentations",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "Long Beach waterfront conversation lab",
        "LA museum/campus visit",
        "Honolulu historic district walk",
        "beach safety & dialogs",
        "nature reserve/island excursion",
        "market negotiation workshop",
        "sunset capstone",
      ],
    },
    "ireland": {
      themes: [
        "Conversational Fluency",
        "Listening & Pronunciation",
        "Workplace English",
        "Storytelling & Presentations",
        "Travel English",
        "Reading Irish Culture",
        "Writing & Email Etiquette",
      ],
      activities: [
        "Dublin city walk & Trinity College",
        "Howth coastal walk & fish market dialogs",
        "Museum of Literature Ireland",
        "Tech campus visit & networking",
        "Distillery tour vocabulary lab",
        "Bookshop crawl & reading circle",
        "Pub music night discussion",
      ],
    },
    "united-kingdom": {
      themes: [
        "Business English",
        "Pronunciation (UK variants)",
        "Meetings & Negotiations",
        "Public Speaking",
        "Cultural Fluency",
        "Email & Reports",
        "Networking Language",
      ],
      activities: [
        "Westminster & Whitehall walk",
        "Museum debate at the British Museum",
        "City firm visit & briefing",
        "Royal Parks conversation lab",
        "Markets role‑play (Borough/Camden)",
        "Oxford or Cambridge day trip",
        "Theatre night debrief",
      ],
    },
    "united-states": {
      themes: [
        "Conversational Fluency",
        "Accent & Listening",
        "Workplace English",
        "Presentations",
        "Customer Language",
        "Email & Docs",
        "Networking & Small Talk",
      ],
      activities: [
        "NYC neighborhood interviews",
        "National museum discussion",
        "Company visit & shadowing",
        "Central Park challenge",
        "Food hall negotiation game",
        "Harbor or skyline tour",
        "Capstone reflection",
      ],
    },
    "cayman-islands": {
      themes: [
        "Travel English",
        "Service Dialogs",
        "Finance English Basics",
        "Presentations",
        "Listening & Pronunciation",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "Seven Mile Beach conversations",
        "Stingray City excursion",
        "George Town finance walk",
        "Cayman cuisine tasting",
        "Mangrove nature tour",
        "Art & culture center",
        "Sunset capstone",
      ],
    },
    "malta": {
      themes: [
        "History & Culture English",
        "Conversational Fluency",
        "Listening & Pronunciation",
        "Workplace English",
        "Presentations",
        "Reading & Discussion",
        "Writing & Email",
      ],
      activities: [
        "Valletta heritage walk",
        "Mdina & Rabat field lesson",
        "Harbor cruise dialogs",
        "Three Cities visit",
        "Fort St. Elmo museum",
        "Local market challenge",
        "Island capstone",
      ],
    },
    // Add a few more destination‑specific tweaks Germans commonly choose:
    "canada": {
      themes: [
        "Conversational Fluency",
        "Accent & Listening (NAE)",
        "Workplace English",
        "Presentations",
        "Email & Docs",
        "Customer Language",
        "Networking & Small Talk",
      ],
      activities: [
        "old town & waterfront walk",
        "museum/culture center discussion",
        "company/innovation hub visit",
        "park or coastal trail challenge",
        "food hall tasting dialogs",
        "harbor/islands boat tour",
        "capstone reflection",
      ],
    },
    "australia": {
      themes: [
        "Conversational Fluency",
        "Listening & Pronunciation (AUS)",
        "Workplace English",
        "Presentations",
        "Travel English",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "harbor bridge/foreshore walk",
        "beach safety & dialogs",
        "museum of contemporary art debate",
        "coastal hike language lab",
        "market negotiation workshop",
        "wildlife reserve visit",
        "sunset capstone",
      ],
    },
    "new-zealand": {
      themes: [
        "Conversational Fluency",
        "Listening & Pronunciation",
        "Workplace English",
        "Presentations",
        "Travel English",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "harbor & ferry dialogs",
        "museum/maori culture session",
        "urban park interviews",
        "nature reserve excursion",
        "local market challenge",
        "coastal drive discussion",
        "capstone reflection",
      ],
    },
    "bermuda": {
      themes: [
        "Travel English",
        "Service Dialogs",
        "Workplace English",
        "Presentations",
        "Email & Messaging",
        "Listening & Pronunciation",
        "Cultural Fluency",
      ],
      activities: [
        "St. George’s heritage walk",
        "coastal trail & beach lab",
        "Hamilton town business walk",
        "maritime museum visit",
        "market negotiation workshop",
        "glass beach/railway trail",
        "sunset capstone",
      ],
    },
    "barbados": {
      themes: [
        "Travel English",
        "Service Dialogs",
        "Hospitality English",
        "Presentations",
        "Listening & Pronunciation",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "historic Bridgetown walk",
        "beach/snorkel excursion",
        "Mount Gay heritage & dialogs",
        "local market & street food",
        "Harrison’s Cave visit",
        "nature reserve",
        "sunset capstone",
      ],
    },
    "jamaica": {
      themes: [
        "Travel English",
        "Service Dialogs",
        "Hospitality English",
        "Listening & Pronunciation",
        "Presentations",
        "Email & Messaging",
        "Cultural Fluency",
      ],
      activities: [
        "Kingston heritage & music lab",
        "Blue Mountains excursion",
        "Port Royal history walk",
        "market role‑play",
        "beach & reef dialogs",
        "local cuisine tasting",
        "capstone reflection",
      ],
    },
    "singapore": {
      themes: [
        "Business & Tech English",
        "Meetings & Negotiations",
        "Presentations",
        "Email & Messaging",
        "Cultural Fluency",
        "Travel English",
        "Listening & Pronunciation",
      ],
      activities: [
        "Marina Bay/financial district walk",
        "heritage quarters (Chinatown/Little India)",
        "hawker center negotiation lab",
        "museum case study",
        "gardens by the bay discussion",
        "riverfront tour",
        "capstone reflection",
      ],
    },
    "india": {
      themes: [
        "Business English",
        "Cultural Fluency",
        "Presentations",
        "Email & Reports",
        "Customer Language",
        "Listening & Pronunciation",
        "Travel English",
      ],
      activities: [
        "old city heritage walk",
        "market bargaining workshop",
        "company/tech park visit",
        "museum & history center",
        "temple/fort cultural debrief",
        "street food dialogues",
        "capstone reflection",
      ],
    },
    "south-africa": {
      themes: [
        "Conversational Fluency",
        "Workplace English",
        "Presentations",
        "Email & Reports",
        "Cultural Fluency",
        "Listening & Pronunciation",
        "Travel English",
      ],
      activities: [
        "city heritage walk",
        "museum/apartheid center discussion",
        "company/NGO site visit",
        "nature reserve or coastal trail",
        "market negotiation lab",
        "music & culture night",
        "capstone reflection",
      ],
    },
  };

  const fallback = {
    themes: [
      "Conversational Fluency",
      "Listening & Pronunciation",
      "Workplace English",
      "Presentations & Storytelling",
      "Vocabulary for Travel",
      "Reading & Culture",
      "Writing & Email Etiquette",
    ],
    activities: [
      "city walking tour",
      "market scavenger challenge",
      "museum & discussion",
      "local company visit",
      "nature excursion",
      "food tasting & dialogue",
      "capstone reflection",
    ],
  };

  const regionSpec = d.region ? regionTemplates[d.region] : undefined;
  const spec = bySlug[d.slug] || regionSpec || fallback;

  const days: { title: string; lesson: string; activity: string }[] = [];
  for (let i = 0; i < length; i++) {
    const day = i + 1;
    const theme = spec.themes[i % spec.themes.length];
    const activity = spec.activities[i % spec.activities.length];
    days.push({
      title: `Day ${day} — ${theme}`,
      lesson: `2–3 hr coached session focused on ${theme.toLowerCase()}.`,
      activity: `Guided ${activity} in ${d.name}.`,
    });
  }
  return { days };
}
