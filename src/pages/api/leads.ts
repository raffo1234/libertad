export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const { name, phone, email, unit_type, utm_source, utm_medium, utm_campaign } = body;

  if (!name || !phone) {
    return new Response(JSON.stringify({ error: "Name and phone are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabaseAdmin
    .from("lead")
    .insert({ name, phone, email, unit_type, utm_source, utm_medium, utm_campaign });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
