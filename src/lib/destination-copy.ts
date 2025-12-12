import type { Lang } from "./i18n";

type ItineraryDay = { title: string; lesson: string; activity: string };

export type DestinationLocaleCopy = {
  name?: string;
  region?: string;
  blurb?: string;
  highlights?: string[];
  customItinerary?: Record<number, ItineraryDay[]>;
};

const german: Record<string, DestinationLocaleCopy> = {
  "custom-tailored": {
    name: "Individuelle English Team Building Events (7–21 Tage)",
    region: "Weltweit",
    blurb:
      "London + Brüssel oder Singapur + Sydney? Wir bauen Wunschdestinationen für Führungskräfte, NGOs und Enterprise-Teams zusammen und richten Curriculum, Compliance und Bildungsurlaub exakt auf Ihre Ziele aus.",
    highlights: [
      "Englischsprachige Reiseziele nach Wahl – auch außerhalb der Standardliste",
      "Curriculum auf Ihre KPIs und regulatorischen Anforderungen abgestimmt",
      "Dedizierte Projektleitung plus zertifizierte ESL-Lehrkraft 8–10 Stunden täglich",
    ],
  },
  "florida-nyc": {
    name: "Florida + New York City (2 Wochen)",
    region: "Nordamerika",
    blurb:
      "Woche 1: Hospitality- und Coastal-Fluency-Labs in Florida. Woche 2: Präsentationen, Museumsdialoge und Firmenbesuche in Manhattan. Max. 10 Teilnehmende.",
    highlights: [
      "Immersion an Floridas Küste & Hospitality English",
      "Museen, Finanzdistrikt-Briefings und Public-Speaking-Labs in NYC",
      "Tägliche 2–3 Stunden Coaching plus kuratierte Ausflüge",
    ],
  },
  "florida-bermuda": {
    name: "Florida + Bahamas (2 Wochen)",
    region: "Karibik",
    blurb:
      "Eine Hälfte der Reise in Floridas Innovationskorridor, die andere auf den Bahamas. Ideal für Tourismus-, Service-Teams und NGOs.",
    highlights: [
      "Service-Englisch & Rollenspiele in Florida",
      "Heritage-Walks, Meereslabore und Diplomatie-Briefings auf den Bahamas",
      "Tägliches Coaching, Riff-Ausflüge und kulturelles Hosting",
    ],
  },
  "florida-grand-cayman": {
    name: "Florida + Grand Cayman (2 Wochen)",
    region: "Karibik",
    blurb:
      "Woche 1 fokussiert Hospitality-Labs in Florida; Woche 2 führt nach Grand Cayman für Reef-Conservation, Finanzhub-Besuche und Coaching am Strand.",
    highlights: [
      "Aviation-English-Intensivtraining in Orlando/Tampa",
      "Riffausflüge, Mangroven-Kajaks und George Town Finance Walk",
      "Täglich 2–3 Stunden Coaching plus Schnorcheln, Sunset-Catamarans & Kulinarik-Labs",
    ],
  },
  "florida-immersion-winter": {
    name: "Florida Immersion – Winterkohorte (2 Wochen)",
    region: "Nordamerika",
    blurb:
      "Januar/Februar 2026 in Tampa & St. Petersburg. Schwerpunkte: Executive Fluency, Aviation und Customer Experience.",
    highlights: [
      "Morgendliche Coaching-Blöcke + nachmittägliche Site Visits",
      "Aviation-Briefing am Flughafen Tampa",
      "Ausflüge wie Salvador-Dalí-Museum und Mangroven-Kajaktour",
    ],
  },
  "florida-immersion-autumn": {
    name: "Florida Immersion – Herbstkohorte (2 Wochen)",
    region: "Nordamerika",
    blurb:
      "September 2026 rund um Miami & Fort Lauderdale. Für Corporate-Teams und NGO-Feldpersonal mit Bedarf an schnellem Fluency-Boost.",
    highlights: [
      "Business-English-Strategielabs jeden Morgen",
      "Dialoge vor Ort in PortMiami & Wynwood Innovation Spaces",
      "Everglades- und Little-Havana-Immersionen",
    ],
  },
  "long-beach-ca": {
    name: "Long Beach, Kalifornien (2 Wochen)",
    region: "Nordamerika",
    blurb:
      "Küstentraining in Long Beach & Orange County plus Tagesausflüge nach Los Angeles (Getty, Griffith, Hollywood). Für Führungsteams, die strukturiertes Coaching mit Praxis verbinden möchten.",
    highlights: [
      "Coaching-Sessions an Bord der Queen Mary & im Aquarium of the Pacific",
      "Conversation-Labs in Shoreline Village und den Naples-Kanälen",
      "Ausflug durch Laguna Beach & LA (Hollywood, Griffith, Getty)",
    ],
  },
  "long-beach-hawaii": {
    name: "Long Beach + Hawaii (3 Wochen)",
    region: "Nordamerika",
    blurb:
      "Woche 1 entlang der Waterfront von Long Beach mit LA-Kultur, Wochen 2–3 in Honolulu für Hospitality & Service English. Max. 10 Teilnehmende.",
    highlights: [
      "Leadership-English-Intensivtraining zwischen Long Beach & Orange County",
      "Honolulu als Basis mit optionalen Insel-Tagestrips",
      "Zertifizierte ESL-Leitung 8–10 Stunden täglich vor Ort",
    ],
  },
  "dublin-heritage": {
    name: "Dublin Heritage Immersion (7 Tage)",
    region: "Europa",
    blurb:
      "Kulturbetonte Route mit Museen, Trinity College und literarischen Spaziergängen. Ideal für Bildungseinrichtungen und öffentliche Institutionen.",
    highlights: [
      "Private Book-of-Kells-Einblicke",
      "Verhandlungen & Vokabelarbeit an der Küste von Howth",
      "Abendliche Theater- und Musikrunden",
    ],
  },
  "dublin-business": {
    name: "Dublin Business & Tech (7 Tage)",
    region: "Europa",
    blurb:
      "Fokussiert auf Kommunikation im Technologiesektor mit Besuchen in den Docklands, Innovationscampus und HQs multinationaler Unternehmen.",
    highlights: [
      "Pitch-Coaching mitten in den Silicon Docks",
      "Briefing bei Enterprise Ireland",
      "Abendliche Networking-Simulationen",
    ],
  },
  "dublin-startup": {
    name: "Dublin Startup Sprint (7 Tage)",
    region: "Europa",
    blurb:
      "Für Gründer*innen und NGO-Projektleitende mit Bedarf an agilen Kommunikationsdrills, Coworking-Tagen und Mentor-Feedback.",
    highlights: [
      "Coworking-Pässe & Mentorensprechstunden",
      "Storytelling-Bootcamp mit irischen Facilitators",
      "Wochenend-Ausflüge nach Galway oder Belfast",
    ],
  },
};

