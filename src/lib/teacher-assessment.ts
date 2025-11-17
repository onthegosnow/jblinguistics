import type { AssessmentLevel } from "./assessments";
import { assessmentTranslations } from "@/assets/assessment-translations";

export type TeacherAssessmentQuestion = {
  id: string;
  level: AssessmentLevel;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
  promptByLang?: Partial<Record<TeacherAssessmentLanguage, string>>;
  optionsByLang?: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>>;
};

export const teacherAssessmentLanguages = [
  { id: "english", label: "English" },
  { id: "german", label: "Deutsch" },
  { id: "french", label: "Français" },
  { id: "dutch", label: "Dutch" },
  { id: "danish", label: "Dansk" },
  { id: "swedish", label: "Svenska" },
  { id: "spanish", label: "Español" },
  { id: "portuguese", label: "Português" },
  { id: "italian", label: "Italiano" },
  { id: "mandarin", label: "普通话" },
  { id: "japanese", label: "日本語" },
  { id: "korean", label: "한국어" },
] as const;

export type TeacherAssessmentLanguage = (typeof teacherAssessmentLanguages)[number]["id"];

export type TeacherAssessmentAnswer = { questionId: string; selected: number };

export type TeacherAssessmentScore = {
  language: TeacherAssessmentLanguage;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  percentage: number;
  breakdown: Record<"B2" | "C1" | "C2", { total: number; correct: number }>;
};

export const QUESTIONS_PER_ASSESSMENT = 100;

const ARTICLE_OPTIONS: [string, string, string, string] = ["a", "an", "the", "no article"];
const MODAL_OPTIONS: [string, string, string, string] = ["must", "should", "could", "might"];
type PromptKind = "article" | "tense" | "modal" | "conditional" | "inversion" | "idiom";

const promptTemplates: Record<PromptKind, Record<TeacherAssessmentLanguage, string>> = {
  article: {
    english: 'Choose the correct article to complete: "__ {phrase}".',
    german: 'Wählen Sie den richtigen Artikel für: „__ {phrase}“.',
    french: 'Choisissez l’article correct pour compléter : « __ {phrase} ».',
    dutch: 'Kies het juiste lidwoord voor: "__ {phrase}".',
    danish: 'Vælg den korrekte artikel til: "__ {phrase}".',
    swedish: 'Välj rätt artikel för: "__ {phrase}".',
    spanish: 'Elija el artículo correcto para completar: «__ {phrase}».',
    portuguese: 'Selecione o artigo correto para completar: "__ {phrase}".',
    italian: 'Scegli l’articolo corretto per completare: «__ {phrase}».',
    mandarin: '请选择正确的冠词完成句子：“__ {phrase}”。',
    japanese: '「__ {phrase}」を完成させる適切な冠詞を選んでください。',
    korean: '다음 문장을 완성할 올바른 관사를 고르세요: "__ {phrase}".',
  },
  tense: {
    english: 'Complete the sentence with the best tense: "{sentence}"',
    german: 'Vervollständigen Sie den Satz mit dem passenden Tempus: „{sentence}“',
    french: 'Complétez la phrase avec le temps approprié : « {sentence} ».',
    dutch: 'Vul de zin aan met de beste tijd: "{sentence}".',
    danish: 'Udfyld sætningen med korrekt tid: "{sentence}".',
    swedish: 'Fyll i meningen med rätt tempus: "{sentence}".',
    spanish: 'Complete la frase con el tiempo verbal adecuado: «{sentence}».',
    portuguese: 'Complete a frase com o tempo verbal adequado: "{sentence}".',
    italian: 'Completa la frase con il tempo corretto: «{sentence}».',
    mandarin: '用最合适的时态完成句子：“{sentence}”。',
    japanese: '最も適切な時制で次の文を完成させてください：「{sentence}」',
    korean: '다음 문장을 알맞은 시제로 완성하세요: "{sentence}".',
  },
  modal: {
    english: 'Select the modal verb that best completes: "{subject} __ {scenario}."',
    german: 'Wählen Sie das passende Modalverb: „{subject} __ {scenario}.“',
    french: 'Choisissez le verbe modal approprié : « {subject} __ {scenario} ».',
    dutch: 'Kies het juiste hulpwerkwoord: "{subject} __ {scenario}".',
    danish: 'Vælg det modalverbum der passer: "{subject} __ {scenario}".',
    swedish: 'Välj det modalverb som passar bäst: "{subject} __ {scenario}".',
    spanish: 'Seleccione el verbo modal adecuado: «{subject} __ {scenario}».',
    portuguese: 'Selecione o verbo modal adequado: "{subject} __ {scenario}".',
    italian: 'Seleziona il verbo modale appropriato: «{subject} __ {scenario}».',
    mandarin: '请选择合适的情态动词：“{subject} __ {scenario}”。',
    japanese: '「{subject} __ {scenario}」に入る適切な助動詞を選んでください。',
    korean: '다음 문장에 들어갈 알맞은 조동사를 고르세요: "{subject} __ {scenario}".',
  },
  conditional: {
    english: 'Choose the best result clause: "If {condition}, ___".',
    german: 'Wählen Sie die passende Folgerung: „Wenn {condition}, ___“.',
    french: 'Choisissez la meilleure proposition : « Si {condition}, ___ ».',
    dutch: 'Kies de beste vervolgzin: "Als {condition}, ___".',
    danish: 'Vælg den bedste ledsætning: "Hvis {condition}, ___".',
    swedish: 'Välj den bästa konsekvensen: "Om {condition}, ___".',
    spanish: 'Seleccione la mejor consecuencia: «Si {condition}, ___».',
    portuguese: 'Escolha a melhor consequência: "Se {condition}, ___".',
    italian: 'Scegli la conclusione corretta: «Se {condition}, ___».',
    mandarin: '请选择最合适的结果从句：“如果 {condition}，___”。',
    japanese: '「もし{condition}なら、___」の最適な結果節を選んでください。',
    korean: '"만약 {condition}이면 ___"에 들어갈 가장 알맞은 절을 고르세요.',
  },
  inversion: {
    english: 'Select the sentence that correctly emphasizes "{focus}".',
    german: 'Wählen Sie den Satz, der „{focus}“ korrekt hervorhebt.',
    french: 'Choisissez la phrase qui met correctement en relief « {focus} ».',
    dutch: 'Kies de zin die "{focus}" correct benadrukt.',
    danish: 'Vælg den sætning, der fremhæver "{focus}" korrekt.',
    swedish: 'Välj meningen som betonar "{focus}" korrekt.',
    spanish: 'Elija la frase que enfatiza correctamente «{focus}».',
    portuguese: 'Selecione a frase que enfatiza corretamente "{focus}".',
    italian: 'Seleziona la frase che enfatizza correttamente «{focus}».',
    mandarin: '请选择正确突出“{focus}”的句子。',
    japanese: '「{focus}」を正しく強調している文を選んでください。',
    korean: '"{focus}"를 정확히 강조하는 문장을 고르세요.',
  },
  idiom: {
    english: 'What does the expression "{phrase}" imply in a professional setting?',
    german: 'Was bedeutet die Redewendung „{phrase}“ im beruflichen Kontext?',
    french: 'Que signifie l’expression « {phrase} » dans un contexte professionnel ?',
    dutch: 'Wat betekent de uitdrukking "{phrase}" in een professionele context?',
    danish: 'Hvad betyder udtrykket "{phrase}" i en professionel sammenhæng?',
    swedish: 'Vad innebär uttrycket "{phrase}" i en professionell miljö?',
    spanish: '¿Qué implica la expresión «{phrase}» en un entorno profesional?',
    portuguese: 'O que implica a expressão "{phrase}" em um contexto profissional?',
    italian: 'Cosa implica l’espressione «{phrase}» in un contesto professionale?',
    mandarin: '在专业场景中，“{phrase}” 表示什么含义？',
    japanese: '「{phrase}」という表現はビジネスの場で何を意味しますか？',
    korean: '"{phrase}"라는 표현은 업무 환경에서 어떤 의미인가요?',
  },
};

