import { languages, type Lang } from "./i18n";

export type AssessmentLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type AssessmentModality = "grammar" | "verbal" | "writing";

type LocalizedText = Partial<Record<Lang, string>>;

type PromptTemplate = "article" | "tense" | "modal" | "conditional" | "inversion" | "idiom";

export type AssessmentQuestion = {
  id: string;
  level: AssessmentLevel;
  modality: AssessmentModality;
  prompt: string;
  promptByLang?: LocalizedText;
  options: string[];
  answerIndex: number;
  optionsByLang?: Partial<Record<Lang, string[]>>;
};

export const assessmentLevels: AssessmentLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const promptTemplates: Record<PromptTemplate, Record<Lang, string>> = {
  article: {
    en: 'Choose the correct article to complete: "__ {word} is on the table."',
    de: 'Wählen Sie den richtigen Artikel für den Satz: „__ {word} liegt auf dem Tisch.“',
    nl: 'Kies het juiste lidwoord voor: "__ {word} ligt op tafel."',
    fr: 'Choisissez l’article correct pour compléter : « __ {word} est sur la table. »',
    sv: 'Välj rätt artikel för meningen: "__ {word} ligger på bordet."',
    es: 'Elija el artículo correcto para completar: "__ {word} está sobre la mesa."',
    zh: '请选择正确的冠词，完成句子：“__ {word} 在桌子上。”',
  },
  tense: {
    en: 'Complete the sentence with the best option: "I __ {action} twice this year."',
    de: 'Vervollständigen Sie den Satz: „I __ {action} twice this year.“ Wählen Sie das beste Tempus.',
    nl: 'Vul de zin aan: "I __ {action} twice this year." Kies de beste tijdsvorm.',
    fr: 'Complétez la phrase : « I __ {action} twice this year. » Choisissez le meilleur temps.',
    sv: 'Fyll i meningen: "I __ {action} twice this year." Välj rätt tempus.',
    es: 'Complete la oración: «I __ {action} twice this year.» Elija el tiempo verbal correcto.',
    zh: '请补全句子：“I __ {action} twice this year.” 选择最合适的时态。',
  },
  modal: {
    en: 'Select the modal verb that best completes: "You __ {scenario}."',
    de: 'Wählen Sie das passende Modalverb: „You __ {scenario}.“',
    nl: 'Kies het juiste hulpwerkwoord: "You __ {scenario}."',
    fr: 'Choisissez le verbe modal approprié : « You __ {scenario}. »',
    sv: 'Välj det modalverb som passar bäst: "You __ {scenario}."',
    es: 'Seleccione el verbo modal adecuado: «You __ {scenario}.»',
    zh: '请选择最合适的情态动词：“You __ {scenario}.”',
  },
  conditional: {
    en: 'Choose the best result clause: "If {condition}, ___"',
    de: 'Wählen Sie den passenden Satzteil: „If {condition}, ___“',
    nl: 'Kies de beste vervolgzins: "If {condition}, ___"',
    fr: 'Choisissez la meilleure proposition : « If {condition}, ___ »',
    sv: 'Välj den bästa följdsatsen: "If {condition}, ___"',
    es: 'Seleccione la mejor consecuencia: «If {condition}, ___»',
    zh: '请选择最恰当的结果从句：“If {condition}, ___”',
  },
  inversion: {
    en: 'Select the sentence that correctly emphasizes: "{focus}"',
    de: 'Wählen Sie den Satz mit korrekter Inversion für: „{focus}“',
    nl: 'Kies de zin met correcte inversie voor: "{focus}"',
    fr: 'Choisissez la phrase qui emploie correctement l’inversion : « {focus} »',
    sv: 'Välj meningen som använder korrekt inversion för: "{focus}"',
    es: 'Elija la frase que usa la inversión correctamente para: «{focus}»',
    zh: '请选择正确使用倒装结构的句子，强调：“{focus}”',
  },
  idiom: {
    en: 'What does the expression "{idiom}" imply in a professional setting?',
    de: 'Was bedeutet die Redewendung „{idiom}“ im beruflichen Kontext?',
    nl: 'Wat houdt de uitdrukking "{idiom}" in een professionele context in?',
    fr: 'Que signifie l’expression « {idiom} » dans un cadre professionnel ?',
    sv: 'Vad innebär uttrycket "{idiom}" i en professionell miljö?',
    es: '¿Qué implica la expresión «{idiom}» en un entorno profesional?',
    zh: '在专业场景中，“{idiom}” 表达的含义是什么？',
  },
};

