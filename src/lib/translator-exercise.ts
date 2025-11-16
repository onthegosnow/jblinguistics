export const translatorStoryParagraphs = [
  "Artificial intelligence is most valuable when it lightens the repetitive workload teams face every day. Instead of replacing people, the right AI workflows give analysts faster research, automate documentation, and coach new hires in real time.",
  "At JB Linguistics, we use AI to assemble terminology banks, surface context during interpretation, and draft status updates so linguists stay focused on nuance. Proper guardrails, human review, and ethical guidelines make the technology safer for aviation, banking, and public-sector teams.",
];

export const translatorLanguages = [
  { id: "german", label: "German" },
  { id: "french", label: "French" },
  { id: "dutch", label: "Dutch" },
  { id: "danish", label: "Danish" },
  { id: "swedish", label: "Swedish" },
  { id: "norwegian", label: "Norwegian" },
  { id: "russian", label: "Russian" },
  { id: "italian", label: "Italian" },
  { id: "spanish", label: "Spanish" },
  { id: "portuguese", label: "Portuguese" },
  { id: "mandarin", label: "Mandarin" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "other", label: "Other" },
] as const;

export type TranslatorExerciseLanguage = (typeof translatorLanguages)[number]["id"];

const translatorLocales: Record<Exclude<TranslatorExerciseLanguage, "other">, string> = {
  german: "de",
  french: "fr",
  dutch: "nl",
  danish: "da",
  swedish: "sv",
  norwegian: "nb",
  russian: "ru",
  italian: "it",
  spanish: "es",
  portuguese: "pt",
  mandarin: "zh-Hans",
  japanese: "ja",
  korean: "ko",
};