const idiomMeaningOptions = [
  "Changing expectations after work has begun",
  "Facing a difficult task directly",
  "Escalating a matter beyond your remit",
  "Delaying action intentionally to gain leverage",
  "Keeping information limited to a small trusted group",
  "Acting quickly before a short-lived opportunity closes",
  "Proceeding without proper planning or approvals",
  "Transferring responsibility to someone else",
];

const articleOptionTranslations: Record<TeacherAssessmentLanguage, [string, string, string, string]> = {
  english: ["a", "an", "the", "no article"],
  german: ["ein", "eine", "der/die/das", "kein Artikel"],
  french: ["un", "une", "le/la", "aucun article"],
  dutch: ["een (klinker)", "een (medeklinker)", "de/het", "geen lidwoord"],
  danish: ["en/et (vokal)", "en/et (konsonant)", "den/det", "ingen artikel"],
  swedish: ["en/ett (vokal)", "en/ett (konsonant)", "den/det", "ingen artikel"],
  spanish: ["un", "una", "el/la", "sin artículo"],
  portuguese: ["um", "uma", "o/a", "sem artigo"],
  italian: ["un", "una", "il/la", "nessun articolo"],
  mandarin: ["不定冠词 a", "不定冠词 an", "定冠词 the", "无冠词"],
  japanese: ["不定冠詞 a", "不定冠詞 an", "定冠詞 the", "冠詞なし"],
  korean: ["부정관사 a", "부정관사 an", "정관사 the", "관사 없음"],
};

const modalOptionTranslations: Record<TeacherAssessmentLanguage, [string, string, string, string]> = {
  english: ["must", "should", "could", "might"],
  german: ["muss", "sollte", "könnte", "dürfte"],
  french: ["doit", "devrait", "pourrait", "pourrait bien"],
  dutch: ["moet", "zou moeten", "zou kunnen", "misschien kan"],
  danish: ["skal", "bør", "kunne", "måske kunne"],
  swedish: ["måste", "bör", "skulle kunna", "kanske kan"],
  spanish: ["debe", "debería", "podría", "quizá podría"],
  portuguese: ["deve", "deveria", "poderia", "talvez pudesse"],
  italian: ["deve", "dovrebbe", "potrebbe", "forse potrebbe"],
  mandarin: ["必须", "应该", "可以", "也许可以"],
  japanese: ["～しなければならない", "～すべきだ", "～できる", "～かもしれない"],
  korean: ["해야 한다", "하는 것이 좋다", "할 수 있다", "할지도 모른다"],
};

const tenseOptionTemplates: Record<TeacherAssessmentLanguage, [string, string, string, string]> = {
  english: [
    "had {participle} {object}",
    "has {participle} {object}",
    "have {participle} {object}",
    "{participle} {object}",
  ],
  german: [
    "hatte {participle} {object}",
    "hat {participle} {object}",
    "haben {participle} {object}",
    "{participle} {object}",
  ],
  french: [
    "avait {participle} {object}",
    "a {participle} {object}",
    "ont {participle} {object}",
    "{participle} {object}",
  ],
  dutch: [
    "had {participle} {object}",
    "heeft {participle} {object}",
    "hebben {participle} {object}",
    "{participle} {object}",
  ],
  danish: [
    "havde {participle} {object}",
    "har {participle} {object}",
    "have {participle} {object}",
    "{participle} {object}",
  ],
  swedish: [
    "hade {participle} {object}",
    "har {participle} {object}",
    "ha {participle} {object}",
    "{participle} {object}",
  ],
  spanish: [
    "había {participle} {object}",
    "ha {participle} {object}",
    "han {participle} {object}",
    "{participle} {object}",
  ],
  portuguese: [
    "havia {participle} {object}",
    "tem {participle} {object}",
    "têm {participle} {object}",
    "{participle} {object}",
  ],
  italian: [
    "aveva {participle} {object}",
    "ha {participle} {object}",
    "hanno {participle} {object}",
    "{participle} {object}",
  ],
  mandarin: [
    "已经{participle}{object}了",
    "已经{participle}{object}",
    "曾经{participle}{object}",
    "{participle}{object}",
  ],
  japanese: [
    "{object}を{participle}していた",
    "{object}を{participle}している",
    "{object}を{participle}している（複数）",
    "{object}を{participle}した",
  ],
  korean: [
    "{object}을/를 {participle}해 두었었다",
    "{object}을/를 {participle}해 두었다",
    "{object}을/를 {participle}해 두었다(복수)",
    "{object}을/를 {participle}했다",
  ],
};

const conditionalOptionTemplates: Record<TeacherAssessmentLanguage, [string, string, string, string]> = {
  english: [
    "we can {result}.",
    "we could {result}.",
    "we will {result} regardless.",
    "we would have {result}.",
  ],
  german: [
    "wir können {result}.",
    "wir könnten {result}.",
    "wir würden {result}, egal was passiert.",
    "wir hätten {result}.",
  ],
  french: [
    "nous pouvons {result}.",
    "nous pourrions {result}.",
    "nous réaliserons {result} quoi qu’il arrive.",
    "nous aurions {result}.",
  ],
  dutch: [
    "we kunnen {result}.",
    "we zouden {result}.",
    "we zullen {result}, ongeacht wat er gebeurt.",
    "we zouden {result} hebben.",
  ],
  danish: [
    "vi kan {result}.",
    "vi kunne {result}.",
    "vi gennemfører {result} uanset hvad.",
    "vi ville have {result}.",
  ],
  swedish: [
    "vi kan {result}.",
    "vi skulle kunna {result}.",
    "vi kommer att {result} oavsett.",
    "vi skulle ha {result}.",
  ],
  spanish: [
    "podemos {result}.",
    "podríamos {result}.",
    "lograremos {result} pase lo que pase.",
    "habríamos {result}.",
  ],
  portuguese: [
    "podemos {result}.",
    "poderíamos {result}.",
    "atingiremos {result}, aconteça o que acontecer.",
    "teríamos {result}.",
  ],
  italian: [
    "possiamo {result}.",
    "potremmo {result}.",
    "realizzeremo {result} indipendentemente dagli ostacoli.",
    "avremmo {result}.",
  ],
  mandarin: [
    "我们可以{result}。",
    "我们可以考虑{result}。",
    "无论如何我们都会{result}。",
    "我们本可以{result}。",
  ],
  japanese: [
    "私たちは{result}ことができる。",
    "私たちは{result}こともできるだろう。",
    "状況にかかわらず{result}予定だ。",
    "私たちは{result}ことができたはずだ。",
  ],
  korean: [
    "우리는 {result} 수 있다.",
    "우리는 {result} 수 있었을 것이다.",
    "우리는 상황과 무관하게 {result} 것이다.",
    "우리는 {result} 있었을 것이다.",
  ],
};

