import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const blockedPhrases = [
  /\b(vou|vamos|quero)\s+(te\s+)?(matar|assassinar|violar)\b/i,
  /\b(mata|matem|assassina|assassinem)\s+(essa|este|essas|estes)?\s*(pessoa|gente|grupo)\b/i,
  /\b(suicida-te|comete\s+suicidio|deves\s+morrer|mereces\s+morrer)\b/i,
  /\b(abusar\s+sexualmente|violentar\s+sexualmente|explorar\s+sexualmente)\b/i,
  /\b(heil\s+hitler|gas\s+the\s+jews)\b/i,
];

function basicModeration(input: string) {
  const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const flagged = blockedPhrases.some((pattern) => pattern.test(normalized));
  return {
    flagged,
    categories: flagged ? { "threatening-or-abusive": true } : {},
    moderation_method: "basic-fallback",
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Authentication service is not configured" }, { status: 503, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return Response.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders });

    const payload = await request.json() as { text?: string; content_type?: string };
    const text = payload.text?.trim();
    if (!text || text.length > 4000) return Response.json({ error: "Text must contain 1 to 4000 characters" }, { status: 400, headers: corsHeaders });

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      return Response.json({
        ...basicModeration(text),
        content_type: payload.content_type ?? "message",
      }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    try {
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: { Authorization: "Bearer " + openAiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
      });
      if (response.ok) {
        const result = await response.json();
        const moderation = result.results?.[0];
        return Response.json({
          flagged: Boolean(moderation?.flagged),
          categories: moderation?.categories ?? {},
          moderation_method: "ai",
          content_type: payload.content_type ?? "message",
        }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } catch {
      // Use the local safety fallback when the external moderation provider is unavailable.
    }

    return Response.json({
      ...basicModeration(text),
      content_type: payload.content_type ?? "message",
    }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return Response.json({ error: "Could not moderate this content" }, { status: 500, headers: corsHeaders });
  }
});