const referenceTranslations: Record<TranslatorExerciseLanguage, string | undefined> = {
  german:
    "Künstliche Intelligenz entfaltet ihren größten Wert, wenn sie Teams von repetitiver Arbeit entlastet. Statt Menschen zu ersetzen, verschaffen die richtigen Workflows Analysten schnellere Recherchewege, automatisieren Dokumentation und coachen neue Mitarbeitende in Echtzeit. Bei JB Linguistics setzen wir KI ein, um Terminologiedatenbanken aufzubauen, Kontext während des Dolmetschens einzublenden und Status-Updates zu entwerfen, damit Sprachprofis sich auf Nuancen konzentrieren können. Mit belastbaren Leitplanken, manueller Prüfung und ethischen Richtlinien bleibt die Technologie für Luftfahrt, Banken und öffentliche Auftraggeber sicher.",
  french:
    "L’intelligence artificielle prend tout son sens lorsqu’elle allège les charges répétitives des équipes. Plutôt que de remplacer les collaborateurs, les bons flux d’IA offrent aux analystes une recherche plus rapide, automatisent la documentation et accompagnent l’intégration des nouveaux talents en temps réel. Chez JB Linguistics, nous utilisons l’IA pour construire des banques terminologiques, rappeler le contexte pendant l’interprétation et rédiger des notes de suivi afin que nos linguistes restent concentrés sur la nuance. Des garde-fous solides, la relecture humaine et des principes éthiques rendent ces usages fiables pour l’aviation, la banque et le secteur public.",
  dutch:
    "Kunstmatige intelligentie is het meest waardevol wanneer zij repetitieve lasten van teams wegneemt. In plaats van mensen te vervangen, geven goed ontworpen AI-workflows analisten snellere research, automatiseren ze documentatie en coachen ze nieuwe collega’s in realtime. Bij JB Linguistics gebruiken we AI om terminologiebanken op te bouwen, tijdens het tolken context naar voren te halen en statusupdates te schetsen zodat linguïsten zich op nuance kunnen richten. Met de juiste waarborgen, menselijke review en ethische spelregels blijft de technologie veilig voor luchtvaart, banken en de publieke sector.",
  danish:
    "Kunstig intelligens skaber størst værdi, når den letter de gentagne opgaver som fylder hverdagen. I stedet for at erstatte mennesker giver de rette AI-workflows analytikere hurtigere research, automatiseret dokumentation og realtime onboarding af nye medarbejdere. Hos JB Linguistics bruger vi AI til at opbygge terminologibanker, stille kontekst til rådighed under tolkning og kladde statusopdateringer, så sprogspecialisterne kan fokusere på nuancer. Stærke værn, menneskelig gennemgang og etiske retningslinjer gør teknologien sikker for luftfart, bank og den offentlige sektor.",
  swedish:
    "Artificiell intelligens är som mest värdefull när den tar bort det repetitiva arbetet från teamens vardag. Rätt AI-flöden ersätter inte människor utan ger analytiker snabbare research, automatiserar dokumentation och coachar nya medarbetare i realtid. På JB Linguistics använder vi AI för att bygga terminologibanker, lyfta fram kontext under tolkning och skissa statusrapporter så att lingvister kan fokusera på nyanser. Rejäla skyddsräcken, mänsklig granskning och etiska riktlinjer gör tekniken trygg för flyg, bank och offentlig sektor.",
  norwegian:
    "Kunstig intelligens er mest verdifull når den avlaster team for de repeterende oppgavene. I stedet for å erstatte mennesker gir gode AI-arbeidsflyter analytikere raskere innsikt, automatiserer dokumentasjon og veileder nye medarbeidere i sanntid. Hos JB Linguistics bruker vi AI til å bygge terminologibanker, hente fram kontekst under tolking og utforme statusoppdateringer slik at lingvister kan fokusere på nyansene. Strenge rammer, menneskelig kvalitetssikring og etiske retningslinjer gjør teknologien trygg for luftfart, bank og offentlig sektor.",
  russian:
    "Искусственный интеллект приносит наибольшую пользу тогда, когда снимает с команд рутинную нагрузку. Вместо того чтобы заменять людей, корректные рабочие процессы на базе ИИ дают аналитикам быстрый доступ к данным, автоматизируют документацию и сопровождают адаптацию новых сотрудников в режиме реального времени. В JB Linguistics мы применяем ИИ для создания терминологических баз, предоставления контекста во время устного перевода и подготовки статусных отчетов, чтобы лингвисты могли сосредоточиться на нюансах. Надежные рамки, ручная проверка и этические стандарты делают технологию безопасной для авиации, банков и государственного сектора.",
  italian:
    "L’intelligenza artificiale produce il massimo valore quando alleggerisce il carico ripetitivo che i team affrontano ogni giorno. Invece di sostituire le persone, i workflow giusti offrono agli analisti ricerche più rapide, automatizzano la documentazione e seguono i nuovi assunti in tempo reale. In JB Linguistics utilizziamo l’IA per costruire banche terminologiche, far emergere il contesto durante l’interpretariato e redigere aggiornamenti di stato affinché i linguisti restino concentrati sulle sfumature. Solidi paletti, revisione umana e linee guida etiche rendono la tecnologia affidabile per aviazione, banking e settore pubblico.",
  spanish:
    "La inteligencia artificial aporta más valor cuando libera a los equipos del trabajo repetitivo. En lugar de sustituir personas, los flujos de IA adecuados brindan a los analistas investigación más ágil, automatizan la documentación y acompañan la incorporación de talento en tiempo real. En JB Linguistics usamos la IA para armar bancos terminológicos, ofrecer contexto durante la interpretación y redactar informes de estatus para que los lingüistas se concentren en la matiz. Con barandillas sólidas, revisión humana y pautas éticas, la tecnología resulta segura para aviación, banca y sector público.",
  portuguese:
    "A inteligência artificial é mais valiosa quando alivia o trabalho repetitivo que recai sobre as equipes. Em vez de substituir pessoas, os fluxos certos de IA oferecem pesquisas mais rápidas aos analistas, automatizam documentação e orientam novos colaboradores em tempo real. Na JB Linguistics usamos IA para montar bancos terminológicos, trazer contexto durante a interpretação e redigir relatórios de status para que os linguistas foquem nas nuances. Com salvaguardas, revisão humana e diretrizes éticas, a tecnologia se mantém segura para aviação, bancos e setor público.",
  mandarin:
    "人工智能在减轻团队每天重复性的工作时价值最高。它不是取代人，而是让分析师更快速地检索资料、自动化文档，并实时指导新成员。JB Linguistics 使用 AI 来构建术语库、在口译过程中推送上下文、起草状态更新，让语言专家专注于细节。借助可靠的防护、人工复核和伦理规范，这些技术在航空、金融与公共部门同样安全。",
  japanese:
    "AI はチームの反復作業を軽くする時にこそ最大の価値を発揮します。人を置き換えるのではなく、最適なワークフローがあればアナリストはより速く調査でき、文書化を自動化し、新しいメンバーをリアルタイムで支援できます。JB Linguistics では、AI で用語バンクを作り、通訳中にコンテキストを提示し、ステータス更新を下書きして、言語専門家がニュアンスに集中できるようにしています。確かなガードレール、人による確認、倫理指針があるからこそ、この技術は航空、金融、公共部門でも安全に使えます。",
  korean:
    "인공지능은 팀이 매일 반복적으로 처리해야 하는 업무를 덜어줄 때 가장 큰 가치를 제공합니다. 사람을 대체하는 것이 아니라, 잘 설계된 AI 워크플로우가 있으면 분석가는 더 빠르게 조사하고, 문서를 자동화하며, 신규 인력을 실시간으로 코칭할 수 있습니다. JB Linguistics는 용어 뱅크를 구축하고, 통역 중에 관련 맥락을 띄워 주며, 상태 보고서를 초안으로 작성하기 위해 AI를 활용합니다. 견고한 가드레일과 사람의 검수, 윤리 지침 덕분에 이 기술은 항공, 금융, 공공 부문에서도 안전하게 쓰일 수 있습니다.",
  other: undefined,
};

function segment(text: string, locale: string): string[] {
  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
      return Array.from(segmenter.segment(text))
        .map((item) => item.segment)
        .filter(Boolean);
    }
  } catch {
    // noop fallback
  }
  return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

function normalizeTokens(tokens: string[]): string[] {
  return tokens.map((token) => token.toLowerCase()).filter(Boolean);
}

export function scoreTranslatorSubmission(language: TranslatorExerciseLanguage, submission: string): {
  score: number | null;
  missingTokens: string[];
} {
  const cleaned = submission.trim();
  if (!cleaned) {
    return { score: null, missingTokens: [] };
  }
  const reference = referenceTranslations[language];
  if (!reference) {
    return { score: null, missingTokens: [] };
  }
  const locale = translatorLocales[language as Exclude<TranslatorExerciseLanguage, "other">] ?? "en";
  const refTokens = new Set(normalizeTokens(segment(reference, locale)));
  const submissionTokens = new Set(normalizeTokens(segment(cleaned, locale)));
  if (refTokens.size === 0 || submissionTokens.size === 0) {
    return { score: null, missingTokens: [] };
  }
  let overlap = 0;
  submissionTokens.forEach((token) => {
    if (refTokens.has(token)) {
      overlap += 1;
    }
  });
  const dice = (2 * overlap) / (refTokens.size + submissionTokens.size);
  const missingTokens = Array.from(refTokens).filter((token) => !submissionTokens.has(token)).slice(0, 10);
  return { score: Math.round(dice * 100), missingTokens };
}
