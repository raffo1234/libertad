import type { APIRoute } from "astro";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client } from "../../lib/r2";
import { supabase } from "../../lib/supabase";

export const DELETE: APIRoute = async ({ request }) => {
  // 1. Auth check
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  // 2. Parse body
  let r2Key: string;
  try {
    const body = await request.json();
    r2Key = body.r2Key;
    if (!r2Key) throw new Error("Missing r2Key");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  // 3. Delete from R2
  try {
    const client = createR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: import.meta.env.R2_BUCKET_NAME,
        Key: r2Key,
      }),
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[r2-delete] Error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to delete from R2",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 },
    );
  }
};