function formatTemplate(template: string, replacements: Record<string, string>): string {
  return template.replace(/\{(.*?)\}/g, (_, key) => replacements[key] ?? "");
}

function localizePrompt(templateKey: PromptTemplate, replacements: Record<string, string>): LocalizedText {
  const localized: LocalizedText = {};
  const templates = promptTemplates[templateKey];
  languages.forEach((lang) => {
    const template = templates[lang] ?? templates.en;
    localized[lang] = formatTemplate(template, replacements);
  });
  return localized;
}

function buildQuestion(
  level: AssessmentLevel,
  modality: AssessmentModality,
  template: PromptTemplate,
  replacements: Record<string, string>,
  options: string[],
  answerIndex: number,
  id: string
): AssessmentQuestion {
  const promptByLang = localizePrompt(template, replacements);
  return {
    id,
    level,
    modality,
    prompt: promptByLang.en ?? "",
    promptByLang,
    options,
    answerIndex,
  };
}

const articleOptions = ["a", "an", "the", "no article"];

const a1Vocabulary: { word: string; article?: "a" | "an" }[] = [
  { word: "apple" },
  { word: "orange" },
  { word: "umbrella" },
  { word: "hour", article: "an" },
  { word: "honest answer", article: "an" },
  { word: "idea" },
  { word: "owl", article: "an" },
  { word: "engineer" },
  { word: "airport" },
  { word: "house" },
  { word: "note" },
  { word: "elephant", article: "an" },
  { word: "invoice" },
  { word: "meeting" },
  { word: "European client", article: "a" },
  { word: "email" },
  { word: "honest colleague", article: "an" },
  { word: "heirloom vase", article: "an" },
  { word: "MBA program", article: "an" },
  { word: "uniform", article: "a" },
  { word: "island briefing", article: "an" },
  { word: "user guide", article: "a" },
  { word: "opportunity", article: "an" },
  { word: "analyst" },
  { word: "upgrade" },
  { word: "orchestra seat", article: "an" },
  { word: "emergency exit", article: "an" },
  { word: "university tour", article: "a" },
  { word: "objective" },
  { word: "agreement" },
  { word: "honor code", article: "an" },
  { word: "incident" },
  { word: "outage" },
  { word: "estimate" },
  { word: "update" },
  { word: "urgent memo", article: "an" },
];

function inferIndefiniteArticle(word: string): "a" | "an" {
  const trimmed = word.trim();
  const firstToken = trimmed.split(/\s+/)[0];
  const lower = firstToken.toLowerCase();
  const upper = firstToken.toUpperCase();
  const forceAn = ["hour", "honest", "heir", "honour", "honor", "mba", "fbi", "mvp"];
  if (forceAn.some((candidate) => lower.startsWith(candidate) || upper.startsWith(candidate.toUpperCase()))) {
    return "an";
  }
  const forceA = ["uni", "use", "user", "euro", "one", "ufo", "y" /* catch inexact vowels sounding y */];
  if (forceA.some((prefix) => lower.startsWith(prefix))) {
    return "a";
  }
  return ["a", "e", "i", "o", "u"].includes(lower[0]) ? "an" : "a";
}

const a1Questions = a1Vocabulary.map((entry, idx) => {
  const correct = entry.article ?? inferIndefiniteArticle(entry.word);
  return buildQuestion(
    "A1",
    "grammar",
    "article",
    { word: entry.word },
    articleOptions,
    articleOptions.indexOf(correct),
    `A1-G-${String(idx + 1).padStart(2, "0")}`
  );
});

