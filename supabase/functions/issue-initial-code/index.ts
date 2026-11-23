/* global Deno */
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function makeInitialCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]);
  chars[4] = "A";
  chars[9] = "7";
  chars[14] = "!";
  return chars.join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  try {
    const { email, name } = await req.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return json({ error: "Indique um nome e email válidos." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL");
    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
      console.error("Missing required function secrets.");
      return json({ error: "O serviço de registo ainda não está configurado. Contacte o suporte." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const initialCode = makeInitialCode();
    const safeName = escapeHtml(name.trim());
    const { data, error: createError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: initialCode,
      email_confirm: true,
      user_metadata: { full_name: name.trim() },
    });
    if (createError || !data.user) {
      const message = createError?.message ?? "Não foi possível criar a conta.";
      if (/already|registered|exists/i.test(message)) {
        return json({ error: "Este email já está registado. Entre na sua conta." }, 409);
      }
      console.error("User creation failed:", message);
      return json({ error: "Não foi possível criar a conta. Tente novamente." }, 400);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `DA UM TOUCH <${fromEmail}>`,
        to: [email.trim().toLowerCase()],
        subject: "O seu código inicial de acesso — DA UM TOUCH",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#202124"><h1 style="color:#111">DA UM TOUCH</h1><p>Olá, ${safeName},</p><p>A sua conta foi criada. Use o código abaixo para entrar na plataforma:</p><div style="background:#f3f4f6;padding:18px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:3px;border-radius:8px">${initialCode}</div><p>Por segurança, altere este código depois de entrar, nas definições da sua conta. Não partilhe este código com ninguém.</p><p>Bem-vindo à DA UM TOUCH.</p></div>`,
        text: `DA UM TOUCH\n\nOlá, ${name.trim()}. A sua conta foi criada. O seu código inicial de acesso é: ${initialCode}\n\nEntre com o seu email e este código. Depois, altere-o nas definições da sua conta. Não partilhe o código com ninguém.`,
      }),
    });

    if (!emailResponse.ok) {
      const detail = await emailResponse.text();
      console.error("Email delivery failed:", detail);
      await admin.auth.admin.deleteUser(data.user.id);
      return json({ error: "Não foi possível enviar o email com o código. Tente novamente mais tarde." }, 502);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Initial code registration failed:", error);
    return json({ error: "Pedido inválido. Tente novamente." }, 400);
  }
});
