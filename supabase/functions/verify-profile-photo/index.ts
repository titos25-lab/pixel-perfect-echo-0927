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
    if (!supabaseUrl || !supabaseKey || !openAiKey) return Response.json({ error: "Photo verification is not configured" }, { status: 503, headers: corsHeaders });
    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return Response.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders });
    const payload = await request.json() as { image_url?: string };
    const imageUrl = payload.image_url;
    const expectedPrefix = supabaseUrl.replace(/\/+$/, "") + "/storage/v1/object/public/agape-member-photos/" + user.id + "/";
    if (!imageUrl || !imageUrl.startsWith(expectedPrefix)) return Response.json({ error: "Invalid profile image URL" }, { status: 400, headers: corsHeaders });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + openAiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a profile-photo safety reviewer. Do not identify the person or estimate their age, identity, ethnicity, gender, religion, or any sensitive trait. Decide only whether the image is suitable as a profile photo. Return JSON with keys approved (boolean) and reason (short string). Approve only when one clearly visible human face is the main subject, the image is a normal non-explicit portrait, and it is not a logo, landscape, building, church interior, object, group photo, or image of another person's artwork. Reject sexual, nude, violent, hateful, deceptive, or non-face images. If uncertain, reject." },
          { role: "user", content: [{ type: "text", text: "Review this uploaded AGAPE profile photo. Does it show one clear face as the main subject and meet the stated rules?" }, { type: "image_url", image_url: { url: imageUrl } }] }
        ]
      })
    });
    if (!response.ok) return Response.json({ error: "Photo review provider unavailable" }, { status: 502, headers: corsHeaders });
    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content ?? "{}";
    let verdict: { approved?: boolean; reason?: string } = {};
    try { verdict = JSON.parse(raw); } catch { verdict = { approved: false, reason: "Could not verify this photo" }; }
    return Response.json({ approved: verdict.approved === true, reason: verdict.reason ?? "" }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch {
    return Response.json({ error: "Could not verify this photo" }, { status: 500, headers: corsHeaders });
  }
});