const verbData: { base: string; object: string }[] = [
  { base: "visit", object: "the museum" },
  { base: "call", object: "my grandmother" },
  { base: "finish", object: "the report" },
  { base: "clean", object: "the lab" },
  { base: "travel", object: "to Oslo" },
  { base: "practice", object: "piano" },
  { base: "climb", object: "the hill" },
  { base: "fix", object: "the printer" },
  { base: "email", object: "the vendor" },
  { base: "audit", object: "the budget" },
  { base: "paint", object: "the lobby" },
  { base: "study", object: "the script" },
  { base: "check", object: "the samples" },
  { base: "train", object: "the team" },
  { base: "guide", object: "new hires" },
  { base: "review", object: "the policy" },
  { base: "monitor", object: "the servers" },
  { base: "ship", object: "the parcels" },
  { base: "update", object: "the website" },
  { base: "coach", object: "the interns" },
  { base: "water", object: "the plants" },
  { base: "iron", object: "the uniforms" },
  { base: "measure", object: "the runway" },
  { base: "polish", object: "the briefing" },
  { base: "document", object: "the process" },
  { base: "catalog", object: "the parts" },
  { base: "schedule", object: "the tour" },
  { base: "label", object: "the files" },
  { base: "secure", object: "the permits" },
  { base: "harvest", object: "the herbs" },
  { base: "balance", object: "the budget" },
  { base: "assemble", object: "the kits" },
  { base: "program", object: "the display" },
  { base: "translate", object: "the brochure" },
];

function pastSimple(base: string): string {
  if (base.endsWith("e")) return `${base}d`;
  if (/[^aeiou]y$/i.test(base)) return `${base.slice(0, -1)}ied`;
  if (base.endsWith("c")) return `${base}ked`;
  return `${base}ed`;
}

function presentParticiple(base: string): string {
  if (base.endsWith("ie")) return `${base.slice(0, -2)}ying`;
  if (base.endsWith("e") && base !== "be") return `${base.slice(0, -1)}ing`;
  if (base.endsWith("c")) return `${base}king`;
  return `${base}ing`;
}

const a2Questions = verbData.map((verb, idx) => {
  const past = pastSimple(verb.base);
  const participle = past;
  const ing = presentParticiple(verb.base);
  const options = [
    `have ${participle} ${verb.object}`,
    `${past} ${verb.object}`,
    `am ${ing} ${verb.object}`,
    `will ${verb.base} ${verb.object}`,
  ];
  return buildQuestion(
    "A2",
    "grammar",
    "tense",
    { action: `${verb.base} ${verb.object}` },
    options,
    0,
    `A2-G-${String(idx + 1).padStart(2, "0")}`
  );
});

const modalOptions = ["must", "should", "could", "might"];