const dutch: Record<string, DestinationLocaleCopy> = {
  "custom-tailored": {
    name: "Maatwerk English Team Building Events (7–21 dagen)",
    region: "Wereldwijd",
    blurb:
      "Nodig u Londen + Brussel of Singapore + Sydney uit? Wij stellen trajecten samen voor executives, NGO’s en enterprise-teams, afgestemd op doelstellingen, compliance en eventuele Bildungsurlaub-eisen.",
    highlights: [
      "Vrije keuze uit Engelstalige bestemmingen, ook buiten de baslijst",
      "Curriculum gekoppeld aan uw KPI’s en regelgeving",
      "Toegewijde projectmanager + gecertificeerde ESL-trainer 8–10 uur per dag",
    ],
  },
  "florida-nyc": {
    name: "Florida + New York City (2 weken)",
    region: "Noord-Amerika",
    blurb:
      "Week 1: hospitality-labs en coastal fluency in Florida. Week 2: Manhattan-presentaties, museumdialogen en bedrijfsbezoeken. Max. 10 deelnemers.",
    highlights: [
      "Immersie aan de Floridiaanse kust & hospitality English",
      "Musea, financieel district en public-speaking labs in NYC",
      "Dagelijks 2–3 uur coaching plus gecureerde excursies",
    ],
  },
  "florida-bermuda": {
    name: "Florida + Bahama's (2 weken)",
    region: "Cariben",
    blurb:
      "Half in Florida’s innovatieregio, half op de Bahama’s. Ideaal voor toerisme-, serviceteams en NGO-delegaties.",
    highlights: [
      "Service-Engels en rollenspellen in Florida",
      "Heritage-walks, marinelabs en diplomatiebriefings op de Bahama’s",
      "Dagelijkse coaching, riffexcursies en cultureel hosten",
    ],
  },
  "florida-grand-cayman": {
    name: "Florida + Grand Cayman (2 weken)",
    region: "Cariben",
    blurb:
      "Week 1 draait om hospitality-labs in Florida; week 2 verplaatst zich naar Grand Cayman voor reef-conservation, financiële hubs en coaching aan zee.",
    highlights: [
      "Aviation-English intensives in Orlando/Tampa",
      "Rifexcursies, mangrovekayaks en George Town finance walk",
      "Dagelijks 2–3 uur coaching plus snorkelen en culinaire labs",
    ],
  },
  "florida-immersion-winter": {
    name: "Florida Immersion – Wintercohort (2 weken)",
    region: "Noord-Amerika",
    blurb:
      "Januari/februari 2026 in Tampa & St. Petersburg met focus op executive fluency, luchtvaart en klantbeleving.",
    highlights: [
      "Ochtendlijke coachingblokken en middagbezoeken op locatie",
      "Aviation-briefing op Tampa International",
      "Uitstappen zoals het Dalí-museum en mangrovekayakken",
    ],
  },
  "florida-immersion-autumn": {
    name: "Florida Immersion – Herfstcohort (2 weken)",
    region: "Noord-Amerika",
    blurb:
      "September 2026 rond Miami & Fort Lauderdale. Voor corporate teams en NGO’s die snelle taalprogressie nodig hebben.",
    highlights: [
      "Business-English strategielabs elke ochtend",
      "On-site dialogen bij PortMiami en Wynwood innovation spaces",
      "Everglades- en Little Havana-immersies",
    ],
  },
  "long-beach-ca": {
    name: "Long Beach, Californië (2 weken)",
    region: "Noord-Amerika",
    blurb:
      "Twee weken kustimmersie in Long Beach en Orange County met dagtrips naar Los Angeles (Getty, Griffith, Hollywood). Voor leiderschapsteams die coaching met praktijk willen combineren.",
    highlights: [
      "Coachingsessies op de Queen Mary en in het Aquarium of the Pacific",
      "Gesprekslabs in Shoreline Village en de kanalen van Naples",
      "Dagtrip via Laguna Beach & LA (Hollywood, Griffith, Getty)",
    ],
  },
  "long-beach-hawaii": {
    name: "Long Beach + Hawaii (3 weken)",
    region: "Noord-Amerika",
    blurb:
      "Week 1 aan de waterfront van Long Beach met LA-cultuur, weken 2–3 in Honolulu voor hospitality & service English. Max. 10 deelnemers.",
    highlights: [
      "Leadership-English intensives tussen Long Beach en Orange County",
      "Honolulu als basis met optionele eilandexcursies",
      "Gecertificeerde ESL-lead 8–10 uur per dag aanwezig",
    ],
  },
  "dublin-heritage": {
    name: "Dublin Heritage Immersion (7 dagen)",
    region: "Europa",
    blurb:
      "Culturele route met museums, Trinity College en literaire wandelingen. Geschikt voor onderwijsinstellingen en publieke organisaties.",
    highlights: [
      "Privé Book of Kells-briefing",
      "Howth-coaching aan zee met uitspraak- en vocabwerk",
      "Avondlijke theater- en muziekrondes",
    ],
  },
  "dublin-business": {
    name: "Dublin Business & Tech (7 dagen)",
    region: "Europa",
    blurb:
      "Focus op techcommunicatie met bezoeken aan Docklands, innovatiescampussen en multinationale HQ’s.",
    highlights: [
      "Pitchcoaching in de Silicon Docks",
      "Briefing bij Enterprise Ireland",
      "Avondelijkse netwerksimulaties",
    ],
  },
  "dublin-startup": {
    name: "Dublin Startup Sprint (7 dagen)",
    region: "Europa",
    blurb:
      "Voor founders en NGO-projectleiders die agile communicatiedrills, coworkingdagen en mentorfeedback zoeken.",
    highlights: [
      "Coworkingpassen & mentor drop-ins",
      "Storytelling bootcamp met Ierse facilitators",
      "Weekendtrips naar Galway of Belfast",
    ],
  },
};

