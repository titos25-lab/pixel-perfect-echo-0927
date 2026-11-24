import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!supabaseUrl || !supabaseKey || !openAiKey) {
      return Response.json({ error: "Moderation service is not configured" }, { status: 503, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return Response.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders });

    const payload = await request.json() as { text?: string; content_type?: string };
    const text = payload.text?.trim();
    if (!text || text.length > 4000) return Response.json({ error: "Text must contain 1 to 4000 characters" }, { status: 400, headers: corsHeaders });

    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { Authorization: "Bearer " + openAiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
    });
    if (!response.ok) return Response.json({ error: "Moderation provider unavailable" }, { status: 502, headers: corsHeaders });

    const result = await response.json();
    const moderation = result.results?.[0];
    return Response.json({
      flagged: Boolean(moderation?.flagged),
      categories: moderation?.categories ?? {},
      content_type: payload.content_type ?? "message",
    }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return Response.json({ error: "Could not moderate this content" }, { status: 500, headers: corsHeaders });
  }
});
