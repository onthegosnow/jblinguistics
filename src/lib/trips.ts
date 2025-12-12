// src/lib/trips.ts
export type Destination = {
  slug: string;
  name: string;
  region?: string;
  hero?: string;
  heroSplit?: { left: string; right: string; altLeft?: string; altRight?: string };
  blurb?: string;
  lengths?: number[]; // default: 14
  highlights?: string[];
  customItinerary?: Record<number, { title: string; lesson: string; activity: string }[]>;
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
    heroSplit: {
      left: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=80",
      right: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1000&q=80",
      altLeft: "Miami palm trees and boardwalk",
      altRight: "Statue of Liberty",
    },
  },
  {
    slug: "florida-bermuda",
    name: "Florida + Bahamas (2 weeks)",
    region: "Caribbean",
    lengths: [14],
    blurb:
      "Split the fortnight between Florida’s innovation corridor and the Bahamas’ marine heritage. Ideal for tourism/service teams and NGO delegations.",
    highlights: [
      "Coastal role-plays & service English in Florida",
      "Bahamas heritage walks, marine labs, and diplomacy briefings",
      "Daily coaching, reef excursions, and cultural hosting",
    ],
    heroSplit: {
      left: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1000&q=80",
      right: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
      altLeft: "Florida Keys turquoise water",
      altRight: "Bahamas pink sand cove",
    },
  },
  {
    slug: "florida-grand-cayman",
    name: "Florida + Grand Cayman (2 weeks)",
    region: "Caribbean",
    lengths: [14],
    blurb:
      "Week 1 spotlights Florida hospitality labs; Week 2 moves to Grand Cayman for reef conservation, finance hub visits, and beachside coaching.",
    highlights: [
      "Orlando/Tampa aviation English intensives",
      "Grand Cayman reef excursions, mangrove kayaks, and George Town finance walk",
      "Daily 2–3h coaching plus snorkeling, sunset catamarans, and culinary labs",
    ],
    heroSplit: {
      left: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      right: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1000&q=80",
      altLeft: "Miami Beach sunrise",
      altRight: "Grand Cayman Seven Mile Beach",
    },
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
    hero:
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80",
  },

  // Southern California programs
  {
    slug: "long-beach-ca",
    name: "Southern California Immersion (2 weeks)",
    region: "North America",
    lengths: [14],
    blurb:
      "Two-week coastal immersion covering Los Angeles, Orange County, and San Diego with day trips into iconic neighborhoods (Getty, Griffith, Hollywood, Balboa Park). Ideal for leadership teams seeking structured coaching plus real-world practice.",
    highlights: [
      "Morning coaching blocks aboard the Queen Mary & Aquarium of the Pacific briefings",
      "Conversation labs along Santa Monica, Newport Beach, and La Jolla coastlines",
      "Excursions through LA, Orange County, and San Diego (Hollywood, Griffith, Balboa Park)",
    ],
    heroSplit: {
      left: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80",
      right: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1000&q=80",
      altLeft: "Laguna Beach shoreline at sunset",
      altRight: "Hollywood sign view",
    },
  },
  {
    slug: "long-beach-hawaii",
    name: "Southern California + Hawaii (3 weeks)",
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
    customItinerary: {
      7: [
        {
          title: "Day 1 · Frankfurt to Dublin",
          lesson: "Conversational warm-up at the departure gate plus taxi-dialogue drills en route to the city.",
          activity: "Trinity College grounds, Book of Kells gallery, and sunset tour + pint at the Guinness Storehouse.",
        },
        {
          title: "Day 2 · Wild Atlantic Way",
          lesson: "Sentence-structure labs on the coach ride with instant correction and vocabulary challenges.",
          activity: "Cliffs of Moher excursion, fish & chips in Doolin, and photo stops outside roadside castles before returning to Dublin.",
        },
        {
          title: "Day 3 · Coastal Howth",
          lesson: "Harbor negotiation role-plays and pronunciation tune-ups over breakfast.",
          activity: "Train to Howth, seafood lunch overlooking the harbor, cliff walk conversation circles, and evening cheese boards at Temple Bar.",
        },
        {
          title: "Day 4 · Dublin tech & startups",
          lesson: "Presentation clinic at a coworking space with peer feedback loops.",
          activity: "Docklands innovation visits, storytelling bootcamp, and live-music scavenger hunt through the city center.",
        },
        {
          title: "Day 5 · Elective day trip",
          lesson: "Storytelling + journaling review on the coach to either Galway or Belfast (group choice).",
          activity: "Street-art walk, museum stop, and café debrief before returning for a relaxed evening.",
        },
        {
          title: "Day 6 · Cultural deep dive",
          lesson: "Grammar refinement over shared breakfast and vocabulary lightning rounds.",
          activity: "Museum or Gaelic sports outing followed by small-group coaching and optional theatre night.",
        },
        {
          title: "Day 7 · Coffeehouse capstone",
          lesson: "Final pronunciation checks, goal review, and personal action plans at a local café.",
          activity: "Check-out logistics coaching, practical airport dialogues, and evening flight back to Frankfurt.",
        },
      ],
    },
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
    name: "Custom English Team Building Events (7–21 days)",
    region: "Global",
    lengths: [7, 10, 14, 21],
    blurb:
      "Need London + Brussels? Singapore + Sydney? We assemble bespoke itineraries focused on English team building for executives, NGOs, and enterprise groups, aligned to your operational goals, compliance needs, or Bildungsurlaub requirements.",
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
  length: number = 14,
  override?: Record<number, { title: string; lesson: string; activity: string }[]>
): { days: { title: string; lesson: string; activity: string }[] } {
  if (override?.[length]) {
    return { days: override[length] as { title: string; lesson: string; activity: string }[] };
  }
  if (d.customItinerary?.[length]) {
    return { days: d.customItinerary[length] as { title: string; lesson: string; activity: string }[] };
  }
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
        "Bahamas heritage walk",
        "marine excursion briefings",
        "market negotiation",
        "island trail / beach immersion",
        "sunset capstone",
      ],
    },
    "florida-grand-cayman": {
      themes: [
        "Hospitality English",
        "Finance & Compliance",
        "Listening & Pronunciation",
        "Email & Messaging",
        "Storytelling",
        "Cultural Fluency",
        "Conversational Fluency",
      ],
      activities: [
        "Florida coastal conversation lab",
        "aviation briefing + airport back-of-house tour",
        "reef conservation snorkel",
        "George Town finance district walk",
        "mangrove kayak vocabulary sprint",
        "sunset catamaran networking",
        "beachside capstone + coconut tasting",
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

  const funAddOns = [
    " capped with a street-food tasting challenge",
    " plus a journaling circle at a local café",
    " followed by a sunset photo scavenger hunt",
    " with live music or theatre tickets for the evening",
    " alongside a charity micro-mission or volunteer drop-in",
  ];

  const regionSpec = d.region ? regionTemplates[d.region] : undefined;
  const spec = bySlug[d.slug] || regionSpec || fallback;

  const days: { title: string; lesson: string; activity: string }[] = [];
  for (let i = 0; i < length; i++) {
    const day = i + 1;
    const theme = spec.themes[i % spec.themes.length];
    const activity = spec.activities[i % spec.activities.length];
    const addOn = funAddOns[i % funAddOns.length];
    days.push({
      title: `Day ${day} — ${theme}`,
      lesson: `Immersive studio on ${theme.toLowerCase()} with rapid-fire drills, feedback, and personal action items.`,
      activity: `Guided ${activity} in ${d.name}${addOn}.`,
    });
  }
  return { days };
}
