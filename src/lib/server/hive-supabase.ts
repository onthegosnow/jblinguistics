import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type HiveFile = {
  id: string;
  path: string;
  display_name: string;
  language: string | null;
  level: string | null;
  skill: string | null;
  topic: string | null;
  file_type: string | null;
  teacher_name: string | null;
  teacher_initials: string | null;
  date: string | null;
  size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_by_email: string | null;
  uploaded_at: string | null;
  approved_at: string | null;
  status: "pending" | "approved" | "deleted" | "rejected" | null;
  notes: string | null;
};

const HIVE_BUCKET = process.env.HIVE_BUCKET ?? "hive-mind";

export function buildHiveFilename(params: {
  level: string;
  skill: string;
  topic: string;
  descriptor?: string;
  fileType: string;
  teacherName: string;
  date: string;
  extension: string;
}) {
  const initials = params.teacherName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "XX";
  const clean = (s: string) =>
    s
      .replace(/[\\/:]+/g, " ") // collapse slashes/colons to space
      .split(/\s+/)
      .filter(Boolean)
      .join("")
      .replace(/[^a-zA-Z0-9]/g, "");
  const descriptor = params.descriptor ? clean(params.descriptor) : "";
  const level = clean(params.level);
  const skill = clean(params.skill);
  const topic = clean(params.topic) || "Topic";
  const type = clean(params.fileType) || "File";
  const date = params.date.replace(/-/g, "") || new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ext = params.extension.startsWith(".") ? params.extension : `.${params.extension}`;
  const parts = [level, skill, topic, type];
  if (descriptor) parts.push(descriptor);
  parts.push(initials, date);
  return `${parts.join("_")}${ext}`;
}

export async function uploadHivePending(params: {
  fileDataBase64: string;
  filename: string;
  metadata: {
    language: string;
    level: string;
    skill: string;
    topic: string;
    descriptor?: string;
    fileType: string;
    teacherName: string;
    date: string;
    uploadedBy: string;
    uploadedByEmail: string;
    size?: number;
    mime?: string;
  };
}) {
  const supabase = createSupabaseAdminClient();
  const pendingPath = `06 - Teacher Submissions/Pending Review/${params.filename}`;
  const buffer = Buffer.from(params.fileDataBase64, "base64");
  const { error: uploadError } = await supabase.storage
    .from(HIVE_BUCKET)
    .upload(pendingPath, buffer, { upsert: true, contentType: params.metadata.mime || "application/octet-stream" });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError, data } = await supabase
    .from("hive_files")
    .insert({
      path: pendingPath,
      // legacy column if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(true && { file_path: pendingPath } as any),
      display_name: params.filename,
      language: params.metadata.language,
      level: params.metadata.level,
      skill: params.metadata.skill,
      topic: params.metadata.topic,
      file_type: params.metadata.fileType,
      teacher_name: params.metadata.teacherName,
      teacher_initials: params.metadata.teacherName
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0]?.toUpperCase())
        .join(""),
      date: params.metadata.date,
      size: params.metadata.size ?? buffer.length,
      mime_type: params.metadata.mime ?? "application/octet-stream",
      uploaded_by: params.metadata.uploadedBy,
      uploaded_by_email: params.metadata.uploadedByEmail,
      uploaded_at: new Date().toISOString(),
      status: "pending",
      notes: params.metadata.descriptor || null,
    })
    .select()
    .maybeSingle();
  if (insertError || !data) throw new Error(insertError?.message ?? "Unable to save hive metadata");
  return data as HiveFile;
}

export async function listHiveFiles(options: { includePending?: boolean; userId?: string; includeSignedUrl?: boolean } = {}) {
  const supabase = createSupabaseAdminClient();
  const query = supabase.from("hive_files").select("*").order("uploaded_at", { ascending: false });
  const { data, error } = options.includePending ? await query : await query.eq("status", "approved");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as HiveFile[];

  // attach signed URLs if requested
  let enriched = rows;
  if (options.includeSignedUrl) {
    enriched = await Promise.all(
      rows.map(async (row) => {
        if (!row.path) return { ...row, signed_url: null };
        const signed = await supabase.storage.from(HIVE_BUCKET).createSignedUrl(row.path, 60 * 60);
        return { ...row, signed_url: signed.data?.signedUrl ?? null };
      })
    );
  }

  if (options.includePending) {
    const approved = enriched.filter((r) => r.status === "approved");
    const pending = options.userId
      ? enriched.filter((r) => r.status === "pending" && r.uploaded_by === options.userId)
      : enriched.filter((r) => r.status === "pending");
    const rejected = options.userId
      ? enriched.filter((r) => r.status === "rejected" && r.uploaded_by === options.userId)
      : enriched.filter((r) => r.status === "rejected");
    return { approved, pending, rejected };
  }
  return { approved: enriched, pending: [] as HiveFile[], rejected: [] as HiveFile[] };
}

export async function approveHiveFile(params: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: file } = await supabase.from("hive_files").select("*").eq("id", params.id).maybeSingle();
  if (!file) throw new Error("File not found");
  const meta = file as HiveFile;
  const dest =
    meta.level && meta.skill && meta.topic
      ? `01 - Curriculum/${meta.level}/${meta.skill}/${meta.topic}/${meta.display_name}`
      : `03 - Lesson Packs/${meta.display_name}`;

  // move file in storage
  const moveResult = await supabase.storage.from(HIVE_BUCKET).move(meta.path, dest);
  if (moveResult.error) {
    // fallback copy+remove
    await supabase.storage.from(HIVE_BUCKET).copy(meta.path, dest);
    await supabase.storage.from(HIVE_BUCKET).remove([meta.path]);
  }

  const { error } = await supabase
    .from("hive_files")
    .update({
      path: dest,
      // legacy column if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(true && { file_path: dest } as any),
      approved_at: new Date().toISOString(),
      status: "approved",
    })
    .eq("id", params.id);
  if (error) throw new Error(error.message);
}

export async function deleteHiveFile(params: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: file } = await supabase.from("hive_files").select("*").eq("id", params.id).maybeSingle();
  if (!file) throw new Error("File not found");
  const meta = file as HiveFile;
  await supabase.storage.from(HIVE_BUCKET).remove([meta.path]);
  const { error } = await supabase.from("hive_files").update({ status: "deleted" }).eq("id", params.id);
  if (error) throw new Error(error.message);
}

export async function rejectHiveFile(params: { id: string; note?: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: file } = await supabase.from("hive_files").select("*").eq("id", params.id).maybeSingle();
  if (!file) throw new Error("File not found");
  const { error } = await supabase
    .from("hive_files")
    .update({
      status: "rejected",
      notes: params.note ?? null,
    })
    .eq("id", params.id);
  if (error) throw new Error(error.message);
}
