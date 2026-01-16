import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createSupabaseAdminClient, RESUME_BUCKET } from "../supabase-server";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const CEFR_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export type CertificateData = {
  studentName: string;
  language: string;
  level: CEFRLevel;
  certificateNumber: string;
  issuedDate: string;
  issuerName?: string;
};

/**
 * Generate a PDF certificate for a student's language proficiency achievement
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Letter size (8.5 x 11 inches) in landscape
  const pageWidth = 792; // 11 inches
  const pageHeight = 612; // 8.5 inches
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Embed fonts
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Colors
  const gold = rgb(0.8, 0.68, 0.2);
  const darkBlue = rgb(0.1, 0.2, 0.4);
  const teal = rgb(0.2, 0.5, 0.55);

  // Draw decorative border
  const borderMargin = 30;
  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: pageWidth - borderMargin * 2,
    height: pageHeight - borderMargin * 2,
    borderColor: gold,
    borderWidth: 3,
  });

  // Inner decorative border
  const innerMargin = 45;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: pageWidth - innerMargin * 2,
    height: pageHeight - innerMargin * 2,
    borderColor: gold,
    borderWidth: 1,
  });

  // Title: "Certificate of Achievement"
  const title = "Certificate of Achievement";
  const titleWidth = timesRomanBold.widthOfTextAtSize(title, 36);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 100,
    size: 36,
    font: timesRomanBold,
    color: darkBlue,
  });

  // Subtitle: "in Language Proficiency"
  const subtitle = "in Language Proficiency";
  const subtitleWidth = timesRomanItalic.widthOfTextAtSize(subtitle, 18);
  page.drawText(subtitle, {
    x: (pageWidth - subtitleWidth) / 2,
    y: pageHeight - 130,
    size: 18,
    font: timesRomanItalic,
    color: darkBlue,
  });

  // "This certifies that"
  const certifyText = "This certifies that";
  const certifyWidth = timesRoman.widthOfTextAtSize(certifyText, 16);
  page.drawText(certifyText, {
    x: (pageWidth - certifyWidth) / 2,
    y: pageHeight - 180,
    size: 16,
    font: timesRoman,
    color: darkBlue,
  });

  // Student name (large, bold)
  const nameWidth = timesRomanBold.widthOfTextAtSize(data.studentName, 32);
  page.drawText(data.studentName, {
    x: (pageWidth - nameWidth) / 2,
    y: pageHeight - 230,
    size: 32,
    font: timesRomanBold,
    color: teal,
  });

  // Decorative line under name
  const lineWidth = 300;
  page.drawLine({
    start: { x: (pageWidth - lineWidth) / 2, y: pageHeight - 245 },
    end: { x: (pageWidth + lineWidth) / 2, y: pageHeight - 245 },
    thickness: 1,
    color: gold,
  });

  // "has successfully achieved"
  const achievedText = "has successfully achieved";
  const achievedWidth = timesRoman.widthOfTextAtSize(achievedText, 16);
  page.drawText(achievedText, {
    x: (pageWidth - achievedWidth) / 2,
    y: pageHeight - 280,
    size: 16,
    font: timesRoman,
    color: darkBlue,
  });

  // Level and Language (prominent)
  const levelDescription = CEFR_DESCRIPTIONS[data.level] || "";
  const levelText = `${data.level} - ${levelDescription}`;
  const levelWidth = timesRomanBold.widthOfTextAtSize(levelText, 28);
  page.drawText(levelText, {
    x: (pageWidth - levelWidth) / 2,
    y: pageHeight - 320,
    size: 28,
    font: timesRomanBold,
    color: teal,
  });

  // "proficiency in"
  const profText = "proficiency in";
  const profWidth = timesRoman.widthOfTextAtSize(profText, 16);
  page.drawText(profText, {
    x: (pageWidth - profWidth) / 2,
    y: pageHeight - 350,
    size: 16,
    font: timesRoman,
    color: darkBlue,
  });

  // Language name (large)
  const langWidth = timesRomanBold.widthOfTextAtSize(data.language, 28);
  page.drawText(data.language, {
    x: (pageWidth - langWidth) / 2,
    y: pageHeight - 385,
    size: 28,
    font: timesRomanBold,
    color: darkBlue,
  });

  // "as determined by the Common European Framework of Reference for Languages (CEFR)"
  const cefrText = "as determined by the Common European Framework of Reference for Languages (CEFR)";
  const cefrWidth = timesRomanItalic.widthOfTextAtSize(cefrText, 11);
  page.drawText(cefrText, {
    x: (pageWidth - cefrWidth) / 2,
    y: pageHeight - 420,
    size: 11,
    font: timesRomanItalic,
    color: darkBlue,
  });

  // Issue date
  const formattedDate = new Date(data.issuedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateText = `Issued on ${formattedDate}`;
  const dateWidth = timesRoman.widthOfTextAtSize(dateText, 12);
  page.drawText(dateText, {
    x: (pageWidth - dateWidth) / 2,
    y: pageHeight - 460,
    size: 12,
    font: timesRoman,
    color: darkBlue,
  });

  // Certificate number (smaller, at bottom)
  const certNumText = `Certificate No: ${data.certificateNumber}`;
  const certNumWidth = timesRoman.widthOfTextAtSize(certNumText, 10);
  page.drawText(certNumText, {
    x: (pageWidth - certNumWidth) / 2,
    y: 80,
    size: 10,
    font: timesRoman,
    color: darkBlue,
  });

  // Verification URL
  const verifyText = "Verify at: jblinguistics.com/verify";
  const verifyWidth = timesRoman.widthOfTextAtSize(verifyText, 9);
  page.drawText(verifyText, {
    x: (pageWidth - verifyWidth) / 2,
    y: 65,
    size: 9,
    font: timesRoman,
    color: teal,
  });

  // Signature area (left side)
  const sigLineWidth = 150;
  const sigY = 120;

  // Issuer signature line
  page.drawLine({
    start: { x: 120, y: sigY },
    end: { x: 120 + sigLineWidth, y: sigY },
    thickness: 1,
    color: darkBlue,
  });
  const issuerLabel = data.issuerName || "JB Linguistics";
  const issuerWidth = timesRoman.widthOfTextAtSize(issuerLabel, 10);
  page.drawText(issuerLabel, {
    x: 120 + (sigLineWidth - issuerWidth) / 2,
    y: sigY - 15,
    size: 10,
    font: timesRoman,
    color: darkBlue,
  });
  const authorizedText = "Authorized Instructor";
  const authorizedWidth = timesRoman.widthOfTextAtSize(authorizedText, 9);
  page.drawText(authorizedText, {
    x: 120 + (sigLineWidth - authorizedWidth) / 2,
    y: sigY - 28,
    size: 9,
    font: timesRomanItalic,
    color: darkBlue,
  });

  // Organization signature line (right side)
  page.drawLine({
    start: { x: pageWidth - 120 - sigLineWidth, y: sigY },
    end: { x: pageWidth - 120, y: sigY },
    thickness: 1,
    color: darkBlue,
  });
  const orgLabel = "JB Linguistics";
  const orgWidth = timesRoman.widthOfTextAtSize(orgLabel, 10);
  page.drawText(orgLabel, {
    x: pageWidth - 120 - sigLineWidth + (sigLineWidth - orgWidth) / 2,
    y: sigY - 15,
    size: 10,
    font: timesRoman,
    color: darkBlue,
  });
  const orgTitle = "Language Services";
  const orgTitleWidth = timesRoman.widthOfTextAtSize(orgTitle, 9);
  page.drawText(orgTitle, {
    x: pageWidth - 120 - sigLineWidth + (sigLineWidth - orgTitleWidth) / 2,
    y: sigY - 28,
    size: 9,
    font: timesRomanItalic,
    color: darkBlue,
  });

  // Serialize PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Generate and store certificate PDF, returning the storage path
 */
export async function generateAndStoreCertificate(
  certificateId: string,
  data: CertificateData
): Promise<string> {
  const pdfBytes = await generateCertificatePDF(data);

  // Store in Supabase Storage
  const supabase = createSupabaseAdminClient();
  const path = `certificates/${data.certificateNumber}.pdf`;

  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to store certificate: ${error.message}`);
  }

  // Update certificate record with PDF path
  await supabase
    .from("student_certificates")
    .update({ pdf_path: path })
    .eq("id", certificateId);

  return path;
}

/**
 * Get a signed download URL for a certificate
 */
export async function getCertificateDownloadUrl(pdfPath: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(pdfPath, 60 * 60); // 1 hour expiry

  if (error || !data) return null;
  return data.signedUrl;
}
