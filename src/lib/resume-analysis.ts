"use server";

import path from "path";

export type ResumeInsights = {
  summary: string;
  keywords: string[];
  score: number;
  verdict: "strong" | "review";
  reasoning: string;
};

type AnalysisOptions = {
  mimeType?: string;
  filename?: string;
  workingLanguages?: string[];
};

const BASELINE_SCORE = 30;
const KEYWORD_GROUPS = [
  { label: "teaching", tokens: ["teach", "instructor", "professor", "curriculum"] },
  { label: "translation", tokens: ["translate", "translation", "localization", "interpret"] },
  { label: "assessment", tokens: ["assessment", "evaluation", "testing", "rubric"] },
  { label: "leadership", tokens: ["lead", "manage", "director", "supervise"] },
  { label: "technology", tokens: ["ai", "machine learning", "automation", "lms", "elearning"] },
  { label: "linguistics", tokens: ["linguist", "philology", "syntax", "phonology"] },
];

const EDUCATION_WORDS = ["phd", "doctorate", "master", "ma ", "mba", "bachelor", "ba ", "bs ", "m.ed", "cils", "dalf"];

export async function analyzeResume(buffer: Buffer, options: AnalysisOptions = {}): Promise<ResumeInsights> {
  const text = await extractResumeText(buffer, options);
  const normalized = collapseWhitespace(text);
  const summary = summarizeText(normalized);
  const keywords = extractKeywords(normalized);
  const { score, reasoning } = scoreResume(normalized, keywords, options);
  return {
    summary: summary || "We could not automatically summarize this resume, but the original document has been saved for manual review.",
    keywords,
    score,
    verdict: score >= 60 ? "strong" : "review",
    reasoning,
  };
}

async function extractResumeText(buffer: Buffer, options: AnalysisOptions): Promise<string> {
  const mime = (options.mimeType || "").toLowerCase();
  const extension = ((options.filename && path.extname(options.filename)) || "").toLowerCase();
  let parsedText = "";
  try {
    if (mime.includes("pdf") || extension === ".pdf") {
      // Try node-specific parser first (handles most PDFs in Node runtimes)
      try {
        const pdfNodeModule = await import("pdf-parse/node");
        type PdfParseCtor = new (params: { data: Buffer }) => {
          getText: () => Promise<{ text: string }>;
          destroy: () => Promise<void>;
        };
        const PDFParseCtor = (pdfNodeModule as { PDFParse?: PdfParseCtor }).PDFParse;
        if (typeof PDFParseCtor === "function") {
          const parser = new PDFParseCtor({ data: buffer });
          try {
            const parsed = await parser.getText();
            return collapseWhitespace(parsed?.text || "");
          } finally {
            await parser.destroy().catch(() => undefined);
          }
        }
      } catch (err) {
        console.warn("Unable to load pdf-parse/node", err);
      }
      // Final pdf-parse fallback
      try {
        const pdfModule = await import("pdf-parse");
        const pdfParseFn = (pdfModule as { default?: (data: Buffer) => Promise<{ text: string }> }).default;
        if (typeof pdfParseFn === "function") {
          const parsed = await pdfParseFn(buffer);
          parsedText = collapseWhitespace(parsed?.text || "");
        }
      } catch (err) {
        console.warn("pdf-parse fallback failed", err);
      }
    }
    if (mime.includes("word") || extension === ".docx") {
      const mammothModule = await import("mammoth");
      const mammoth = (mammothModule as { default?: { extractRawText: typeof import("mammoth").extractRawText } }).default ?? mammothModule;
      const extracted = await mammoth.extractRawText({ buffer });
      parsedText = collapseWhitespace(extracted?.value || "");
    }
    if (mime.startsWith("text/") || extension === ".txt" || extension === ".rtf" || extension === ".md" || extension === ".doc") {
      parsedText = buffer.toString("utf8");
    }
    if (parsedText) return parsedText;
  } catch (err) {
    console.warn("Resume text extraction failed", err);
  }

  // External OCR fallback (e.g., scanned PDFs) using OCR.space
  const ocrApiUrl = process.env.OCR_API_URL;
  const ocrApiKey = process.env.OCR_API_KEY;
  if (ocrApiUrl && ocrApiKey) {
    try {
      const formData = new FormData();
      const filename = options.filename || (mime.includes("pdf") ? "resume.pdf" : "document");
      const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      const arrayBuffer = new ArrayBuffer(view.byteLength);
      new Uint8Array(arrayBuffer).set(view);
      formData.append("file", new Blob([arrayBuffer]), filename);
      formData.append("language", "auto");
      formData.append("OCREngine", "2");
      formData.append("isTable", "true");
      formData.append("scale", "true");

      const res = await fetch(ocrApiUrl, {
        method: "POST",
        headers: { apikey: ocrApiKey },
        body: formData,
      });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as
          | {
              ParsedResults?: Array<{ ParsedText?: string | null; ErrorMessage?: unknown; ErrorDetails?: unknown }>;
              IsErroredOnProcessing?: boolean;
            }
          | null;
        const parsed = data?.ParsedResults?.[0]?.ParsedText ?? "";
        const collapsed = collapseWhitespace(parsed || "");
        if (collapsed) return collapsed;
      } else {
        console.warn("OCR API response not ok", res.status);
      }
    } catch (err) {
      console.warn("OCR API fallback failed", err);
    }
  }

  try {
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const trimmed = decoded.trim();
    if (!trimmed) {
      return "";
    }
    const looksLikePdf = trimmed.startsWith("%PDF") || trimmed.includes("/Filter/FlateDecode");
    const binaryish = /[\x00-\x08\x0E-\x1F]/.test(trimmed);
    if (looksLikePdf || binaryish) {
      return "";
    }
    return decoded;
  } catch {
    return "";
  }
}