const chinese: Record<string, DestinationLocaleCopy> = {
  "custom-tailored": {
    name: "定制英语团队建设（7–21 天）",
    region: "全球",
    blurb: "无论是伦敦＋布鲁塞尔还是新加坡＋悉尼，我们根据 KPI、合规与 Bildungsurlaub 需求定制行程，服务高管、NGO 与企业团队。",
    highlights: [
      "可选择核心清单之外的英语目的地",
      "课程内容匹配企业目标与监管要求",
      "专属项目经理＋认证教师每日 8–10 小时随行",
    ],
  },
  "florida-nyc": {
    name: "佛罗里达＋纽约（2 周）",
    region: "北美",
    blurb: "首周在佛罗里达进行款待业实验室，次周转战纽约，开展演讲、博物馆对话与企业参访。人数上限 10 名。",
    highlights: [
      "佛罗里达海岸沉浸与服务英语",
      "纽约博物馆及金融区演讲训练",
      "每日 2–3 小时辅导＋精选行程",
    ],
  },
  "florida-bermuda": {
    name: "佛罗里达＋巴哈马（2 周）",
    region: "加勒比",
    blurb: "半程在佛罗里达创新走廊，半程在巴哈马体验海洋文化，适合旅游／服务与 NGO 团队。",
    highlights: [
      "佛罗里达服务英语与角色扮演",
      "巴哈马人文漫步、海洋实验与外交简报",
      "每日辅导、浮潜与文化接待",
    ],
  },
  "florida-grand-cayman": {
    name: "佛罗里达＋大开曼（2 周）",
    region: "加勒比",
    blurb: "第一周在佛罗里达进行酒店实验室，第二周前往大开曼体验珊瑚保育、金融考察与海边课程。",
    highlights: [
      "奥兰多／坦帕航空英语强化",
      "大开曼浮潜、红树林皮划艇与金融街步行",
      "每日 2–3 小时辅导＋日落双体船与美食体验",
    ],
  },
  "florida-immersion-winter": {
    name: "佛罗里达沉浸·冬季班（2 周）",
    region: "北美",
    blurb: "2026 年 1–2 月在坦帕与圣彼得堡开课，聚焦高管流利度、航空与客户体验。",
    highlights: [
      "上午教学＋下午现场参访",
      "坦帕国际机场航空简报",
      "萨尔瓦多·达利博物馆与红树林皮划艇",
    ],
  },
  "florida-immersion-autumn": {
    name: "佛罗里达沉浸·秋季班（2 周）",
    region: "北美",
    blurb: "2026 年 9 月在迈阿密与劳德代尔堡举行，面向企业与 NGO 团队的快速进阶课程。",
    highlights: [
      "每日商务英语战略实验室",
      "PortMiami 与 Wynwood 创新空间对话",
      "大沼泽地与小哈瓦那沉浸体验",
    ],
  },
  "long-beach-ca": {
    name: "长滩（加州）两周营",
    region: "北美",
    blurb: "在长滩与橙县进行海岸沉浸，并安排洛杉矶（盖蒂、格里菲斯、好莱坞）一日游，适合需要理论＋实践结合的领导团队。",
    highlights: [
      "女王玛丽号与太平洋水族馆上的晨间课程",
      "海滨与水道会话实验",
      "拉古纳海滩＋洛杉矶文化之旅",
    ],
  },
  "long-beach-hawaii": {
    name: "长滩＋夏威夷（3 周）",
    region: "北美",
    blurb: "第一周驻扎长滩与洛杉矶，第二、三周移师火奴鲁鲁聚焦岛屿款待与服务英语，最多 10 名学员。",
    highlights: [
      "长滩与橙县领导力英语训练",
      "火奴鲁鲁为基地，可选跨岛一日游",
      "认证教师每日 8–10 小时现场辅导",
    ],
  },
  "dublin-heritage": {
    name: "都柏林文化沉浸（7 天）",
    region: "欧洲",
    blurb: "以博物馆、三一学院与文学徒步为主，适合教育机构与公共部门。",
    highlights: [
      "Book of Kells 私人讲解",
      "豪斯海岸谈判与发音训练",
      "夜间剧院与音乐学习圈",
    ],
  },
  "dublin-business": {
    name: "都柏林商务与科技（7 天）",
    region: "欧洲",
    blurb: "参访硅码头、创新园区与跨国总部，强化科技行业沟通。",
    highlights: [
      "硅码头内的演讲训练营",
      "Enterprise Ireland 简报",
      "夜间社交场景模拟",
    ],
  },
  "dublin-startup": {
    name: "都柏林创业冲刺（7 天）",
    region: "欧洲",
    blurb: "面向创业者与 NGO 负责人，提供敏捷沟通训练、联合办公日与导师反馈。",
    highlights: [
      "联合办公日与导师驻点",
      "故事力训练营",
      "周末前往戈尔韦或贝尔法斯特的选修行程",
    ],
  },
};

export const destinationCopy: Record<Lang, Record<string, DestinationLocaleCopy>> = {
  en: {},
  de: german,
  nl: dutch,
  fr: {},
  sv: {},
  es: {},
  zh: chinese,
};
