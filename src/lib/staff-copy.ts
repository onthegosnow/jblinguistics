import type { Lang } from "./i18n";

export type StaffProfileContent = {
  name: string;
  title: string;
  languages: string;
  overview: string[];
  highlightsTitle: string;
  highlights: string[];
  servicesTitle: string;
  services: string[];
  cta: string;
};

const jonathan: Record<Lang, StaffProfileContent> = {
  en: {
    name: "Jonathan Brooks",
    title: "CEO & Founder, JB Linguistics LLC · TEFL-certified linguist · International operations & diplomacy contexts",
    languages:
      "English (native) · German (B2+) · French (B2+) · Russian (B1) · Dutch (B1) · Swedish (B1) · Danish (B1)",
    overview: [
      "Jonathan Brooks is a TEFL-certified linguist and in-flight operations leader with more than 13 years of experience inside commercial aviation and international program management. He has built and managed teams of 150+ specialists for German government contracts, Lufthansa-aligned departments, and enterprise clients that require fast, context-aware language enablement.",
      "He partners with German governmental entities and applies the same rigor to every virtual curriculum, certified translation, and interpretation engagement. Programs emphasize rapid pacing, zero-cost learning materials, and bilingual documentation that keeps stakeholders audit-ready.",
    ],
    highlightsTitle: "Profile highlights",
    highlights: [
      "168-hour TEFL certification",
      "Fluent English; B2+ German & French",
      "B1 proficiency in Russian, Dutch, Swedish, and Danish",
      "86-country travel experience with international volunteer groups",
      "13+ years leading in-flight operations and program management",
      "CEO & Founder of JB Linguistics LLC directing 150+ linguists",
      "Private pilot licenses (EASA & FAA) with Airbus/Boeing exposure",
      "Built multilingual teams for German governmental and Lufthansa-aligned programs",
    ],
    servicesTitle: "Teaching & services",
    services: [
      "1:1 and small-group training in 20+ languages",
      "Corporate programs for internal teams & leadership",
      "Written translation & localization",
      "Virtual & on-site simultaneous/consecutive interpretation",
    ],
    cta: "Book a session",
  },
  nl: {
    name: "Jonathan Brooks",
    title: "CEO & Founder JB Linguistics LLC · TEFL-gecertificeerde taalkundige · Internationale operatie- en diplomatiecontexten",
    languages:
      "Engels (moedertaal) · Duits (B2+) · Frans (B2+) · Russisch (B1) · Nederlands (B1) · Zweeds (B1) · Deens (B1)",
    overview: [
      "Jonathan Brooks is een TEFL-gecertificeerde taalkundige en in-flight operations leader met meer dan 13 jaar ervaring in de commerciële luchtvaart en internationaal programmamanagement. Hij bouwde teams van meer dan 150 specialisten voor Duitse overheidscontracten, Lufthansa-partners en ondernemingen die snel taalresultaat vragen.",
      "Hij werkt nauw samen met Duitse overheidsinstellingen en past dezelfde nauwkeurigheid toe op virtuele curricula, beëdigde vertalingen en tolkopdrachten. Programma’s draaien om hoge snelheid, lesmaterialen zonder meerkosten en tweetalige documentatie die audit-proof is.",
    ],
    highlightsTitle: "Profielhoogtepunten",
    highlights: [
      "168-uur TEFL-certificering",
      "Vloeiend Engels; B2+ Duits & Frans",
      "B1 in Russisch, Nederlands, Zweeds en Deens",
      "Reiservaring in 86 landen met internationale vrijwilligers",
      "13+ jaar leiding over cabin operations en programma’s",
      "CEO & oprichter van JB Linguistics met 150+ linguïsten",
      "Privépilootlicenties (EASA & FAA) met Airbus/Boeing-ervaring",
      "Leidde meertalige teams voor Duitse overheid en Lufthansa",
    ],
    servicesTitle: "Training & diensten",
    services: [
      "1-op-1 en groepstraining in 20+ talen",
      "Bedrijfsprogramma’s voor teams en leiders",
      "Schriftelijke vertaling & lokalisatie",
      "Virtuele en on-site simultaan- en consecutieftolken",
    ],
    cta: "Plan een sessie",
  },
  fr: {
    name: "Jonathan Brooks",
    title: "CEO & Fondateur de JB Linguistics LLC · Linguiste certifié TEFL · Opérations internationales & diplomatie",
    languages:
      "Anglais (natif) · Allemand (B2+) · Français (B2+) · Russe (B1) · Néerlandais (B1) · Suédois (B1) · Danois (B1)",
    overview: [
      "Jonathan Brooks est un linguiste certifié TEFL et un responsable des opérations en vol avec plus de treize ans d’expérience dans l’aviation commerciale et la gestion de programmes internationaux. Il a dirigé des équipes de plus de 150 spécialistes pour des contrats gouvernementaux allemands, des entités alignées sur Lufthansa et des entreprises internationales.",
      "Il collabore étroitement avec les institutions allemandes et applique la même rigueur à chaque programme virtuel, traduction certifiée et mission d’interprétation. Ses formations sont rapides, utilisent des supports fournis sans frais et livrent une documentation bilingue conforme aux audits.",
    ],
    highlightsTitle: "Points forts",
    highlights: [
      "Certificat TEFL 168 h",
      "Anglais natif ; allemand et français B2+",
      "Niveau B1 en russe, néerlandais, suédois et danois",
      "Expérience de voyage dans 86 pays",
      "13+ ans à diriger des opérations en vol",
      "CEO & fondateur de JB Linguistics (150+ linguistes)",
      "Licences de pilote privé (EASA & FAA) sur Airbus/Boeing",
      "Équipes multilingues pour le gouvernement allemand et Lufthansa",
    ],
    servicesTitle: "Enseignement & services",
    services: [
      "Coaching individuel et en groupe dans 20+ langues",
      "Programmes corporate pour équipes et dirigeants",
      "Traduction écrite & localisation",
      "Interprétation simultanée/consecutive à distance ou sur site",
    ],
    cta: "Réserver une session",
  },
  sv: {
    name: "Jonathan Brooks",
    title: "VD & grundare, JB Linguistics LLC · TEFL-certifierad lingvist · Internationella operationer och diplomati",
    languages:
      "Engelska (modersmål) · Tyska (B2+) · Franska (B2+) · Ryska (B1) · Nederländska (B1) · Svenska (B1) · Danska (B1)",
    overview: [
      "Jonathan Brooks är TEFL-certifierad lingvist och ledare inom kabinoperationer med över 13 års erfarenhet av kommersiell luftfart och internationell programledning. Han har byggt team om 150+ specialister för tyska myndigheter, Lufthansa och globala företag som kräver snabba språkresultat.",
      "Han samarbetar regelbundet med tyska myndigheter och levererar virtuella program, certifierade översättningar och tolkning med hög säkerhet. Fokus ligger på snabb progression, kostnadsfria kursmaterial och tvåspråkig dokumentation som klarar varje revision.",
    ],
    highlightsTitle: "Profilhöjdpunkter",
    highlights: [
      "168 timmars TEFL-certifiering",
      "Flytande engelska; tyska och franska B2+",
      "B1-nivå i ryska, nederländska, svenska och danska",
      "Resor till 86 länder med internationella volontärer",
      "13+ år som ledare inom kabin- och programdrift",
      "VD & grundare av JB Linguistics (150+ lingvister)",
      "Privatpilotlicenser (EASA & FAA) med Airbus/Boeing",
      "Byggde flerspråkiga team för tyska staten och Lufthansa",
    ],
    servicesTitle: "Undervisning & tjänster",
    services: [
      "1:1 och smågruppslektioner i 20+ språk",
      "Företagsprogram för interna team och ledare",
      "Skriftlig översättning & lokalisering",
      "Virtuell och on-site simultan/konsekutiv tolkning",
    ],
    cta: "Boka en session",
  },
  es: {
    name: "Jonathan Brooks",
    title: "CEO y fundador de JB Linguistics LLC · Lingüista certificado TEFL · Operaciones internacionales y diplomacia",
    languages:
      "Inglés (nativo) · Alemán (B2+) · Francés (B2+) · Ruso (B1) · Neerlandés (B1) · Sueco (B1) · Danés (B1)",
    overview: [
      "Jonathan Brooks es un lingüista certificado TEFL y líder de operaciones a bordo con más de 13 años de experiencia en aviación comercial y gestión de programas internacionales. Ha liderado equipos de más de 150 especialistas para contratos del gobierno alemán, áreas vinculadas a Lufthansa y empresas que requieren agilidad lingüística.",
      "Colabora con organismos alemanes y aplica la misma rigurosidad a cada currículo virtual, traducción certificada e interpretación. Sus programas priorizan el avance rápido, materiales sin coste y documentación bilingüe lista para auditorías.",
    ],
    highlightsTitle: "Puntos destacados",
    highlights: [
      "Certificación TEFL de 168 horas",
      "Inglés nativo; alemán y francés nivel B2+",
      "Nivel B1 en ruso, neerlandés, sueco y danés",
      "Experiencia en 86 países con grupos internacionales",
      "Más de 13 años dirigiendo operaciones en vuelo",
      "CEO y fundador de JB Linguistics (150+ lingüistas)",
      "Licencias de piloto privado (EASA & FAA) con Airbus/Boeing",
      "Equipos multilingües para el gobierno alemán y Lufthansa",
    ],
    servicesTitle: "Formación y servicios",
    services: [
      "Entrenamiento individual y grupal en 20+ idiomas",
      "Programas corporativos para equipos y liderazgo",
      "Traducción escrita y localización",
      "Interpretación simultánea/consecutiva virtual y presencial",
    ],
    cta: "Reservar sesión",
  },
  zh: {
    name: "Jonathan Brooks",
    title: "JB Linguistics LLC 首席执行官兼创始人 · TEFL 认证语言专家 · 国际运营与外交场景",
    languages: "英语（母语）· 德语（B2+）· 法语（B2+）· 俄语（B1）· 荷兰语（B1）· 瑞典语（B1）· 丹麦语（B1）",
    overview: [
      "Jonathan Brooks 拥有 TEFL 认证，曾长期负责商业航空及国际项目管理，在 13 年的在职经验中组建并带领超过 150 名语言专家，为德国政府合同、Lufthansa 体系以及全球企业提供快速、可靠的语言支持。",
      "他常年与德国政府部门合作，将相同的高标准应用到所有线上课程、认证翻译和口译任务中。课程节奏紧凑、教材无需额外费用，并提供方便审计的双语文档。",
    ],
    highlightsTitle: "核心亮点",
    highlights: [
      "168 小时 TEFL 认证",
      "英语母语；德语与法语 B2+",
      "俄语、荷兰语、瑞典语、丹麦语 B1",
      "走访 86 个国家，组织国际志愿者项目",
      "13+ 年机上运营与项目管理经验",
      "JB Linguistics 创始人，领导 150+ 语言专家",
      "拥有 EASA/FAA 私照，熟悉 Airbus/Boeing 机型",
      "为德国政府与 Lufthansa 项目打造多语团队",
    ],
    servicesTitle: "教学与服务",
    services: [
      "20+ 语言的一对一或小组教学",
      "面向企业团队与管理层的定制课程",
      "笔译 / 本地化",
      "线上或现场的同声/交替传译",
    ],
    cta: "预约课程",
  },
  de: {
    name: "Jonathan Brooks",
    title: "CEO & Gründer, JB Linguistics LLC · TEFL-zertifizierter Linguist · Internationale Operationen & Diplomatie",
    languages:
      "Englisch (Muttersprache) · Deutsch (B2+) · Französisch (B2+) · Russisch (B1) · Niederländisch (B1) · Schwedisch (B1) · Dänisch (B1)",
    overview: [
      "Jonathan Brooks ist ein TEFL-zertifizierter Linguist und Inflight-Operationsleiter mit über 13 Jahren Erfahrung in der zivilen Luftfahrt und im internationalen Programmmanagement. Er leitete Teams von mehr als 150 Spezialist*innen für deutsche Regierungsaufträge, Lufthansa-nahe Abteilungen und Unternehmen mit hohem Sprachbedarf.",
      "Er arbeitet eng mit deutschen Behörden zusammen und überträgt dieselbe Präzision auf jedes virtuelle Curriculum, jede zertifizierte Übersetzung und jedes Dolmetschprojekt. Seine Programme setzen auf hohe Lerngeschwindigkeit, kostenlose Materialien und zweisprachige Dokumentation für audit-sichere Prozesse.",
    ],
    highlightsTitle: "Profil-Highlights",
    highlights: [
      "168-Stunden-TEFL-Zertifizierung",
      "Englisch muttersprachlich; Deutsch & Französisch B2+",
      "B1 in Russisch, Niederländisch, Schwedisch und Dänisch",
      "86 Länder Reise- und Volunteer-Erfahrung",
      "Über 13 Jahre Führungserfahrung im Flugbetrieb",
      "CEO & Gründer von JB Linguistics (150+ Linguist*innen)",
      "Privatpilotenlizenzen (EASA & FAA) mit Airbus/Boeing",
      "Aufbau multilingualer Teams für deutsche Behörden & Lufthansa",
    ],
    servicesTitle: "Unterricht & Services",
    services: [
      "Einzel- und Kleingruppentraining in 20+ Sprachen",
      "Corporate-Programme für Teams & Leadership",
      "Schriftliche Übersetzung & Lokalisierung",
      "Virtuelle & Vor-Ort-Simultan-/Konsekutivdolmetschen",
    ],
    cta: "Session buchen",
  },
};

const staffProfiles: Record<Lang, Record<string, StaffProfileContent>> = {
  en: { "jonathan-brooks": jonathan.en },
  nl: { "jonathan-brooks": jonathan.nl },
  fr: { "jonathan-brooks": jonathan.fr },
  sv: { "jonathan-brooks": jonathan.sv },
  es: { "jonathan-brooks": jonathan.es },
  zh: { "jonathan-brooks": jonathan.zh },
  de: { "jonathan-brooks": jonathan.de },
};

export function getStaffProfile(lang: Lang, slug: string): StaffProfileContent {
  const localized = staffProfiles[lang]?.[slug];
  if (localized) return localized;
  const fallback = staffProfiles.en?.[slug];
  if (!fallback) {
    throw new Error(`Missing staff profile copy for ${slug}`);
  }
  return fallback;
}
