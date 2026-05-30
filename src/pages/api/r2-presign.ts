import type { APIRoute } from "astro";
import { generatePresignedUploadUrl } from "../../lib/r2";
import { supabase } from "../../lib/supabase";

// ─── Allowed file types ───────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// ─── Route ────────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  // 1. Auth check
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Parse body
  let body: { filename: string; contentType: string; folder: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const { filename, contentType, folder } = body;

  if (!filename || !contentType || !folder) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  // 3. Validate content type
  if (!ALLOWED_TYPES.has(contentType)) {
    return new Response(JSON.stringify({ error: "File type not allowed" }), { status: 400 });
  }

  // 4. Generate presigned URL
  try {
    const result = await generatePresignedUploadUrl(folder, filename, contentType);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[r2-presign] Error generating presigned URL:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to generate upload URL",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 },
    );
  }
};
