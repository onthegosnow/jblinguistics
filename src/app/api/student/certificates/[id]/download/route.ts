import { NextRequest, NextResponse } from "next/server";
import {
  requireStudentFromToken,
  getCertificateById,
  getStudentById,
} from "@/lib/server/student-auth";
import {
  generateCertificatePDF,
  generateAndStoreCertificate,
  getCertificateDownloadUrl,
  type CertificateData,
} from "@/lib/server/certificate-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("x-student-token") ?? undefined;
    const student = await requireStudentFromToken(token);

    const { id } = await params;
    const certificate = await getCertificateById(id);

    if (!certificate) {
      return NextResponse.json({ message: "Certificate not found." }, { status: 404 });
    }

    // Verify this certificate belongs to the student
    if (certificate.studentId !== student.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    // Check if certificate is valid
    if (!certificate.valid) {
      return NextResponse.json({ message: "This certificate has been revoked." }, { status: 400 });
    }

    // If PDF already exists, return signed URL
    if (certificate.pdfPath) {
      const url = await getCertificateDownloadUrl(certificate.pdfPath);
      if (url) {
        return NextResponse.json({ downloadUrl: url });
      }
    }

    // Generate PDF on-demand
    const certData: CertificateData = {
      studentName: student.name,
      language: certificate.language,
      level: certificate.level,
      certificateNumber: certificate.certificateNumber,
      issuedDate: certificate.issuedDate,
      issuerName: certificate.issuerName,
    };

    try {
      const path = await generateAndStoreCertificate(certificate.id, certData);
      const url = await getCertificateDownloadUrl(path);

      if (!url) {
        throw new Error("Failed to generate download URL");
      }

      return NextResponse.json({ downloadUrl: url });
    } catch (genError) {
      console.error("Certificate generation error:", genError);

      // Fallback: generate and return PDF directly
      const pdfBytes = await generateCertificatePDF(certData);

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${certificate.certificateNumber}.pdf"`,
        },
      });
    }
  } catch (err) {
    const status =
      typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500;
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Failed to download certificate." },
      { status }
    );
  }
}