function summarizeText(text: string): string {
  if (!text) return "";
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  if (sentences.length === 0) return "";
  const preview = sentences.slice(0, 3).join(" ");
  return preview.length > 600 ? `${preview.slice(0, 600)}…` : preview;
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const lowered = text.toLowerCase();
  const matches = new Set<string>();
  for (const group of KEYWORD_GROUPS) {
    if (group.tokens.some((token) => lowered.includes(token))) {
      matches.add(group.label);
    }
  }
  return Array.from(matches);
}

function scoreResume(text: string, keywords: string[], options: AnalysisOptions): { score: number; reasoning: string } {
  let score = BASELINE_SCORE;
  const reasoning: string[] = [];
  if (!text || text.length < 100) {
    reasoning.push("Resume text was too short for confident analysis.");
    return { score: 30, reasoning: reasoning.join(" ") };
  }
  const lowered = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 400) {
    score += 10;
    reasoning.push("Detailed resume content detected.");
  } else if (wordCount > 250) {
    score += 6;
  }
  const yearsMatch = lowered.match(/(\d{1,2})\s*\+?\s*(?:years|yrs)/);
  if (yearsMatch) {
    const years = Math.min(25, Number(yearsMatch[1]) || 0);
    if (years > 0) {
      const bonus = Math.min(30, years * 2);
      score += bonus;
      reasoning.push(`Approximately ${years} years of experience referenced.`);
    }
  }
  if (EDUCATION_WORDS.some((word) => lowered.includes(word))) {
    score += 10;
    reasoning.push("Advanced education credentials mentioned.");
  }
  score += Math.min(25, keywords.length * 5);
  if (keywords.length) {
    reasoning.push(`Highlighted skills: ${keywords.join(", ")}.`);
  }
  const languageCount = options.workingLanguages?.length ?? 0;
  if (languageCount) {
    score += Math.min(15, languageCount * 4);
    reasoning.push(`${languageCount} working language${languageCount > 1 ? "s" : ""} selected by applicant.`);
  }
  if (lowered.includes("certified") || lowered.includes("credential")) {
    score += 6;
    reasoning.push("Professional certifications referenced.");
  }
  score = Math.min(100, Math.round(score));
  if (!reasoning.length) reasoning.push("Automatic analysis completed with limited signals detected.");
  return { score, reasoning: reasoning.join(" ") };
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