const modalScenarios: { scenario: string; answer: "must" | "should" | "could" | "might" }[] = [
  { scenario: "remind the crew about the mandatory safety briefing", answer: "must" },
  { scenario: "suggest that a junior analyst double-check the numbers", answer: "should" },
  { scenario: "offer to cover a shift if a teammate is sick", answer: "could" },
  { scenario: "express uncertainty about weekend travel plans", answer: "might" },
  { scenario: "insist that passengers fasten seatbelts before taxi", answer: "must" },
  { scenario: "advise a colleague to back up their files", answer: "should" },
  { scenario: "volunteer to answer questions after the webinar", answer: "could" },
  { scenario: "describe a slight chance of turbulence", answer: "might" },
  { scenario: "ensure technicians follow the safety checklist", answer: "must" },
  { scenario: "recommend that managers hold weekly stand-ups", answer: "should" },
  { scenario: "offer to mentor the new hire during onboarding", answer: "could" },
  { scenario: "acknowledge that the schedule may change", answer: "might" },
  { scenario: "enforce the rule about ID badges on site", answer: "must" },
  { scenario: "encourage the team to submit feedback", answer: "should" },
  { scenario: "suggest bringing snacks for the overnight shift", answer: "could" },
  { scenario: "note a remote possibility of delays", answer: "might" },
  { scenario: "state that pilots follow fuel protocols", answer: "must" },
  { scenario: "remind students to review the rubric", answer: "should" },
  { scenario: "offer to host the bilingual client call", answer: "could" },
  { scenario: "mention that a storm could reroute flights", answer: "might" },
  { scenario: "demand compliance with export controls", answer: "must" },
  { scenario: "propose that finance revisits forecasts", answer: "should" },
  { scenario: "offer help translating the deck", answer: "could" },
  { scenario: "warn that the vendor may increase prices", answer: "might" },
  { scenario: "stress wearing PPE inside the hangar", answer: "must" },
  { scenario: "encourage remote staff to log hours promptly", answer: "should" },
  { scenario: "offer to escort visitors through security", answer: "could" },
  { scenario: "signal that interviews might run long", answer: "might" },
  { scenario: "state that auditors follow confidentiality rules", answer: "must" },
  { scenario: "recommend that designers test accessibility", answer: "should" },
  { scenario: "offer to moderate the multilingual panel", answer: "could" },
  { scenario: "acknowledge that budgets might shrink", answer: "might" },
  { scenario: "command mechanics to lock out power sources", answer: "must" },
  { scenario: "nudge participants to submit surveys", answer: "should" },
  { scenario: "offer to brief the press in French", answer: "could" },
  { scenario: "remark that the ferry might be late", answer: "might" },
];

const b1Questions = modalScenarios.map((scenario, idx) =>
  buildQuestion(
    "B1",
    "verbal",
    "modal",
    { scenario: scenario.scenario },
    modalOptions,
    modalOptions.indexOf(scenario.answer),
    `B1-V-${String(idx + 1).padStart(2, "0")}`
  )
);

const b2Conditions: { condition: string; result: string; type: "first" | "second" }[] = [
  { condition: "the inspectors arrive early", result: "set up the lab tour", type: "first" },
  { condition: "the supplier misses another shipment", result: "escalate to procurement", type: "first" },
  { condition: "the interns notice a hazard", result: "report it immediately", type: "first" },
  { condition: "the visa gets approved", result: "book the flights", type: "first" },
  { condition: "the audience asks tough questions", result: "share extra data", type: "first" },
  { condition: "the cabin temperature rises", result: "call maintenance", type: "first" },
  { condition: "the bids stay within budget", result: "award the contract", type: "first" },
  { condition: "the mockup looks on-brand", result: "launch the microsite", type: "first" },
  { condition: "clients confirm attendance", result: "publish the agenda", type: "first" },
  { condition: "pilots log their rest hours", result: "clear the roster", type: "first" },
  { condition: "the drones pass inspection", result: "deploy them overseas", type: "first" },
  { condition: "the charity meets its goal", result: "announce the stretch target", type: "first" },
  { condition: "weather alerts keep coming", result: "delay departures", type: "first" },
  { condition: "students submit late work", result: "dock participation points", type: "first" },
  { condition: "sponsors approve the copy", result: "print the programs", type: "first" },
  { condition: "engineers flag a bug", result: "pause the rollout", type: "first" },
  { condition: "partners share the dataset", result: "update the dashboard", type: "first" },
  { condition: "auditors spot a gap", result: "issue a corrective memo", type: "first" },
  { condition: "we had unrestricted funding", result: "open a field office", type: "second" },
  { condition: "the runway were longer", result: "land the cargo jet", type: "second" },
  { condition: "our team knew Mandarin", result: "negotiate without interpreters", type: "second" },
  { condition: "the weather were predictable", result: "schedule outdoor training", type: "second" },
  { condition: "the budget allowed more staff", result: "double the cohort size", type: "second" },
  { condition: "pilots felt better rested", result: "accept the extra rotation", type: "second" },
  { condition: "customs processed paperwork faster", result: "ship live samples", type: "second" },
  { condition: "delegates trusted each other", result: "sign the accord", type: "second" },
  { condition: "we lived closer to HQ", result: "commute by bike", type: "second" },
  { condition: "the student had studied morphology", result: "grasp the dialect shift", type: "second" },
  { condition: "they weren’t so risk-averse", result: "pilot the AI tool", type: "second" },
  { condition: "she had more free evenings", result: "tutor additional crews", type: "second" },
  { condition: "he understood Swedish", result: "lead the Stockholm call", type: "second" },
  { condition: "the airport operated 24/7", result: "add a midnight service", type: "second" },
  { condition: "the NGO controlled the site", result: "install the water plant", type: "second" },
  { condition: "the legislation were simpler", result: "expand into Canada", type: "second" },
];