const inversionOptionTemplates: Record<TeacherAssessmentLanguage, [string, string, string, string]> = {
  english: [
    "Only after {focus} did the board approve the change.",
    "Only after {focus} the board approved the change.",
    "Only after {focus} has the board approve the change.",
    "Only after {focus} the board had approve the change.",
  ],
  german: [
    "Erst nachdem {focus}, genehmigte der Vorstand die Änderung.",
    "Nur nachdem {focus}, genehmigte der Vorstand die Änderung.",
    "Nur nachdem {focus}, hat der Vorstand die Änderung genehmigt.",
    "Nur nachdem {focus}, hatte der Vorstand die Änderung genehmigt.",
  ],
  french: [
    "Ce n’est qu’après {focus} que le conseil a approuvé le changement.",
    "Seulement après {focus} le conseil a approuvé le changement.",
    "Seulement après {focus} le conseil a approuvé.",
    "Seulement après {focus} le conseil avait approuvé.",
  ],
  dutch: [
    "Pas nadat {focus} keurde het bestuur de wijziging goed.",
    "Alleen nadat {focus} keurde het bestuur de wijziging goed.",
    "Alleen nadat {focus} heeft het bestuur de wijziging goedgekeurd.",
    "Alleen nadat {focus} had het bestuur goedgekeurd.",
  ],
  danish: [
    "Først efter {focus} godkendte bestyrelsen ændringen.",
    "Kun efter {focus} godkendte bestyrelsen ændringen.",
    "Kun efter {focus} har bestyrelsen godkendt.",
    "Kun efter {focus} havde bestyrelsen godkendt.",
  ],
  swedish: [
    "Först efter {focus} godkände styrelsen ändringen.",
    "Endast efter {focus} godkände styrelsen ändringen.",
    "Endast efter {focus} har styrelsen godkänt.",
    "Endast efter {focus} hade styrelsen godkänt.",
  ],
  spanish: [
    "Solo después de {focus} aprobó la junta el cambio.",
    "Solo después de {focus} la junta aprobó el cambio.",
    "Solo después de {focus} la junta ha aprobado el cambio.",
    "Solo después de {focus} la junta había aprobado el cambio.",
  ],
  portuguese: [
    "Só depois de {focus} o conselho aprovou a mudança.",
    "Somente depois de {focus} o conselho aprovou a mudança.",
    "Somente depois de {focus} o conselho aprovou.",
    "Somente depois de {focus} o conselho havia aprovado.",
  ],
  italian: [
    "Solo dopo {focus} il consiglio approvò il cambiamento.",
    "Soltanto dopo {focus} il consiglio approvò il cambiamento.",
    "Solo dopo {focus} il consiglio ha approvato.",
    "Solo dopo {focus} il consiglio aveva approvato.",
  ],
  mandarin: [
    "只有在{focus}之后，董事会才批准了变更。",
    "只有在{focus}之后，董事会批准了变更。",
    "只有在{focus}之后，董事会才已经批准。",
    "只有在{focus}之后，董事会才曾批准。",
  ],
  japanese: [
    "{focus}して初めて、取締役会は変更を承認した。",
    "{focus}しただけで取締役会は承認した。",
    "{focus}しただけで取締役会は承認している。",
    "{focus}しただけで取締役会は承認していた。",
  ],
  korean: [
    "{focus} 이후에야 이사회가 변경을 승인했다.",
    "{focus} 이후에 이사회가 변경을 승인했다.",
    "{focus} 이후에 이사회가 이미 승인했다.",
    "{focus} 이후에 이사회가 승인했었다.",
  ],
};

const idiomMeaningTranslations: Record<TeacherAssessmentLanguage, string[]> = {
  english: idiomMeaningOptions,
  german: [
    "Anforderungen ändern, nachdem die Arbeit begonnen hat",
    "Eine schwierige Aufgabe direkt angehen",
    "Ein Thema über die eigene Zuständigkeit hinweg eskalieren",
    "Handlung absichtlich verzögern, um Zeit zu gewinnen",
    "Informationen nur einem kleinen Kreis preisgeben",
    "Schnell handeln, solange die Chance besteht",
    "Ohne Planung oder Freigaben vorgehen",
    "Verantwortung auf jemand anderen abwälzen",
  ],
  french: [
    "Changer les attentes une fois le travail lancé",
    "Faire face à une tâche difficile de front",
    "Contourner la hiérarchie pour escalader un sujet",
    "Retarder une action pour gagner du temps",
    "Limiter l’information à un cercle restreint",
    "Agir immédiatement avant qu’une opportunité ne disparaisse",
    "Avancer sans planification ni validations",
    "Transférer la responsabilité à quelqu’un d’autre",
  ],
  dutch: [
    "Tijdens het traject de spelregels aanpassen",
    "Een moeilijke taak frontaal aanpakken",
    "Buiten de hiërarchie om escaleren",
    "Bewust tijd rekken om voordeel te behalen",
    "Informatie enkel met een kleine groep delen",
    "Meteen toeslaan zolang de kans er is",
    "Zonder plan of goedkeuring handelen",
    "De verantwoordelijkheid doorschuiven",
  ],
  danish: [
    "Ændre målsætningen efter arbejdet er startet",
    "Gå en svær opgave i møde direkte",
    "Eskalerer over din nærmeste leder",
    "Trække tiden ud for at vinde fordel",
    "Holde information på få hænder",
    "Handle hurtigt, mens muligheden er der",
    "Handle uden plan eller godkendelser",
    "Skyde ansvaret over på andre",
  ],
  swedish: [
    "Ändra målen efter att jobbet har startat",
    "Ta sig an en svår uppgift direkt",
    "Gå förbi sin chef för att eskalera",
    "Förhala med flit för att vinna tid",
    "Hålla informationen inom en liten krets",
    "Agera snabbt innan möjligheten försvinner",
    "Fortsätta utan plan eller godkännande",
    "Skicka vidare ansvaret",
  ],
  spanish: [
    "Cambiar las reglas una vez iniciado el trabajo",
    "Enfrentar una tarea difícil de frente",
    "Escalar un asunto por encima del superior",
    "Retrasar deliberadamente para ganar tiempo",
    "Mantener la información en un círculo pequeño",
    "Actuar rápido antes de perder la oportunidad",
    "Proceder sin planificación ni aprobación",
    "Pasar la responsabilidad a otro",
  ],
  portuguese: [
    "Mudar as metas depois que o trabalho começou",
    "Enfrentar uma tarefa difícil de frente",
    "Escalar um assunto acima da hierarquia",
    "Ganhar tempo adiando uma decisão",
    "Manter informações restritas a poucos",
    "Aproveitar uma oportunidade antes que acabe",
    "Agir sem planejamento ou aprovação",
    "Transferir a responsabilidade",
  ],
  italian: [
    "Cambiare gli obiettivi a lavoro iniziato",
    "Affrontare direttamente una situazione difficile",
    "Scavalcare la gerarchia per un’escalation",
    "Prendere tempo volutamente",
    "Limitare le informazioni a pochi fidati",
    "Agire subito prima che l’occasione sfumi",
    "Procedere senza piano né autorizzazione",
    "Scaricare la responsabilità su altri",
  ],
  mandarin: [
    "在项目进行中改变目标要求",
    "直面困难任务",
    "越级向更高层汇报",
    "故意拖延以争取时间",
    "把信息限制在小范围内",
    "趁机会稍纵即逝时迅速行动",
    "没有计划或批准就贸然行动",
    "把责任推给别人",
  ],
  japanese: [
    "作業開始後に基準を変更すること",
    "困難を正面から受け止めること",
    "上司を飛び越えてエスカレーションすること",
    "時間稼ぎをすること",
    "情報を限られたメンバーにだけ共有すること",
    "チャンスを逃さずすぐ動くこと",
    "計画も承認もなく進めること",
    "責任を他人に押し付けること",
  ],
  korean: [
    "업무가 시작된 뒤 기준을 바꾸는 것",
    "어려운 과제에 정면으로 맞서는 것",
    "상사를 건너뛰고 보고하는 것",
    "일부러 시간을 끄는 것",
    "정보를 일부에게만 공유하는 것",
    "기회를 놓치기 전에 즉시 행동하는 것",
    "계획이나 승인 없이 진행하는 것",
    "책임을 다른 사람에게 떠넘기는 것",
  ],
};

