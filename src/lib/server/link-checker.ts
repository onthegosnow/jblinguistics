import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type LinkStatus = "unchecked" | "valid" | "dead" | "error";

// Known video platforms with their URL patterns
const VIDEO_PATTERNS = [
  { provider: "youtube", pattern: /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/ },
  { provider: "vimeo", pattern: /vimeo\.com\/(?:video\/)?(\d+)/ },
  { provider: "loom", pattern: /loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/ },
  { provider: "wistia", pattern: /wistia\.com\/medias\/([a-zA-Z0-9]+)/ },
];

/**
 * Validate if a URL is a supported video platform
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    return VIDEO_PATTERNS.some((p) => p.pattern.test(url));
  } catch {
    return false;
  }
}

/**
 * Get video embed information from URL
 */
export function getVideoEmbed(url: string): { provider: string; videoId: string; embedUrl: string } | null {
  try {
    for (const { provider, pattern } of VIDEO_PATTERNS) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        let embedUrl = "";
        switch (provider) {
          case "youtube":
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
            break;
          case "vimeo":
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
            break;
          case "loom":
            embedUrl = `https://www.loom.com/embed/${videoId}`;
            break;
          case "wistia":
            embedUrl = `https://fast.wistia.net/embed/iframe/${videoId}`;
            break;
        }
        return { provider, videoId, embedUrl };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is reachable (HEAD request with timeout)
 */
export async function checkUrl(url: string): Promise<LinkStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    // Some sites block HEAD, try GET if we get 405
    if (response.status === 405) {
      const getResponse = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
      });
      return getResponse.ok ? "valid" : "dead";
    }

    return response.ok ? "valid" : "dead";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return "error"; // timeout
    }
    return "dead";
  }
}

/**
 * Check all hive links and update their status in the database
 */
export async function checkAllHiveLinks(): Promise<{
  total: number;
  valid: number;
  dead: number;
  errors: number;
  checked: Array<{ id: string; url: string; status: LinkStatus }>;
}> {
  const supabase = createSupabaseAdminClient();

  // Get all video/link resources that have a URL
  const { data: links, error } = await supabase
    .from("hive_files")
    .select("id, url, resource_type")
    .in("resource_type", ["video", "link"])
    .not("url", "is", null)
    .neq("status", "deleted");

  if (error) throw new Error(error.message);
  if (!links || links.length === 0) {
    return { total: 0, valid: 0, dead: 0, errors: 0, checked: [] };
  }

  const results = {
    total: links.length,
    valid: 0,
    dead: 0,
    errors: 0,
    checked: [] as Array<{ id: string; url: string; status: LinkStatus }>,
  };

  // Check each link (with some parallelism but not too aggressive)
  const batchSize = 5;
  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (link) => {
        const status = await checkUrl(link.url!);
        return { id: link.id, url: link.url!, status };
      })
    );

    for (const result of batchResults) {
      results.checked.push(result);
      if (result.status === "valid") results.valid++;
      else if (result.status === "dead") results.dead++;
      else results.errors++;

      // Update database
      await supabase
        .from("hive_files")
        .update({
          link_status: result.status,
          link_checked_at: new Date().toISOString(),
        })
        .eq("id", result.id);
    }
  }

  return results;
}

/**
 * Check a single link and update its status
 */
export async function checkSingleLink(id: string): Promise<LinkStatus> {
  const supabase = createSupabaseAdminClient();

  const { data: file } = await supabase
    .from("hive_files")
    .select("url")
    .eq("id", id)
    .maybeSingle();

  if (!file?.url) throw new Error("Link not found or has no URL");

  const status = await checkUrl(file.url);

  await supabase
    .from("hive_files")
    .update({
      link_status: status,
      link_checked_at: new Date().toISOString(),
    })
    .eq("id", id);

  return status;
}

/**
 * Get count of dead links for admin dashboard
 */
export async function getDeadLinkCount(): Promise<number> {
  const supabase = createSupabaseAdminClient();

  const { count, error } = await supabase
    .from("hive_files")
    .select("*", { count: "exact", head: true })
    .eq("link_status", "dead")
    .neq("status", "deleted");

  if (error) throw new Error(error.message);
  return count ?? 0;
}