function buildConditionalOptions(entry: { condition: string; result: string; type: "first" | "second" }): string[] {
  const base = entry.result;
  const first = `we will ${base}`;
  const second = `we would ${base}`;
  const simplePast = `we ${base.split(" ")[0]}ed ${base.split(" ").slice(1).join(" ")}`;
  const presentPerfect = `we have ${base}`;
  return [first, second, simplePast, presentPerfect];
}

const b2Questions = b2Conditions.map((item, idx) => {
  const options = buildConditionalOptions(item);
  const answerIndex = item.type === "first" ? 0 : 1;
  return buildQuestion(
    "B2",
    "grammar",
    "conditional",
    { condition: item.condition },
    options,
    answerIndex,
    `B2-G-${String(idx + 1).padStart(2, "0")}`
  );
});

const c1Structures: { adverb: string; aux: string; subject: string; rest: string }[] = [
  { adverb: "Seldom", aux: "have", subject: "we", rest: "received such detailed feedback" },
  { adverb: "Hardly", aux: "had", subject: "the briefing", rest: "ended when questions started" },
  { adverb: "Rarely", aux: "do", subject: "auditors", rest: "praise a process so quickly" },
  { adverb: "Only after", aux: "did", subject: "the team", rest: "understand the full scope" },
  { adverb: "No sooner", aux: "had", subject: "the merger", rest: "closed than issues arose" },
  { adverb: "Little", aux: "did", subject: "the engineers", rest: "realize the impact" },
  { adverb: "Not only", aux: "did", subject: "the pilots", rest: "adapt, they excelled" },
  { adverb: "Never before", aux: "had", subject: "the NGO", rest: "scaled so fast" },
  { adverb: "Rarely", aux: "is", subject: "compliance", rest: "discussed so openly" },
  { adverb: "Only when", aux: "did", subject: "the auditors", rest: "read the memo" },
  { adverb: "Hardly", aux: "had", subject: "the call", rest: "ended when the alert came" },
  { adverb: "Seldom", aux: "does", subject: "leadership", rest: "offer such transparency" },
  { adverb: "No sooner", aux: "was", subject: "the prototype", rest: "tested than it failed" },
  { adverb: "Under no circumstances", aux: "should", subject: "contractors", rest: "share the prototype" },
  { adverb: "Only after", aux: "was", subject: "the deck", rest: "revised was it clear" },
  { adverb: "Nowhere", aux: "did", subject: "the team", rest: "feel more supported" },
  { adverb: "At no time", aux: "did", subject: "the negotiators", rest: "lose control" },
  { adverb: "Little", aux: "did", subject: "she", rest: "expect the promotion" },
  { adverb: "Never", aux: "have", subject: "our clients", rest: "been so engaged" },
  { adverb: "Rarely", aux: "had", subject: "I", rest: "seen such poise" },
  { adverb: "Seldom", aux: "do", subject: "regulators", rest: "approve that quickly" },
  { adverb: "Only rarely", aux: "does", subject: "a crisis", rest: "resolve so neatly" },
  { adverb: "No sooner", aux: "had", subject: "the keynote", rest: "begun than the power failed" },
  { adverb: "Scarcely", aux: "had", subject: "they", rest: "landed when the call came" },
  { adverb: "Only then", aux: "did", subject: "leadership", rest: "allocate resources" },
  { adverb: "Under no circumstances", aux: "are", subject: "trainees", rest: "to share credentials" },
  { adverb: "Little", aux: "do", subject: "stakeholders", rest: "see the backstage work" },
  { adverb: "Hardly ever", aux: "does", subject: "the runway", rest: "close for maintenance" },
  { adverb: "Rarely", aux: "have", subject: "we", rest: "launched so smoothly" },
  { adverb: "Never again", aux: "will", subject: "the crew", rest: "ignore the checklist" },
];

