import { z } from 'zod';

export const authSearchSchema = z.object({
  mode: z.enum(['login', 'register']).default('login').catch('login'),
});

export function confirmationRedirect(origin: string) {
  return `${origin}/auth?mode=login`;
}

export function authErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
  if (code === 'email_not_confirmed') return 'Confirma o teu email antes de entrar. Podes solicitar uma nova mensagem.';
  if (code === 'invalid_credentials') return 'Email ou palavra-passe incorrectos.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Foram feitas muitas tentativas. Aguarda alguns minutos e tenta novamente.';
  if (code === 'signup_disabled' || code === 'email_provider_disabled') return 'O registo está temporariamente indisponível. Tenta novamente mais tarde.';
  if (code === 'weak_password') return 'Escolhe uma palavra-passe mais forte, com pelo menos 8 caracteres.';
  if (error instanceof Error && !code) return error.message;
  return 'Não foi possível concluir a operação. Verifica os dados e tenta novamente.';
}