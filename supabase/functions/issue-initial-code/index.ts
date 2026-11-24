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
    const { email, name, age, accountType } = await req.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
        !Number.isInteger(age) || age < 18 || age > 100 ||
        !["client", "professional"].includes(accountType)) {
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
    const appUrl = (Deno.env.get("APP_URL") || req.headers.get("origin") || "").replace(/\\/$/, "");
    const loginUrl = appUrl ? `${appUrl}/auth?modo=entrar` : "";
    const loginButton = loginUrl ? `<p style="margin:28px 0"><a href="${loginUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:13px 22px;border-radius:8px;font-weight:bold">Voltar à Dá Um Touch e entrar</a></p>` : "";
    const { data, error: createError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: initialCode,
      email_confirm: true,
      user_metadata: { full_name: name.trim(), age: String(age), account_type: accountType },
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
        from: `Dá Um Touch <${fromEmail}>`,
        to: [email.trim().toLowerCase()],
        subject: "O seu código permanente de acesso — Dá Um Touch",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#202124"><h1 style="color:#111">Dá Um Touch</h1><p>Olá, ${safeName},</p><p>A sua conta foi criada. Este é o seu código permanente de acesso:</p><div style="background:#f3f4f6;padding:18px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:3px;border-radius:8px">${initialCode}</div><p>Volte à plataforma e escolha <strong>Entrar</strong>. Introduza o seu email e este código. Não precisa de criar uma palavra-passe.</p>${loginButton}<p>Guarde este código num local seguro. Ele continuará válido até ser alterado por si nas definições da conta. Nunca o partilhe com ninguém.</p><p>Bem-vindo à Dá Um Touch.</p></div>`,
        text: `Dá Um Touch

Olá, ${name.trim()}. A sua conta foi criada. O seu código permanente de acesso é: ${initialCode}

Volte à plataforma, escolha Entrar e introduza o seu email e este código. Não precisa de criar uma palavra-passe.

${loginUrl ? `Aceder à página de entrada: ${loginUrl}

` : ""}Guarde o código num local seguro. Ele continuará válido até ser alterado por si. Não o partilhe com ninguém.`,
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