const reflectionPrompts: Record<TeacherAssessmentLanguage, { conflict: string; attendance: string }> = {
  english: {
    conflict:
      "If a student consistently causes conflict, how do you address it in the moment and prevent future disruptions?",
    attendance:
      "If students cancel frequently or skip sessions, what steps do you take to improve participation and revise your approach?",
  },
  german: {
    conflict:
      "Wenn eine Teilnehmerin regelmäßig Konflikte verursacht, wie reagieren Sie sofort und wie beugen Sie weiteren Störungen vor?",
    attendance:
      "Wenn Lernende häufig absagen oder fehlen, welche Maßnahmen ergreifen Sie zur Steigerung der Teilnahme und zur Anpassung Ihres Unterrichts?",
  },
  french: {
    conflict:
      "Si un apprenant crée régulièrement des tensions, comment intervenez-vous immédiatement et comment évitez-vous que cela se reproduise ?",
    attendance:
      "Si des apprenants annulent souvent ou manquent des séances, quelles actions mettez-vous en place pour relancer l’engagement et ajuster votre approche ?",
  },
  dutch: {
    conflict:
      "Als een cursist herhaaldelijk conflicten veroorzaakt, hoe grijpt u dan direct in en voorkomt u herhaling?",
    attendance:
      "Als cursisten vaak afzeggen of wegblijven, welke stappen neemt u om de opkomst te verhogen en uw aanpak bij te sturen?",
  },
  danish: {
    conflict:
      "Hvis en deltager skaber gentagne konflikter, hvordan håndterer du det med det samme og forebygger nye episoder?",
    attendance:
      "Hvis deltagere ofte melder afbud eller udebliver, hvilke skridt tager du for at øge fremmødet og justere din metode?",
  },
  swedish: {
    conflict:
      "Om en deltagare ständigt skapar konflikter, hur agerar du direkt och hur förebygger du framtida störningar?",
    attendance:
      "Om deltagare ofta ställer in eller uteblir, hur ökar du närvaron och justerar din undervisning?",
  },
  spanish: {
    conflict:
      "Si un alumno genera conflictos de forma recurrente, ¿cómo actúas en el momento y qué haces para evitar que vuelva a ocurrir?",
    attendance:
      "Si los alumnos cancelan o faltan con frecuencia, ¿qué medidas implementas para mejorar la asistencia y ajustar tu metodología?",
  },
  portuguese: {
    conflict:
      "Se um aluno cria conflitos de forma recorrente, como você intervém imediatamente e evita novas interrupções?",
    attendance:
      "Se os alunos faltam ou cancelam com frequência, que ações você toma para aumentar a participação e rever sua abordagem?",
  },
  italian: {
    conflict:
      "Se un corsista crea conflitti in modo ricorrente, come intervieni nell’immediato e quali passi compi per evitare recidive?",
    attendance:
      "Se gli studenti saltano spesso le lezioni, come favorisci la partecipazione e adatti il tuo metodo?",
  },
  mandarin: {
    conflict: "如果有學員經常在課堂造成衝突，您會如何即時處理並避免再次發生？",
    attendance: "若學員常常缺席或臨時取消，您會採取哪些措施提升參與度並調整教學方式？",
  },
  japanese: {
    conflict: "受講者が繰り返しトラブルを起こす場合、どのように即時対応し、再発を防ぎますか？",
    attendance: "受講者が頻繁に欠席・キャンセルする場合、参加率を上げるためにどう工夫し、指導法をどう見直しますか？",
  },
  korean: {
    conflict: "수강생이 지속적으로 갈등을 일으킨다면 즉시 어떻게 대응하고 향후 재발을 어떻게 막으시나요?",
    attendance: "수강생이 자주 결석하거나 취소한다면 참여율을 높이고 수업 방식을 조정하기 위해 어떤 조치를 취하시나요?",
  },
};

export function getReflectionPrompts(language: TeacherAssessmentLanguage) {
  const translated = assessmentTranslations[language]?.reflections;
  if (translated) {
    return translated;
  }
  return reflectionPrompts[language] ?? reflectionPrompts.english;
}

function interpolate(template: string, replacements: Record<string, string>) {
  return template.replace(/\{(.*?)\}/g, (_, key) => replacements[key] ?? "");
}

function buildPromptLocalization(kind: PromptKind, replacements: Record<string, string>) {
  const map: Partial<Record<TeacherAssessmentLanguage, string>> = {};
  teacherAssessmentLanguages.forEach(({ id }) => {
    const template = promptTemplates[kind]?.[id];
    if (template) {
      map[id] = interpolate(template, replacements);
    }
  });
  return map;
}

const articleModifiers = [
  "critical",
  "urgent",
  "strategic",
  "emerging",
  "complex",
  "sensitive",
  "innovative",
  "routine",
  "contingency",
  "regulatory",
  "on-site",
  "pre-flight",
  "global",
  "regional",
  "high-risk",
  "low-profile",
  "core",
  "pilot",
  "legacy",
  "VIP",
  "cyber",
  "hybrid",
  "rapid-response",
  "mobile",
  "bilingual",
];

const articleNouns = [
  "audit memo",
  "incident report",
  "overflight permit",
  "crew briefing",
  "diplomatic pouch",
  "export filing",
  "operations update",
  "training intake",
  "immersion syllabus",
  "compliance dashboard",
  "immigration packet",
  "security addendum",
  "maintenance slot",
  "handover log",
  "language sprint",
  "immersion retreat",
  "talent roster",
  "governance stand-up",
  "triage queue",
  "vendor escalation",
  "bridge call",
  "rollout pilot",
  "wellness debrief",
  "ethics attestation",
  "welfare stipend",
  "mentorship lab",
  "plenary brief",
  "fleet retrofit",
  "innovation charter",
  "translation capsule",
];

const tenseActors = [
  "our compliance lead",
  "the aviation task force",
  "the Frankfurt support pod",
  "our NYC interpreters",
  "the Nairobi analysts",
  "the Montreal counsel",
  "our bilingual QA crew",
  "the security liaison",
  "our digital campus team",
  "the humanitarian desk",
  "our Zurich auditors",
  "the charter operations cell",
  "the vendor integration crew",
  "our regulatory affairs duo",
  "the field linguists",
  "our crisis negotiators",
  "the R&D documentation squad",
  "our cyber response lead",
  "the embassy coordination cell",
  "our immersion instructors",
  "the procurement cluster",
  "our sustainability pod",
  "the safety stewards",
  "our legacy systems guild",
  "the quality circle",
];

