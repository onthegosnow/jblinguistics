import type { Lang } from "./i18n";
import { destinationCopy, type DestinationLocaleCopy } from "./destination-copy";
export { languages, type Lang } from "./i18n";
export type { DestinationLocaleCopy };

type ServiceCardKey = "learning" | "translation" | "interpretation" | "documents";

type ServiceCard = {
  key: ServiceCardKey;
  title: string;
  description: string;
};

type EnterpriseCard = {
  title: string;
  text: string;
  bullets: string[];
};

export const copy = {
  en: {
    nav: {
      mission: "Mission",
      teacher: "Linguistic Learning",
      translator: "Translation services",
      staff: "Staff",
      trips: "Learning Trips",
      contact: "Contact",
      aboutJb: "Meet our CEO",
      careers: "Join our team",
      viewAllDestinations: "View all destinations",
      viewAllStaff: "View all",
      ctaLabel: "Get a quote",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "Virtual-first language training, certified document and website translations, and diplomacy-grade interpretation tailored to your goals.",
      ctaPrimary: "Request a consultation",
      ctaSecondary: "Explore services",
      meetJB: "Meet Jonathan Brooks",
      highlights: [
        "Registered as JB Linguistics LLC (Florida) and JB Linguistics GmbH (Germany) to support U.S. and EU clients.",
        "All services are virtual unless you book a Linguistic Learning Trip.",
        "Certified document & website translations with rigorous QA and sworn linguists.",
        "Programs delivered in Dutch, English, French, German, Mandarin, Spanish, and Swedish.",
      ],
      cardTitle: "Practical language learning, translation & interpretation",
      cardBody:
        "Sessions can be fully virtual or arranged in person – from one-to-one coaching to high-level diplomatic settings.",
      badgeTitle: "Security-aware language support",
      badgeText:
        "Trusted with German government work and multinational projects that require discretion and compliance-ready delivery.",
    },
    mission: {
      heading: "Mission Statement",
      text:
        "JB LINGUISTICS LLC engineers high-velocity, fully virtual language programs that respect every learner’s goals, pace, and compliance requirements. We provide secure classrooms, LMS seats, recordings, assessments, and curated materials at no cost to our client organizations so teams can focus on measurable progress. Our linguists accelerate mastery, keep stakeholders audit-ready, and minimize the budget, time away from mission, and travel typically associated with language upskilling.",
      text2:
        "We pair that learning engine with certified document and website translations plus interpretation services that meet government, airline, and enterprise standards. Operating as a remote-first collective allows us to compensate our highly educated contractors significantly above industry norms while passing efficiency back to clients through transparent pricing. Your needs define our objectives; your KPIs become the benchmarks that guide every engagement.",
    },
    virtual: {
      heading: "Virtual delivery, zero-cost materials",
      text:
        "Every corporate curriculum runs virtually unless you intentionally book one of our linguistic learning trips. We include the secure classroom, LMS seats, recordings, and resource licenses at no cost to your team.",
      bullets: [
        "Live coaching plus asynchronous labs, glossaries, and drills included.",
        "Secure, NDA-ready platforms aligned with compliance and audit requirements.",
        "In-person formats are reserved for immersive Linguistic Learning Trips to keep overhead low.",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "Linguistic Learning",
          description:
            "Virtual 1:1 and cohort programs mapped to your KPIs, industry terminology, and company culture.",
        },
        {
          key: "translation",
          title: "Translation & Localization",
          description:
            "Certified website translation, localization for training portals, and ready-to-deploy content for policy and operations.",
        },
        {
          key: "interpretation",
          title: "Simultaneous Interpretation",
          description:
            "Remote simultaneous and consecutive interpretation for briefings, tenders, and high-stakes negotiations.",
        },
        {
          key: "documents",
          title: "Certified Document Translation",
          description:
            "Legal, immigration, aviation, banking, and HR documentation handled by sworn translators and reviewers.",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "Linguistic Learning",
      intro:
        "Language learning at JB Linguistics is practical, immersive, and individually tailored so every session supports your actual work.",
      bullets: [
        "Virtual coaching for executives, aviation crews, NGOs, and government teams",
        "Curricula aligned to KPIs, compliance rules, and company culture",
        "Resource libraries, recordings, and assignments provided at no cost",
        "Optional linguistic learning trips when your team needs in-person immersion",
      ],
      ctas: {
        viewAll: "See all teachers",
        meetJB: "Meet Jonathan Brooks",
        request: "Request a consultation",
        assessment: "Launch placement test",
        book: "Book JB",
      },
      banner: {
        title: "Fast-paced coaching for global teams",
        text:
          "Sessions revolve around your calls, decks, RFPs, and negotiations so every hour delivers immediate impact.",
      },
      gridTitle: "Featured Teachers",
      cardRole: "Instructor",
      cardLink: "Ask about this teacher",
    },
    translator: {
      heading: "Translation & Interpretation",
      intro:
        "From certified documents to UN-ready interpretation, JB Linguistics provides the virtual, secure, and responsive language support your programs demand.",
      servicesTitle: "Core Services",
      services: [
        "Certified document translation for legal, immigration, aviation, HR, and procurement needs",
        "Certified website translation & localization with accessibility, privacy, and SEO in mind",
        "Localization for training portals, LMS modules, and policy briefings",
        "Remote simultaneous and consecutive interpretation for briefings and negotiations",
        "Terminology management for UN, airline, and banking partners",
      ],
      ctaJB: "Work with Jonathan Brooks",
      badgeTitle: "Virtual & compliance-ready projects",
      badgeText:
        "Every engagement is scoped with confidentiality measures, terminology prep, and the security-screened talent your project requires.",
      gridTitle: "Featured Translators & Interpreters",
      cardRoleSuffix: "Translator",
      cardLink: "Check availability",
      gridCta: "Request an interpreter",
    },
    enterprise: {
      heading: "Multilateral & enterprise partnerships",
      intro:
        "JB Linguistics positions teams for UN missions, airline operations, and regulated industries that need fast yet precise language outcomes.",
      cards: [
        {
          title: "UN & Multilateral Readiness",
          text: "Briefings, humanitarian updates, procurement packets, and training modules for global teams.",
          bullets: [
            "Rapid translation of sitreps, MoUs, and mission documents",
            "Virtual facilitation across New York, Geneva, Nairobi, and beyond",
            "Familiar with UN procurement, security, and disclosure language",
          ],
        },
        {
          title: "Airlines & Aviation (Lufthansa-ready)",
          text:
            "Translation and interpretation for airline operations, crew communication, and safety documentation.",
          bullets: [
            "OPS briefings, irregular-operations messaging, and safety bulletins",
            "Aviation SEO, website, and customer experience localization",
            "Experience supporting Lufthansa-aligned processes and Star Alliance partners",
          ],
        },
        {
          title: "Financial & Banking Partners",
          text: "Language operations for global banks, airlines, and treasury teams.",
          bullets: [
            "Certified translations for contracts, regulatory filings, and shareholder updates",
            "Terminology management for KYC, onboarding, and internal controls",
            "Embedded language support for vendor diligence and strategic projects",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "Government & Security-Aware Work",
      text: [
        "Jonathan Brooks has supported German governmental entities for more than a decade and understands the security protocols required for sensitive assignments.",
        "This experience allows JB Linguistics LLC to serve ministries, diplomats, and government vendors that require confidentiality, precision, and quick turnarounds.",
      ],
      highlightsTitle: "Profile Highlights",
      highlights: [
        "B.A. Political Science & World Religion Studies; M.A. International Affairs (Hostage Negotiations)",
        "168-hour TEFL certification plus postgraduate ESL & TOEFL credentials",
        "Languages: English & French (native); German (B2+); Dutch, Swedish, Danish, Russian (B1)",
        "Built and led global teams of 150+ translators for German government contracts",
        "Designed bilingual training for diplomats, aviation leadership, and cross-border NGOs",
        "FAA & EASA private pilot licenses (IFR) with Airbus and Boeing operations exposure",
        "Experience aligning language workflows with German security-screening requirements",
      ],
      ctaBio: "Read Jonathan Brooks’s full bio",
    },
    trips: {
      heading: "Linguistic Learning Trips",
      intro:
        "For teams who want to combine fun travel with immersive language coaching, JB Linguistics designs bespoke itineraries anchored in daily lessons and cultural adventures.",
      bullets: [
        "Custom itineraries in German-speaking countries and beyond",
        "Language coaching woven into excursions, meals, and meetings",
        "Programs for executives, students, NGOs, and international teams",
        "Options for governments, airlines, and enterprise delegations",
      ],
      note: "Trips are negotiated engagements — fully customized to your goals, compliance needs, and budget.",
      featuredTitle: "Featured 2026 itineraries",
      customNote:
        "Need something different? We build additional custom itineraries to match your goals, calendar, and compliance requirements.",
      additionalDates:
        "We already have {count} more departures reserved for bespoke cohorts.",
      bildungsurlaub: "German citizens can leverage Bildungsurlaub through JB Linguistics — details follow your inquiry.",
      browseLink: "Browse the full Linguistic Learning Trips page",
      bildungsurlaubGuide: "Read the Bildungsurlaub guide",
      bildungsurlaubApplication: "Download the application form",
      bildungsurlaubSteps: [
        "Confirm your Bundesland regulations and select a 2026 departure date.",
        "Download the official application, add JB Linguistics LLC program details, and attach the preliminary itinerary we send you.",
        "Submit the packet to your employer or authority and share the approval with JB so we can finalize contracts and billing splits.",
      ],
    },
    tripsPage: {
      title: "Linguistic Learning Trips",
      description:
        "Combine tourism with daily English coaching. Choose a destination to see a sample itinerary (7, 10, 14, or 21 days) and request custom dates for 2026.",
      capacity: "Capacity: max 10 participants per departure. Once a trip is full, alternative dates will be offered.",
      includesTitle: "What every 2026 trip includes",
      includes: [
        "Round-trip flights, 4★ accommodations, breakfasts, and all local transportation.",
        "Certified ESL lead with the cohort 8–10 hours per day plus 2–3 hour workshops woven into the itinerary.",
        "Select excursions and admissions tied to each destination’s learning goals.",
        "Daily language labs (2–3 hours) with pronunciation, grammar, and industry-specific drills.",
      ],
      extrasTitle: "Exams, compliance & extras",
      extras: [
        "Online placement before departure plus a government-certified exam after the trip.",
        "Eligible for Bildungsurlaub (DE) — documentation supplied after you inquire.",
        "Max 10 participants; alternative dates released when a cohort fills.",
        "Travel health & liability insurance is purchased separately; we guide you through approved providers.",
      ],
      searchLabel: "Search:",
      searchPlaceholder: "Search destination or region…",
      filterLabel: "Filter by length:",
      filterAllLabel: "All",
      packageLengthLabel: "Package length:",
      daySuffix: "days",
      cardButton: "View itinerary",
      cardPricingLink: "View sample pricing",
      cardNote: "Max 10 participants; additional dates released when full.",
      ctaButton: "Request an itinerary & pricing packet",
      bildungsurlaubSectionTitle: "Bildungsurlaub toolkit",
      sampleHeading: "Sample {days}-Day Itinerary",
      sampleSubheading:
        "Daily English sessions (2–3h) + afternoon experiences. Travel, lodging, breakfast, local transport, and select excursions included.",
      lessonLabel: "Lesson",
      activityLabel: "Activity",
      note:
        "Note: Programs are tailored to group size (max 10), proficiency, and dates. We’ll confirm the exact plan and alternatives when groups fill, and will direct each traveler to purchase the required travel health/liability coverage before departure.",
      agreementTitle: "Sample Learning Trip Agreement",
      agreementIntro:
        "Pricing is always customized, but every cohort signs a transparent agreement. Use the outline below to brief legal, HR, or procurement before we draft the final document.",
      agreementClauses: [
        {
          title: "Parties & scope",
          text: "JB Linguistics LLC (language provider) delivers a custom itinerary, curriculum, and facilitation for the client organization named in the statement of work.",
        },
        {
          title: "Services",
          text: "Daily coaching (2–3 hrs), travel chaperoning, placement/exit assessments, and post-trip reporting are included. Learning materials remain virtual and free of charge.",
        },
        {
          title: "Travel & lodging",
          text: "JB Linguistics secures flights, accommodations, breakfasts, and ground transport for up to 10 travelers; upgrades or add-ons are billed separately with client approval.",
        },
        {
          title: "Pricing & payment",
          text: "Pricing is tailored per cohort and outlined in an attached schedule. 40% deposit at signature, 60% due 14 days prior to departure unless otherwise negotiated.",
        },
        {
          title: "Changes & cancellation",
          text: "Date moves requested ≥45 days prior incur no penalty; 15–44 days incur 25%; <15 days incur vendor costs already committed. Force majeure clauses protect both parties.",
        },
        {
          title: "Insurance & compliance",
          text: "Participants purchase travel medical plus liability insurance from approved providers. JB Linguistics supplies Bildungsurlaub paperwork and country-specific compliance docs.",
        },
        {
          title: "Confidentiality & security",
          text: "All facilitators operate under NDA and German government-grade security practices; sensitive briefings can be delivered virtually before or after travel days.",
        },
        {
          title: "Signatures",
          text: "Each agreement includes signature blocks for JB Linguistics LLC and the client organization plus optional HR/Works Council acknowledgement.",
        },
      ],
    agreementCta: "Request a draft agreement",
      detailIntro:
        "Sample {days}-day program combining daily English coaching (2–3 hours) with curated cultural activities. Custom dates also available.",
      detailCta: "Inquire about {days}-day {destination}",
      waiverHeading: "Travel & liability notice",
      waiverText:
        "Participants must purchase supplemental travel medical and trip cancellation insurance. JB Linguistics LLC and JB Linguistics GmbH coordinate schedules and vendors but are not responsible for injuries, lost property, or delays. Each traveler confirms coverage before departure and signs the release in the final agreement.",
      aboutTripTitle: "About this trip",
      aboutTripFallback:
        "Join a cultural and language immersion experience blending English learning with curated travel and local exploration.",
      bildungsurlaubBadgeTitle: "Bildungsurlaub documentation",
      bildungsurlaubBadgeText:
        "German citizens receive full JB Linguistics paperwork (application, curriculum outline, signed participation letter, and split invoices) within two business days of securing a cohort.",
      notFoundTitle: "Destination not found",
      notFoundLink: "Back to all destinations",
      pricingDisclaimer:
        "Pricing varies by cohort size, travel dates, and booking window. The outline below is a planning estimate; final totals are confirmed once travel and accommodation contracts are locked.",
    },
    tripBenefits: {
      title: "Country-specific learning benefits",
      description:
        "Many clients co-fund linguistic trips with statutory or collective training budgets. We already support the programs below and can prepare paperwork in your language.",
      items: [
        {
          label: "Germany — Bildungsurlaub",
          description:
            "JB Linguistics is an authorized Bildungsurlaub course provider (final listings pending for select Bundesländer in 2026). We deliver the Antrag, curriculum outline, attendance records, and split invoicing.",
        },
        {
          label: "France — CPF / OPCO",
          description:
            "We issue bilingual course descriptions so your Compte Personnel de Formation or OPCO partner can release credits for virtual or travel-based English programs.",
        },
        {
          label: "Netherlands — CAO learning budget",
          description:
            "Dutch employers typically route costs via CAO-leerbijeenkomsten, werk-naar-werk budgets, or the Werkkostenregeling. We provide split invoices plus detailed attendance logs.",
        },
        {
          label: "Spain — FUNDAE bonuses",
          description:
            "Spanish organisations can offset tuition with Fundación Estatal (FUNDAE) training credits. We submit hour-by-hour attendance exports in Spanish and English.",
        },
        {
          label: "Sweden — Omställningsstudiestöd",
          description:
            "Swedish professionals can request CSN/union study support. JB prepares Swedish course descriptions, syllabi, and proof of completion for the omställningsstudiestöd application.",
        },
        {
          label: "Global — Custom compliance",
          description:
            "Need SkillsFuture, tax-credit, or CSR alignment elsewhere? Share the guidelines and we will generate the curriculum, budget splits, and attendance attestations you need.",
        },
      ],
    },
    contact: {
      heading: "Inquiry Form",
      subtitle: "Tell us what you need and we’ll respond with a tailored proposal.",
      phoneLine: "Prefer to talk live? Call (602) 628-4600 or leave your number and we’ll call you shortly.",
      name: "Name",
      email: "Email",
      organization: "Organization (optional)",
      servicesLabel: "What are you interested in?",
      servicesOptions: [
        "Language learning / training",
        "Certified document translation",
        "Certified website translation",
        "Virtual interpretation",
        "Linguistic learning trip",
        "Other / not sure yet",
      ],
      servicesPlaceholder: "Select…",
      languagesNeeded: "Languages needed",
      languagesPlaceholder: "e.g. English ↔ German, French, Swedish…",
      details: "Project details / goals",
      detailsPlaceholder:
        "What are you working on? Please include context (industry, audience, volume, dates)…",
      budget: "Estimated budget (optional)",
      timeline: "Timeline or desired start date",
      submit: "Submit inquiry",
      disclaimer:
        "By submitting, you agree that JB Linguistics LLC may contact you about this inquiry. Nothing is shared with third parties without consent.",
      techNote: "",
    },
    sectionsShort: {
      mission:
        "Our mission: fully virtual learning and translation services that move as fast as your goals.",
      teacher:
        "Practical, tailored language training in Dutch, English, French, German, Danish, Russian, and Swedish.",
      translator:
        "Certified document and website translations plus secure interpretation for UN, airlines, and banks.",
      trips:
        "Immersive linguistic learning trips with coaching embedded in every adventure.",
      contact: "Tell us about your project and we’ll prepare a proposal.",
    },
    globalCta: {
      text: "Ready to move forward? Tell us about your project and get a tailored proposal.",
      primary: "Get a quote",
      secondary: "Request a consultation",
    },
    careers: {
      heading: "Join our team & collaborations",
      text:
        "Certified translators, interpreters, and educators partner with JB Linguistics as remote-first contractors. Share your background so we can match you with virtual classes, UN-facing translation needs, or airline and government projects.",
      bullets: [
        "Priority for sworn translators covering English with German, Dutch, French, Spanish, Mandarin, or Swedish.",
        "Educators with aviation, enterprise, or diplomatic experience are fast-tracked for 2025–2026 cohorts.",
        "Remote delivery with transparent pay bands, fast invoicing, and bilingual support.",
      ],
      perks: [
        "Flexible schedules built around client-demand windows.",
        "Fully remote workflows with secure virtual classrooms.",
        "Free language-learning benefits for staff and contractors.",
        "Discounted translation services for employees and their families.",
        "Free onboarding and AI-focused training once hired.",
      ],
      ctaPrimary: "Visit the careers page",
      ctaSecondary: "Refer a colleague",
      cardTitle: "Remote-first, multilingual, compliance-ready",
      cardText:
        "Upload your resume once. We feature talent across virtual academies, certified translation teams, and on-demand interpretation for airlines, banks, NGOs, and governments.",
      note: "Priority languages: English ↔ German, Dutch, French, Spanish, Mandarin, Swedish.",
    },
    careersPage: {
      title: "Collaborate with JB Linguistics",
      intro:
        "We grow our bench of translators and educators throughout the year. Tell us about your expertise, upload a resume, and we will reach out when your profile aligns with a cohort or compliance-driven engagement.",
      rolesTitle: "Focus areas",
      roleOptions: {
        translator: "Translator / localization",
        educator: "Educator / coach",
        both: "Hybrid (teach + translate)",
      },
      supportNote: "Need immediate support? Email talent@jblinguistics.com with “JB Careers” in the subject line.",
      backLink: "Back to home",
      form: {
        heading: "Application form",
        name: "Full name",
        email: "Email",
        location: "Location / time zone",
        languages: "Working languages",
        experience: "Years of experience & industries",
        availability: "Availability",
        message: "Notes",
        resume: "Upload resume / CV",
        resumeHint: "PDF or DOC up to 5 MB.",
        submit: "Submit application",
        success: "Thank you for applying — our talent team will review and get back to you shortly.",
        error: "Unable to submit right now. Please try again in a moment.",
      },
      assessments: {
        teacher: {
          heading: "Teacher assessment (required)",
          intro:
            "Select the language you wish to teach. Answer all 50 grammar questions (B2–C2) and provide two reflective responses about your classroom management approach.",
          languageLabel: "Assessment language",
          languagePlaceholder: "Choose the language you teach",
          answeredLabel: "Answered",
          shortResponseHeading: "Short responses",
          conflictPrompt:
            "If a student consistently creates conflict during class, how do you resolve it in the moment and prevent future disruptions?",
          attendancePrompt:
            "If students cancel frequently or skip sessions, how would you correct the pattern and adjust your approach to improve participation?",
          requirementNote: "All 50 questions and both written responses are mandatory for educator roles.",
        },
        translator: {
          heading: "Translator exercise (required)",
          intro:
            "Read the short English passage about AI adoption at work. Select the language you translate into and deliver your best rendering below.",
          storyHeading: "Source passage",
          story: [
            "Artificial intelligence proves most useful when it frees employees from the repetitive load that clutters every project. A thoughtful rollout begins with a clear promise to staff: AI exists to augment skilled professionals, not to displace them. Organizations that pair deliberate pilots with tight guardrails can introduce automation that handles the rote steps—transcription, glossary prep, file conversions—so people spend more time reasoning with stakeholders.",
            "Successful AI adoption always includes candid briefings about data. Companies describe which workflows stay on secure servers, which tools anonymize source text, and how every interaction is logged for audits. By training teams on both the limits and the strengths of large language models, leaders maintain trust even as they accelerate delivery timelines.",
            "Implementation goes beyond translation memory or canned chatbots. High-performing teams maintain neural glossaries that surface context-specific hints during live interpretation of meetings; they pair summarization engines with human reviewers to condense parliamentary debates into policy-ready briefs; and they tune classifier models so they flag cultural or regulatory risks before a document reaches a decision maker. Every workflow is paired with human checkpoints and traceable metadata.",
            "Human review remains the signature feature of responsible AI programs. Automation produces an initial draft; domain experts annotate it, resolve local nuance, and explain the rationale back to clients or executives. That dialog becomes training data for future projects—without ever leaving the secure perimeter—so organizations continuously improve without leaking sensitive information.",
            "In conclusion, AI functions best as a disciplined assistant. Companies that invest in security, transparency, and deliberate change management adopt automation without sacrificing confidentiality or empathy. Translating the passage above should capture that same balance: embrace the excitement of innovation while anchoring it in responsible, human-centered delivery.",
          ],
          languageLabel: "Target language",
          languagePlaceholder: "Select the language you translate into",
          submissionLabel: "Your translation",
          notes: "Please submit your translation in the selected language. We will auto-score accuracy and surface any quality risks in the admin portal.",
        },
        validation: {
          teacherLanguage: "Select an assessment language before submitting.",
          teacherIncomplete: "Answer all 50 questions and complete both short responses for the teacher assessment.",
          translatorLanguage: "Select a target language for the translation exercise.",
          translatorText: "Provide your translation before submitting.",
        },
      },
    },
    footer: {
      tagline: "Virtual-first, available worldwide for negotiated projects.",
      teachers: "Teachers",
      bio: "JB’s Bio",
    },
    destinations: destinationCopy.en,
  },
  nl: {
    nav: {
      mission: "Missie",
      teacher: "Taalleren",
      translator: "Vertaalservices",
      staff: "Team",
      trips: "Leerreizen",
      contact: "Contact",
      aboutJb: "Maak kennis met onze CEO",
      careers: "Sluit je aan bij ons team",
      viewAllDestinations: "Alle bestemmingen",
      viewAllStaff: "Alles bekijken",
      ctaLabel: "Offerte aanvragen",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "Virtuele taaltraining, beëdigde document- en websitevertalingen en tolkdiensten op diplomatiek niveau, geheel afgestemd op uw doelen.",
      ctaPrimary: "Adviesgesprek aanvragen",
      ctaSecondary: "Diensten bekijken",
      meetJB: "Maak kennis met Jonathan Brooks",
      highlights: [
        "Geregistreerd als JB Linguistics LLC (Florida) en JB Linguistics GmbH (Duitsland) om klanten in de VS en Europa te ondersteunen.",
        "Alle diensten zijn virtueel, behalve wanneer u een Linguistic Learning Trip boekt.",
        "Beëdigde document- en websitevertalingen met strenge kwaliteitscontrole en beëdigde taalkundigen.",
        "Programma's beschikbaar in het Nederlands, Engels, Frans, Duits, Mandarijn, Spaans en Zweeds.",
      ],
      cardTitle: "Praktische taallessen, vertaling & tolkwerk",
      cardBody:
        "Sessies verlopen volledig virtueel of op locatie – van 1-op-1 coaching tot diplomatieke settings.",
      badgeTitle: "Veiligheidsbewuste taalondersteuning",
      badgeText:
        "Ervaring met projecten voor Duitse overheden en internationale teams waar discretie en compliance cruciaal zijn.",
    },
    mission: {
      heading: "Missieverklaring",
      text:
        "JB LINGUISTICS LLC ontwikkelt snelle, volledig virtuele leertrajecten die rekening houden met ieders doelen, leertempo en compliance-eisen. Wij verzorgen veilige klasruimtes, LMS-toegang, opnames, assessments en materialen zonder extra kosten zodat teams zich kunnen focussen op meetbare vooruitgang.",
      text2:
        "Daarnaast leveren we beëdigde documenten- en websitevertalingen plus tolkdiensten die voldoen aan de eisen van overheden, airlines en ondernemingen. Dankzij ons remote-first model blijven prijzen transparant, reactietijden kort en vergoedingen voor onze specialisten boven marktgemiddelde. Uw KPI’s zijn het kompas dat elk project stuurt.",
    },
    virtual: {
      heading: "Virtuele levering, materialen inbegrepen",
      text:
        "Elk programma loopt virtueel tenzij u bewust een taalleerreis reserveert. We leveren het beveiligde klaslokaal, LMS-toegang, opnames en materialen zonder extra kosten.",
      bullets: [
        "Live coaching plus asynchrone labs, glossaria en oefeningen inbegrepen",
        "Beveiligde, NDA-bestendige platforms die voldoen aan compliance- en auditvereisten",
        "Fysieke bijeenkomsten reserveren we voor Linguistic Learning Trips om overhead laag te houden",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "Taalleren",
          description:
            "Virtuele 1-op-1- en cohortprogramma's afgestemd op KPI's, vakterminologie en bedrijfscultuur.",
        },
        {
          key: "translation",
          title: "Vertaling & Lokalisatie",
          description:
            "Beëdigde websitevertaling, lokalisatie voor leerplatforms en inzetklare content voor beleid en operatie.",
        },
        {
          key: "interpretation",
          title: "Simultaantolken",
          description:
            "Remote simultaan- en consecutief tolken voor briefings, aanbestedingen en kritieke onderhandelingen.",
        },
        {
          key: "documents",
          title: "Beëdigde Documenten",
          description:
            "Juridische, migratie-, luchtvaart-, bancaire en HR-documenten met beëdigde vertalers en reviewers.",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "Taalleren",
      intro:
        "Taalleren bij JB Linguistics is praktisch, immersief en volledig afgestemd op uw dagelijkse werk.",
      bullets: [
        "Virtuele coaching voor executives, crewleden, NGO's en overheidsteams",
        "Curricula op basis van KPI's, compliance-eisen en cultuur",
        "Bibliotheken, opnames en opdrachten zonder extra kosten",
        "Optionele Linguistic Learning Trips voor intensieve on-site immersie",
      ],
      ctas: {
        viewAll: "Alle docenten bekijken",
        meetJB: "Maak kennis met Jonathan Brooks",
        request: "Adviesgesprek aanvragen",
        assessment: "Taaltoets openen",
        book: "Boek JB",
      },
      banner: {
        title: "Snel coachen voor wereldwijde teams",
        text:
          "Sessies draaien om uw calls, decks, RFP's en onderhandelingen zodat elke minuut direct resultaat levert.",
      },
      gridTitle: "Uitgelichte docenten",
      cardRole: "Docent",
      cardLink: "Vraag naar deze docent",
    },
    translator: {
      heading: "Vertaling & Tolken",
      intro:
        "Van beëdigde documenten tot UN-klare tolkdiensten: JB Linguistics levert virtuele, veilige en responsieve taalondersteuning.",
      servicesTitle: "Kernservices",
      services: [
        "Beëdigde documentvertaling voor juridische, migratie-, luchtvaart-, HR- en inkoopdossiers",
        "Beëdigde websitevertaling & lokalisatie met oog voor toegankelijkheid, privacy en SEO",
        "Lokalisatie voor leerportalen, LMS-modules en beleidsmemo's",
        "Remote simultaan- en consecutief tolken voor briefings en onderhandelingen",
        "Terminologiebeheer voor UN-, airline- en bankpartners",
      ],
      ctaJB: "Werk met Jonathan Brooks",
      badgeTitle: "Virtueel & compliance-klaar",
      badgeText:
        "Elk project wordt opgezet met vertrouwelijkheidsmaatregelen, terminologiewerk en beveiligd talent.",
      gridTitle: "Uitgelichte vertalers & tolken",
      cardRoleSuffix: "Vertaler",
      cardLink: "Beschikbaarheid opvragen",
      gridCta: "Tolkaanvraag indienen",
    },
    enterprise: {
      heading: "UN-, airline- & enterprise-partners",
      intro:
        "JB Linguistics ondersteunt UN-missies, airline-operaties en gereguleerde sectoren met snelle en precieze taaloplossingen.",
      cards: [
        {
          title: "UN & multilaterale inzet",
          text: "Briefings, humanitaire updates, aanbestedingen en trainingsmodules voor wereldwijde teams.",
          bullets: [
            "Snelle vertaling van sitreps, MoU's en missiedocumenten",
            "Virtuele facilitation tussen New York, Genève, Nairobi en meer",
            "Vertrouwd met UN-procurement, veiligheids- en disclosure-taal",
          ],
        },
        {
          title: "Airlines & luchtvaart (Lufthansa-ready)",
          text:
            "Vertaling en tolken voor airline-operations, crewcommunicatie en veiligheidsdocumentatie.",
          bullets: [
            "OPS-briefings, IROP-communicatie en veiligheidsbulletins",
            "Aviation-SEO, website- en customer-experience-lokalisatie",
            "Ervaring met Lufthansa-processen en Star Alliance-partners",
          ],
        },
        {
          title: "Financiële & bankpartners",
          text: "Taalprocessen voor banken, airlines en treasury-teams.",
          bullets: [
            "Beëdigde vertalingen voor contracten, rapportages en aandeelhoudersupdates",
            "Terminologiebeheer voor KYC, onboarding en interne controles",
            "Embedded taalondersteuning voor vendor due diligence en strategische projecten",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "Overheid & veiligheid",
      text: [
        "Jonathan Brooks ondersteunt al meer dan tien jaar Duitse overheden en kent de beveiligingsprotocollen die voor gevoelige dossiers vereist zijn.",
        "Daardoor kan JB Linguistics ministeries, diplomatie en overheidsleveranciers snel en discreet bedienen.",
      ],
      highlightsTitle: "Hoogtepunten",
      highlights: [
        "B.A. Politicologie & Religiewetenschappen; M.A. Internationale Betrekkingen (gijzelingsonderhandelingen)",
        "168 uur TEFL plus postgraduaat ESL- en TOEFL-certificaten",
        "Talen: Engels & Frans (moedertaal); Duits (B2+); Nederlands, Zweeds, Deens, Russisch (B1)",
        "Leidde wereldwijde teams van 150+ vertalers voor overheidstrajecten",
        "Ontwikkelde tweetalige trainingen voor diplomaten, luchtvaart en NGO's",
        "FAA- & EASA-privépiloot (IFR) met Airbus/Boeing-ervaring",
        "Ervaring met taalworkflows onder Duitse veiligheidsrichtlijnen",
      ],
      ctaBio: "Lees Jonathan Brooks’ volledige profiel",
    },
    trips: {
      heading: "Linguistic Learning Trips",
      intro:
        "Voor teams die reizen en taal willen combineren ontwerpen we trajecten met dagelijkse lessen en belevenissen.",
      bullets: [
        "Maatwerkroutes in Duitstalige regio's en daarbuiten",
        "Coaching verweven met excursies, maaltijden en meetings",
        "Formules voor executives, studenten, NGO's en internationale teams",
        "Opties voor overheden, airlines en ondernemingen",
      ],
      note: "Reizen zijn maatwerkprojecten – volledig afgestemd op doelen, compliance en budget.",
      featuredTitle: "Uitgelichte 2026-itineraries",
      customNote:
        "Toch iets anders nodig? We bouwen extra maatwerkreizen die aansluiten op uw kalender en eisen.",
      additionalDates:
        "Er staan al {count} extra vertrekken klaar voor maatwerkgroepen.",
      bildungsurlaub: "Duitse deelnemers kunnen via JB Linguistics Bildungsurlaub benutten – details na uw aanvraag.",
      browseLink: "Bekijk alle Linguistic Learning Trips",
      bildungsurlaubGuide: "Lees de Bildungsurlaub-handleiding",
      bildungsurlaubApplication: "Download het aanvraagformulier",
      bildungsurlaubSteps: [
        "Controleer de regels in uw Bundesland en kies een vertrekdatum voor 2026.",
        "Download het officiële formulier, vul de gegevens van JB Linguistics LLC en de voorlopige route in.",
        "Dien het pakket in bij werkgever of instantie en stuur de goedkeuring naar JB zodat contract en facturatie kunnen worden afgerond.",
      ],
    },
    tripsPage: {
      title: "Linguistic Learning Trips",
      description:
        "Combineer reizen met dagelijkse taalcoaching. Kies een bestemming om een voorbeeldroute van 7, 10, 14 of 21 dagen te bekijken en vraag aangepaste data voor 2026 aan.",
      capacity: "Capaciteit: maximaal 10 deelnemers per vertrek. Zodra een trip vol is, bieden we alternatieve data aan.",
      includesTitle: "Wat elke reis in 2026 omvat",
      includes: [
        "Retourvluchten, 4★ accommodaties, ontbijt en al het lokale vervoer.",
        "Gecertificeerde trainer begeleidt de groep 8–10 uur per dag plus 2–3 uur workshops die in het schema verweven zijn.",
        "Geselecteerde excursies en entreebewijzen afgestemd op de leerdoelen per bestemming.",
        "Dagelijkse taallabs (2–3 uur) met uitspraak-, grammatica- en sectorspecifieke oefeningen.",
      ],
      extrasTitle: "Examens, compliance & extra’s",
      extras: [
        "Online plaatsing vooraf en een erkend examen na afloop.",
        "Geschikt voor Bildungsurlaub (DE) – documenten ontvangt u na uw aanvraag.",
        "Maximaal 10 deelnemers; zodra vol, plannen we alternatieve data met u.",
        "Reisverzekering en aansprakelijkheidsdekking regelt u zelf; wij adviseren goedgekeurde aanbieders.",
      ],
      searchLabel: "Zoeken:",
      searchPlaceholder: "Zoek bestemming of regio…",
      filterLabel: "Filter op duur:",
      filterAllLabel: "Alles",
      packageLengthLabel: "Pakketduur:",
      daySuffix: "dagen",
      cardButton: "Bekijk programma",
      cardNote: "Max. 10 deelnemers; extra data wanneer vol.",
      ctaButton: "Vraag itinerary & prijsinformatie op",
      bildungsurlaubSectionTitle: "Bildungsurlaub-toolkit",
      sampleHeading: "Voorbeeldprogramma van {days} dagen",
      sampleSubheading:
        "Dagelijkse Engelse sessies (2–3u) plus middagactiviteiten. Vlucht, verblijf, ontbijt, lokaal vervoer en geselecteerde excursies inbegrepen.",
      lessonLabel: "Les",
      activityLabel: "Activiteit",
      note:
        "Let op: programma’s worden afgestemd op groepsgrootte (max. 10), niveau en data. Bij volle groepen bevestigen we een alternatief en verwijzen we elke deelnemer naar de juiste verzekeringsopties vóór vertrek.",
      agreementClauses: [
        {
          title: "Partijen & scope",
          text:
            "JB Linguistics LLC (taalpartner) levert een maatwerkroute, curriculum en begeleiding voor de opdrachtgever die in de statement of work staat benoemd.",
        },
        {
          title: "Diensten",
          text:
            "Dagelijkse coaching (2–3 uur), reisbegeleiding, instap- en exitassessments en rapportages zijn inbegrepen. Alle leermaterialen blijven virtueel en zonder extra kosten.",
        },
        {
          title: "Reis & logies",
          text:
            "JB Linguistics regelt vluchten, accommodaties, ontbijt en lokaal vervoer voor maximaal 10 reizigers; upgrades of add-ons worden alleen met goedkeuring doorbelast.",
        },
        {
          title: "Prijzen & betaling",
          text:
            "Tarieven worden per cohort vastgelegd in een bijlage. 40% bij ondertekening, 60% uiterlijk 14 dagen voor vertrek tenzij anders overeengekomen.",
        },
        {
          title: "Wijzigingen & annulering",
          text:
            "Datumwijzigingen ≥45 dagen vooraf zijn kosteloos; 15–44 dagen vooraf: 25%; <15 dagen: reeds gemaakte leverancierskosten. Overmachtclausules beschermen beide partijen.",
        },
        {
          title: "Verzekering & compliance",
          text:
            "Deelnemers sluiten zelf reis- en aansprakelijkheidsverzekering af via goedgekeurde aanbieders. JB levert Bildungsurlaub-documenten en landspecifieke compliance.",
        },
        {
          title: "Vertrouwelijkheid & veiligheid",
          text:
            "Alle facilitators werken onder NDA en volgens Duitse veiligheidsprotocollen; gevoelige briefings kunnen virtueel voor of na de reis plaatsvinden.",
        },
        {
          title: "Handtekeningen",
          text:
            "Elke overeenkomst bevat handtekeningen voor JB Linguistics LLC en de klant, plus optionele HR-/Ondernemingsraad-bevestiging.",
        },
      ],
      agreementTitle: "Voorbeeld van een Learning Trip-contract",
      agreementIntro:
        "Prijzen zijn maatwerk, maar elke groep tekent een helder contract. Gebruik het overzicht hieronder om uw juridische of inkoopteams te briefen voordat wij het definitieve document opstellen.",
      agreementCta: "Vraag een contractontwerp aan",
      detailIntro:
        "Voorbeeldprogramma van {days} dagen met dagelijkse Engelse coaching (2–3 uur) en zorgvuldig gekozen culturele activiteiten. Aangepaste data zijn mogelijk.",
      detailCta: "Informeer naar {days}-daagse {destination}",
      aboutTripTitle: "Over deze reis",
      aboutTripFallback:
        "Neem deel aan een culturele en taalkundige immersie waarbij Engels leren wordt gecombineerd met zorgvuldig samengestelde reizen.",
      bildungsurlaubBadgeTitle: "Bildungsurlaub-documentatie",
      bildungsurlaubBadgeText:
        "Duitse deelnemers ontvangen binnen twee werkdagen alle JB Linguistics-documenten (aanvraag, curriculum, deelnamebrief en gesplitste facturen) zodra een cohort is bevestigd.",
      notFoundTitle: "Bestemming niet gevonden",
      notFoundLink: "Terug naar alle bestemmingen",
    },
    tripBenefits: {
      title: "Landgebonden opleidingsvoordelen",
      description:
        "Veel klanten financieren (deels) via wettelijke of CAO-gebonden opleidingsbudgetten. Wij kennen de procedures hieronder en leveren de vereiste documenten in uw taal.",
      items: [
        {
          label: "Duitsland — Bildungsurlaub",
          description:
            "JB Linguistics is een erkende Bildungsurlaub-aanbieder (laatste registraties voor bepaalde Bundesländer lopen voor 2026). Wij leveren aanvraag, curriculum, aanwezigheidsbewijzen en gesplitste facturen.",
        },
        {
          label: "Frankrijk — CPF / OPCO",
          description:
            "We leveren Franstalige syllabus en offertes zodat Compte Personnel de Formation of uw OPCO snel kredieten kan vrijgeven voor virtuele of reisprogramma’s.",
        },
        {
          label: "Nederland — CAO-opleidingsbudgetten",
          description:
            "Werkgevers gebruiken CAO-leeruren, mobiliteitsbudgetten of de werkkostenregeling. Wij verzorgen facturen per deelnemer plus aanwezigheidsoverzichten.",
        },
        {
          label: "Spanje — FUNDAE",
          description:
            "Spaanse organisaties kunnen gebruikmaken van Fundación Estatal (FUNDAE) opleidingskredieten. Wij leveren urenregistraties in het Spaans en Engels.",
        },
        {
          label: "Zweden — Omställningsstudiestöd",
          description:
            "Zweedse professionals vragen CSN/union-studieondersteuning aan; wij schrijven Zweedse cursusbeschrijvingen en deelnameverklaringen.",
        },
        {
          label: "Internationaal — maatwerk",
          description:
            "Heeft u SkillsFuture-, belastingkrediet- of CSR-eisen? Deel de richtlijnen en wij genereren syllabus, begroting en aanwezigheidsbewijzen.",
        },
      ],
    },
    contact: {
      heading: "Aanvraagformulier",
      subtitle: "Vertel ons wat u nodig hebt en ontvang een voorstel op maat.",
      phoneLine: "Liever telefonisch contact? Bel (602) 628-4600 of laat uw nummer achter, dan bellen we snel terug.",
      name: "Naam",
      email: "E-mail",
      organization: "Organisatie (optioneel)",
      servicesLabel: "Waar bent u in geïnteresseerd?",
      servicesOptions: [
        "Taalleren / training",
        "Beëdigde documentvertaling",
        "Beëdigde websitevertaling",
        "Virtueel tolken",
        "Linguistic Learning Trip",
        "Anders / nog onzeker",
      ],
      servicesPlaceholder: "Maak een keuze…",
      languagesNeeded: "Benodigde talen",
      languagesPlaceholder: "bijv. Engels ↔ Duits, Frans, Zweeds…",
      details: "Projectdetails / doelen",
      detailsPlaceholder:
        "Waaraan werkt u? Vermeld context (branche, doelgroep, volume, data)…",
      budget: "Begroot budget (optioneel)",
      timeline: "Planning of gewenste startdatum",
      submit: "Aanvraag verzenden",
      disclaimer:
        "Door te verzenden geeft u JB Linguistics LLC toestemming om contact op te nemen. Gegevens worden niet gedeeld zonder toestemming.",
      techNote:
        "Technische noot: koppel dit formulier aan uw e-mail, CRM of automatisering (API-route, Formspree, Make/Zapier).",
    },
    sectionsShort: {
      mission:
        "Onze missie: virtuele taal- en vertaaldiensten die net zo snel gaan als uw doelen.",
      teacher:
        "Praktisch, maatgemaakt taalonderwijs in Nederlands, Engels, Frans, Duits, Deens, Russisch en Zweeds.",
      translator:
        "Beëdigde document- en websitevertalingen plus veilige tolkdiensten voor UN, airlines en banken.",
      trips:
        "Immersieve reizen met coaching in elke activiteit.",
      contact: "Vertel ons over uw project en ontvang een voorstel.",
    },
    globalCta: {
      text: "Klaar om verder te gaan? Deel uw project en ontvang een voorstel op maat.",
      primary: "Offerte aanvragen",
      secondary: "Adviesgesprek aanvragen",
    },
    careers: {
      heading: "Carrières & samenwerking",
      text:
        "Beëdigde vertalers, tolken en trainers werken als remote contractors met JB Linguistics. Deel uw achtergrond zodat we u kunnen matchen met virtuele trajecten, UN-opdrachten of airline- en overheidsteams.",
      bullets: [
        "Voorrang voor beëdigde vertalers EN ↔ DE/NL/FR/ES/ZH/SV.",
        "Trainers met ervaring bij luchtvaart, corporates of diplomatie krijgen snelle intake.",
        "Volledig remote levering met transparante tarieven en snelle facturatie.",
      ],
      perks: [
        "Flexibele schema's afgestemd op klantvraag.",
        "Volledig remote workflows met beveiligde virtuele klaslokalen.",
        "Gratis taalleren voor medewerkers en contractors.",
        "Kortingen op vertaaldiensten voor medewerkers en hun gezinnen.",
        "Gratis onboarding en AI-gerichte training na startdatum.",
      ],
      ctaPrimary: "Bekijk de carrièrepagina",
      ctaSecondary: "Tip een collega",
      cardTitle: "Remote-first, meertalig en compliant",
      cardText:
        "Upload uw cv één keer. Wij presenteren talent voor virtuele academies, beëdigde vertaalteams en on-demand tolkwerk voor airlines, banken, NGO's en overheden.",
      note: "Prioriteitstalen: Engels ↔ Duits, Nederlands, Frans, Spaans, Mandarijn, Zweeds.",
    },
    careersPage: {
      title: "Werk samen met JB Linguistics",
      intro:
        "We breiden het netwerk van vertalers en trainers het hele jaar uit. Vul uw expertise in, upload een cv en we nemen contact op zodra uw profiel aansluit bij een cohort of compliance-traject.",
      rolesTitle: "Focusgebieden",
      roleOptions: {
        translator: "Vertaler / lokalisatie",
        educator: "Trainer / coach",
        both: "Hybride (les + vertaling)",
      },
      supportNote: "Direct hulp? Mail talent@jblinguistics.com met onderwerp “JB Careers”.",
      backLink: "Terug naar home",
      form: {
        heading: "Aanmeldingsformulier",
        name: "Naam",
        email: "E-mail",
        location: "Locatie / tijdzone",
        languages: "Werktalen",
        experience: "Jaren ervaring & sectoren",
        availability: "Beschikbaarheid",
        message: "Extra info",
        resume: "Upload cv",
        resumeHint: "PDF of DOC tot 5 MB.",
        submit: "Aanmelding verzenden",
        success: "Dank u! We reageren zodra er een match is.",
        error: "Verzenden mislukt. Probeer het zo opnieuw.",
      },
      assessments: {
        teacher: {
          heading: "Docenttoets (verplicht)",
          intro:
            "Selecteer de taal die u wilt onderwijzen. Beantwoord alle 50 grammatica-vragen (B2–C2) en geef twee reflectieve antwoorden over klasbeheer.",
          languageLabel: "Taal van de toets",
          languagePlaceholder: "Kies de taal waarin u lesgeeft",
          answeredLabel: "Beantwoord",
          shortResponseHeading: "Korte antwoorden",
          conflictPrompt:
            "Als een student herhaaldelijk conflicten veroorzaakt, hoe lost u dat direct op en hoe voorkomt u herhaling op lange termijn?",
          attendancePrompt:
            "Als studenten vaak afzeggen of wegblijven, welke stappen neemt u om deelname te verbeteren en uw aanpak aan te passen?",
          requirementNote: "Alle 50 vragen en beide schriftelijke antwoorden zijn verplicht voor docentrollen.",
        },
        translator: {
          heading: "Vertaalopdracht (verplicht)",
          intro:
            "Lees de Engelse passage over AI op de werkvloer. Kies de taal waarin u vertaalt en lever uw beste vertaling hieronder aan.",
          storyHeading: "Bronpassage",
          story: [
            "Kunstmatige intelligentie levert de meeste waarde wanneer het teams bevrijdt van de repetitieve last die elk project vertraagt. Een zorgvuldig uitgerolde strategie begint met een heldere belofte: AI is er om professionals te ondersteunen, niet om hen overbodig te maken. Bedrijven die met pilots en strakke veiligheidskaders werken, kunnen automatisering inzetten voor de routine—transcripties, glossaria, bestandconversies—zodat experts meer tijd overhouden voor analyse en advies.",
            "Succesvolle adoptie start met transparantie over data. Organisaties leggen uit welke workflows op eigen servers blijven, welke tools bronmateriaal anonimiseren en hoe elke interactie wordt gelogd voor audits. Door teams te trainen in de mogelijkheden en beperkingen van grote taalmodellen behouden leiders het vertrouwen terwijl doorlooptijden korter worden.",
            "Implementatie reikt verder dan vertaalgeheugens of standaardchatbots. High-performance teams onderhouden neurale glossaria die contextuele hints geven tijdens live-interpretaties, combineren samenvattingsengines met menselijke reviewers voor beleidsklare memo’s en trainen classificatiemodellen om culturele of wettelijke risico’s vroeg te signaleren. Elk proces krijgt menselijke checkpoints en herleidbare metadata.",
            "Menselijke beoordeling blijft de ruggengraat van verantwoord AI-gebruik. Automatisering levert een eerste concept; vakspecialisten voegen nuance toe, corrigeren en lichten hun keuzes toe voor klanten of besluitvormers. Die dialoog wordt trainingsdata—zonder het afgeschermde netwerk te verlaten—waardoor organisaties leren zonder vertrouwelijke informatie prijs te geven.",
            "Kortom, AI functioneert het best als gedisciplineerde assistent. Bedrijven die investeren in veiligheid, transparantie en verandermanagement profiteren van automatisering zonder in te leveren op discretie of empathie. De passage hierboven vraagt om een vertaling die dat evenwicht weerspiegelt: de energie van innovatie én de verantwoordelijkheid van mensgericht werken.",
          ],
          languageLabel: "Doeltaal",
          languagePlaceholder: "Kies de taal waarin u vertaalt",
          submissionLabel: "Uw vertaling",
          notes: "Lever uw vertaling in de gekozen taal aan. We scoren automatisch de nauwkeurigheid en tonen eventuele risico’s in het portaal.",
        },
        validation: {
          teacherLanguage: "Selecteer eerst de toetstaal.",
          teacherIncomplete: "Beantwoord alle 50 vragen en vul beide korte antwoorden in.",
          translatorLanguage: "Kies een doeltaal voor de vertaalopdracht.",
          translatorText: "Voer uw vertaling in voordat u verstuurt.",
        },
      },
    },
    footer: {
      tagline: "Remote-first en wereldwijd beschikbaar voor projectmatige samenwerking.",
      teachers: "Docenten",
      bio: "Profiel van JB",
    },
    destinations: destinationCopy.nl,
  },
  fr: {
    nav: {
      mission: "Mission",
      teacher: "Formation linguistique",
      translator: "Services de traduction",
      staff: "Équipe",
      trips: "Voyages linguistiques",
      contact: "Contact",
      aboutJb: "Rencontrez notre PDG",
      careers: "Rejoignez notre équipe",
      viewAllDestinations: "Voir toutes les destinations",
      viewAllStaff: "Tout voir",
      ctaLabel: "Demander un devis",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "Formation linguistique virtuelle, traductions certifiées de documents et de sites web, et interprétation de niveau diplomatique, le tout adapté à vos objectifs.",
      ctaPrimary: "Demander une consultation",
      ctaSecondary: "Découvrir les services",
      meetJB: "Rencontrer Jonathan Brooks",
      highlights: [
        "Enregistrée sous JB Linguistics LLC (Floride) et JB Linguistics GmbH (Allemagne) afin de servir les clients aux États-Unis et en Europe.",
        "Tous les services sont virtuels, sauf si vous réservez une Linguistic Learning Trip.",
        "Traductions certifiées de documents et de sites web avec contrôle qualité rigoureux.",
        "Programmes disponibles en néerlandais, anglais, français, allemand, mandarin, espagnol et suédois.",
      ],
      cardTitle: "Formation linguistique pratique, traduction & interprétation",
      cardBody:
        "Sessions 100 % virtuelles ou sur site – du coaching individuel aux réunions diplomatiques.",
      badgeTitle: "Soutien linguistique sécurisé",
      badgeText:
        "Expérience auprès d’institutions allemandes et d’équipes internationales où la discrétion et la conformité sont essentielles.",
    },
    mission: {
      heading: "Déclaration de mission",
      text:
        "Chez JB LINGUISTICS LLC, nous concevons des parcours d’apprentissage entièrement virtuels, rapides et calibrés sur vos objectifs, votre rythme et vos exigences réglementaires. Nous fournissons salles sécurisées, accès LMS, enregistrements, évaluations et ressources sans frais additionnels afin que vos équipes puissent se concentrer sur des progrès mesurables.",
      text2:
        "Nous associons cette approche pédagogique à des traductions certifiées et à un service d’interprétation conformes aux standards des administrations, compagnies aériennes et entreprises internationales. Notre fonctionnement remote-first garantit transparence tarifaire, réactivité et rémunération équitable de nos experts. Vos indicateurs deviennent notre feuille de route et définissent la réussite de chaque mission.",
    },
    virtual: {
      heading: "Livraison virtuelle et supports inclus",
      text:
        "Chaque programme d'entreprise est assuré virtuellement, sauf si vous choisissez explicitement une voyage linguistique. Nous fournissons la salle de classe sécurisée, les accès LMS, les enregistrements et les licences de ressources sans coût supplémentaire.",
      bullets: [
        "Coaching en direct plus laboratoires asynchrones, glossaires et exercices inclus",
        "Plateformes sécurisées et conformes aux NDA, aux règles de conformité et aux audits",
        "Les formats en présentiel sont réservés aux Linguistic Learning Trips pour limiter les frais généraux",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "Formation linguistique",
          description:
            "Programmes virtuels individuels ou en cohorte alignés sur vos KPI, votre terminologie métier et votre culture d'entreprise.",
        },
        {
          key: "translation",
          title: "Traduction & localisation",
          description:
            "Traduction certifiée de sites web, localisation pour plateformes d'apprentissage et contenus prêts pour les politiques et opérations.",
        },
        {
          key: "interpretation",
          title: "Interprétation simultanée",
          description:
            "Interprétation simultanée et consécutive à distance pour briefings, appels d'offres et négociations critiques.",
        },
        {
          key: "documents",
          title: "Documents certifiés",
          description:
            "Documents juridiques, migratoires, aéronautiques, bancaires et RH pris en charge par des traducteurs assermentés.",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "Formation linguistique",
      intro:
        "La formation JB Linguistics est pratique, immersive et entièrement alignée sur votre réalité professionnelle.",
      bullets: [
        "Coaching virtuel pour dirigeants, équipages, ONG et équipes gouvernementales",
        "Curricula alignés sur les KPI, la conformité et la culture d'entreprise",
        "Bibliothèques, enregistrements et devoirs fournis sans frais",
        "Voyages linguistiques optionnels pour une immersion accélérée",
      ],
      ctas: {
        viewAll: "Voir tous les formateurs",
        meetJB: "Rencontrer Jonathan Brooks",
        request: "Demander une consultation",
        assessment: "Lancer le test de placement",
        book: "Réserver JB",
      },
      banner: {
        title: "Coaching rapide pour équipes mondiales",
        text:
          "Chaque séance s'appuie sur vos appels, présentations, RFP et négociations pour générer un impact immédiat.",
      },
      gridTitle: "Formateurs mis en avant",
      cardRole: "Formateur",
      cardLink: "Poser une question sur ce formateur",
    },
    translator: {
      heading: "Traduction & interprétation",
      intro:
        "Des documents certifiés aux sessions prêtes pour l'ONU, JB Linguistics fournit l'appui linguistique virtuel, sécurisé et réactif dont vous avez besoin.",
      servicesTitle: "Services clés",
      services: [
        "Traduction certifiée de documents pour les besoins juridiques, migratoires, aéronautiques, RH et achats",
        "Traduction & localisation certifiées de sites web avec accessibilité, confidentialité et SEO intégrés",
        "Localisation de portails de formation, modules LMS et notes de politique",
        "Interprétation simultanée et consécutive à distance pour briefings et négociations",
        "Gestion terminologique pour les partenaires onusiens, aériens et bancaires",
      ],
      ctaJB: "Travailler avec Jonathan Brooks",
      badgeTitle: "Projets virtuels et conformes",
      badgeText:
        "Chaque mission est cadrée avec mesures de confidentialité, préparation terminologique et intervenants habilités.",
      gridTitle: "Traducteurs & interprètes",
      cardRoleSuffix: "Traducteur",
      cardLink: "Vérifier la disponibilité",
      gridCta: "Demander un interprète",
    },
    enterprise: {
      heading: "Partenariats ONU & entreprises",
      intro:
        "JB Linguistics prépare les équipes pour les missions onusiennes, les opérations aériennes et les secteurs réglementés qui exigent des résultats linguistiques rapides et précis.",
      cards: [
        {
          title: "Prêt pour l'ONU & le multilatéral",
          text: "Briefings, rapports humanitaires, dossiers d'achat et modules de formation pour équipes mondiales.",
          bullets: [
            "Traduction rapide de sitreps, MoU et documents de mission",
            "Animation virtuelle entre New York, Genève, Nairobi et au-delà",
            "Maîtrise du langage procurement, sécurité et disclosure de l'ONU",
          ],
        },
        {
          title: "Compagnies aériennes (Lufthansa-ready)",
          text:
            "Traduction et interprétation pour les opérations aériennes, la communication équipage et la documentation sécurité.",
          bullets: [
            "Briefings OPS, messages en situation irrégulière et bulletins sécurité",
            "Localisation aviation pour sites, SEO et expérience client",
            "Expérience des processus alignés Lufthansa et partenaires Star Alliance",
          ],
        },
        {
          title: "Banques & services financiers",
          text: "Opérations linguistiques pour banques internationales, compagnies aériennes et équipes trésorerie.",
          bullets: [
            "Traductions certifiées de contrats, dépôts réglementaires et communications actionnaires",
            "Gestion terminologique pour KYC, onboarding et contrôles internes",
            "Soutien linguistique intégré pour due diligence fournisseurs et projets stratégiques",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "Secteur public & sécurité",
      text: [
        "Jonathan Brooks accompagne les institutions allemandes depuis plus de dix ans et maîtrise les protocoles de sécurité requis pour les missions sensibles.",
        "JB Linguistics peut ainsi servir ministères, diplomates et prestataires publics avec discrétion, précision et rapidité.",
      ],
      highlightsTitle: "Points forts",
      highlights: [
        "Licence en sciences politiques & religions; Master en affaires internationales (négociations d'otages)",
        "Certification TEFL 168 h + diplômes ESL & TOEFL avancés",
        "Langues : anglais & français (natifs) ; allemand (B2+) ; néerlandais, suédois, danois, russe (B1)",
        "Direction d'équipes mondiales de 150+ traducteurs pour des contrats gouvernementaux",
        "Formations bilingues pour diplomates, dirigeants aéronautiques et ONG",
        "Licences de pilote privé FAA & EASA (IFR) avec expérience Airbus/Boeing",
        "Maîtrise des workflows linguistiques soumis aux exigences de sécurité allemandes",
      ],
      ctaBio: "Lire le profil complet de Jonathan Brooks",
    },
    trips: {
      heading: "Voyages linguistiques",
      intro:
        "Pour combiner voyage et apprentissage, nous concevons des itinéraires sur mesure avec coaching quotidien et activités culturelles.",
      bullets: [
        "Itinéraires personnalisés en pays germanophones et ailleurs",
        "Coaching intégré aux excursions, repas et réunions",
        "Formats pour dirigeants, étudiants, ONG et équipes internationales",
        "Options pour gouvernements, compagnies aériennes et délégations corporate",
      ],
      note: "Chaque voyage est un projet négocié – entièrement adapté à vos objectifs, exigences et budget.",
      featuredTitle: "Itinéraires phares 2026",
      customNote:
        "Besoin d'autre chose ? Nous construisons des programmes supplémentaires selon vos objectifs et calendriers.",
      additionalDates:
        "{count} départs supplémentaires sont déjà réservés pour des cohortes sur mesure.",
      bildungsurlaub: "Les citoyens allemands peuvent mobiliser le Bildungsurlaub via JB Linguistics – détails après votre demande.",
      browseLink: "Voir toutes les Linguistic Learning Trips",
      bildungsurlaubGuide: "Consulter le guide Bildungsurlaub",
      bildungsurlaubApplication: "Télécharger le formulaire",
      bildungsurlaubSteps: [
        "Vérifier les règles de votre Bundesland et choisir une date de départ 2026.",
        "Télécharger le formulaire officiel, y ajouter les informations de JB Linguistics LLC et l’itinéraire provisoire.",
        "Soumettre le dossier à votre employeur ou à l’autorité compétente puis transmettre l’accord à JB pour finaliser contrats et facturation.",
      ],
    },
    tripsPage: {
      title: "Voyages linguistiques",
      description:
        "Alliez voyage et apprentissage. Choisissez une destination pour consulter un itinéraire type (7, 10, 14 ou 21 jours) et demander des dates sur mesure pour 2026.",
      capacity:
        "Capacité : 10 participant·e·s maximum par départ. Une fois la cohorte complète, nous proposons des dates alternatives.",
      includesTitle: "Inclus dans chaque départ 2026",
      includes: [
        "Vols aller-retour, hébergements 4★, petits-déjeuners et transports locaux.",
        "Formateur·rice certifié·e présent·e 8–10 h/jour avec ateliers de 2–3 h intégrés à l’itinéraire.",
        "Excursions et visites choisies selon les objectifs pédagogiques.",
        "Laboratoires linguistiques quotidiens (2–3 h) axés sur la prononciation, la grammaire et le vocabulaire métier.",
      ],
      extrasTitle: "Examens, conformité & extras",
      extras: [
        "Positionnement en ligne avant le départ puis examen officiel en fin de séjour.",
        "Éligible au Bildungsurlaub (DE) – dossiers fournis après votre demande.",
        "Limité à 10 personnes ; des dates supplémentaires sont proposées lorsque le groupe est complet.",
        "Assurances voyage et responsabilité civile à souscrire séparément avec nos partenaires conseillés.",
      ],
      searchLabel: "Recherche :",
      searchPlaceholder: "Rechercher une destination ou une région…",
      filterLabel: "Filtrer par durée :",
      filterAllLabel: "Toutes",
      packageLengthLabel: "Durée du programme :",
      daySuffix: "jours",
      cardButton: "Voir l’itinéraire",
      cardNote: "Max. 10 personnes ; nouvelles dates proposées une fois complet.",
      ctaButton: "Demander l’itinéraire et la tarification",
      bildungsurlaubSectionTitle: "Boîte à outils Bildungsurlaub",
      sampleHeading: "Itinéraire type sur {days} jours",
      sampleSubheading:
        "Sessions d’anglais quotidiennes (2–3 h) et expériences l’après-midi. Voyage, hébergement, petit-déjeuner, transports locaux et excursions sélectionnées inclus.",
      lessonLabel: "Cours",
      activityLabel: "Activité",
      note:
        "Remarque : chaque programme est ajusté à la taille du groupe (max. 10), au niveau et aux dates. Nous confirmons les adaptations lorsque la cohorte est complète et orientons chaque voyageur vers les assurances obligatoires avant le départ.",
      agreementClauses: [
        {
          title: "Parties & périmètre",
          text:
            "JB Linguistics LLC (prestataire linguistique) fournit l’itinéraire, le curriculum et la facilitation sur mesure pour l’organisation figurant dans le statement of work.",
        },
        {
          title: "Services",
          text:
            "Coaching quotidien (2–3 h), accompagnement de voyage, évaluations d’entrée/sortie et reporting sont inclus. Les supports restent virtuels et sans coût additionnel.",
        },
        {
          title: "Voyage & hébergement",
          text:
            "JB Linguistics organise vols, hébergements 4★, petits-déjeuners et transferts locaux pour max. 10 voyageurs ; les options supplémentaires sont validées au préalable.",
        },
        {
          title: "Tarification & paiement",
          text:
            "La tarification est définie par cohorte dans une annexe. 40 % à la signature, 60 % 14 jours avant le départ, sauf accord contraire.",
        },
        {
          title: "Modifications & annulation",
          text:
            "Changements ≥45 jours : aucun frais ; 15–44 jours : 25 % ; <15 jours : coûts fournisseurs déjà engagés. Les clauses de force majeure protègent les deux parties.",
        },
        {
          title: "Assurance & conformité",
          text:
            "Les participants souscrivent eux-mêmes assurance voyage et RC via des prestataires approuvés. JB fournit les dossiers Bildungsurlaub et les exigences pays par pays.",
        },
        {
          title: "Confidentialité & sécurité",
          text:
            "Tous les facilitateurs travaillent sous NDA et selon les protocoles de sécurité allemands. Les briefings sensibles peuvent être réalisés virtuellement avant/après le déplacement.",
        },
        {
          title: "Signatures",
          text:
            "Chaque contrat inclut les blocs de signature pour JB Linguistics LLC et l’organisation cliente, plus l’option RH/Comité social.",
        },
      ],
      agreementTitle: "Exemple de contrat de voyage linguistique",
      agreementIntro:
        "La tarification est personnalisée, mais chaque cohorte signe un contrat transparent. Utilisez ce résumé pour préparer vos équipes juridiques, RH ou achats avant la rédaction finale.",
      agreementCta: "Demander un projet de contrat",
      detailIntro:
        "Itinéraire type sur {days} jours combinant coaching d’anglais quotidien (2–3 h) et activités culturelles sélectionnées. Autres dates possibles sur demande.",
      detailCta: "Demander des infos sur {destination} ({days} jours)",
      aboutTripTitle: "À propos de ce voyage",
      aboutTripFallback:
        "Rejoignez une immersion linguistique et culturelle qui associe apprentissage de l’anglais et exploration locale.",
      bildungsurlaubBadgeTitle: "Documents Bildungsurlaub",
      bildungsurlaubBadgeText:
        "Les citoyen·ne·s allemand·e·s reçoivent sous deux jours ouvrés tous les documents JB Linguistics (formulaire, programme, lettre signée et facturation scindée) dès qu’une cohorte est confirmée.",
      notFoundTitle: "Destination introuvable",
      notFoundLink: "Retour à toutes les destinations",
    },
    tripBenefits: {
      title: "Aides formation par pays",
      description:
        "De nombreux clients financent ces voyages via des dispositifs légaux (CPF, OPCO, etc.). Nous préparons déjà les dossiers ci-dessous et pouvons fournir la documentation bilingue.",
      items: [
        {
          label: "Allemagne — Bildungsurlaub",
          description:
            "JB Linguistics est fournisseur agréé Bildungsurlaub (homologations finales en attente pour certains Länder 2026). Nous remettons dossier, syllabus, attestations et factures ventilées.",
        },
        {
          label: "France — CPF / OPCO",
          description:
            "Nous émettons les descriptifs FR/EN et les feuilles d’émargement pour Compte Personnel de Formation ou votre OPCO sectoriel.",
        },
        {
          label: "Pays-Bas — budgets CAO",
          description:
            "Les employeurs utilisent les budgets de convention collective ou la Werkkostenregeling. Nous fournissons factures nominatives et suivi de présence.",
        },
        {
          label: "Espagne — FUNDAE",
          description:
            "Les organisations espagnoles compensent les coûts via les crédits Fundación Estatal (FUNDAE). Nous livrons les rapports horaires en espagnol et anglais.",
        },
        {
          label: "Suède — Omställningsstudiestöd",
          description:
            "Les salariés suédois sollicitent l’aide CSN/organisations syndicales. JB fournit syllabus et attestations en suédois.",
        },
        {
          label: "Autres pays — sur mesure",
          description:
            "Besoin d’un appui pour SkillsFuture, crédits fiscaux ou budget RSE ? Envoyez les critères et nous produirons programme, budget et émargements requis.",
        },
      ],
    },
    contact: {
      heading: "Formulaire de contact",
      subtitle: "Expliquez-nous votre besoin et recevez une proposition personnalisée.",
      phoneLine: "Envie d’échanger par téléphone ? Appelez le (602) 628-4600 ou laissez votre numéro et nous vous rappellerons rapidement.",
      name: "Nom",
      email: "E-mail",
      organization: "Organisation (optionnel)",
      servicesLabel: "Quels services vous intéressent ?",
      servicesOptions: [
        "Formation linguistique",
        "Traduction certifiée de documents",
        "Traduction certifiée de sites web",
        "Interprétation virtuelle",
        "Voyage linguistique",
        "Autre / incertain",
      ],
      servicesPlaceholder: "Choisissez…",
      languagesNeeded: "Langues requises",
      languagesPlaceholder: "ex. anglais ↔ allemand, français, suédois…",
      details: "Détails / objectifs",
      detailsPlaceholder:
        "Quel est votre projet ? Précisez le contexte (secteur, audience, volume, dates)…",
      budget: "Budget estimé (optionnel)",
      timeline: "Échéance ou date souhaitée",
      submit: "Envoyer la demande",
      disclaimer:
        "En envoyant ce formulaire, vous autorisez JB Linguistics LLC à vous contacter. Aucune donnée n'est partagée sans consentement.",
      techNote:
        "Note technique : connectez ce formulaire à votre e-mail, CRM ou outil d'automatisation (API, Formspree, Make/Zapier).",
    },
    sectionsShort: {
      mission:
        "Notre mission : des services linguistiques virtuels qui avancent au rythme de vos ambitions.",
      teacher:
        "Formations sur mesure en néerlandais, anglais, français, allemand, danois, russe et suédois.",
      translator:
        "Traductions certifiées et interprétation sécurisée pour l'ONU, les compagnies aériennes et les banques.",
      trips:
        "Voyages immersifs avec coaching intégré à chaque activité.",
      contact: "Présentez-nous votre projet et nous préparerons une proposition.",
    },
    globalCta: {
      text: "Prêt à avancer ? Décrivez votre projet et recevez une proposition sur mesure.",
      primary: "Demander un devis",
      secondary: "Demander une consultation",
    },
    careers: {
      heading: "Carrières & collaborations",
      text:
        "Traducteurs assermentés, interprètes et formateurs travaillent avec JB Linguistics en mode remote-first. Présentez votre profil afin d’être mobilisé sur nos cohortes virtuelles, missions ONU ou projets pour compagnies aériennes et gouvernements.",
      bullets: [
        "Priorité aux traducteurs certifiés EN ↔ DE/NL/FR/ES/ZH/SV.",
        "Les formateurs issus de l’aérien, de l’entreprise ou du diplomatique sont intégrés plus vite.",
        "Prestations 100 % à distance avec grilles tarifaires transparentes et paiement rapide.",
      ],
      perks: [
        "Horaires flexibles adaptés aux fenêtres clients.",
        "Workflows 100 % distants avec salles virtuelles sécurisées.",
        "Formation linguistique gratuite pour employés et prestataires.",
        "Services de traduction à tarif réduit pour le personnel et leurs familles.",
        "Programme d’onboarding et de formation IA gratuit une fois embauché.",
      ],
      ctaPrimary: "Accéder à la page carrières",
      ctaSecondary: "Recommander un confrère",
      cardTitle: "Remote-first, multilingue et conforme",
      cardText:
        "Téléchargez votre CV une seule fois. Nous mettons en avant les talents pour des académies virtuelles, des équipes de traduction certifiées et de l’interprétation à la demande pour compagnies aériennes, banques, ONG et institutions publiques.",
      note: "Langues prioritaires : anglais ↔ allemand, néerlandais, français, espagnol, mandarin, suédois.",
    },
    careersPage: {
      title: "Collaborer avec JB Linguistics",
      intro:
        "Nous élargissons notre réseau de traducteurs et de formateurs toute l’année. Partagez votre expérience, joignez un CV et nous reviendrons vers vous dès qu’une mission correspond à votre profil.",
      rolesTitle: "Domaines",
      roleOptions: {
        translator: "Traducteur / localisation",
        educator: "Formateur / coach",
        both: "Hybride (cours + traduction)",
      },
      supportNote: "Besoin d’aide immédiate ? Écrivez à talent@jblinguistics.com avec l’objet “JB Careers”.",
      backLink: "Retour à l’accueil",
      form: {
        heading: "Formulaire",
        name: "Nom complet",
        email: "E-mail",
        location: "Localisation / fuseau horaire",
        languages: "Langues de travail",
        experience: "Années d’expérience & secteurs",
        availability: "Disponibilités",
        message: "Notes",
        resume: "Téléverser le CV",
        resumeHint: "PDF ou DOC – 5 Mo max.",
        submit: "Envoyer la candidature",
        success: "Merci ! Nous vous contacterons dès qu’une mission correspond.",
        error: "Envoi impossible pour le moment. Réessayez bientôt.",
      },
      assessments: {
        teacher: {
          heading: "Évaluation formateur (obligatoire)",
          intro:
            "Choisissez la langue que vous souhaitez enseigner. Répondez aux 50 questions de grammaire (B2–C2) et rédigez deux réponses sur votre gestion de classe.",
          languageLabel: "Langue de l’évaluation",
          languagePlaceholder: "Sélectionnez la langue d’enseignement",
          answeredLabel: "Réponses",
          shortResponseHeading: "Réponses ouvertes",
          conflictPrompt:
            "Si un apprenant crée régulièrement des tensions, comment intervenez-vous immédiatement et comment évitez-vous que cela se reproduise ?",
          attendancePrompt:
            "Si les apprenants manquent souvent les séances, quelles actions mettez-vous en place pour relancer l’engagement et adapter votre approche pédagogique ?",
          requirementNote: "Les 50 questions et les deux réponses écrites sont obligatoires pour les rôles d’enseignant.",
        },
        translator: {
          heading: "Exercice de traduction (obligatoire)",
          intro:
            "Lisez le passage anglais sur l’adoption de l’IA. Choisissez la langue vers laquelle vous traduisez et saisissez votre traduction.",
          storyHeading: "Texte source",
          story: [
            "L’intelligence artificielle apporte le plus de valeur lorsqu’elle libère les collaborateurs des tâches répétitives. Une mise en œuvre réfléchie commence par une promesse claire : l’IA vient renforcer les professionnels, non les remplacer. Les organisations qui testent de petits pilotes et fixent des garde-fous stricts peuvent automatiser la transcription, la préparation de glossaires ou les conversions de fichiers pour consacrer davantage de temps à l’analyse.",
            "Une adoption réussie commence aussi par des briefings transparents sur la gestion des données. Les équipes expliquent quels flux restent sur des serveurs sécurisés, quels outils anonymisent les contenus et comment chaque interaction est consignée pour audit. En formant les collaborateurs aux forces et limites des grands modèles de langage, les dirigeants gagnent en confiance tout en accélérant les délais de livraison.",
            "L’implémentation dépasse largement les mémoires de traduction. Les équipes performantes entretiennent des glossaires neuronaux qui offrent des indices contextuels pendant les interprétations; elles associent moteurs de synthèse et relecteurs humains pour condenser les débats parlementaires; et elles entraînent des classificateurs pour détecter les risques culturels ou réglementaires avant qu’un document n’arrive sur le bureau d’un décideur.",
            "La relecture humaine demeure la pierre angulaire des programmes responsables. L’automatisation produit un premier jet, puis les experts le commentent, résolvent les nuances locales et expliquent leur raisonnement. Ce dialogue devient un corpus d’apprentissage sans quitter l’environnement sécurisé, afin de progresser sans exposer d’informations sensibles.",
            "En conclusion, l’IA agit comme un assistant discipliné. Les organisations qui investissent dans la sécurité, la transparence et la conduite du changement profitent d’une automatisation maîtrisée, sans sacrifier la confidentialité ni l’empathie. Traduire ce texte requiert ce même équilibre : l’enthousiasme de l’innovation marié à la rigueur d’une approche humaine et responsable.",
          ],
          languageLabel: "Langue cible",
          languagePlaceholder: "Sélectionnez la langue de traduction",
          submissionLabel: "Votre traduction",
          notes: "Merci d’envoyer votre traduction dans la langue choisie. Un score automatique mettra en évidence les risques potentiels.",
        },
        validation: {
          teacherLanguage: "Sélectionnez d’abord la langue d’évaluation.",
          teacherIncomplete: "Répondez aux 50 questions et remplissez les deux réponses ouvertes.",
          translatorLanguage: "Choisissez une langue cible pour l’exercice.",
          translatorText: "Ajoutez votre traduction avant de soumettre.",
        },
      },
    },
    footer: {
      tagline: "Remote-first, disponible dans le monde entier pour des projets sur mesure.",
      teachers: "Formateurs",
      bio: "Profil de JB",
    },
    destinations: destinationCopy.fr,
  },
  sv: {
    nav: {
      mission: "Mission",
      teacher: "Språkutbildning",
      translator: "Översättning",
      staff: "Team",
      trips: "Språkresor",
      contact: "Kontakt",
      aboutJb: "Möt vår vd",
      careers: "Gå med i vårt team",
      viewAllDestinations: "Visa alla destinationer",
      viewAllStaff: "Visa alla",
      ctaLabel: "Begär offert",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "Virtuell språkträning, certifierade dokument- och webböversättningar samt tolkning på diplomatnivå – allt anpassat efter dina mål.",
      ctaPrimary: "Boka konsultation",
      ctaSecondary: "Utforska tjänster",
      meetJB: "Möt Jonathan Brooks",
      highlights: [
        "Registrerat som JB Linguistics LLC i Florida och JB Linguistics GmbH i Tyskland för att stödja kunder i USA och Europa.",
        "Alla tjänster är virtuella om du inte bokar en Linguistic Learning Trip.",
        "Certifierade dokument- och webböversättningar med strikt kvalitetssäkring.",
        "Program på nederländska, engelska, franska, tyska, mandarin, spanska och svenska.",
      ],
      cardTitle: "Praktisk språkutbildning, översättning & tolkning",
      cardBody:
        "Sessioner kan vara helt virtuella eller på plats – från 1:1-coaching till diplomatiska möten.",
      badgeTitle: "Säker språkpartner",
      badgeText:
        "Erfarenhet av tyska myndigheter och globala team där diskretion och efterlevnad är avgörande.",
    },
    mission: {
      heading: "Vårt uppdrag",
      text:
        "JB LINGUISTICS LLC tar fram snabbrörliga, helt virtuella program som tar hänsyn till mål, tempo och compliance-krav. Vi tillhandahåller säkra klassrum, LMS-konton, inspelningar, tester och material utan extra kostnad så att era team kan fokusera på mätbar utveckling.",
      text2:
        "Dessutom levererar vi certifierade dokument- och webböversättningar samt tolkning som uppfyller myndigheters, flygbolags och företags standarder. Vårt remote-first arbetssätt ger transparent prissättning, snabb respons och generös ersättning till våra experter. Era KPI:er är vårt styrsystem i varje uppdrag.",
    },
    virtual: {
      heading: "Virtuell leverans, material ingår",
      text:
        "Alla företagsprogram är virtuella om du inte aktivt bokar en språkresa. Vi står för säker klassrumsmiljö, LMS-konton, inspelningar och licenser utan extra kostnad.",
      bullets: [
        "Livesessioner plus asynkrona labb, ordlistor och övningar ingår",
        "Säkra, NDA-klara plattformar som uppfyller compliance- och revisonskrav",
        "Fysiska format reserveras för Linguistic Learning Trips för att hålla overhead låg",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "Språkutbildning",
          description:
            "Virtuella 1:1- och gruppprogram kopplade till era KPI:er, terminologi och kultur.",
        },
        {
          key: "translation",
          title: "Översättning & lokalisering",
          description:
            "Certifierad webböversättning, lokalisering för lärplattformar och färdigt innehåll för policy och drift.",
        },
        {
          key: "interpretation",
          title: "Simultantolkning",
          description:
            "Fjärrbaserad simultan- och konsekutivtolkning för briefingar, upphandlingar och kritiska möten.",
        },
        {
          key: "documents",
          title: "Certifierade dokument",
          description:
            "Juridiska, migrations-, flyg-, bank- och HR-dokument hanteras av auktoriserade översättare.",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "Språkutbildning",
      intro:
        "Språkträning hos JB Linguistics är praktisk, immersiv och kopplad till ditt faktiska arbete.",
      bullets: [
        "Virtuellt coachning för ledare, besättningar, NGO:er och myndigheter",
        "Kursplaner justerade efter KPI:er, compliance och företagskultur",
        "Resursbibliotek, inspelningar och uppgifter utan extra kostnad",
        "Valfria språkresor för snabb fysisk immersion",
      ],
      ctas: {
        viewAll: "Visa alla lärare",
        meetJB: "Möt Jonathan Brooks",
        request: "Boka konsultation",
        assessment: "Starta nivåtestet",
        book: "Boka JB",
      },
      banner: {
        title: "Snabb coachning för globala team",
        text:
          "Sessionerna utgår från dina samtal, presentationer, RFP:er och förhandlingar så att varje timme ger effekt.",
      },
      gridTitle: "Utvalda lärare",
      cardRole: "Lärare",
      cardLink: "Fråga om denna lärare",
    },
    translator: {
      heading: "Översättning & tolkning",
      intro:
        "Från certifierade dokument till FN-klara tolkningar – JB Linguistics levererar virtuell, säker och snabb språkservice.",
      servicesTitle: "Kärntjänster",
      services: [
        "Certifierad dokumentöversättning för juridik, migration, flyg, HR och inköp",
        "Certifierad webböversättning och lokalisering med fokus på tillgänglighet, sekretess och SEO",
        "Lokalisering av utbildningsportaler, LMS-moduler och policyunderlag",
        "Fjärrbaserad simultan- och konsekutivtolkning för briefingar och förhandlingar",
        "Terminologihantering för FN-, flyg- och bankpartners",
      ],
      ctaJB: "Arbeta med Jonathan Brooks",
      badgeTitle: "Virtuella, compliant-projekt",
      badgeText:
        "Varje uppdrag planeras med sekretess, terminologiarbete och säkerhetsprövat team.",
      gridTitle: "Utvalda översättare & tolkar",
      cardRoleSuffix: "Översättare",
      cardLink: "Kontrollera tillgänglighet",
      gridCta: "Begär en tolk",
    },
    enterprise: {
      heading: "UN- & företags­partnerskap",
      intro:
        "JB Linguistics förbereder team för FN-uppdrag, flygbolagsdrift och reglerade branscher som kräver snabba och precisa språkresultat.",
      cards: [
        {
          title: "FN & multilateralt stöd",
          text: "Briefingar, humanitära uppdateringar, upphandlingar och utbildningsmoduler för globala team.",
          bullets: [
            "Snabb översättning av sitreps, MoU och uppdragsdokument",
            "Virtuell facilitering mellan New York, Genève, Nairobi m.fl.",
            "Insikt i FN:s upphandlings-, säkerhets- och disclosure-språk",
          ],
        },
        {
          title: "Flygbolag (Lufthansa-ready)",
          text:
            "Översättning och tolkning för flygoperativ, besättningskommunikation och säkerhetsdokumentation.",
          bullets: [
            "OPS-briefingar, IROP-kommunikation och säkerhetsbulletiner",
            "Flygrelaterad SEO, webb- och kundupplevelselokalisering",
            "Erfarenhet av Lufthansa-processer och Star Alliance-partners",
          ],
        },
        {
          title: "Finans & banker",
          text: "Språkprocesser för banker, flygbolag och treasury-team.",
          bullets: [
            "Certifierade översättningar av avtal, tillsynsrapporter och ägarkommunikation",
            "Terminologihantering för KYC, onboarding och interna kontroller",
            "Inbäddad språk­support för leverantörsgranskning och strategiska projekt",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "Offentlig sektor & säkerhet",
      text: [
        "Jonathan Brooks har i över ett decennium stöttat tyska myndigheter och behärskar de säkerhetsrutiner som krävs för känsliga uppdrag.",
        "Det gör att JB Linguistics kan stötta departement, diplomati och statliga leverantörer med diskretion, precision och snabba leveranser.",
      ],
      highlightsTitle: "Profilhöjdpunkter",
      highlights: [
        "B.A. statsvetenskap & religionsstudier; M.A. internationella relationer (gisslanförhandlingar)",
        "168h TEFL samt avancerade ESL- och TOEFL-certifieringar",
        "Språk: engelska & franska (modersmål); tyska (B2+); nederländska, svenska, danska, ryska (B1)",
        "Ledde globala team med 150+ översättare för statliga kontrakt",
        "Tvåspråkiga utbildningar för diplomater, flygledare och NGOs",
        "FAA- & EASA-privatpilot (IFR) med Airbus/Boeing-erfarenhet",
        "Erfaren med språkflöden under tyska säkerhetskrav",
      ],
      ctaBio: "Läs hela profilen för Jonathan Brooks",
    },
    trips: {
      heading: "Linguistic Learning Trips",
      intro:
        "För team som vill kombinera resor och språk designar vi program med daglig coaching och upplevelser.",
      bullets: [
        "Skräddarsydda resor i tysktalande länder och världen över",
        "Språkcoachning inbyggd i utflykter, måltider och möten",
        "Format för ledare, studenter, NGO:er och internationella team",
        "Alternativ för myndigheter, flygbolag och företagsdelegationer",
      ],
      note: "Resor är projektbaserade – helt anpassade till mål, compliance och budget.",
      featuredTitle: "Utvalda resor 2026",
      customNote:
        "Behöver du något annat? Vi bygger extra resor efter er kalender och krav.",
      additionalDates:
        "{count} ytterligare avgångar är redan reserverade för specialgrupper.",
      bildungsurlaub: "Tyska deltagare kan använda Bildungsurlaub via JB Linguistics – detaljer efter förfrågan.",
      browseLink: "Se alla Linguistic Learning Trips",
      bildungsurlaubGuide: "Läs guiden om Bildungsurlaub",
      bildungsurlaubApplication: "Ladda ned ansökningsblanketten",
      bildungsurlaubSteps: [
        "Kontrollera reglerna i ditt Bundesland och välj ett avresedatum 2026.",
        "Ladda ned det officiella formuläret, fyll i JB Linguistics LLC och den preliminära resplanen.",
        "Skicka in till arbetsgivare eller myndighet och vidarebefordra godkännandet till JB så att avtal och fakturering kan slutföras.",
      ],
    },
    tripsPage: {
      title: "Språkresor",
      description:
        "För team som vill kombinera resor med coachning. Välj en destination för att se en provplan (7, 10, 14 eller 21 dagar) och begär skräddarsydda datum för 2026.",
      capacity:
        "Kapacitet: högst 10 deltagare per avgång. När gruppen är full erbjuder vi alternativa datum.",
      includesTitle: "Detta ingår 2026",
      includes: [
        "Tur- och returflyg, 4★ boende, frukost samt alla lokala transporter.",
        "Certifierad tränare med gruppen 8–10 timmar per dag plus 2–3 timmars workshoppar inlagda i schemat.",
        "Utvalda utflykter och inträden kopplade till lärandemålen för varje destination.",
        "Dagliga språkpass (2–3 timmar) med uttals-, grammatik- och branschspecifika övningar.",
      ],
      extrasTitle: "Prov, compliance & extra",
      extras: [
        "Onlineplacering före avresa och myndighetsgodkänt prov efter resan.",
        "Berättigat till Bildungsurlaub (DE) – dokument skickas efter förfrågan.",
        "Max 10 deltagare; vid fullbokning föreslår vi nya datum.",
        "Rese- och ansvarsförsäkring köps separat – vi rekommenderar godkända leverantörer.",
      ],
      searchLabel: "Sök:",
      searchPlaceholder: "Sök destination eller region…",
      filterLabel: "Filtrera på längd:",
      filterAllLabel: "Alla",
      packageLengthLabel: "Paketlängd:",
      daySuffix: "dagar",
      cardButton: "Visa resplan",
      cardNote: "Max 10 deltagare; fler datum släpps när avgången är full.",
      ctaButton: "Begär resplan & prisinformation",
      bildungsurlaubSectionTitle: "Bildungsurlaub-verktygslåda",
      sampleHeading: "Exempel på {days}-dagars resplan",
      sampleSubheading:
        "Dagliga engelska sessioner (2–3 h) plus eftermiddagsupplevelser. Resor, boende, frukost, lokala transporter och utvalda utflykter ingår.",
      lessonLabel: "Lektion",
      activityLabel: "Aktivitet",
      note:
        "Obs: programmen anpassas efter gruppstorlek (max 10), nivå och datum. När en avgång fylls bekräftar vi alternativ och vägleder varje resenär kring obligatoriska försäkringar innan avresa.",
      agreementClauses: [
        {
          title: "Parter & omfattning",
          text:
            "JB Linguistics LLC (språkpartner) levererar ett skräddarsytt upplägg, curriculum och facilitering för den organisation som anges i statement of work.",
        },
        {
          title: "Tjänster",
          text:
            "Daglig coachning (2–3 h), reseledarskap, nivåtester före/efter samt rapportering ingår. Allt kursmaterial är virtuellt och kostnadsfritt.",
        },
        {
          title: "Resa & logi",
          text:
            "JB Linguistics ordnar flyg, 4★ boende, frukost och lokala transporter för upp till 10 resenärer; uppgraderingar debiteras endast efter godkännande.",
        },
        {
          title: "Priser & betalning",
          text:
            "Priset specificeras per kohort i en bilaga. 40 % vid signering, 60 % 14 dagar före avresa om inget annat avtalas.",
        },
        {
          title: "Ändringar & avbokning",
          text:
            "Datumändringar ≥45 dagar före avresa: ingen avgift; 15–44 dagar: 25 %; <15 dagar: leverantörskostnader som redan uppstått. Force majeure skyddar båda parter.",
        },
        {
          title: "Försäkring & compliance",
          text:
            "Deltagarna tecknar själva rese- och ansvarsförsäkring via godkända leverantörer. JB tillhandahåller Bildungsurlaub-underlag och landspecifika krav.",
        },
        {
          title: "Sekretess & säkerhet",
          text:
            "Alla handledare arbetar under NDA och följer tyska säkerhetsrutiner. Känsliga briefingar kan hållas virtuellt före eller efter resan.",
        },
        {
          title: "Signaturer",
          text:
            "Avtalet innehåller signaturer för JB Linguistics LLC och kundorganisationen samt valfri HR-/facklig bekräftelse.",
        },
      ],
      agreementTitle: "Exempel på lärresavtal",
      agreementIntro:
        "Priset skräddarsys, men varje grupp undertecknar ett transparent avtal. Använd översikten nedan för att förbereda juridik, HR eller inköp innan slutdokumentet tas fram.",
      agreementCta: "Begär avtalsutkast",
      detailIntro:
        "Exempelprogram på {days} dagar med daglig engelska coachning (2–3 timmar) och kuraterade kulturaktiviteter. Anpassade datum är möjliga.",
      detailCta: "Fråga om {days}-dagars {destination}",
      aboutTripTitle: "Om resan",
      aboutTripFallback:
        "Delta i en språklig och kulturell immersion som kombinerar engelska med genomtänkta upplevelser.",
      bildungsurlaubBadgeTitle: "Bildungsurlaub-dokumentation",
      bildungsurlaubBadgeText:
        "Tyska medborgare får alla JB Linguistics-handlingar (ansökan, kursplan, undertecknat deltagarbrev och delade fakturor) inom två arbetsdagar efter bekräftad grupp.",
      notFoundTitle: "Destinationen hittades inte",
      notFoundLink: "Tillbaka till alla destinationer",
    },
    tripBenefits: {
      title: "Studieförmåner per land",
      description:
        "Många kunder finansierar språkträning via lagstadgade eller kollektivavtalsbaserade medel. Vi stödjer redan ordningarna nedan och kan leverera dokumentationen på ditt språk.",
      items: [
        {
          label: "Tyskland — Bildungsurlaub",
          description:
            "JB Linguistics är godkänd Bildungsurlaub-leverantör (slutlig listning pågår för vissa Bundesländer 2026). Vi levererar ansökan, kursplan, närvarointyg och uppdelade fakturor.",
        },
        {
          label: "Frankrike — CPF / OPCO",
          description:
            "Vi tar fram fransk/engelsk kursbeskrivning och närvarolistor så att Compte Personnel de Formation eller er OPCO kan frisläppa medel.",
        },
        {
          label: "Nederländerna — CAO-utbildningsbudget",
          description:
            "Arbetsgivare använder CAO-leerbudget of Werkkostenregeling. Vi skickar fakturor per deltagare och detaljerade närvarorapporter.",
        },
        {
          label: "Spanien — FUNDAE",
          description:
            "Spanska organisationer kan använda Fundación Estatal (FUNDAE) utbildningskrediter; vi levererar timloggar på spanska och engelska.",
        },
        {
          label: "Sverige — Omställningsstudiestöd",
          description:
            "Svenska deltagare kan söka CSN/omställningsstudiestöd. JB tar fram kursplan och intyg på svenska.",
        },
        {
          label: "Globalt — anpassning",
          description:
            "Behöver du stöd för SkillsFuture, skatteavdrag eller CSR-budgetar? Skicka riktlinjerna så producerar vi kursbeskrivning, budget och närvarointyg.",
        },
      ],
    },
    contact: {
      heading: "Förfrågningsformulär",
      subtitle: "Berätta vad du behöver så tar vi fram ett förslag.",
      phoneLine: "Vill du hellre ringa? Tfn (602) 628-4600, eller lämna ditt nummer så ringer vi upp dig snarast.",
      name: "Namn",
      email: "E-post",
      organization: "Organisation (valfritt)",
      servicesLabel: "Vad är du intresserad av?",
      servicesOptions: [
        "Språkutbildning",
        "Certifierad dokumentöversättning",
        "Certifierad webböversättning",
        "Virtuell tolkning",
        "Linguistic Learning Trip",
        "Annat / osäker",
      ],
      servicesPlaceholder: "Välj…",
      languagesNeeded: "Önskade språk",
      languagesPlaceholder: "t.ex. engelska ↔ tyska, franska, svenska…",
      details: "Projektinformation / mål",
      detailsPlaceholder:
        "Vad arbetar du med? Ange kontext (bransch, målgrupp, volym, datum)…",
      budget: "Budget (valfritt)",
      timeline: "Tidslinje eller önskat startdatum",
      submit: "Skicka förfrågan",
      disclaimer:
        "Genom att skicka godkänner du att JB Linguistics LLC kontaktar dig. Ingen data delas utan medgivande.",
      techNote:
        "Teknisk not: koppla formuläret till din e-post, CRM eller automation (API, Formspree, Make/Zapier).",
    },
    sectionsShort: {
      mission:
        "Vårt uppdrag: virtuella språk- och översättningstjänster som matchar ditt tempo.",
      teacher:
        "Praktisk, skräddarsydd träning på nederländska, engelska, franska, tyska, danska, ryska och svenska.",
      translator:
        "Certifierade dokument- och webböversättningar plus säker tolkning för FN, flygbolag och banker.",
      trips:
        "Immersiva resor med coachning i varje aktivitet.",
      contact: "Berätta om ditt projekt så tar vi fram ett förslag.",
    },
    globalCta: {
      text: "Redo att gå vidare? Beskriv projektet och få ett förslag.",
      primary: "Begär offert",
      secondary: "Boka konsultation",
    },
    careers: {
      heading: "Karriär & samarbete",
      text:
        "Auktoriserade översättare, tolkar och utbildare arbetar med JB Linguistics som remote-konsulter. Dela din bakgrund så matchar vi dig med virtuella klasser, FN-nära uppdrag eller uppdrag för flygbolag och myndigheter.",
      bullets: [
        "Förtur för auktoriserade översättare EN ↔ DE/NL/FR/ES/ZH/SV.",
        "Utbildare med erfarenhet från flyg, företag eller offentlig sektor prioriteras.",
        "Helt virtuella leveranser med tydliga arvoden och snabb utbetalning.",
      ],
      perks: [
        "Flexibla scheman som följer kundernas behov.",
        "Helt distansbaserade arbetsflöden med säkra virtuella klassrum.",
        "Kostnadsfri språkträning för anställda och konsulter.",
        "Rabatterade översättningstjänster för personal och familjer.",
        "Kostnadsfri onboarding och AI-inriktad utbildning efter anställning.",
      ],
      ctaPrimary: "Öppna karriärsidan",
      ctaSecondary: "Tipsa en kollega",
      cardTitle: "Remote-first, flerspråkigt och compliant",
      cardText:
        "Ladda upp ditt CV en gång. Vi lyfter fram talanger till virtuella akademier, certifierade översättningsteam och tolkning på begäran för flyg, banker, NGO:er och myndigheter.",
      note: "Prioriterade språk: engelska ↔ tyska, nederländska, franska, spanska, mandarin, svenska.",
    },
    careersPage: {
      title: "Samarbeta med JB Linguistics",
      intro:
        "Vi bygger vårt nätverk av översättare och utbildare löpande. Fyll i din erfarenhet, ladda upp ett CV och vi hör av oss när en uppgift matchar din profil.",
      rolesTitle: "Fokusområden",
      roleOptions: {
        translator: "Översättning / lokalisering",
        educator: "Utbildare / coach",
        both: "Hybrid (undervisning + översättning)",
      },
      supportNote: "Behöver du snabb hjälp? Mejla talent@jblinguistics.com med ämnet “JB Careers”.",
      backLink: "Tillbaka till startsidan",
      form: {
        heading: "Ansökan",
        name: "Namn",
        email: "E-post",
        location: "Plats / tidszon",
        languages: "Arbetsspråk",
        experience: "Erfarenhet och branscher",
        availability: "Tillgänglighet",
        message: "Anteckningar",
        resume: "Ladda upp CV",
        resumeHint: "PDF eller DOC, max 5 MB.",
        submit: "Skicka ansökan",
        success: "Tack! Vi kontaktar dig när vi har en match.",
        error: "Det gick inte att skicka just nu. Försök igen senare.",
      },
      assessments: {
        teacher: {
          heading: "Lärartest (obligatoriskt)",
          intro:
            "Välj språket du undervisar i. Besvara samtliga 50 grammatikfrågor (B2–C2) och skriv två korta svar om hur du hanterar klassrumssituationer.",
          languageLabel: "Testspråk",
          languagePlaceholder: "Välj undervisningsspråk",
          answeredLabel: "Besvarade",
          shortResponseHeading: "Öppna svar",
          conflictPrompt:
            "Om en deltagare skapar konflikter – hur agerar du direkt och vilka långsiktiga åtgärder inför du?",
          attendancePrompt:
            "Om deltagare ofta uteblir eller ställer in, hur vänder du trenden och justerar din metod för att öka närvaron?",
          requirementNote: "Alla 50 frågor och båda svaren måste vara klara för roller som utbildare.",
        },
        translator: {
          heading: "Översättningsövning (obligatorisk)",
          intro:
            "Läs den engelska texten om AI på arbetsplatsen. Välj målspråk och skriv din bästa översättning.",
          storyHeading: "Källtext",
          story: [
            "Artificiell intelligens gör störst nytta när den frigör personal från repetitiva uppgifter. En genomtänkt implementering börjar med ett tydligt löfte: AI ska stötta yrkeskompetensen, inte ersätta den. Organisationer som testar kontrollerade piloter och bygger säkra ramar kan låta automatisering hantera rutiner som transkribering, ordlista eller filkonvertering så att experter får mer tid till analys och rådgivning.",
            "Lyckad AI-adoption kräver också öppenhet om datahantering. Företag beskriver vilka arbetsflöden som ligger kvar på egna servrar, vilka verktyg som anonymiserar källtext och hur varje interaktion loggas för revision. Genom att utbilda teamen i språkmodellernas styrkor och begränsningar bevarar ledare förtroendet och kan samtidigt korta ledtiderna.",
            "Implementeringen sträcker sig långt bortom översättningsminnen. Högpresterande team underhåller neurala ordlistor som ger kontextuella ledtrådar under live-tolkningar, kombinerar sammanfattningsmotorer med mänskliga granskare för politiska briefar och tränar klassificeringsmodeller att flagga kulturella eller juridiska risker innan ett dokument når beslutsfattare. Varje arbetsflöde kompletteras med mänskliga kontrollpunkter och spårbar metadata.",
            "Mänsklig granskning är fortsatt kärnan i ansvarsfullt AI-arbete. Automatisering producerar ett första utkast; domänexperter kommenterar, förtydligar lokala nyanser och återkopplar till mottagaren. Dialogen blir träningsdata utan att lämna den säkra miljön, vilket gör det möjligt att förbättra utan att röja känslig information.",
            "Sammanfattningsvis fungerar AI bäst som en disciplinerad assistent. Organisationer som investerar i säkerhet, transparens och förändringsledning kan ta till sig automatisering utan att ge avkall på integritet eller empati. Översättningen av texten ovan bör spegla denna balans: innovationens energi kombinerad med ansvarstagande, människocentrerad leverans.",
          ],
          languageLabel: "Målspråk",
          languagePlaceholder: "Välj språket du översätter till",
          submissionLabel: "Din översättning",
          notes: "Skicka översättningen på valt språk. Vi autoscorear texten och flaggar risker i adminportalen.",
        },
        validation: {
          teacherLanguage: "Välj testspråk innan du skickar.",
          teacherIncomplete: "Besvara samtliga 50 frågor och båda öppna svaren.",
          translatorLanguage: "Välj ett målspråk för översättningen.",
          translatorText: "Klistra in din översättning innan du skickar.",
        },
      },
    },
    footer: {
      tagline: "Remote-first och tillgänglig globalt för projektbaserat samarbete.",
      teachers: "Lärare",
      bio: "JB:s profil",
    },
    destinations: destinationCopy.sv,
  },
  es: {
    nav: {
      mission: "Misión",
      teacher: "Formación lingüística",
      translator: "Traducción",
      staff: "Equipo",
      trips: "Viajes lingüísticos",
      contact: "Contacto",
      aboutJb: "Conoce a nuestro CEO",
      careers: "Únete a nuestro equipo",
      viewAllDestinations: "Ver todos los destinos",
      viewAllStaff: "Ver todo",
      ctaLabel: "Solicitar presupuesto",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "Formación lingüística virtual, traducciones certificadas de documentos y sitios web e interpretación de nivel diplomático adaptada a sus objetivos.",
      ctaPrimary: "Solicitar una consulta",
      ctaSecondary: "Explorar servicios",
      meetJB: "Conozca a Jonathan Brooks",
      highlights: [
        "Registrada como JB Linguistics LLC (Florida) y JB Linguistics GmbH (Alemania) para atender a clientes en Estados Unidos y Europa.",
        "Todos los servicios son virtuales salvo que reserve un Linguistic Learning Trip.",
        "Traducciones certificadas de documentos y sitios web con control de calidad riguroso.",
        "Programas disponibles en neerlandés, inglés, francés, alemán, mandarín, español y sueco.",
      ],
      cardTitle: "Formación lingüística práctica, traducción e interpretación",
      cardBody:
        "Las sesiones pueden ser 100 % virtuales o presenciales, desde coaching individual hasta entornos diplomáticos.",
      badgeTitle: "Soporte lingüístico con foco en seguridad",
      badgeText:
        "Experiencia con organismos alemanes y equipos globales que requieren discreción y cumplimiento normativo.",
    },
    mission: {
      heading: "Declaración de misión",
      text:
        "En JB LINGUISTICS LLC diseñamos programas totalmente virtuales y de alta velocidad que respetan los objetivos, el ritmo y los requisitos de cumplimiento de cada equipo. Proveemos aulas seguras, accesos a LMS, grabaciones, evaluaciones y materiales sin coste extra para que la organización se concentre en resultados medibles.",
      text2:
        "Combinamos esa base con traducciones certificadas y servicios de interpretación que cumplen los estándares de gobiernos, aerolíneas y empresas internacionales. Nuestro modelo remoto mantiene precios transparentes, tiempos de respuesta ágiles y honorarios competitivos para nuestros especialistas. Sus KPI definen la hoja de ruta de cada proyecto.",
    },
    virtual: {
      heading: "Entrega virtual con materiales incluidos",
      text:
        "Cada programa corporativo es virtual a menos que reserve deliberadamente un viaje lingüístico. Proporcionamos el aula segura, accesos al LMS, grabaciones y licencias sin coste adicional.",
      bullets: [
        "Sesiones en vivo más laboratorios asíncronos, glosarios y ejercicios incluidos",
        "Plataformas seguras y compatibles con NDA, normativas y auditorías",
        "Las experiencias presenciales se reservan para Linguistic Learning Trips para minimizar costes",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "Formación lingüística",
          description:
            "Programas virtuales individuales o grupales alineados con sus KPIs, terminología sectorial y cultura empresarial.",
        },
        {
          key: "translation",
          title: "Traducción y localización",
          description:
            "Traducción certificada de sitios web, localización para portales de formación y contenidos listos para políticas y operaciones.",
        },
        {
          key: "interpretation",
          title: "Interpretación simultánea",
          description:
            "Interpretación simultánea y consecutiva remota para reuniones, licitaciones y negociaciones críticas.",
        },
        {
          key: "documents",
          title: "Documentos certificados",
          description:
            "Documentación legal, migratoria, aeronáutica, bancaria y de RR. HH. gestionada por traductores jurados.",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "Formación lingüística",
      intro:
        "La formación en JB Linguistics es práctica, inmersiva y totalmente vinculada a su trabajo real.",
      bullets: [
        "Coaching virtual para ejecutivos, tripulaciones, ONG y equipos gubernamentales",
        "Currículos alineados con KPIs, cumplimiento normativo y cultura",
        "Bibliotecas, grabaciones y tareas sin coste",
        "Viajes lingüísticos opcionales para inmersión presencial acelerada",
      ],
      ctas: {
        viewAll: "Ver todos los formadores",
        meetJB: "Conozca a Jonathan Brooks",
        request: "Solicitar consulta",
        assessment: "Iniciar prueba de nivel",
        book: "Reservar a JB",
      },
      banner: {
        title: "Coaching ágil para equipos globales",
        text:
          "Cada sesión se basa en sus llamadas, presentaciones, RFP y negociaciones para generar impacto inmediato.",
      },
      gridTitle: "Formadores destacados",
      cardRole: "Formador",
      cardLink: "Solicitar este formador",
    },
    translator: {
      heading: "Traducción e interpretación",
      intro:
        "Desde documentos certificados hasta interpretación lista para la ONU, JB Linguistics aporta soporte lingüístico virtual, seguro y de respuesta rápida.",
      servicesTitle: "Servicios clave",
      services: [
        "Traducción certificada de documentos legales, migratorios, aeronáuticos, de RR. HH. y de compras",
        "Traducción y localización certificadas de sitios web con accesibilidad, privacidad y SEO",
        "Localización de portales de formación, módulos LMS y resúmenes de política",
        "Interpretación simultánea y consecutiva remota para reuniones y negociaciones",
        "Gestión terminológica para aliados de la ONU, aerolíneas y banca",
      ],
      ctaJB: "Trabajar con Jonathan Brooks",
      badgeTitle: "Proyectos virtuales y conformes",
      badgeText:
        "Cada encargo incluye medidas de confidencialidad, preparación terminológica y talento con acreditación de seguridad.",
      gridTitle: "Traductores e intérpretes",
      cardRoleSuffix: "Traductor",
      cardLink: "Consultar disponibilidad",
      gridCta: "Solicitar intérprete",
    },
    enterprise: {
      heading: "Alianzas con ONU y empresas",
      intro:
        "JB Linguistics prepara equipos para misiones de la ONU, operaciones aéreas e industrias reguladas que requieren resultados lingüísticos rápidos y precisos.",
      cards: [
        {
          title: "Preparación ONU & multilateral",
          text: "Informes, actualizaciones humanitarias, paquetes de compras y módulos formativos para equipos globales.",
          bullets: [
            "Traducción rápida de sitreps, MoU y documentos de misión",
            "Facilitación virtual entre Nueva York, Ginebra, Nairobi y más",
            "Dominio del lenguaje de compras, seguridad y divulgación de la ONU",
          ],
        },
        {
          title: "Aerolíneas (listo para Lufthansa)",
          text:
            "Traducción e interpretación para operaciones aéreas, comunicación con tripulaciones y documentación de seguridad.",
          bullets: [
            "Briefings OPS, mensajes en operaciones irregulares y boletines de seguridad",
            "SEO aeronáutico, localización web y experiencia del cliente",
            "Experiencia con procesos alineados con Lufthansa y socios Star Alliance",
          ],
        },
        {
          title: "Sector financiero y bancario",
          text: "Operaciones lingüísticas para bancos globales, aerolíneas y equipos de tesorería.",
          bullets: [
            "Traducciones certificadas de contratos, informes regulatorios y comunicaciones a accionistas",
            "Gestión terminológica para KYC, onboarding y controles internos",
            "Soporte lingüístico integrado para due diligence de proveedores y proyectos estratégicos",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "Gobierno y seguridad",
      text: [
        "Jonathan Brooks ha colaborado con organismos gubernamentales alemanes durante más de una década y conoce los protocolos de seguridad necesarios para misiones sensibles.",
        "Esta experiencia permite a JB Linguistics servir a ministerios, diplomáticos y proveedores públicos con confidencialidad, precisión y rapidez.",
      ],
      highlightsTitle: "Puntos destacados",
      highlights: [
        "Licenciatura en Ciencias Políticas y Religión; Máster en Asuntos Internacionales (negociaciones de rehenes)",
        "Certificación TEFL de 168 h y credenciales avanzadas ESL & TOEFL",
        "Idiomas: inglés y francés (nativos); alemán (B2+); neerlandés, sueco, danés, ruso (B1)",
        "Dirección de equipos globales de más de 150 traductores para contratos gubernamentales",
        "Formación bilingüe para diplomáticos, líderes aeronáuticos y ONG",
        "Licencias de piloto privado FAA & EASA (IFR) con experiencia Airbus/Boeing",
        "Experiencia en flujos lingüísticos sujetos a requisitos de seguridad alemanes",
      ],
      ctaBio: "Leer el perfil completo de Jonathan Brooks",
    },
    trips: {
      heading: "Linguistic Learning Trips",
      intro:
        "Para equipos que quieren combinar viajes y aprendizaje diseñamos itinerarios a medida con clases diarias y actividades culturales.",
      bullets: [
        "Itinerarios personalizados en países germanohablantes y más allá",
        "Coaching lingüístico integrado en excursiones, comidas y reuniones",
        "Programas para ejecutivos, estudiantes, ONG y equipos internacionales",
        "Opciones para gobiernos, aerolíneas y delegaciones corporativas",
      ],
      note: "Cada viaje es un proyecto negociado y completamente adaptado a objetivos, compliance y presupuesto.",
      featuredTitle: "Itinerarios destacados 2026",
      customNote:
        "¿Necesita algo distinto? Creamos itinerarios adicionales según su calendario y requisitos.",
      additionalDates:
        "Ya tenemos {count} salidas adicionales reservadas para cohortes a medida.",
      bildungsurlaub: "Los ciudadanos alemanes pueden aprovechar Bildungsurlaub a través de JB Linguistics; recibirá los detalles tras su solicitud.",
      browseLink: "Ver todos los Linguistic Learning Trips",
      bildungsurlaubGuide: "Consultar la guía de Bildungsurlaub",
      bildungsurlaubApplication: "Descargar el formulario de solicitud",
      bildungsurlaubSteps: [
        "Verifique las normas de su Bundesland y elija una salida 2026.",
        "Descargue el formulario oficial, añada los datos de JB Linguistics LLC y el itinerario preliminar.",
        "Preséntelo ante su empleador o autoridad y envíe la aprobación a JB para finalizar contratos y facturación.",
      ],
    },
    tripsPage: {
      title: "Viajes lingüísticos",
      description:
        "Combine viaje y aprendizaje. Elija un destino para ver un itinerario ejemplo (7, 10, 14 o 21 días) y solicite fechas personalizadas para 2026.",
      capacity:
        "Capacidad: máximo 10 participantes por salida. Cuando un grupo se llena ofrecemos fechas alternativas.",
      includesTitle: "Qué incluye cada viaje 2026",
      includes: [
        "Vuelos de ida y vuelta, alojamiento 4★, desayunos y todos los traslados locales.",
        "Formador certificado con el grupo 8–10 h al día y talleres de 2–3 h integrados en el plan.",
        "Excursiones y entradas alineadas con los objetivos de aprendizaje de cada destino.",
        "Laboratorios lingüísticos diarios (2–3 h) centrados en pronunciación, gramática y vocabulario sectorial.",
      ],
      extrasTitle: "Exámenes, cumplimiento y extras",
      extras: [
        "Prueba de nivel online antes del viaje y examen oficial al finalizar.",
        "Elegible para Bildungsurlaub (DE); entregamos la documentación tras su solicitud.",
        "Máximo 10 personas; cuando se llena una cohorte liberamos nuevas fechas.",
        "El seguro médico y de responsabilidad se contrata aparte; indicamos proveedores aprobados.",
      ],
      searchLabel: "Buscar:",
      searchPlaceholder: "Busque destino o región…",
      filterLabel: "Filtrar por duración:",
      filterAllLabel: "Todas",
      packageLengthLabel: "Duración del paquete:",
      daySuffix: "días",
      cardButton: "Ver itinerario",
      cardNote: "Máx. 10 participantes; abrimos nuevas fechas cuando se llena.",
      ctaButton: "Solicitar itinerario y presupuesto",
      bildungsurlaubSectionTitle: "Kit de Bildungsurlaub",
      sampleHeading: "Itinerario de muestra de {days} días",
      sampleSubheading:
        "Sesiones diarias de inglés (2–3 h) más experiencias por la tarde. Incluye vuelos, alojamiento, desayuno, transporte local y excursiones seleccionadas.",
      lessonLabel: "Lección",
      activityLabel: "Actividad",
      note:
        "Nota: cada programa se adapta al tamaño del grupo (máx. 10), el nivel y las fechas. Cuando la cohorte se completa confirmamos alternativas y orientamos a cada viajero sobre los seguros obligatorios antes de salir.",
      agreementClauses: [
        {
          title: "Partes y alcance",
          text:
            "JB Linguistics LLC (proveedor lingüístico) entrega el itinerario, el plan formativo y la facilitación a medida para la organización indicada en el statement of work.",
        },
        {
          title: "Servicios",
          text:
            "Incluye coaching diario (2–3 h), acompañamiento de viaje, evaluaciones iniciales/finales e informes. Todos los materiales permanecen virtuales y sin coste.",
        },
        {
          title: "Viaje y alojamiento",
          text:
            "JB Linguistics gestiona vuelos, alojamiento 4★, desayunos y traslados locales para hasta 10 viajeros; las mejoras se facturan solo con aprobación.",
        },
        {
          title: "Precio y pago",
          text:
            "La tarifa se define por cohorte en un anexo. 40 % al firmar, 60 % 14 días antes de la salida salvo acuerdo distinto.",
        },
        {
          title: "Cambios y cancelación",
          text:
            "Cambios ≥45 días antes: sin cargo; 15–44 días: 25 %; <15 días: costes de proveedores ya comprometidos. Las cláusulas de fuerza mayor protegen a ambas partes.",
        },
        {
          title: "Seguro y cumplimiento",
          text:
            "Los participantes contratan seguro médico y de responsabilidad con proveedores aprobados. JB entrega la documentación de Bildungsurlaub y los requisitos locales.",
        },
        {
          title: "Confidencialidad y seguridad",
          text:
            "Todo el personal opera bajo NDA y protocolos de seguridad de nivel gubernamental; los briefings sensibles pueden hacerse en línea antes/después del viaje.",
        },
        {
          title: "Firmas",
          text:
            "Cada contrato incluye los bloques de firmas de JB Linguistics LLC y del cliente, además de una opción para RR. HH. o comités laborales.",
        },
      ],
      agreementTitle: "Contrato modelo de viaje lingüístico",
      agreementIntro:
        "La inversión siempre es personalizada, pero cada cohorte firma un acuerdo transparente. Utilice el esquema siguiente para preparar a los equipos legales, de RR. HH. o compras antes de la redacción final.",
      agreementCta: "Solicitar borrador de contrato",
      detailIntro:
        "Itinerario de referencia de {days} días que combina coaching diario de inglés (2–3 h) con actividades culturales curadas. También hay fechas personalizadas.",
      detailCta: "Consultar {destination} ({days} días)",
      aboutTripTitle: "Sobre este viaje",
      aboutTripFallback:
        "Viva una experiencia de inmersión cultural y lingüística que combina inglés aplicado con viajes cuidadosamente diseñados.",
      bildungsurlaubBadgeTitle: "Documentación de Bildungsurlaub",
      bildungsurlaubBadgeText:
        "Los ciudadanos alemanes reciben en dos días hábiles todo el paquete JB Linguistics (solicitud, plan curricular, carta firmada y facturación dividida) tras confirmar el grupo.",
      notFoundTitle: "Destino no encontrado",
      notFoundLink: "Volver a todos los destinos",
    },
    tripBenefits: {
      title: "Beneficios formativos por país",
      description:
        "Muchos clientes financian estos viajes con presupuestos legales o colectivos. Ya gestionamos los programas siguientes y podemos entregar la documentación en su idioma.",
      items: [
        {
          label: "Alemania — Bildungsurlaub",
          description:
            "JB Linguistics es proveedor autorizado (últimos registros pendientes en algunos Länder para 2026). Entregamos solicitud, temario, certificados de asistencia y facturas fraccionadas.",
        },
        {
          label: "Francia — CPF / OPCO",
          description:
            "Emitimos descripciones FR/EN y hojas de firma para activar créditos del Compte Personnel de Formation u OPCO sectorial.",
        },
        {
          label: "Países Bajos — presupuestos CAO",
          description:
            "Los empleadores usan horas de formación CAO o la Werkkostenregeling. Proveemos facturas nominativas y reportes de asistencia.",
        },
        {
          label: "España — FUNDAE",
          description:
            "Las organizaciones españolas bonifican costes con créditos de la Fundación Estatal. Entregamos registros horario por hora en español e inglés.",
        },
        {
          label: "Suecia — Omställningsstudiestöd",
          description:
            "Profesionales suecos pueden solicitar el apoyo CSN/ombställning; emitimos plan docente y constancias en sueco.",
        },
        {
          label: "Global — a medida",
          description:
            "¿Necesita requisitos de SkillsFuture, créditos fiscales o presupuestos CSR? Compártalos y generaremos programa, presupuesto y certificados necesarios.",
        },
      ],
    },
    contact: {
      heading: "Formulario de contacto",
      subtitle: "Cuéntenos qué necesita y le enviaremos una propuesta a medida.",
      phoneLine: "¿Prefiere hablar por teléfono? Llámenos al (602) 628-4600 o deje su número y le devolveremos la llamada.",
      name: "Nombre",
      email: "Correo electrónico",
      organization: "Organización (opcional)",
      servicesLabel: "¿Qué le interesa?",
      servicesOptions: [
        "Formación lingüística",
        "Traducción certificada de documentos",
        "Traducción certificada de sitios web",
        "Interpretación virtual",
        "Linguistic Learning Trip",
        "Otro / no seguro",
      ],
      servicesPlaceholder: "Seleccione…",
      languagesNeeded: "Idiomas requeridos",
      languagesPlaceholder: "ej. inglés ↔ alemán, francés, sueco…",
      details: "Detalles del proyecto / objetivos",
      detailsPlaceholder:
        "¿En qué está trabajando? Incluya contexto (sector, público, volumen, fechas)…",
      budget: "Presupuesto estimado (opcional)",
      timeline: "Plazo o fecha deseada",
      submit: "Enviar solicitud",
      disclaimer:
        "Al enviar acepta que JB Linguistics LLC se ponga en contacto con usted sobre esta consulta. No compartimos información sin consentimiento.",
      techNote:
        "Nota técnica: conecte este formulario con su correo, CRM o herramienta de automatización (API, Formspree, Make/Zapier).",
    },
    sectionsShort: {
      mission:
        "Nuestra misión: servicios lingüísticos virtuales que avanzan al ritmo de sus metas.",
      teacher:
        "Formación práctica y personalizada en neerlandés, inglés, francés, alemán, danés, ruso y sueco.",
      translator:
        "Traducciones certificadas e interpretación segura para la ONU, aerolíneas y banca.",
      trips:
        "Viajes inmersivos con coaching en cada actividad.",
      contact: "Cuéntenos su proyecto y prepararemos una propuesta.",
    },
    globalCta: {
      text: "¿Listo para avanzar? Describa su proyecto y obtenga una propuesta personalizada.",
      primary: "Solicitar presupuesto",
      secondary: "Solicitar consulta",
    },
    careers: {
      heading: "Carreras y colaboraciones",
      text:
        "Traductores jurados, intérpretes y formadores colaboran con JB Linguistics como contratistas remotos. Comparta su experiencia para vincularse a cohortes virtuales, proyectos ONU o equipos de aerolíneas y gobiernos.",
      bullets: [
        "Prioridad para traductores certificados EN ↔ DE/NL/FR/ES/ZH/SV.",
        "Formadores con experiencia corporativa, aeronáutica o gubernamental pasan por fast-track.",
        "Entrega 100 % virtual con tarifas transparentes y pagos rápidos.",
      ],
      perks: [
        "Horarios flexibles ajustados a las ventanas de demanda del cliente.",
        "Flujos totalmente remotos con aulas virtuales seguras.",
        "Beneficios gratuitos de aprendizaje de idiomas para empleados y contratistas.",
        "Servicios de traducción con descuento para el personal y sus familias.",
        "Onboarding y formación enfocada en IA sin costo al incorporarse.",
      ],
      ctaPrimary: "Ir a la página de carreras",
      ctaSecondary: "Referir a un colega",
      cardTitle: "Operación remota, multilingüe y compliant",
      cardText:
        "Suba su CV una sola vez. Presentamos talento para academias virtuales, equipos de traducción certificada e interpretación bajo demanda para aerolíneas, bancos, ONG y gobiernos.",
      note: "Idiomas prioritarios: inglés ↔ alemán, neerlandés, francés, español, mandarín, sueco.",
    },
    careersPage: {
      title: "Colabore con JB Linguistics",
      intro:
        "Ampliamos nuestra red de traductores y educadores durante todo el año. Complete el formulario, suba su CV y le contactaremos cuando su perfil se ajuste a una cohorte o proyecto regulado.",
      rolesTitle: "Áreas de enfoque",
      roleOptions: {
        translator: "Traductor / localización",
        educator: "Educador / coach",
        both: "Híbrido (enseñar + traducir)",
      },
      supportNote: "¿Necesita ayuda inmediata? Escriba a talent@jblinguistics.com con el asunto “JB Careers”.",
      backLink: "Volver al inicio",
      form: {
        heading: "Formulario de aplicación",
        name: "Nombre completo",
        email: "Correo electrónico",
        location: "Ubicación / zona horaria",
        languages: "Idiomas de trabajo",
        experience: "Años de experiencia y sectores",
        availability: "Disponibilidad",
        message: "Notas",
        resume: "Adjuntar CV",
        resumeHint: "PDF o DOC hasta 5 MB.",
        submit: "Enviar solicitud",
        success: "Gracias. Le contactaremos cuando haya una coincidencia.",
        error: "No pudimos enviar la solicitud. Intente nuevamente en unos minutos.",
      },
      assessments: {
        teacher: {
          heading: "Evaluación para docentes (obligatoria)",
          intro:
            "Elija el idioma que desea impartir. Responda las 50 preguntas de gramática (B2–C2) y escriba dos respuestas sobre cómo gestiona el aula.",
          languageLabel: "Idioma de la evaluación",
          languagePlaceholder: "Seleccione el idioma en el que enseña",
          answeredLabel: "Respondidas",
          shortResponseHeading: "Respuestas abiertas",
          conflictPrompt:
            "Si un alumno crea conflictos con frecuencia, ¿cómo interviene en el momento y qué medidas toma para evitar que se repita?",
          attendancePrompt:
            "Si los alumnos faltan o cancelan seguido, ¿qué estrategia aplicaría para revertir la situación y ajustar su metodología?",
          requirementNote: "Las 50 preguntas y las dos respuestas escritas son obligatorias para roles docentes.",
        },
        translator: {
          heading: "Ejercicio de traducción (obligatorio)",
          intro:
            "Lea el texto en inglés sobre el uso de la IA en el trabajo. Seleccione el idioma objetivo y escriba su traducción.",
          storyHeading: "Texto fuente",
          story: [
            "La inteligencia artificial aporta más valor cuando libera a los equipos de las tareas repetitivas que saturan cada proyecto. Una implantación cuidadosa comienza con una promesa: la IA complementa a los profesionales, no los reemplaza. Las organizaciones que prueban pilotos controlados y fijan límites estrictos dejan que la automatización se encargue de la transcripción, los glosarios o las conversiones de archivos, para que los especialistas se concentren en el análisis.",
            "El éxito también depende de la transparencia en el tratamiento de datos. Las empresas describen qué flujos permanecen en servidores seguros, qué herramientas anonimizan los textos y cómo cada interacción se registra para auditorías. Al capacitar a los equipos sobre las fortalezas y limitaciones de los modelos de lenguaje, los líderes mantienen la confianza mientras aceleran los plazos de entrega.",
            "La implementación va más allá de las memorias de traducción. Los equipos de alto rendimiento mantienen glosarios neuronales que aportan pistas contextuales durante interpretaciones en vivo, combinan motores de resumen con revisores humanos para convertir debates parlamentarios en informes breves y entrenan clasificadores que detectan riesgos culturales o regulatorios antes de llegar a un responsable.",
            "La revisión humana sigue siendo la base de un programa responsable. La automatización produce un borrador; los expertos anotan, resuelven las particularidades locales y explican su razonamiento a clientes o directivos. Ese diálogo genera datos de entrenamiento sin abandonar el perímetro seguro, de modo que la organización aprende sin exponer información sensible.",
            "En conclusión, la IA funciona mejor como un asistente disciplinado. Las empresas que invierten en seguridad, transparencia y gestión del cambio adoptan la automatización sin sacrificar confidencialidad ni empatía. La traducción del texto anterior debe reflejar ese equilibrio: innovación con responsabilidad y un enfoque centrado en las personas.",
          ],
          languageLabel: "Idioma destino",
          languagePlaceholder: "Seleccione el idioma al que traduce",
          submissionLabel: "Su traducción",
          notes: "Presente su traducción en el idioma elegido. El sistema asignará una puntuación automática y mostrará riesgos en el portal.",
        },
        validation: {
          teacherLanguage: "Seleccione primero el idioma de la evaluación.",
          teacherIncomplete: "Responda las 50 preguntas y las dos respuestas abiertas.",
          translatorLanguage: "Seleccione un idioma destino para la traducción.",
          translatorText: "Pegue su traducción antes de enviar.",
        },
      },
    },
    footer: {
      tagline: "Remote-first y disponible en todo el mundo para proyectos a medida.",
      teachers: "Formadores",
      bio: "Perfil de JB",
    },
    destinations: destinationCopy.es,
  },
  zh: {
    nav: {
      mission: "使命",
      teacher: "语言培训",
      translator: "翻译服务",
      staff: "师资团队",
      trips: "语言旅行",
      contact: "联系我们",
      aboutJb: "认识我们的首席执行官",
      careers: "加入我们的团队",
      viewAllDestinations: "查看所有目的地",
      viewAllStaff: "查看全部",
      ctaLabel: "获取报价",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "提供虚拟语言培训、认证文件与网站翻译，以及符合外交级别的口译服务，全部围绕您的业务目标量身定制。",
      ctaPrimary: "预约咨询",
      ctaSecondary: "浏览服务",
      meetJB: "了解 Jonathan Brooks",
      highlights: [
        "以佛罗里达注册的 JB Linguistics LLC 与德国注册的 JB Linguistics GmbH 两家实体运营，服务美国及欧洲客户。",
        "除语言旅行外，其余服务全部在线完成。",
        "严格质控的认证文件与网站翻译，由宣誓译员负责。",
        "项目可覆盖荷兰语、英语、法语、德语、普通话、西班牙语和瑞典语。",
      ],
      cardTitle: "实用语言培训、翻译与口译",
      cardBody:
        "课程可完全线上，也可按需线下安排——从一对一辅导到高层外交场景。",
      badgeTitle: "注重安全的语言支持",
      badgeText:
        "拥有为德国机构及跨国团队服务的经验，确保保密与合规要求得到满足。",
    },
    mission: {
      heading: "使命宣言",
      text:
        "JB LINGUISTICS LLC 打造高效的全虚拟语言方案，兼顾学习目标、节奏与合规需求。我们免费提供安全教室、LMS 帐号、录音、评估与精选资料，让团队专注于可量化的进步。",
      text2:
        "同时我们提供认证文件与网站翻译以及口译服务，满足政府、航空和企业级标准。远程优先的运营模式保障透明定价、迅速响应，并为专家团队提供优厚报酬。您的 KPI 成为我们的路线图，决定每个项目的成败。",
    },
    virtual: {
      heading: "虚拟交付，材料全包",
      text:
        "除非您特意预订语言旅行，每个企业课程都以线上方式开展。我们免费提供安全教室、LMS 账号、录制内容与授权资源。",
      bullets: [
        "包含直播辅导、异步练习、术语表与训练任务",
        "符合 NDA、合规与审计要求的安全平台",
        "仅在 Linguistic Learning Trip 中安排线下体验，以保持成本最低",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "语言培训",
          description:
            "虚拟一对一及小组课程，贴合您的 KPI、行业术语与企业文化。",
        },
        {
          key: "translation",
          title: "翻译与本地化",
          description:
            "认证网站翻译、培训平台本地化以及可直接上线的政策与运营内容。",
        },
        {
          key: "interpretation",
          title: "同声传译",
          description:
            "远程同传与交传，覆盖简报、招投标及高风险谈判。",
        },
        {
          key: "documents",
          title: "认证文件翻译",
          description:
            "法律、移民、航空、银行与人力资源文件均由宣誓译员与质检团队处理。",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "语言培训",
      intro:
        "JB Linguistics 的培训注重实用、沉浸与个性化设计，让每次课程都直接支撑您的真实工作场景。",
      bullets: [
        "为高管、机组、NGO 与政府团队提供虚拟辅导",
        "课程结构与 KPI、合规要求和企业文化保持一致",
        "资料库、录音与作业全部免费提供",
        "可选语言旅行，实现高强度线下沉浸",
      ],
      ctas: {
        viewAll: "查看全部讲师",
        meetJB: "了解 Jonathan Brooks",
        request: "预约咨询",
        assessment: "开始水平测试",
        book: "预约 JB",
      },
      banner: {
        title: "加速全球团队语言力",
        text:
          "课程直接围绕您的电话会议、演示、RFP 与谈判展开，确保每小时都产生可见成效。",
      },
      gridTitle: "精选讲师",
      cardRole: "讲师",
      cardLink: "咨询该讲师",
    },
    translator: {
      heading: "翻译与口译",
      intro:
        "从认证文件到联合国级别的口译，JB Linguistics 为您的关键项目提供安全、快速的线上语言支持。",
      servicesTitle: "核心服务",
      services: [
        "法律、移民、航空、HR 与采购文件的认证翻译",
        "兼顾无障碍、隐私与 SEO 的认证网站翻译与本地化",
        "培训门户、LMS 模块与政策材料的本地化",
        "远程同传与交传，覆盖简报与商务谈判",
        "面向联合国、航空与银行伙伴的术语管理",
      ],
      ctaJB: "与 Jonathan Brooks 合作",
      badgeTitle: "虚拟且合规的项目架构",
      badgeText:
        "每个项目都会配置保密措施、术语准备以及通过安全审查的语言专家。",
      gridTitle: "精选译员与口译员",
      cardRoleSuffix: "译员",
      cardLink: "查询档期",
      gridCta: "提交口译需求",
    },
    enterprise: {
      heading: "联合国与企业伙伴",
      intro:
        "JB Linguistics 支持联合国任务、航空运营及受监管行业，帮助您快速获得高精度的语言成果。",
      cards: [
        {
          title: "联合国/多边准备",
          text: "为全球团队制作简报、人道更新、采购案与培训内容。",
          bullets: [
            "快速翻译态势报告、MoU 与任务文件",
            "跨纽约、日内瓦、内罗毕等时区的虚拟协调",
            "熟悉联合国采购、安全与披露语言",
          ],
        },
        {
          title: "航空与航司（面向 Lufthansa）",
          text:
            "为航司运营、机组沟通与安全文件提供翻译与口译。",
          bullets: [
            "OPS 简报、异常运营信息与安全公告",
            "航空 SEO、网站与旅客体验本地化",
            "具备支持 Lufthansa 及星空联盟流程的经验",
          ],
        },
        {
          title: "金融与银行合作",
          text: "为全球银行、航空及财资团队提供语言运营支持。",
          bullets: [
            "合同、监管申报与股东沟通的认证翻译",
            "KYC、入职与内控术语管理",
            "嵌入式语言支持，协助供应商尽调与战略项目",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "政府与安全项目",
      text: [
        "Jonathan Brooks 与德国政府机构合作逾十年，熟悉承担敏感任务所需的安全流程。",
        "这使 JB Linguistics 能够在保密、精准与高效的前提下服务部委、外交与公共承包商。",
      ],
      highlightsTitle: "专业亮点",
      highlights: [
        "政治学与宗教学学士；国际事务硕士（人质谈判方向）",
        "168 小时 TEFL 以及高级 ESL/TOEFL 认证",
        "语言：英语、法语（母语）；德语 B2+；荷兰语、瑞典语、丹麦语、俄语 B1",
        "为政府合同搭建并管理 150+ 人全球翻译团队",
        "为外交、航空领导与 NGO 设计双语培训",
        "FAA/EASA IFR 私照，熟悉 Airbus 与 Boeing 运营",
        "深谙德国安全审查要求下的语言流程",
      ],
      ctaBio: "查看 Jonathan Brooks 个人简介",
    },
    trips: {
      heading: "Linguistic Learning Trips",
      intro:
        "想把旅行与语言相结合？我们提供每日课程与沉浸体验相融合的专属行程。",
      bullets: [
        "可定制德语区及全球目的地",
        "语言辅导融入行程、餐饮与商务会面",
        "适合高管、学员、NGO 与跨国团队",
        "适用于政府、航司与企业代表团",
      ],
      note: "旅行均为定制项目，会根据目标、合规与预算全面设计。",
      featuredTitle: "2026 年精选行程",
      customNote:
        "需要其他方案？我们可根据日程与要求追加定制行程。",
      additionalDates:
        "另有 {count} 个定制出发批次已预留。",
      bildungsurlaub: "德国客户可通过 JB Linguistics 申请 Bildungsurlaub，详情在提交需求后提供。",
      browseLink: "查看全部 Linguistic Learning Trips",
      bildungsurlaubGuide: "查看 Bildungsurlaub 指南",
      bildungsurlaubApplication: "下载申请表",
      bildungsurlaubSteps: [
        "确认所在联邦州的规定并选择 2026 年的出发批次。",
        "下载官方表格，填写 JB Linguistics LLC 项目信息及初步行程。",
        "提交给雇主或主管机构，并将批准结果提供给 JB 以完成合同与账单分配。",
      ],
    },
    tripsPage: {
      title: "语言旅行",
      description:
        "把旅行与语言学习结合。选择目的地即可查看 7、10、14 或 21 天的示例行程，并预约 2026 年的专属档期。",
      capacity: "人数上限：每个批次最多 10 人。满员后我们会提供其他日期。",
      includesTitle: "2026 行程涵盖",
      includes: [
        "往返机票、四星级住宿、早餐及所有当地交通。",
        "认证教师全程随行，每天 8–10 小时辅导，并嵌入 2–3 小时工作坊。",
        "与学习目标匹配的精选活动和门票。",
        "每日 2–3 小时语言实验课，强化发音、语法与行业词汇。",
      ],
      extrasTitle: "考试、合规与增值服务",
      extras: [
        "出发前线上分级，返程后参加官方认证考试。",
        "支持德国 Bildungsurlaub（教育假期）申请，详情在提交需求后提供。",
        "每批最多 10 人；满员后将开放新日期。",
        "旅行医疗与责任保险需单独购买，我们提供核准供应商建议。",
      ],
      searchLabel: "搜索：",
      searchPlaceholder: "搜索目的地或地区…",
      filterLabel: "按天数筛选：",
      filterAllLabel: "全部",
      packageLengthLabel: "行程天数：",
      daySuffix: "天",
      cardButton: "查看行程",
      cardNote: "每批最多 10 人；满员后开放新日期。",
      ctaButton: "索取行程与报价包",
      bildungsurlaubSectionTitle: "Bildungsurlaub 工具包",
      sampleHeading: "{days} 天示例行程",
      sampleSubheading:
        "每天 2–3 小时英语课程 + 下午体验。费用包含机票、住宿、早餐、当地交通与精选活动。",
      lessonLabel: "课程",
      activityLabel: "活动",
      note:
        "提示：每个项目都会根据团队规模（最多 10 人）、水平与日期微调。满员后我们会确认替代方案，并在出发前指导每位学员完成必要保险。",
      agreementClauses: [
        {
          title: "合作方与范围",
          text: "JB Linguistics LLC（语言服务方）为声明书中指定的客户提供定制行程、课程与全程协调。",
        },
        {
          title: "服务内容",
          text: "包含每日 2–3 小时辅导、旅程陪同、行前/行后测评及全程报告；所有教材均为线上并免费提供。",
        },
        {
          title: "交通与住宿",
          text: "JB Linguistics 负责往返机票、四星住宿、早餐与当地交通（最多 10 人）；升级或加项需事先确认。",
        },
        {
          title: "价格与付款",
          text: "费用按团组在附件中列明。签约时支付 40%，出发前 14 天付清余款，如需调整可协商。",
        },
        {
          title: "变更与取消",
          text: "出发前 ≥45 天改期无费用；15–44 天：25%；<15 天：支付已产生的供应商成本。不可抗力条款同时保护双方。",
        },
        {
          title: "保险与合规",
          text: "学员通过认可渠道自行购买旅行及责任险。JB 提供 Bildungsurlaub 材料与各国合规文件。",
        },
        {
          title: "保密与安全",
          text: "全体讲师遵守保密协议并符合德国安全标准；敏感简报可在行前或行后通过线上交付。",
        },
        {
          title: "签署",
          text: "合同含 JB Linguistics LLC 与客户的签署栏，并可加入 HR/工会确认。",
        },
      ],
      agreementTitle: "语言旅行样板协议",
      agreementIntro:
        "费用始终是定制的，但每个团组都会签署透明协议。可借以下提纲向法务、HR 或采购团队提前说明，我们随后会拟定正式文件。",
      agreementCta: "索取协议草案",
      detailIntro:
        "{days} 天示例方案，将每日 2–3 小时英语辅导与精选文化活动相结合，亦可定制其他日期。",
      detailCta: "咨询 {destination}（{days} 天）",
      aboutTripTitle: "行程简介",
      aboutTripFallback:
        "加入融合英语学习与精选旅行体验的沉浸式项目。",
      bildungsurlaubBadgeTitle: "Bildungsurlaub 文件",
      bildungsurlaubBadgeText:
        "确认成团后，两日内即可收到 JB Linguistics 全套材料（申请表、课程大纲、签署证明与分账发票）。",
      notFoundTitle: "未找到该目的地",
      notFoundLink: "返回全部目的地",
    },
    tripBenefits: {
      title: "各国可用的培训福利",
      description:
        "许多客户会结合本国的法定培训补贴来支付语言旅行费用。我们已熟悉下列项目，并可按照要求出具双语材料。",
      items: [
        {
          label: "德国 — Bildungsurlaub",
          description:
            "JB Linguistics 为官方认可的教育假期课程提供方（2026 年部分州仍在备案中）。我们准备申请表、课程大纲、出席证明与分账发票。",
        },
        {
          label: "法国 — CPF / OPCO",
          description:
            "可提供法英双语课程描述，方便 Compte Personnel de Formation 或 OPCO 审批经费。",
        },
        {
          label: "荷兰 — CAO 培训预算",
          description:
            "雇主常通过 CAO 学习预算或 Werkkostenregeling 报销。我们提供个人发票与出勤记录。",
        },
        {
          label: "西班牙 — FUNDAE",
          description:
            "西班牙机构可使用 Fundación Estatal (FUNDAE) 培训积分。我们提供西语及英语的课时报告。",
        },
        {
          label: "瑞典 — Omställningsstudiestöd",
          description:
            "瑞典学员可申请 CSN/工会的再培训资助，JB 提供瑞语课程说明及结业证明。",
        },
        {
          label: "全球 — 定制合规",
          description:
            "如果需要 SkillsFuture、税收抵扣或 CSR 证明，请告知准则，我们会生成相应的课程、预算与出勤文件。",
        },
      ],
    },
    contact: {
      heading: "需求表单",
      subtitle: "告诉我们您的需求，我们会提供专属方案。",
      phoneLine: "也可直接致电 (602) 628-4600，或在表单中留下号码，我们会尽快回拨。",
      name: "姓名",
      email: "邮箱",
      organization: "机构（可选）",
      servicesLabel: "您感兴趣的服务",
      servicesOptions: [
        "语言培训",
        "认证文件翻译",
        "认证网站翻译",
        "线上口译",
        "Linguistic Learning Trip",
        "其他 / 暂不确定",
      ],
      servicesPlaceholder: "请选择…",
      languagesNeeded: "所需语言",
      languagesPlaceholder: "如 英语 ↔ 德语、法语、瑞典语…",
      details: "项目详情 / 目标",
      detailsPlaceholder:
        "请说明业务背景（行业、受众、规模、时间等）…",
      budget: "预算（可选）",
      timeline: "时间表或期望开始日期",
      submit: "提交表单",
      disclaimer:
        "提交代表您同意 JB Linguistics LLC 就此需求与您联系。未经许可不会与第三方共享信息。",
      techNote:
        "技术提示：可将此表单连接至邮箱、CRM 或自动化工具（API、Formspree、Make/Zapier）。",
    },
    sectionsShort: {
      mission:
        "我们的使命：以虚拟方式提供与您节奏同步的语言与翻译服务。",
      teacher:
        "提供荷兰语、英语、法语、德语、丹麦语、俄语和瑞典语的定制培训。",
      translator:
        "为联合国、航司与银行提供认证翻译与安全口译。",
      trips:
        "沉浸式语言旅行，在每个活动中融入辅导。",
      contact: "告诉我们您的项目，我们将制定方案。",
    },
    globalCta: {
      text: "准备好下一步了吗？分享您的项目即可获得定制方案。",
      primary: "获取报价",
      secondary: "预约咨询",
    },
    careers: {
      heading: "加入我们的合作网络",
      text:
        "宣誓译员、口译和语言培训专家都以远程合同的方式与 JB Linguistics 合作。留下您的背景，我们会在虚拟课程、联合国及航空/政府项目有需求时邀请您加入。",
      bullets: [
        "优先考虑覆盖英语 ↔ 德语/荷兰语/法语/西语/中文/瑞典语的宣誓译员。",
        "拥有航空、企业或政府经验的讲师将获得快速审核。",
        "完全线上交付，费率透明，结算迅速。",
      ],
      perks: [
        "排班灵活，可根据客户需求调整。",
        "完全远程的安全虚拟课堂工作流。",
        "为员工与合同顾问提供免费的语言学习福利。",
        "员工及其家属可享受优惠翻译服务。",
        "入职后提供免费的入职指导和 AI 专项培训。",
      ],
      ctaPrimary: "打开招聘页面",
      ctaSecondary: "推荐同事",
      cardTitle: "远程优先 · 多语言 · 符合合规",
      cardText:
        "简历只需上传一次。我们会在虚拟学院、认证翻译团队以及航空、银行、NGO 与政府的口译需求中优先展示您的能力。",
      note: "重点语言：英语 ↔ 德语、荷兰语、法语、西班牙语、普通话、瑞典语。",
    },
    careersPage: {
      title: "与 JB Linguistics 合作",
      intro:
        "我们全年扩充译员与讲师库。请填写下方信息并上传简历，一旦有匹配的项目，我们会第一时间联系您。",
      rolesTitle: "合作方向",
      roleOptions: {
        translator: "翻译 / 本地化",
        educator: "培训师 / 教练",
        both: "混合角色（教学 + 翻译）",
      },
      supportNote: "需要即时协助？请发送邮件至 talent@jblinguistics.com，并在标题注明 “JB Careers”。",
      backLink: "返回首页",
      form: {
        heading: "申请表",
        name: "姓名",
        email: "邮箱",
        location: "所在地 / 时区",
        languages: "工作语言",
        experience: "经验年限与行业",
        availability: "可投入时间",
        message: "备注",
        resume: "上传简历",
        resumeHint: "PDF 或 DOC，最大 5 MB。",
        submit: "提交申请",
        success: "感谢申请！合适项目出现时我们会联系您。",
        error: "暂时无法提交，请稍后再试。",
      },
      assessments: {
        teacher: {
          heading: "讲师测评（必填）",
          intro:
            "请选择希望教授的语言。答完 50 道 B2–C2 级别的语法题，并填写两个与课堂管理相关的开放式问题。",
          languageLabel: "测评语言",
          languagePlaceholder: "请选择授课语言",
          answeredLabel: "已完成",
          shortResponseHeading: "开放式回答",
          conflictPrompt: "若有学员在课堂上持续制造冲突，您会如何即时处理并避免后续再发生？",
          attendancePrompt: "若学员频繁缺课或临时取消，您会如何扭转状况并调整教学方式以提升参与度？",
          requirementNote: "申请教学角色必须完成全部 50 道题与两道开放式问题。",
        },
        translator: {
          heading: "翻译测试（必填）",
          intro: "阅读关于“AI 在职场应用”的英文短文，选择目标语言并提交您的译文。",
          storyHeading: "英文原文",
          story: [
            "人工智能在减少团队重复性工作时价值最大。要成功导入 AI，需要向员工承诺：AI 用于增强岗位能力，而非替代人。企业通常通过受控试点与严格安全边界，让自动化集中处理转录、术语表及文件转换等工作，从而释放专家时间。",
            "成功应用 AI 必须以透明数据治理为前提。公司解释哪些流程保留在本地服务器、哪些工具匿名化文本、以及为什么每一步都记录在案。通过培训员工了解大型语言模型的优势与局限，管理层能够加快交付并保持客户信任。",
            "实践远不止翻译记忆或聊天机器人。领先团队维护神经术语库，为现场口译提供背景提示；他们将摘要引擎与人工审校结合，以便迅速生成政策摘要；他们也会训练分类模型，在材料送至决策者之前就提示文化或监管风险。每条流程都配置人工检查点与可追溯的元数据。",
            "人工审校依然是负责的 AI 方案的核心。自动化产出初稿，专家负责注释、补充在地语境，并向客户说明理由。上述对话本身也会成为训练素材，但始终保留在受控环境，确保隐私不外泄。",
            "总之，AI 最适合作为一名纪律严明的助手。投资于安全、透明度和变更管理的组织，能够在不牺牲保密性或同理心的前提下拥抱自动化。请在翻译时体现这种平衡：既传达创新热情，也突出以人为本的交付。",
          ],
          languageLabel: "目标语言",
          languagePlaceholder: "请选择翻译方向",
          submissionLabel: "您的译文",
          notes: "请使用所选语言提交译文，系统会自动评分并在后台标注潜在风险。",
        },
        validation: {
          teacherLanguage: "请先选择测评语言。",
          teacherIncomplete: "请完成 50 道题并填写两个开放式回答。",
          translatorLanguage: "请选择翻译的目标语言。",
          translatorText: "请粘贴译文后再提交。",
        },
      },
    },
    footer: {
      tagline: "Remote-first，面向全球提供项目型合作。",
      teachers: "讲师团队",
      bio: "JB 简介",
    },
    destinations: destinationCopy.zh,
  },
  de: {
    nav: {
      mission: "Mission",
      teacher: "Sprachtraining",
      translator: "Übersetzung",
      staff: "Team",
      trips: "Sprachreisen",
      contact: "Kontakt",
      aboutJb: "Lernen Sie unseren CEO kennen",
      careers: "Trete unserem Team bei",
      viewAllDestinations: "Alle Destinationen",
      viewAllStaff: "Alle anzeigen",
      ctaLabel: "Angebot anfragen",
    },
    hero: {
      title: "JB Linguistics LLC",
      subtitle:
        "Virtueller Sprachunterricht, beglaubigte Dokument- und Website-Übersetzungen sowie diplomatieerprobtes Dolmetschen – exakt auf Ihre Ziele zugeschnitten.",
      ctaPrimary: "Beratung anfragen",
      ctaSecondary: "Leistungen entdecken",
      meetJB: "Jonathan Brooks kennenlernen",
      highlights: [
        "Registriert als JB Linguistics LLC in Florida und JB Linguistics GmbH in Deutschland, um Kunden in den USA und Europa zu betreuen.",
        "Alle Leistungen sind virtuell – außer Sie buchen eine Linguistic Learning Trip-Reise.",
        "Beglaubigte Dokument- und Website-Übersetzungen mit strenger Qualitätssicherung.",
        "Programme in Niederländisch, Englisch, Französisch, Deutsch, Mandarin, Spanisch und Schwedisch.",
      ],
      cardTitle: "Praxisnahe Sprachtrainings, Übersetzung & Dolmetschen",
      cardBody:
        "Sessions laufen virtuell oder vor Ort – von Einzelcoaching bis zu diplomatischen Einsätzen.",
      badgeTitle: "Sicherheitsbewusste Sprachbegleitung",
      badgeText:
        "Erfahrung mit Projekten deutscher Behörden und multinationalen Teams, bei denen Diskretion und Compliance entscheidend ist.",
    },
    mission: {
      heading: "Leitbild",
      text:
        "JB LINGUISTICS LLC entwickelt hochdynamische, vollständig virtuelle Sprachprogramme, die Lerntempo, Ziele und Compliance-Vorgaben Ihrer Teams berücksichtigen. Wir stellen sichere Klassenzimmer, LMS-Zugänge, Aufzeichnungen, Assessments und kuratierte Materialien ohne Zusatzkosten bereit, damit sich Ihre Organisation auf messbare Fortschritte konzentrieren kann.",
      text2:
        "Parallel dazu liefern wir beglaubigte Dokument- und Website-Übersetzungen sowie Dolmetschleistungen, die Behörden-, Airline- und Enterprise-Standards erfüllen. Unser Remote-First-Modell ermöglicht transparente Preise, schnelle Reaktionszeiten und faire Honorare für unser Expertenteam. Ihre KPIs bilden den Fahrplan, an dem wir jede Zusammenarbeit ausrichten.",
    },
    virtual: {
      heading: "Virtuell & inklusive Materialien",
      text:
        "Jedes Firmenprogramm läuft virtuell, solange Sie nicht gezielt eine Sprachreise buchen. Wir stellen sichere Klassenräume, LMS-Zugänge, Aufzeichnungen und Materialien ohne Zusatzkosten bereit.",
      bullets: [
        "Live-Coaching plus asynchrone Labs, Glossare und Übungen inklusive",
        "Sichere, NDA-taugliche Plattformen mit Compliance- und Audit-Nachweisen",
        "Präsenzformate bieten wir ausschließlich im Rahmen der Linguistic Learning Trips an",
      ],
    },
    services: {
      cards: [
        {
          key: "learning",
          title: "Sprachtraining",
          description:
            "Virtuelle Einzel- und Gruppenkurse – abgestimmt auf KPIs, Fachterminologie und Unternehmenskultur.",
        },
        {
          key: "translation",
          title: "Übersetzung & Lokalisierung",
          description:
            "Beglaubigte Website-Übersetzungen, Lokalisierung für Lernplattformen sowie einsatzbereite Inhalte für Richtlinien und Betrieb.",
        },
        {
          key: "interpretation",
          title: "Simultan-Dolmetschen",
          description:
            "Remote Simultan- und Konsekutivdolmetschen für Briefings, Ausschreibungen und Verhandlungen.",
        },
        {
          key: "documents",
          title: "Beglaubigte Dokumente",
          description:
            "Rechts-, Einwanderungs-, Luftfahrt-, Banken- und HR-Dokumente mit beeidigten Übersetzer*innen.",
        },
      ] satisfies ServiceCard[],
    },
    teacher: {
      heading: "Sprachtraining",
      intro:
        "Sprachtraining bei JB Linguistics ist praxisnah, immersiv und individuell – jede Sitzung unterstützt Ihren Arbeitsalltag.",
      bullets: [
        "Virtuelles Coaching für Führungskräfte, Crews, NGOs und Behörden",
        "Curricula entlang von KPIs, Compliance-Regeln und Unternehmenskultur",
        "Materialien, Aufzeichnungen und Aufgaben ohne Zusatzkosten",
        "Optionale Sprachreisen für intensive Präsenzphasen",
      ],
      ctas: {
        viewAll: "Alle Lehrkräfte anzeigen",
        meetJB: "Jonathan Brooks kennenlernen",
        request: "Beratung anfragen",
        assessment: "Sprachtest starten",
        book: "JB buchen",
      },
      banner: {
        title: "Schnelles Coaching für globale Teams",
        text:
          "Die Sessions basieren auf Ihren Calls, Präsentationen und Ausschreibungen – so liefert jede Stunde messbare Ergebnisse.",
      },
      gridTitle: "Ausgewählte Lehrkräfte",
      cardRole: "Trainer*in",
      cardLink: "Zu dieser Lehrkraft anfragen",
    },
    translator: {
      heading: "Übersetzung & Dolmetschen",
      intro:
        "Von beglaubigten Dokumenten bis zu UN-tauglichem Dolmetschen – JB Linguistics liefert sichere, virtuelle Sprachunterstützung für anspruchsvolle Projekte.",
      servicesTitle: "Kernleistungen",
      services: [
        "Beglaubigte Dokumentübersetzungen für Recht, Migration, Luftfahrt, HR und Beschaffung",
        "Beglaubigte Website-Übersetzung & Lokalisierung mit Barrierefreiheit, Datenschutz und SEO",
        "Lokalisierung für Lernplattformen, Schulungsmodule und Policy-Briefings",
        "Remote Simultan- und Konsekutivdolmetschen für Briefings und Verhandlungen",
        "Terminologiemanagement für UN, Airlines und Banken",
      ],
      ctaJB: "Mit Jonathan Brooks arbeiten",
      badgeTitle: "Virtuell & compliance-sicher",
      badgeText:
        "Jeder Auftrag wird mit Vertraulichkeitsmaßnahmen, Terminologie-Vorbereitung und sicherheitsgeprüftem Team geplant.",
      gridTitle: "Ausgewählte Übersetzer*innen & Dolmetscher*innen",
      cardRoleSuffix: "Übersetzer*in",
      cardLink: "Verfügbarkeit prüfen",
      gridCta: "Dolmetscher*in anfragen",
    },
    enterprise: {
      heading: "UN-, Airline- & Enterprise-Partner",
      intro:
        "JB Linguistics unterstützt UN-Missionen, Airline-Betrieb und regulierte Branchen mit schnellen, präzisen Sprachlösungen.",
      cards: [
        {
          title: "UN & multilaterale Einsätze",
          text: "Briefings, Lageberichte, Beschaffungsunterlagen und Trainingsmodule für globale Teams.",
          bullets: [
            "Schnelle Übersetzung von SitReps, MoUs und Einsatzdokumenten",
            "Virtuelle Moderation zwischen New York, Genf, Nairobi u. a.",
            "Vertraut mit UN-Beschaffung, Sicherheits- und Offenlegungssprache",
          ],
        },
        {
          title: "Airlines & Luftfahrt (Lufthansa-ready)",
          text:
            "Übersetzung und Dolmetschen für Airline-Betrieb, Crew-Kommunikation und Safety-Dokumentation.",
          bullets: [
            "OPS-Briefings, IROP-Kommunikation und Sicherheitsmitteilungen",
            "Aviation-SEO, Website- und Customer-Experience-Lokalisierung",
            "Erfahrung mit Lufthansa-Prozessen und Star-Alliance-Partnern",
          ],
        },
        {
          title: "Finanz- & Bankpartner",
          text: "Sprachprozesse für Banken, Airlines und Treasury-Teams.",
          bullets: [
            "Beglaubigte Übersetzungen für Verträge, Reports und Shareholder-Updates",
            "Terminologiemanagement für KYC, Onboarding und interne Kontrollen",
            "Eingebettete Sprachunterstützung für Vendor-Due-Diligence und Projekte",
          ],
        },
      ] satisfies EnterpriseCard[],
    },
    gov: {
      heading: "Regierungs- & sicherheitsbewusste Arbeit",
      text: [
        "Jonathan Brooks arbeitet seit über zehn Jahren mit deutschen Behörden zusammen und kennt die Sicherheitsprozesse, die für sensible Einsätze erforderlich sind.",
        "Dadurch kann JB Linguistics Ministerien, Diplomatie und staatliche Auftragnehmer mit Diskretion, Präzision und schnellen Durchlaufzeiten unterstützen.",
      ],
      highlightsTitle: "Profil-Highlights",
      highlights: [
        "B.A. Politikwissenschaft & Religionsstudien; M.A. Internationale Beziehungen (Geiselnahme-Verhandlungen)",
        "168h-TEFL plus weiterführende ESL- & TOEFL-Zertifizierungen",
        "Sprachen: Englisch & Französisch (native); Deutsch (B2+); Niederländisch, Schwedisch, Dänisch, Russisch (B1)",
        "Aufbau und Leitung eines globalen Teams von 150+ Übersetzer*innen für Behörden",
        "Bilinguale Trainings für Diplomatie, Luftfahrtführung und NGOs",
        "FAA- & EASA-Privatpilotenlizenz (IFR) mit Airbus/Boeing-Erfahrung",
        "Erfahrung mit sprachlichen Workflows unter deutschen Sicherheitsauflagen",
      ],
      ctaBio: "Jonathan Brooks’ vollständiges Profil",
    },
    trips: {
      heading: "Sprachreisen & Intensivprogramme",
      intro:
        "Wer Reisen und Sprachen verbinden möchte, erhält maßgeschneiderte Programme mit täglichen Coachings und erlebnisreichen Aktivitäten.",
      bullets: [
        "Individuelle Routen in deutschsprachigen Ländern und weltweit",
        "Sprachcoaching integriert in Ausflüge, Mahlzeiten und Meetings",
        "Formate für Executives, Studierende, NGOs und internationale Teams",
        "Optionen für Behörden, Airlines und Unternehmensdelegationen",
      ],
      note: "Reisen sind projektbasiert – komplett auf Ziele, Compliance und Budget zugeschnitten.",
      featuredTitle: "Ausgewählte 2026-Itineraries",
      customNote:
        "Sie brauchen etwas anderes? Wir entwickeln zusätzliche Wunschreisen passend zu Ihren Terminen und Anforderungen.",
      additionalDates:
        "Zusätzlich stehen {count} weitere Abfahrten für maßgeschneiderte Gruppen bereit.",
      bildungsurlaub: "Deutsche Teilnehmende können Bildungsurlaub über JB Linguistics nutzen – Details nach Ihrer Anfrage.",
      browseLink: "Zur Seite Linguistic Learning Trips",
      bildungsurlaubGuide: "Infos zum Bildungsurlaub",
      bildungsurlaubApplication: "Antragsformular herunterladen",
      bildungsurlaubSteps: [
        "Bundeslandspezifische Vorgaben prüfen und einen 2026-Termin auswählen.",
        "Offizielles Formular herunterladen, mit den Angaben von JB Linguistics LLC und dem vorläufigen Ablauf ergänzen.",
        "Beim Arbeitgeber bzw. der Behörde einreichen und die Genehmigung an JB weiterleiten, damit Verträge und Abrechnung fixiert werden können.",
      ],
    },
    tripsPage: {
      title: "Sprachreisen & Intensivprogramme",
      description:
        "Für Teams, die Reisen und Coaching verbinden möchten. Wählen Sie ein Ziel, sehen Sie Beispielrouten (7, 10, 14 oder 21 Tage) und fragen Sie individuelle Termine für 2026 an.",
      capacity:
        "Kapazität: maximal 10 Teilnehmende pro Abfahrt. Sobald ein Termin voll ist, bieten wir Alternativen an.",
      includesTitle: "Was jede 2026-Reise beinhaltet",
      includes: [
        "Hin- und Rückflüge, 4★ Hotels, Frühstück und sämtliche Transfers vor Ort.",
        "Zertifizierte Lehrkraft begleitet die Gruppe 8–10 Stunden täglich plus 2–3h Workshops im Programm.",
        "Ausgewählte Ausflüge und Eintritte abgestimmt auf die Lernziele jeder Destination.",
        "Tägliche Sprachlabs (2–3 h) mit Aussprache-, Grammatik- und branchenspezifischen Übungen.",
      ],
      extrasTitle: "Prüfungen, Compliance & Extras",
      extras: [
        "Online-Einstufung vorab sowie ein behördlich anerkanntes Abschlusszertifikat.",
        "Bildungsurlaub (DE) möglich – Unterlagen erhalten Sie nach der Anfrage.",
        "Max. 10 Personen; sobald ausgebucht, planen wir Ersatztermine.",
        "Reise- und Haftpflichtversicherung schließen Teilnehmende separat ab; wir nennen geprüfte Anbieter.",
      ],
      searchLabel: "Suche:",
      searchPlaceholder: "Ziel oder Region suchen…",
      filterLabel: "Nach Dauer filtern:",
      filterAllLabel: "Alle",
      packageLengthLabel: "Programmlänge:",
      daySuffix: "Tage",
      cardButton: "Reiseplan ansehen",
      cardNote: "Max. 10 Teilnehmende; neue Termine folgen bei Ausbuchung.",
      ctaButton: "Itinerary & Preisunterlagen anfordern",
      bildungsurlaubSectionTitle: "Bildungsurlaub-Toolkit",
      sampleHeading: "Beispielplan für {days} Tage",
      sampleSubheading:
        "Tägliche Englisch-Sessions (2–3 h) plus Nachmittags­erlebnisse. Flüge, Unterkunft, Frühstück, lokale Transfers und ausgewählte Ausflüge sind enthalten.",
      lessonLabel: "Lektion",
      activityLabel: "Aktivität",
      note:
        "Hinweis: Programme werden auf Gruppengröße (max. 10), Niveau und Wunschtermine abgestimmt. Sobald eine Gruppe voll ist, bestätigen wir Alternativen und leiten alle Reisenden durch die verpflichtenden Versicherungen.",
      agreementClauses: [
        {
          title: "Parteien & Umfang",
          text:
            "JB Linguistics LLC (Sprachdienstleister) liefert das individuelle Itinerary, Curriculum und die Facilitation für die im Statement of Work benannte Organisation.",
        },
        {
          title: "Leistungen",
          text:
            "Tägliches Coaching (2–3 Std.), Reisebegleitung, Einstufungs- und Abschlusstests sowie Reporting sind inkludiert. Lernmaterial bleibt virtuell und kostenfrei.",
        },
        {
          title: "Reise & Unterbringung",
          text:
            "JB Linguistics organisiert Flüge, 4★ Hotels, Frühstück und Transfers für max. 10 Teilnehmende; Upgrades werden nur nach Freigabe berechnet.",
        },
        {
          title: "Preise & Zahlung",
          text:
            "Die Preise werden kohortenspezifisch in einer Anlage festgehalten. 40 % bei Unterzeichnung, 60 % bis 14 Tage vor Abreise, sofern nichts anderes vereinbart wird.",
        },
        {
          title: "Änderungen & Storno",
          text:
            "Terminänderungen ≥45 Tage vorher: keine Gebühr; 15–44 Tage: 25 %; <15 Tage: bereits gebuchte Lieferantenkosten. Höhere-Gewalt-Klauseln schützen beide Seiten.",
        },
        {
          title: "Versicherung & Compliance",
          text:
            "Teilnehmende schließen Reise- und Haftpflichtversicherung bei freigegebenen Anbietern ab. JB liefert Bildungsurlaub-Unterlagen und länderspezifische Compliance-Dokumente.",
        },
        {
          title: "Vertraulichkeit & Sicherheit",
          text:
            "Alle Facilitators arbeiten unter NDA und nach deutschen Sicherheitsstandards; sensible Briefings können virtuell vor oder nach den Reisetagen stattfinden.",
        },
        {
          title: "Signaturen",
          text:
            "Jedes Agreement enthält Unterschriftsfelder für JB Linguistics LLC und die Kundenorganisation sowie optional HR-/Betriebsrats-Bestätigungen.",
        },
      ],
      agreementTitle: "Mustervertrag Sprachreise",
      agreementIntro:
        "Kosten sind stets maßgeschneidert, dennoch unterschreibt jede Kohorte einen transparenten Vertrag. Nutzen Sie die Übersicht, um Legal, HR oder Einkauf vorab zu briefen, bevor wir den finalen Entwurf erstellen.",
      agreementCta: "Vertragsentwurf anfordern",
      detailIntro:
        "Beispielprogramm über {days} Tage mit täglichem Englischcoaching (2–3 h) plus kuratierten Kulturaktivitäten. Individuelle Termine sind möglich.",
      detailCta: "Anfrage zu {days}-tägigem {destination}",
      aboutTripTitle: "Über diese Reise",
      aboutTripFallback:
        "Erleben Sie eine Sprach- und Kulturimmersion, die Englischtraining mit sorgfältig gestalteten Reisen verbindet.",
      bildungsurlaubBadgeTitle: "Bildungsurlaub-Unterlagen",
      bildungsurlaubBadgeText:
        "Deutsche Staatsbürger erhalten binnen zwei Werktagen das komplette JB Linguistics-Paket (Antrag, Curriculumsplan, Teilnahmebestätigung und geteilte Rechnungen), sobald eine Gruppe bestätigt ist.",
      notFoundTitle: "Ziel nicht gefunden",
      notFoundLink: "Zurück zu allen Destinationen",
    },
    tripBenefits: {
      title: "Länderspezifische Fördermöglichkeiten",
      description:
        "Viele Kund*innen nutzen gesetzliche oder tarifliche Weiterbildungsbudgets, um Sprachreisen zu kofinanzieren. Wir unterstützen die folgenden Programme bereits und liefern zweisprachige Unterlagen.",
      items: [
        {
          label: "Deutschland — Bildungsurlaub",
          description:
            "JB Linguistics ist anerkannter Bildungsurlaubsträger (letzte Listungen für einzelne Bundesländer stehen für 2026 aus). Wir liefern Antrag, Curriculum, Teilnahmebestätigungen und gesplittete Rechnungen.",
        },
        {
          label: "Frankreich — CPF / OPCO",
          description:
            "Wir erstellen FR/EN-Kursbeschreibungen und Anwesenheitslisten, damit Compte Personnel de Formation bzw. Ihr OPCO Mittel freigeben kann.",
        },
        {
          label: "Niederlande — CAO-Lernbudget",
          description:
            "Arbeitgeber greifen auf CAO-leeruren, Mobilitätsbudgets oder die Werkkostenregeling zurück. Wir stellen Rechnungen pro Teilnehmer*in sowie Anwesenheitsübersichten aus.",
        },
        {
          label: "Spanien — FUNDAE",
          description:
            "Spanische Organisationen nutzen Fundación Estatal (FUNDAE) Trainingsguthaben. Wir liefern stundengenaue Reports auf Spanisch und Englisch.",
        },
        {
          label: "Schweden — Omställningsstudiestöd",
          description:
            "Schwedische Teilnehmende beantragen CSN-/Gewerkschaftsunterstützung; wir liefern Studienbeschreibungen und Bescheinigungen auf Schwedisch.",
        },
        {
          label: "International — Individuelle Lösungen",
          description:
            "Benötigen Sie Nachweise für SkillsFuture, Steueranreize oder CSR-Budgets? Teilen Sie uns die Kriterien mit und wir erzeugen Curriculum, Budgetaufschlüsselung und Anwesenheitsnachweise.",
        },
      ],
    },
    contact: {
      heading: "Anfrageformular",
      subtitle: "Beschreiben Sie Ihr Vorhaben – wir senden ein individuelles Angebot.",
      phoneLine: "Sie erreichen uns auch telefonisch unter (602) 628-4600. Hinterlassen Sie gern Ihre Nummer, dann rufen wir zeitnah zurück.",
      name: "Name",
      email: "E-Mail",
      organization: "Organisation (optional)",
      servicesLabel: "Wofür interessieren Sie sich?",
      servicesOptions: [
        "Sprachtraining / Unterricht",
        "Beglaubigte Dokumentübersetzung",
        "Beglaubigte Website-Übersetzung",
        "Virtuelles Dolmetschen",
        "Sprachreise / Intensivprogramm",
        "Sonstiges / noch unklar",
      ],
      servicesPlaceholder: "Bitte wählen…",
      languagesNeeded: "Benötigte Sprachen",
      languagesPlaceholder: "z. B. Deutsch ↔ Englisch, Französisch, Schwedisch…",
      details: "Projektbeschreibung / Ziele",
      detailsPlaceholder:
        "Worum geht es? Bitte Kontext nennen (Branche, Zielgruppe, Umfang, Termine)…",
      budget: "Budget (optional)",
      timeline: "Zeitrahmen oder gewünschter Start",
      submit: "Anfrage senden",
      disclaimer:
        "Mit dem Absenden erlauben Sie JB Linguistics LLC, Sie zu dieser Anfrage zu kontaktieren. Keine Weitergabe ohne Zustimmung.",
      techNote:
        "Technischer Hinweis: Verbinden Sie das Formular mit Ihrem E-Mail-Postfach, CRM oder Automations-Tool (API-Route, Formspree, Make/Zapier).",
    },
    sectionsShort: {
      mission:
        "Unsere Mission: virtuelle Sprach- und Übersetzungsservices, die Ihr Tempo mitgehen.",
      teacher:
        "Praktisches, maßgeschneidertes Training in Niederländisch, Englisch, Französisch, Deutsch, Dänisch, Russisch und Schwedisch.",
      translator:
        "Beglaubigte Dokument- & Website-Übersetzungen plus sicheres Dolmetschen für UN, Airlines und Banken.",
      trips:
        "Immersive Sprachreisen mit Coaching in jeder Aktivität.",
      contact: "Teilen Sie Ihr Projekt – wir bereiten ein Angebot vor.",
    },
    globalCta: {
      text: "Bereit für den nächsten Schritt? Beschreiben Sie Ihr Projekt und erhalten Sie ein individuelles Angebot.",
      primary: "Angebot anfragen",
      secondary: "Beratung anfragen",
    },
    careers: {
      heading: "Karriere & Kooperation",
      text:
        "Beeidigte Übersetzer*innen, Dolmetscher*innen und Trainer*innen arbeiten mit JB Linguistics als remote-first Contractors. Stellen Sie Ihr Profil vor, damit wir Sie für virtuelle Klassen, UN-nahe Projekte oder Airline- und Behördenaufträge einplanen können.",
      bullets: [
        "Priorität für vereidigte Übersetzer*innen EN ↔ DE/NL/FR/ES/ZH/SV.",
        "Trainer*innen mit Luftfahrt-, Unternehmens- oder Regierungserfahrung werden beschleunigt aufgenommen.",
        "Komplett virtuelle Lieferung mit transparenten Honoraren und schneller Abrechnung.",
      ],
      perks: [
        "Flexible Einsatzplanung passend zu Kundenfenstern.",
        "Komplett remote Workflows mit sicheren virtuellen Klassenzimmern.",
        "Kostenlose Sprachlernleistungen für Mitarbeitende und Contractors.",
        "Vergünstigte Übersetzungsservices für Mitarbeitende und deren Familien.",
        "Kostenloses Onboarding inklusive KI-Schulungen nach Vertragsstart.",
      ],
      ctaPrimary: "Zur Karriereseite",
      ctaSecondary: "Kolleg*in empfehlen",
      cardTitle: "Remote-first, mehrsprachig, compliant",
      cardText:
        "Laden Sie Ihren Lebenslauf einmal hoch. Wir präsentieren Talente für virtuelle Akademien, zertifizierte Übersetzungsteams und On-Demand-Dolmetschen für Airlines, Banken, NGOs und Behörden.",
      note: "Prioritätssprachen: Englisch ↔ Deutsch, Niederländisch, Französisch, Spanisch, Mandarin, Schwedisch.",
    },
    careersPage: {
      title: "Mit JB Linguistics zusammenarbeiten",
      intro:
        "Wir erweitern unser Netzwerk an Übersetzer*innen und Dozent*innen laufend. Füllen Sie das Formular aus, laden Sie Ihren Lebenslauf hoch und wir melden uns, sobald Ihr Profil zu einem Projekt passt.",
      rolesTitle: "Fokusbereiche",
      roleOptions: {
        translator: "Übersetzung / Lokalisierung",
        educator: "Trainer*in / Coach",
        both: "Hybrid (Unterricht + Übersetzung)",
      },
      supportNote: "Sie benötigen sofort Unterstützung? Schreiben Sie an talent@jblinguistics.com mit dem Betreff „JB Careers“.",
      backLink: "Zurück zur Startseite",
      form: {
        heading: "Bewerbungsformular",
        name: "Name",
        email: "E-Mail",
        location: "Standort / Zeitzone",
        languages: "Arbeitssprachen",
        experience: "Erfahrung & Branchen",
        availability: "Verfügbarkeit",
        message: "Hinweise",
        resume: "Lebenslauf hochladen",
        resumeHint: "PDF oder DOC bis 5 MB.",
        submit: "Bewerbung senden",
        success: "Vielen Dank! Wir melden uns bei passender Gelegenheit.",
        error: "Senden derzeit nicht möglich. Bitte später erneut versuchen.",
      },
      assessments: {
        teacher: {
          heading: "Lehrer*innen-Assessment (Pflicht)",
          intro:
            "Wählen Sie die Sprache, die Sie unterrichten möchten. Beantworten Sie alle 50 Grammatikfragen (B2–C2) und verfassen Sie zwei Antworten zu Ihrem Classroom-Management.",
          languageLabel: "Sprache des Assessments",
          languagePlaceholder: "Unterrichtssprache wählen",
          answeredLabel: "Beantwortet",
          shortResponseHeading: "Freitextantworten",
          conflictPrompt:
            "Wie reagieren Sie, wenn ein*e Teilnehmer*in wiederholt Konflikte auslöst, und welche langfristigen Maßnahmen setzen Sie um?",
          attendancePrompt:
            "Wenn Teilnehmende häufig absagen oder fehlen, wie drehen Sie die Situation und passen Ihre Methode an, um Engagement zu erhöhen?",
          requirementNote: "Alle 50 Fragen und beide Freitextantworten sind für Lehrrollen verpflichtend.",
        },
        translator: {
          heading: "Übersetzungsübung (Pflicht)",
          intro:
            "Lesen Sie den englischen Text über KI am Arbeitsplatz, wählen Sie die Zielsprache und liefern Sie Ihre Übersetzung.",
          storyHeading: "Ausgangstext",
          story: [
            "Künstliche Intelligenz stiftet den größten Nutzen, wenn sie Mitarbeitende von repetitiven Aufgaben entlastet. Eine durchdachte Einführung beginnt mit der Zusage, dass AI Fachkräfte unterstützt statt sie zu ersetzen. Unternehmen, die kontrollierte Pilotprojekte durchführen und klare Sicherheitsgrenzen setzen, lassen Automatisierung Routinearbeiten wie Transkription, Glossarerstellung oder Dateikonvertierung übernehmen – so bleibt mehr Raum für Analyse und Beratung.",
            "Erfolgreiche Einführung erfordert Transparenz beim Umgang mit Daten. Firmen erläutern, welche Abläufe auf eigenen Servern verbleiben, welche Tools Texte anonymisieren und wie jede Interaktion protokolliert wird. Wer Teams in Stärken und Grenzen großer Sprachmodelle schult, verkürzt Durchlaufzeiten und bewahrt Vertrauen.",
            "Die Umsetzung geht weit über Übersetzungsspeicher hinaus. Leistungsstarke Teams pflegen neuronale Glossare für kontextuelle Hinweise während Live-Dolmetschen, kombinieren Zusammenfassungs-Engines mit menschlichen Prüfern und trainieren Klassifikatoren, die kulturelle oder regulatorische Risiken melden, bevor ein Dokument einen Entscheidungsträger erreicht. Jedes Workflow wird mit menschlichen Kontrollpunkten und nachvollziehbarer Metadata abgesichert.",
            "Die manuelle Prüfung bleibt Kernstück verantwortungsvoller AI-Programme. Automatisierung erstellt den Erstentwurf, danach kommentieren Fachleute, ergänzen kulturelle Nuancen und erläutern ihr Vorgehen. Der Dialog dient als Trainingsmaterial, ohne die gesicherte Umgebung zu verlassen – so lernt das Unternehmen, ohne sensible Informationen preiszugeben.",
            "Kurz gesagt: AI ist ein disziplinierter Assistent. Organisationen, die in Sicherheit, Transparenz und Change-Management investieren, nutzen Automatisierung, ohne Vertraulichkeit oder Empathie zu verlieren. Die Übersetzung des obigen Textes sollte dieses Gleichgewicht widerspiegeln: Innovationsfreude kombiniert mit einer verantwortungsvollen, menschenzentrierten Umsetzung.",
          ],
          languageLabel: "Zielsprache",
          languagePlaceholder: "Zielsprache auswählen",
          submissionLabel: "Ihre Übersetzung",
          notes: "Bitte reichen Sie den Text in der gewählten Sprache ein. Wir bewerten automatisch und markieren Risiken im Portal.",
        },
        validation: {
          teacherLanguage: "Bitte wählen Sie zuerst die Assessment-Sprache.",
          teacherIncomplete: "Alle 50 Fragen und beide Antworten müssen ausgefüllt werden.",
          translatorLanguage: "Wählen Sie eine Zielsprache für die Übersetzung.",
          translatorText: "Fügen Sie Ihre Übersetzung ein, bevor Sie senden.",
        },
      },
    },
    footer: {
      tagline: "Remote-first und weltweit für projektbasierte Zusammenarbeit verfügbar.",
      teachers: "Lehrkräfte",
      bio: "JBs Profil",
    },
    destinations: destinationCopy.de,
  },
} as const;

export type CopyContent = (typeof copy)[Lang];