function buildInversionOptions(entry: { adverb: string; aux: string; subject: string; rest: string }): {
  options: string[];
  answerIndex: number;
} {
  const subject = entry.subject;
  const rest = entry.rest;
  const correct = `${entry.adverb} ${entry.aux} ${subject} ${rest}.`;
  const option1 = `${entry.adverb} ${subject} ${entry.aux} ${rest}.`;
  const option2 = `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${entry.aux} ${entry.adverb.toLowerCase()} ${rest}.`;
  const option3 = `${entry.adverb} did ${subject} ${rest}.`;
  return { options: [correct, option1, option2, option3], answerIndex: 0 };
}

const c1Questions = c1Structures.map((structure, idx) => {
  const { options, answerIndex } = buildInversionOptions(structure);
  return buildQuestion(
    "C1",
    "writing",
    "inversion",
    { focus: `${structure.adverb} ${structure.aux} ${structure.subject} ${structure.rest}` },
    options,
    answerIndex,
    `C1-W-${String(idx + 1).padStart(2, "0")}`
  );
});

const idiomQuestionsData: { idiom: string; options: string[]; answerIndex: number }[] = [
  {
    idiom: "take the bull by the horns",
    options: [
      "Address a problem directly and decisively",
      "Wait until someone else makes the first move",
      "Avoid conflict by changing the topic",
      "Collect more data before acting at all",
    ],
    answerIndex: 0,
  },
  {
    idiom: "call the shots",
    options: [
      "Hold authority to make final decisions",
      "Complain loudly about delays",
      "Record minutes during meetings",
      "Measure progress with KPIs",
    ],
    answerIndex: 0,
  },
  {
    idiom: "read between the lines",
    options: [
      "Look for hidden meaning beyond explicit words",
      "Highlight every line in a contract",
      "Translate documents word for word",
      "Skip directly to the summary",
    ],
    answerIndex: 0,
  },
  {
    idiom: "raise the bar",
    options: [
      "Increase expectations or standards",
      "Shorten a training program",
      "Lower costs at any price",
      "Freeze hiring for a quarter",
    ],
    answerIndex: 0,
  },
  {
    idiom: "hit the nail on the head",
    options: [
      "Identify the exact issue",
      "Cause unnecessary damage",
      "Delay approvals",
      "Speak off topic intentionally",
    ],
    answerIndex: 0,
  },
  {
    idiom: "once in a blue moon",
    options: [
      "Something that rarely happens",
      "An event that happens daily",
      "A checklist you must follow",
      "A routine budget review",
    ],
    answerIndex: 0,
  },
  {
    idiom: "pull strings",
    options: [
      "Use connections to influence an outcome",
      "Practice violin before a concert",
      "Remove cables from equipment",
      "Abruptly cancel a contract",
    ],
    answerIndex: 0,
  },
  {
    idiom: "move the needle",
    options: [
      "Create noticeable impact",
      "Make tiny decorative changes",
      "Replace analog gauges",
      "Ignore stakeholder input",
    ],
    answerIndex: 0,
  },
  {
    idiom: "get the ball rolling",
    options: [
      "Start a project or process",
      "Cancel an initiative",
      "Evaluate legal risk",
      "Transfer ownership",
    ],
    answerIndex: 0,
  },
  {
    idiom: "in the same boat",
    options: [
      "Share the same situation or risk",
      "Travel together literally",
      "Compete directly with someone",
      "Negotiate on opposite sides",
    ],
    answerIndex: 0,
  },
  {
    idiom: "cut corners",
    options: [
      "Skip quality steps to save time or money",
      "Measure precisely",
      "Expand the scope responsibly",
      "Outsource for innovation",
    ],
    answerIndex: 0,
  },
  {
    idiom: "on the same page",
    options: [
      "Fully aligned on understanding",
      "Reading the same novel",
      "Standing in the same room",
      "Having equal titles",
    ],
    answerIndex: 0,
  },
  {
    idiom: "back to the drawing board",
    options: [
      "Restart planning after a setback",
      "Celebrate a finished draft",
      "Hand projects to legal",
      "Audit a warehouse",
    ],
    answerIndex: 0,
  },
  {
    idiom: "elephant in the room",
    options: [
      "An obvious issue everyone avoids",
      "A brand-new opportunity",
      "A literal animal mascot",
      "A surprise budget surplus",
    ],
    answerIndex: 0,
  },
  {
    idiom: "low-hanging fruit",
    options: [
      "Tasks that are easy wins",
      "Fruit purchased in bulk",
      "Goals that are impossible",
      "Equipment stored overhead",
    ],
    answerIndex: 0,
  },
  {
    idiom: "face the music",
    options: [
      "Accept the consequences",
      "Lead an orchestra",
      "Change the playlist",
      "Cancel the concert",
    ],
    answerIndex: 0,
  },
  {
    idiom: "walk on eggshells",
    options: [
      "Speak very cautiously",
      "Tour a farm",
      "Take off your shoes",
      "Discuss finances boldly",
    ],
    answerIndex: 0,
  },
  {
    idiom: "out of the blue",
    options: [
      "Unexpectedly without warning",
      "Following a detailed plan",
      "After months of prep",
      "During a scheduled break",
    ],
    answerIndex: 0,
  },
  {
    idiom: "on thin ice",
    options: [
      "In a risky position",
      "Working in winter",
      "Waiting confidently",
      "Celebrating a win",
    ],
    answerIndex: 0,
  },
  {
    idiom: "bite the bullet",
    options: [
      "Accept a difficult decision",
      "Delay action indefinitely",
      "Celebrate an award",
      "Contact the press",
    ],
    answerIndex: 0,
  },
  {
    idiom: "break the ice",
    options: [
      "Ease tension at the start of an interaction",
      "Freeze relationships",
      "Fire an employee",
      "Rewrite policy manuals",
    ],
    answerIndex: 0,
  },
  {
    idiom: "go the extra mile",
    options: [
      "Deliver more effort than required",
      "Travel exactly one mile",
      "Cut travel reimbursements",
      "Skip half the process",
    ],
    answerIndex: 0,
  },
  {
    idiom: "burn the midnight oil",
    options: [
      "Work late into the night",
      "Waste resources intentionally",
      "Switch to solar power",
      "Close the office early",
    ],
    answerIndex: 0,
  },
  {
    idiom: "turn a blind eye",
    options: [
      "Ignore a problem on purpose",
      "Lose eyesight temporarily",
      "Change observation posts",
      "Review data carefully",
    ],
    answerIndex: 0,
  },
  {
    idiom: "throw someone under the bus",
    options: [
      "Sacrifice someone to save yourself",
      "Offer someone a ride",
      "Nominate a colleague for an award",
      "Invite extra help",
    ],
    answerIndex: 0,
  },
  {
    idiom: "tight ship",
    options: [
      "Run an operation with strict discipline",
      "Operate a cramped boat",
      "Transport cargo overseas",
      "Invest in shipping stocks",
    ],
    answerIndex: 0,
  },
  {
    idiom: "across the board",
    options: [
      "Affecting everyone equally",
      "Limited to finance only",
      "Discussed only at HQ",
      "Occurring on weekends",
    ],
    answerIndex: 0,
  },
  {
    idiom: "touch base",
    options: [
      "Briefly connect for an update",
      "Play baseball",
      "Approve expenses",
      "Merge two teams",
    ],
    answerIndex: 0,
  },
  {
    idiom: "silver lining",
    options: [
      "A hopeful aspect in a bad situation",
      "Metal insulation",
      "Revenue growth",
      "An aircraft paint finish",
    ],
    answerIndex: 0,
  },
  {
    idiom: "step up to the plate",
    options: [
      "Take responsibility to act",
      "Literally climb stairs",
      "Reject an assignment",
      "Switch departments without approval",
    ],
    answerIndex: 0,
  },
  {
    idiom: "change gears",
    options: [
      "Shift strategy quickly",
      "Repair a transmission",
      "Buy new machinery",
      "Slow projects permanently",
    ],
    answerIndex: 0,
  },
  {
    idiom: "hold the fort",
    options: [
      "Maintain operations while others are away",
      "Invest in real estate",
      "Delay the project",
      "Cancel security patrols",
    ],
    answerIndex: 0,
  },
  {
    idiom: "across the aisle",
    options: [
      "Collaborate with another group or party",
      "Walk through an airplane aisle",
      "Switch to a competitor",
      "Move offices permanently",
    ],
    answerIndex: 0,
  },
];