const tenseActions = [
  { participle: "verified", object: "the satellite uplink checklist" },
  { participle: "reviewed", object: "the bilingual payroll data" },
  { participle: "completed", object: "the crisis protocol" },
  { participle: "checked", object: "every incidents log" },
  { participle: "updated", object: "the relief supply ledger" },
  { participle: "audited", object: "all coaching transcripts" },
  { participle: "tracked", object: "the repatriation metrics" },
  { participle: "finalized", object: "the curriculum addendum" },
  { participle: "captured", object: "the cockpit voice samples" },
  { participle: "scheduled", object: "the night-shift roster" },
  { participle: "consolidated", object: "the visa waiver requests" },
  { participle: "translated", object: "the maritime alerts" },
  { participle: "archived", object: "the arbitration evidence" },
  { participle: "assembled", object: "the terminology binder" },
  { participle: "drafted", object: "the relocation policy" },
  { participle: "circulated", object: "the investment memo" },
  { participle: "redacted", object: "the sensitive intercept" },
  { participle: "validated", object: "the command-center drills" },
  { participle: "prepared", object: "the AOG briefing" },
  { participle: "reconciled", object: "the multilingual invoices" },
  { participle: "aggregated", object: "the carbon data" },
  { participle: "mapped", object: "the refugee corridors" },
  { participle: "logged", object: "the overtime waivers" },
  { participle: "secured", object: "the trade secret packet" },
  { participle: "uploaded", object: "the adaptive worksheets" },
];

const modalSubjects = [
  "You",
  "The negotiations team",
  "Our senior instructor",
  "The compliance squad",
  "The outreach duo",
  "Our charter pilot",
  "The research guild",
  "The Berlin interpreters",
  "Our fintech liaison",
  "The Nairobi operations lead",
];

const modalNeeds = {
  must: [
    "submit the updated passenger manifest before pushback",
    "document every security exception in the log",
    "notify the regulator the moment a variance occurs",
    "complete the live-fire drill before midnight",
    "encrypt the client transcript before sharing",
    "secure the diplomatic pouch in the vault",
    "obtain written consent from the mission lead",
    "escort visitors through the sterile area",
    "record the full consent briefing",
    "escalate child-safety alerts immediately",
  ],
  should: [
    "circulate the post-flight survey within 24 hours",
    "coach the trainee through the pronunciation grid",
    "offer recovery options to delayed travelers",
    "align the lesson plan with the client KPIs",
    "flag recurring idiom errors in the LMS",
    "mention the cultural risks in the wrap-up",
    "remind the cohort about attendance expectations",
    "loop the mentor into the tough conversation",
    "restate the scope when stakeholders drift",
    "add the sustainability clause to the deck",
  ],
  could: [
    "prototype an AI glossary for the rail contract",
    "shadow the legal counsel during the merger",
    "join the innovation sprint for three days",
    "document the workflow in two additional languages",
    "share your repository with the ethics lab",
    "support the night-duty team during the festival",
    "volunteer to rehearse the crisis comms",
    "pilot the immersive VR classroom",
    "sit in on the airline safety forum",
    "pair with the fintech translator for the audit",
  ],
  might: [
    "invite the regional lead to the dry run",
    "explore a slower cadence for the executive coaching",
    "offer a weekend immersion if demand holds",
    "capture a short video recap for the cohort",
    "suggest a shared glossary to the vendor",
    "recommend a board update if the scope expands",
    "add cultural mentors if morale dips",
    "open a microsite if marketing approves",
    "launch a book club if interest rises",
    "trial a condensed format for summer",
  ],
};

type ConditionalType = "real" | "unlikely" | "past";

const conditionalConditions: Record<ConditionalType, string[]> = {
  real: [
    "the ministry releases the embargoed data",
    "clients sign the revised engagement letter",
    "the fleet clears the safety inspection",
    "funding arrives before quarter-end",
    "border officials keep the corridor open",
    "weather stays stable through the mission",
    "the interpreters remain on rotation",
    "airspace slots stay confirmed",
    "partners deliver the biometric kits",
    "unions endorse the overtime plan",
    "the health desk maintains 24/7 coverage",
    "the escrow instructions remain unchanged",
    "the arbitration pauses for two weeks",
    "training records sync overnight",
    "the secure tunnel stays online",
  ],
  unlikely: [
    "the auditors demanded a rewrite mid-hearing",
    "leadership asked us to relocate in 48 hours",
    "a single analyst handled three jurisdictions",
    "regulators reopened evidence already sealed",
    "the airline insisted on five simultaneous briefings",
    "clients expected fluency across six dialects",
    "the board wanted launch readiness without staff",
    "the vendor left the NDA unsigned for weeks",
    "the lender froze disbursements unexpectedly",
    "the embassy required a bilingual escort every hour",
    "the tech stack crashed throughout rehearsals",
    "procurement cut the interpretation channel",
    "travel bans shifted twice per day",
    "stakeholders joined from three conflict zones",
    "the adjudicator moved the session to sunrise",
  ],
  past: [
    "the crew had reported the hazard earlier",
    "the sponsor had disclosed the conflict of interest",
    "the airline had offered a standby team",
    "the ministry had shared the raw intelligence",
    "the vendor had locked the pricing",
    "the litigators had recorded the concessions",
    "the mentors had logged attendance daily",
    "the partner had confirmed the indemnity",
    "the engineers had stress-tested the simulations",
    "the broker had secured the hedge",
    "the crisis cell had escalated to the cabinet",
    "the negotiators had announced the ceasefire",
    "the university had approved the syllabus",
    "the branch had authorized the stipend",
    "the agency had briefed the attaché",
  ],
};

const conditionalResults: Record<ConditionalType, string[]> = {
  real: [
    "deploy the team within the month",
    "sign the memorandum without delay",
    "publish the clarity memo",
    "deliver the full immersion on-site",
    "open the satellite classroom",
    "issue certificates to the cohort",
    "start the compliance accelerator",
    "ship the bilingual safety cards",
    "expand the scope to two more regions",
    "hold the arbitration prep workshop",
  ],
  unlikely: [
    "stabilize the workload without burnout",
    "keep every stakeholder happy",
    "cover the entire merger with just one crew",
    "translate 200 pages overnight solo",
    "attend three hearings running concurrently",
    "eliminate the backlog in a weekend",
    "guarantee zero attrition in peak season",
    "travel to four continents in one sprint",
    "mentor every delegate personally",
    "redesign the curriculum while teaching full time",
  ],
  past: [
    "avoided the public escalation",
    "closed the deal before scrutiny intensified",
    "prevented the airspace shutdown",
    "saved the procurement penalty",
    "kept the workforce intact",
    "protected the humanitarian exemption",
    "met the confidentiality threshold",
    "won the arbitration outright",
    "shielded the clients from the outage",
    "shortened the visa timeline",
  ],
};

