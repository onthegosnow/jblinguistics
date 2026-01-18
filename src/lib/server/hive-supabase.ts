import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type ResourceType = "file" | "video" | "link";
export type LinkStatus = "unchecked" | "valid" | "dead" | "error";

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
  week_number: number | null;
  // New fields for links
  resource_type: ResourceType;
  url: string | null;
  link_status: LinkStatus | null;
  link_checked_at: string | null;
};

export type HivePack = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  level: string | null;
  week_number: number | null;
  cover_image_path: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
};

export type HivePackItem = {
  id: string;
  pack_id: string;
  hive_file_id: string;
  sort_order: number;
  created_at: string;
};

export type HivePackSuggestion = {
  id: string;
  hive_file_id: string;
  pack_id: string | null;
  suggested_by: string | null;
  suggested_by_name: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
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
  return `${parts.join("-")}${ext}`;
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
    weekNumber?: number;
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
      resource_type: "file",
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

  // For video/link resources, no file movement needed
  if (meta.resource_type === "video" || meta.resource_type === "link") {
    const { error } = await supabase
      .from("hive_files")
      .update({
        approved_at: new Date().toISOString(),
        status: "approved",
      })
      .eq("id", params.id);
    if (error) throw new Error(error.message);
    return;
  }

  // For file resources, move to curriculum folder
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

  // Only remove from storage if it's a file with a path
  if (meta.resource_type === "file" && meta.path) {
    await supabase.storage.from(HIVE_BUCKET).remove([meta.path]);
  }

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

export async function updateHiveFile(params: {
  id: string;
  updates: {
    displayName?: string;
    language?: string;
    level?: string;
    skill?: string;
    topic?: string;
    fileType?: string;
    weekNumber?: number | null;
    url?: string;
    description?: string;
  };
}) {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {};
  if (params.updates.displayName !== undefined) updateData.display_name = params.updates.displayName;
  if (params.updates.language !== undefined) updateData.language = params.updates.language;
  if (params.updates.level !== undefined) updateData.level = params.updates.level;
  if (params.updates.skill !== undefined) updateData.skill = params.updates.skill;
  if (params.updates.topic !== undefined) updateData.topic = params.updates.topic;
  if (params.updates.fileType !== undefined) updateData.file_type = params.updates.fileType;
  if (params.updates.url !== undefined) updateData.url = params.updates.url;
  if (params.updates.description !== undefined) updateData.notes = params.updates.description;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No updates provided");
  }

  const { data, error } = await supabase
    .from("hive_files")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error || !data) throw new Error(error?.message ?? "Unable to update file");
  return data as HiveFile;
}