const c2Questions = idiomQuestionsData.map((q, idx) =>
  buildQuestion(
    "C2",
    "verbal",
    "idiom",
    { idiom: q.idiom },
    q.options,
    q.answerIndex,
    `C2-V-${String(idx + 1).padStart(2, "0")}`
  )
);

export const assessmentQuestions: AssessmentQuestion[] = [
  ...a1Questions,
  ...a2Questions,
  ...b1Questions,
  ...b2Questions,
  ...c1Questions,
  ...c2Questions,
];

if (assessmentQuestions.length < 200) {
  console.warn("Assessment bank should contain at least 200 questions; currently:", assessmentQuestions.length);
}

// Extended question banks - loaded dynamically
const questionBankCache: Record<string, AssessmentQuestion[]> = {};

/**
 * Load questions from the extended question bank for a specific language.
 * Falls back to the built-in assessmentQuestions if no extended bank exists.
 */
export async function loadQuestionBank(language: string): Promise<AssessmentQuestion[]> {
  const key = language.toLowerCase();

  if (questionBankCache[key]) {
    return questionBankCache[key];
  }

  try {
    // Dynamic import based on language
    let questions: AssessmentQuestion[] = [];

    switch (key) {
      case "english":
      case "en":
        const englishModule = await import("./assessment-questions/english-questions");
        questions = englishModule.default || englishModule.englishQuestions || [];
        break;
      case "german":
      case "de":
        const germanModule = await import("./assessment-questions/german-questions");
        questions = germanModule.default || germanModule.germanQuestions || [];
        break;
      default:
        // Fall back to built-in questions for other languages
        console.log(`No extended question bank for '${language}', using built-in questions`);
        return assessmentQuestions;
    }

    if (questions.length > 0) {
      questionBankCache[key] = questions;
      console.log(`Loaded ${questions.length} questions for ${language}`);
      return questions;
    }
  } catch (err) {
    console.warn(`Failed to load question bank for ${language}:`, err);
  }

  // Fall back to built-in questions
  return assessmentQuestions;
}

/**
 * Get a randomized set of questions for a placement test.
 * Uses the extended question bank if available.
 */
export async function getPlacementTestQuestions(
  language: string,
  count: number = 200
): Promise<AssessmentQuestion[]> {
  const all = await loadQuestionBank(language);

  // Shuffle
  const shuffled = [...all].sort(() => Math.random() - 0.5);

  // Take requested count
  return shuffled.slice(0, count);
}