const inversionFocuses = [
  "completing the fourth compliance audit",
  "meeting Lufthansa's revised KPIs",
  "clearing every Ü1 background check",
  "resolving the cyber intrusion alerts",
  "securing visas for the Cayman cohort",
  "translating 600 pages of aircraft manuals",
  "delivering six simultaneous town halls",
  "rebuilding the entire terminology bank",
  "training the government negotiators",
  "localizing the airline safety films",
  "recovering the outage within two hours",
  "staging the blended-learning summit",
  "achieving 100% attendance in Q3",
  "syncing three ministries' timetables",
  "reopening the language lab before dawn",
  "writing the arbitration scripts overnight",
  "ending the backlog ahead of schedule",
  "launching the Gulf immersion onsite",
  "compressing the syllabus into ten days",
  "calming the investors after the leak",
  "expanding to six jurisdictions in one quarter",
  "negotiating landing rights on a holiday",
  "covering simultaneous evacuations",
  "stabilizing operations after the quake",
  "delivering the AI governance pilot",
  "transferring 200 trainees onto virtual tracks",
  "rolling out the secure messaging hub",
  "capturing testimony across five languages",
  "building the crisis playbook from scratch",
  "coaching the diplomats through the summit",
  "deploying the humanitarian flights",
  "transitioning three campuses to remote",
  "closing the carbon audit without findings",
  "leading the restitution dialogues",
  "retooling the onboarding flow in a week",
  "recovering the lost freight manifests",
  "expediting the sanctions briefing",
  "indexing the multilingual case files",
  "covering every interpreter absence",
  "mapping the refugee reunion routes",
  "validating all procurement invoices",
  "facilitating the royal visit",
  "standardizing the vaccine scripts",
  "rescuing the fintech launch",
  "backfilling the entire analyst pod",
  "stitching three datasets into one",
  "restoring trust after the recall",
  "resolving the defamation dispute",
  "safeguarding the embassy detail",
  "mastering the maritime jargon",
  "completing the cultural bootcamp",
  "teaching the astronaut linguistics class",
  "translating the Ground Canyon logs",
  "replacing the manual with digital twins",
  "balancing four time zones nightly",
  "stopping a rumor before it spread",
  "co-writing the bilingual safety anthem",
  "closing the microloan gap",
  "meeting the bank's sustainability clause",
  "aligning 12 subcontractors",
  "supporting the UN airlift",
  "resolving the fintech breach",
  "reviving morale after layoffs",
  "redirecting the wildfire response",
  "creating the airline's AI charter",
  "preventing the strike in peak season",
  "winning back the government tender",
  "designing the remote cockpit labs",
  "securing the European approvals",
  "covering an ambassador's absence",
  "launching the mentorship exchange",
  "documenting the ethics overhaul",
  "stabilizing the humanitarian hotline",
  "rolling the campus into a co-op",
  "proving ROI during downturn",
  "protecting whistleblowers globally",
  "ensuring medical clearances in two days",
  "synchronizing interpreters across continents",
  "capturing clean-room transcripts",
  "monitoring the sanctions tracker",
  "reinforcing the QA cadence",
  "keeping the evidence chain intact",
  "setting up simultaneous diplomacy pods",
  "converting the hangar into classrooms",
  "brokering the airline-banking partnership",
  "aligning French and German regulators",
  "recovering the lost satellite comms",
  "delivering 40 hours of tutoring weekly",
  "preventing graft in the supply channel",
  "meeting every UN reporting checkpoint",
  "closing the multilingual talent gap",
  "documenting the hostage support plan",
  "drafting the bilingual employment contracts",
  "standing up the carbon academy",
  "guiding the board through media prep",
  "upgrading the medevac scripts",
  "capturing lessons learned before redeployment",
  "standing in for the absent CEO",
  "stitching data from six ERPs",
  "refitting the booking engine in production",
  "calming the shareholder revolt",
  "cutting onboarding time in half",
  "bundling five service catalogs",
];

const idiomEntries = [
  { phrase: "move the goalposts", meaningIndex: 0 },
  { phrase: "bite the bullet", meaningIndex: 1 },
  { phrase: "go over someone's head", meaningIndex: 2 },
  { phrase: "play for time", meaningIndex: 3 },
  { phrase: "keep it under wraps", meaningIndex: 4 },
  { phrase: "strike while the iron is hot", meaningIndex: 5 },
  { phrase: "fly by the seat of your pants", meaningIndex: 6 },
  { phrase: "pass the buck", meaningIndex: 7 },
  { phrase: "raise the bar", meaningIndex: 0 },
  { phrase: "rip off the bandage", meaningIndex: 1 },
  { phrase: "pull rank", meaningIndex: 2 },
  { phrase: "stall for breathing room", meaningIndex: 3 },
  { phrase: "stay tight-lipped", meaningIndex: 4 },
  { phrase: "jump on the opening", meaningIndex: 5 },
  { phrase: "improvise on the fly", meaningIndex: 6 },
  { phrase: "shift accountability", meaningIndex: 7 },
  { phrase: "change the finish line", meaningIndex: 0 },
  { phrase: "face the music", meaningIndex: 1 },
  { phrase: "outrank the chain", meaningIndex: 2 },
  { phrase: "buy breathing room", meaningIndex: 3 },
  { phrase: "keep it close to the chest", meaningIndex: 4 },
  { phrase: "seize the window", meaningIndex: 5 },
  { phrase: "wing it", meaningIndex: 6 },
  { phrase: "hand off the hot potato", meaningIndex: 7 },
  { phrase: "shift the targets", meaningIndex: 0 },
  { phrase: "take the hit head-on", meaningIndex: 1 },
  { phrase: "sidestep your supervisor", meaningIndex: 2 },
  { phrase: "slow-walk the decision", meaningIndex: 3 },
  { phrase: "lock it down", meaningIndex: 4 },
  { phrase: "capitalize immediately", meaningIndex: 5 },
  { phrase: "launch without a net", meaningIndex: 6 },
  { phrase: "hand the issue to someone else", meaningIndex: 7 },
  { phrase: "shift the baseline", meaningIndex: 0 },
  { phrase: "grasp the nettle", meaningIndex: 1 },
  { phrase: "leapfrog the hierarchy", meaningIndex: 2 },
  { phrase: "spin the delay", meaningIndex: 3 },
  { phrase: "wrap it in confidentiality", meaningIndex: 4 },
  { phrase: "pounce on the lead", meaningIndex: 5 },
  { phrase: "shoot from the hip", meaningIndex: 6 },
  { phrase: "delegate the blame", meaningIndex: 7 },
  { phrase: "move the measure", meaningIndex: 0 },
  { phrase: "rip off the plaster", meaningIndex: 1 },
  { phrase: "step above the ladder", meaningIndex: 2 },
  { phrase: "drag your feet", meaningIndex: 3 },
  { phrase: "keep it quiet", meaningIndex: 4 },
  { phrase: "ride the momentum", meaningIndex: 5 },
  { phrase: "pilot without a plan", meaningIndex: 6 },
  { phrase: "drop it in someone else's lap", meaningIndex: 7 },
  { phrase: "reset the scoreboard", meaningIndex: 0 },
  { phrase: "take your medicine", meaningIndex: 1 },
  { phrase: "bypass the commander", meaningIndex: 2 },
  { phrase: "string things out", meaningIndex: 3 },
  { phrase: "stay mum", meaningIndex: 4 },
  { phrase: "take the chance while it lasts", meaningIndex: 5 },
  { phrase: "make it up as you go", meaningIndex: 6 },
  { phrase: "toss responsibility elsewhere", meaningIndex: 7 },
  { phrase: "lift the requirements midstream", meaningIndex: 0 },
  { phrase: "square your shoulders and act", meaningIndex: 1 },
  { phrase: "jump to the executive sponsor", meaningIndex: 2 },
  { phrase: "play the waiting game", meaningIndex: 3 },
  { phrase: "seal it in the vault", meaningIndex: 4 },
  { phrase: "press the advantage now", meaningIndex: 5 },
  { phrase: "wing the whole presentation", meaningIndex: 6 },
  { phrase: "hand the live grenade to someone else", meaningIndex: 7 },
];

