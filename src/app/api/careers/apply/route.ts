import { NextResponse } from "next/server";
import { appendApplication } from "@/lib/server/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const languages = String(formData.get("languages") || "").trim();
    const experience = String(formData.get("experience") || "").trim();
    const availability = String(formData.get("availability") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const landing = String(formData.get("landing") || "").trim() || undefined;
    const roles = formData.getAll("roles").map((value) => String(value));

    const resume = formData.get("resume");
    if (!name || !email || !(resume instanceof File)) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    if (resume.size === 0) {
      return NextResponse.json({ message: "Resume file is empty." }, { status: 400 });
    }
    if (resume.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Resume exceeds 5 MB limit." }, { status: 400 });
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const record = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      name,
      email,
      location: location || undefined,
      languages: languages || undefined,
      experience: experience || undefined,
      availability: availability || undefined,
      message: message || undefined,
      landing,
      roles: roles.length ? roles : ["translator"],
      resume: {
        filename: resume.name || "resume.pdf",
        mimeType: resume.type || "application/octet-stream",
        size: resume.size,
        data: buffer.toString("base64"),
      },
    };

    await appendApplication(record);

    return NextResponse.json({ success: true, message: "Application received." });
  } catch (err) {
    console.error("Careers application error", err);
    return NextResponse.json({ message: "Unable to submit application." }, { status: 500 });
  }
}