// Replace a rejected file with a new file and resubmit for approval
export async function replaceHiveFile(params: {
  id: string;
  fileDataBase64: string;
  filename: string;
  mime?: string;
  size?: number;
}) {
  const supabase = createSupabaseAdminClient();

  // Get the existing file record
  const { data: existing, error: fetchError } = await supabase
    .from("hive_files")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (fetchError || !existing) {
    throw new Error("File not found");
  }

  if (existing.status !== "rejected") {
    throw new Error("Only rejected files can be replaced");
  }

  // Only allow replacing actual files, not links/videos
  if (existing.resource_type !== "file") {
    throw new Error("Cannot replace link or video resources - please update the URL instead");
  }

  // Delete old file from storage
  if (existing.path) {
    await supabase.storage.from(HIVE_BUCKET).remove([existing.path]);
  }

  // Upload new file to pending folder
  const buffer = Buffer.from(params.fileDataBase64, "base64");
  const pendingPath = `pending/${Date.now()}-${params.filename}`;

  const { error: uploadError } = await supabase.storage
    .from(HIVE_BUCKET)
    .upload(pendingPath, buffer, { contentType: params.mime ?? "application/octet-stream" });

  if (uploadError) throw new Error(uploadError.message);

  // Update the database record - reset to pending status and clear rejection notes
  const { data: updated, error: updateError } = await supabase
    .from("hive_files")
    .update({
      path: pendingPath,
      file_path: pendingPath,
      display_name: params.filename,
      status: "pending",
      notes: null, // Clear rejection notes
      mime_type: params.mime,
      size: params.size,
      uploaded_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (updateError || !updated) throw new Error(updateError?.message ?? "Unable to update file record");
  return updated as HiveFile;
}

// ============ Video/Link Upload Functions ============

export async function uploadHiveLink(params: {
  resourceType: "video" | "link";
  url: string;
  displayName: string;
  metadata: {
    language: string;
    level: string;
    skill: string;
    topic: string;
    fileType: string;
    teacherName: string;
    date: string;
    uploadedBy: string;
    uploadedByEmail: string;
    description?: string;
    weekNumber?: number;
  };
}) {
  const supabase = createSupabaseAdminClient();

  const initials = params.metadata.teacherName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "XX";

  const linkPath = `links/${params.resourceType}/${Date.now()}-${params.displayName.replace(/[^a-zA-Z0-9]/g, "-")}`;

  const { error: insertError, data } = await supabase
    .from("hive_files")
    .insert({
      path: linkPath,
      file_path: linkPath, // Required column
      display_name: params.displayName,
      language: params.metadata.language,
      level: params.metadata.level,
      skill: params.metadata.skill,
      topic: params.metadata.topic,
      file_type: params.metadata.fileType,
      teacher_name: params.metadata.teacherName,
      teacher_initials: initials,
      date: params.metadata.date,
      size: null,
      mime_type: null,
      uploaded_by: params.metadata.uploadedBy,
      uploaded_by_email: params.metadata.uploadedByEmail,
      uploaded_at: new Date().toISOString(),
      status: "pending",
      notes: params.metadata.description || null,
      resource_type: params.resourceType,
      url: params.url,
      link_status: "unchecked",
    })
    .select()
    .maybeSingle();

  if (insertError || !data) throw new Error(insertError?.message ?? "Unable to save link");
  return data as HiveFile;
}

// ============ Classroom Pack Functions ============

export async function createPack(params: {
  name: string;
  description?: string;
  language?: string;
  level?: string;
  weekNumber?: number;
  createdBy?: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("hive_packs")
    .insert({
      name: params.name,
      description: params.description || null,
      language: params.language || null,
      level: params.level || null,
      created_by: params.createdBy || null,
      published: false,
    })
    .select()
    .maybeSingle();

  if (error || !data) throw new Error(error?.message ?? "Unable to create pack");
  return data as HivePack;
}

export async function updatePack(params: {
  id: string;
  name?: string;
  description?: string;
  language?: string;
  level?: string;
  weekNumber?: number;
  published?: boolean;
}) {
  const supabase = createSupabaseAdminClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.name !== undefined) updates.name = params.name;
  if (params.description !== undefined) updates.description = params.description;
  if (params.language !== undefined) updates.language = params.language;
  if (params.level !== undefined) updates.level = params.level;
  if (params.published !== undefined) updates.published = params.published;

  const { data, error } = await supabase
    .from("hive_packs")
    .update(updates)
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error || !data) throw new Error(error?.message ?? "Unable to update pack");
  return data as HivePack;
}

export async function deletePack(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("hive_packs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listPacks(options: { publishedOnly?: boolean } = {}) {
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("hive_packs")
    .select("*, hive_pack_items(count)")
    .order("language", { ascending: true })
    .order("level", { ascending: true });

  if (options.publishedOnly) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((pack) => ({
    ...pack,
    item_count: (pack.hive_pack_items as unknown as { count: number }[])?.[0]?.count ?? 0,
  })) as (HivePack & { item_count: number })[];
}

export async function getPackWithItems(packId: string, options: { includeSignedUrl?: boolean } = {}) {
  const supabase = createSupabaseAdminClient();

  const { data: pack, error: packError } = await supabase
    .from("hive_packs")
    .select("*")
    .eq("id", packId)
    .maybeSingle();

  if (packError || !pack) throw new Error(packError?.message ?? "Pack not found");

  const { data: items, error: itemsError } = await supabase
    .from("hive_pack_items")
    .select("*, hive_files(*)")
    .eq("pack_id", packId)
    .order("sort_order", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  let enrichedItems = (items ?? []).map((item) => ({
    ...item,
    hive_file: item.hive_files as HiveFile,
  }));

  // Add signed URLs for files
  if (options.includeSignedUrl) {
    enrichedItems = await Promise.all(
      enrichedItems.map(async (item) => {
        if (!item.hive_file || item.hive_file.resource_type !== "file" || !item.hive_file.path) {
          return { ...item, hive_file: { ...item.hive_file, signed_url: null } };
        }
        const signed = await supabase.storage.from(HIVE_BUCKET).createSignedUrl(item.hive_file.path, 60 * 60);
        return { ...item, hive_file: { ...item.hive_file, signed_url: signed.data?.signedUrl ?? null } };
      })
    );
  }

  return { pack: pack as HivePack, items: enrichedItems };
}

export async function addItemToPack(packId: string, hiveFileId: string, sortOrder?: number) {
  const supabase = createSupabaseAdminClient();

  // Get max sort order if not provided
  if (sortOrder === undefined) {
    const { data: existing } = await supabase
      .from("hive_pack_items")
      .select("sort_order")
      .eq("pack_id", packId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (existing?.sort_order ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("hive_pack_items")
    .insert({ pack_id: packId, hive_file_id: hiveFileId, sort_order: sortOrder })
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") throw new Error("Item already in pack");
    throw new Error(error.message);
  }
  return data as HivePackItem;
}

export async function removeItemFromPack(packId: string, hiveFileId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("hive_pack_items")
    .delete()
    .eq("pack_id", packId)
    .eq("hive_file_id", hiveFileId);
  if (error) throw new Error(error.message);
}

export async function reorderPackItems(packId: string, itemIds: string[]) {
  const supabase = createSupabaseAdminClient();

  for (let i = 0; i < itemIds.length; i++) {
    await supabase
      .from("hive_pack_items")
      .update({ sort_order: i })
      .eq("pack_id", packId)
      .eq("hive_file_id", itemIds[i]);
  }
}

// ============ Pack Suggestion Functions ============

export async function suggestForPack(params: {
  hiveFileId: string;
  packId?: string;
  suggestedBy: string;
  suggestedByName: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("hive_pack_suggestions")
    .insert({
      hive_file_id: params.hiveFileId,
      pack_id: params.packId || null,
      suggested_by: params.suggestedBy,
      suggested_by_name: params.suggestedByName,
      status: "pending",
    })
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as HivePackSuggestion;
}

export async function listPackSuggestions(options: { status?: string } = {}) {
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("hive_pack_suggestions")
    .select("*, hive_files(*), hive_packs(*)")
    .order("created_at", { ascending: false });

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateSuggestionStatus(id: string, status: "accepted" | "rejected") {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("hive_pack_suggestions")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