function inferIndefiniteArticle(phrase: string): "a" | "an" {
  const word = phrase.trim().split(/[\s-]+/)[0];
  const lower = word.toLowerCase();
  const specialAn = ["honest", "honor", "hour", "heir", "mba", "fbi", "sos", "x-ray"];
  if (specialAn.some((entry) => lower.startsWith(entry))) return "an";
  const specialA = ["uni", "use", "user", "one", "euro", "ubiqu", "y" /* y-sound */];
  if (specialA.some((entry) => lower.startsWith(entry))) return "a";
  return ["a", "e", "i", "o", "u"].includes(lower[0]) ? "an" : "a";
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const clone = items.slice();
  const rng = mulberry32(seed);
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function takeCombinations<A, B>(aValues: A[], bValues: B[], limit: number) {
  const combos: Array<{ a: A; b: B }> = [];
  outer: for (const a of aValues) {
    for (const b of bValues) {
      combos.push({ a, b });
      if (combos.length >= limit) break outer;
    }
  }
  return combos;
}

function generateArticleQuestions(limit = 320): TeacherAssessmentQuestion[] {
  const combos = takeCombinations(articleModifiers, articleNouns, limit);
  return combos.map((combo, index) => {
    const phrase = `${combo.a} ${combo.b}`;
    const answer = inferIndefiniteArticle(phrase);
    const answerIndex = ARTICLE_OPTIONS.indexOf(answer);
    const promptByLang = buildPromptLocalization("article", { phrase });
    const optionsByLang: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>> = {};
    teacherAssessmentLanguages.forEach(({ id }) => {
      optionsByLang[id] = articleOptionTranslations[id] ?? articleOptionTranslations.english;
    });
    return {
      id: `ART-${String(index + 1).padStart(4, "0")}`,
      level: "B2",
      prompt: promptByLang.english ?? `Choose the correct article to complete: "__ ${phrase}"`,
      options: ARTICLE_OPTIONS,
      answerIndex,
      promptByLang,
      optionsByLang,
    };
  });
}

function generateTenseQuestions(limit = 250): TeacherAssessmentQuestion[] {
  const combos = takeCombinations(tenseActors, tenseActions, limit);
  return combos.map((combo, index) => {
    const basePrompt = `${combo.a} ___ ${combo.b.participle} ${combo.b.object} before regulators arrived.`;
    const options: [string, string, string, string] = [
      `had ${combo.b.participle} ${combo.b.object}`,
      `has ${combo.b.participle} ${combo.b.object}`,
      `have ${combo.b.participle} ${combo.b.object}`,
      `${combo.b.participle} ${combo.b.object}`,
    ];
    const promptByLang = buildPromptLocalization("tense", { sentence: basePrompt });
    const optionsByLang: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>> = {};
    teacherAssessmentLanguages.forEach(({ id }) => {
      const templates = tenseOptionTemplates[id] ?? tenseOptionTemplates.english;
      const localized = templates.map((template) =>
        template.replace("{participle}", combo.b.participle).replace("{object}", combo.b.object)
      ) as [string, string, string, string];
      optionsByLang[id] = localized;
    });
    return {
      id: `TNS-${String(index + 1).padStart(4, "0")}`,
      level: "C1",
      prompt: promptByLang.english ?? `Complete the sentence: "${basePrompt}"`,
      options,
      answerIndex: 0,
      promptByLang,
      optionsByLang,
    };
  });
}

function generateModalQuestions(limit = 320): TeacherAssessmentQuestion[] {
  const entries: Array<{ subject: string; scenario: string; answer: number }> = [];
  (Object.keys(modalNeeds) as Array<keyof typeof modalNeeds>).forEach((key, keyIndex) => {
    const scenarios = modalNeeds[key];
    modalSubjects.forEach((subject) => {
      scenarios.forEach((scenario) => {
        entries.push({ subject, scenario, answer: keyIndex });
      });
    });
  });
  const limited = entries.slice(0, limit);
  return limited.map((entry, index) => {
    const promptByLang = buildPromptLocalization("modal", { subject: entry.subject, scenario: entry.scenario });
    const optionsByLang: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>> = {};
    teacherAssessmentLanguages.forEach(({ id }) => {
      optionsByLang[id] = modalOptionTranslations[id] ?? MODAL_OPTIONS;
    });
    return {
      id: `MOD-${String(index + 1).padStart(4, "0")}`,
      level: "B2",
      prompt:
        promptByLang.english ??
        `Select the modal verb that best completes: "${entry.subject} __ ${entry.scenario}."`,
      options: MODAL_OPTIONS,
      answerIndex: entry.answer,
      promptByLang,
      optionsByLang,
    };
  });
}

function generateConditionalQuestions(limit = 240): TeacherAssessmentQuestion[] {
  const questions: TeacherAssessmentQuestion[] = [];
  (Object.keys(conditionalConditions) as ConditionalType[]).forEach((type) => {
    const conditions = conditionalConditions[type];
    const results = conditionalResults[type];
    outer: for (const condition of conditions) {
      for (const result of results) {
        if (questions.length >= limit) break outer;
        const base = `If ${condition}, ___`;
        const options: [string, string, string, string] = [
          `we can ${result}.`,
          `we could ${result}.`,
          `we will ${result} regardless.`,
          `we would have ${result}.`,
        ];
        let answerIndex = 0;
        if (type === "unlikely") answerIndex = 1;
        if (type === "past") answerIndex = 3;
        const promptByLang = buildPromptLocalization("conditional", { condition });
        const optionsByLang: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>> = {};
        teacherAssessmentLanguages.forEach(({ id }) => {
          const templates = conditionalOptionTemplates[id] ?? conditionalOptionTemplates.english;
          const localized = templates.map((template) => template.replace("{result}", result)) as [
            string,
            string,
            string,
            string,
          ];
          optionsByLang[id] = localized;
        });
        questions.push({
          id: `CON-${String(questions.length + 1).padStart(4, "0")}`,
          level: type === "real" ? "C1" : "C2",
          prompt: promptByLang.english ?? base,
          options,
          answerIndex,
          promptByLang,
          optionsByLang,
        });
      }
    }
  });
  return questions.slice(0, limit);
}

function generateInversionQuestions(limit = 120): TeacherAssessmentQuestion[] {
  return inversionFocuses.slice(0, limit).map((focus, index) => {
    const promptByLang = buildPromptLocalization("inversion", { focus });
    const optionsByLang: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>> = {};
    teacherAssessmentLanguages.forEach(({ id }) => {
      const templates = inversionOptionTemplates[id] ?? inversionOptionTemplates.english;
      optionsByLang[id] = templates.map((template) => template.replace("{focus}", focus)) as [
        string,
        string,
        string,
        string,
      ];
    });
    return {
      id: `INV-${String(index + 1).padStart(4, "0")}`,
      level: "C2",
      prompt: promptByLang.english ?? `Select the sentence that correctly emphasizes: "${focus}"`,
      options: [
        `Only after ${focus} did the board approve the change.`,
        `Only after ${focus} the board approved the change.`,
        `Only after ${focus} has the board approve the change.`,
        `Only after ${focus} the board had approve the change.`,
      ],
      answerIndex: 0,
      promptByLang,
      optionsByLang,
    };
  });
}

function buildIdiomOptions(
  entryIndex: number,
  correctIndex: number
): { options: [string, string, string, string]; answerIndex: number; indexes: number[] } {
  const indexes = new Set<number>([correctIndex]);
  let offset = entryIndex + 1;
  while (indexes.size < 4) {
    indexes.add((correctIndex + offset) % idiomMeaningOptions.length);
    offset += 1;
  }
  const optionList = Array.from(indexes).map((idx) => ({ idx, text: idiomMeaningOptions[idx] }));
  const shuffled = shuffleWithSeed(optionList, correctIndex * 97 + entryIndex);
  const answerIndex = shuffled.findIndex((item) => item.idx === correctIndex);
  return {
    options: shuffled.map((item) => item.text) as [string, string, string, string],
    answerIndex,
    indexes: shuffled.map((item) => item.idx),
  };
}

function generateIdiomQuestions(limit = 150): TeacherAssessmentQuestion[] {
  return idiomEntries.slice(0, limit).map((entry, index) => {
    const { options, answerIndex, indexes } = buildIdiomOptions(index, entry.meaningIndex);
    const promptByLang = buildPromptLocalization("idiom", { phrase: entry.phrase });
    const optionsByLang: Partial<Record<TeacherAssessmentLanguage, [string, string, string, string]>> = {};
    teacherAssessmentLanguages.forEach(({ id }) => {
      const translations = idiomMeaningTranslations[id] ?? idiomMeaningTranslations.english;
      const localized = indexes.map((idx) => translations[idx]) as [string, string, string, string];
      optionsByLang[id] = localized;
    });
    return {
      id: `IDI-${String(index + 1).padStart(4, "0")}`,
      level: "C2",
      prompt: promptByLang.english ?? `What does the expression "${entry.phrase}" imply in a professional setting?`,
      options,
      answerIndex,
      promptByLang,
      optionsByLang,
    };
  });
}

const QUESTION_BANK: TeacherAssessmentQuestion[] = [
  ...generateArticleQuestions(),
  ...generateTenseQuestions(),
  ...generateModalQuestions(),
  ...generateConditionalQuestions(),
  ...generateInversionQuestions(),
  ...generateIdiomQuestions(),
];

export const __questionBank = QUESTION_BANK;

export const __assessmentSource = {
  articleModifiers,
  articleNouns,
  tenseActors,
  tenseActions,
  modalSubjects,
  modalNeeds,
  conditionalConditions,
  conditionalResults,
  inversionFocuses,
  idiomMeaningOptions,
  idiomPhrases: idiomEntries.map((entry) => entry.phrase),
  reflectionPrompts: reflectionPrompts.english,
};

type LevelKey = "B2" | "C1" | "C2";

const QUESTIONS_BY_LEVEL: Record<LevelKey, TeacherAssessmentQuestion[]> = {
  B2: [],
  C1: [],
  C2: [],
};

QUESTION_BANK.forEach((question) => {
  if (question.level === "B2" || question.level === "C1" || question.level === "C2") {
    QUESTIONS_BY_LEVEL[question.level].push(question);
  }
});

const LEVEL_WEIGHTS: Record<LevelKey, number> = {
  B2: 0.3,
  C1: 0.35,
  C2: 0.35,
};

const LEVEL_PRIORITY: LevelKey[] = ["C2", "C1", "B2"];

function computeLevelTargets(sampleSize: number): Record<LevelKey, number> {
  const rawTargets = LEVEL_PRIORITY.map((level) => ({
    level,
    exact: sampleSize * LEVEL_WEIGHTS[level],
  }));
  const counts: Record<LevelKey, number> = { B2: 0, C1: 0, C2: 0 };
  let assigned = 0;
  rawTargets.forEach(({ level, exact }) => {
    const base = Math.floor(exact);
    counts[level] = base;
    assigned += base;
  });
  let remainder = sampleSize - assigned;
  if (remainder > 0) {
    rawTargets
      .slice()
      .sort((a, b) => b.exact % 1 - a.exact % 1)
      .forEach(({ level }) => {
        if (remainder <= 0) return;
        counts[level] += 1;
        remainder -= 1;
      });
  }
  return counts;
}

function ensureUniqueOptionTexts(options: [string, string, string, string]): [string, string, string, string] {
  const seen = new Map<string, number>();
  return options.map((text) => {
    const key = text.trim().toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 0) return text;
    return `${text} (${count + 1})`;
  }) as [string, string, string, string];
}

function localizeQuestionForLanguage(
  question: TeacherAssessmentQuestion,
  language: TeacherAssessmentLanguage
): TeacherAssessmentQuestion {
  const translation = assessmentTranslations[language]?.questions?.[question.id];
  const localizedPrompt = translation?.prompt ?? question.promptByLang?.[language] ?? question.prompt;
  let localizedOptions = (question.optionsByLang?.[language] ?? question.options) as [
    string,
    string,
    string,
    string,
  ];
  if (translation?.options && translation.options.length === 4) {
    localizedOptions = translation.options as [string, string, string, string];
  }
  localizedOptions = ensureUniqueOptionTexts(localizedOptions);
  return {
    ...question,
    prompt: localizedPrompt,
    options: localizedOptions,
  };
}

export function getTeacherAssessment(
  language: TeacherAssessmentLanguage,
  options?: { sampleSize?: number; seed?: number }
): TeacherAssessmentQuestion[] {
  const sampleSize = options?.sampleSize ?? QUESTIONS_PER_ASSESSMENT;
  const seedBase = options?.seed ?? language.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const targets = computeLevelTargets(sampleSize);
  const selected: TeacherAssessmentQuestion[] = [];
  const selectedIds = new Set<string>();
  LEVEL_PRIORITY.forEach((level, index) => {
    const count = targets[level];
    if (count <= 0) return;
    const pool = shuffleWithSeed(QUESTIONS_BY_LEVEL[level], seedBase + (index + 1) * 997);
    for (let i = 0; i < pool.length && selected.length < sampleSize && i < count; i += 1) {
      const question = pool[i];
      if (selectedIds.has(question.id)) continue;
      selected.push(question);
      selectedIds.add(question.id);
    }
  });
  if (selected.length < sampleSize) {
    const fallback = shuffleWithSeed(QUESTION_BANK, seedBase + 7919);
    for (const question of fallback) {
      if (selectedIds.has(question.id)) continue;
      selected.push(question);
      selectedIds.add(question.id);
      if (selected.length >= sampleSize) break;
    }
  }
  const ordered = shuffleWithSeed(selected, seedBase).slice(0, sampleSize);
  return ordered.map((question) => localizeQuestionForLanguage(question, language));
}

export function scoreTeacherAssessment(
  language: TeacherAssessmentLanguage,
  seed: number,
  answers: TeacherAssessmentAnswer[]
): TeacherAssessmentScore {
  const questions = getTeacherAssessment(language, { seed, sampleSize: answers.length || QUESTIONS_PER_ASSESSMENT });
  const answerMap = new Map(answers.map((entry) => [entry.questionId, entry.selected]));
  let totalCorrect = 0;
  const breakdown: Record<"B2" | "C1" | "C2", { total: number; correct: number }> = {
    B2: { total: 0, correct: 0 },
    C1: { total: 0, correct: 0 },
    C2: { total: 0, correct: 0 },
  };
  questions.forEach((question) => {
    const level = question.level as "B2" | "C1" | "C2";
    breakdown[level].total += 1;
    const selected = answerMap.get(question.id);
    if (selected === question.answerIndex) {
      totalCorrect += 1;
      breakdown[level].correct += 1;
    }
  });
  const totalQuestions = questions.length;
  const totalIncorrect = totalQuestions - totalCorrect;
  const percentage = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);
  return {
    language,
    totalQuestions,
    totalCorrect,
    totalIncorrect,
    percentage,
    breakdown,
  };
}
