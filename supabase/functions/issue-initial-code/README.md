# Registo e códigos permanentes — Dá Um Touch

A Edge Function `issue-initial-code` cria uma conta no Supabase Auth, guarda nome, idade e tipo de conta nos metadados do utilizador e envia por email um código permanente de acesso através da Resend API. O utilizador não escolhe uma palavra-passe durante o registo. O código recebido funciona como credencial de entrada e pode ser alterado depois em **Minha conta → Segurança e código de acesso**.

## Requisitos

1. Uma conta Resend com um domínio de envio verificado.
2. O endereço remetente verificado no Resend.
3. Supabase CLI autenticada e ligada ao projecto `yqhwkmmvbajxehlbaasd`.

## Segredos da Edge Function

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set FROM_EMAIL=acesso@seudominio.co.mz
supabase secrets set APP_URL=https://pixel-perfect-echo-0927.lovable.app
```

O Supabase disponibiliza `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente das Edge Functions. Nunca coloque a service role key no frontend, no GitHub ou em ficheiros públicos.

## Aplicar a migração da base de dados

A migração `drizzle/migrations/0001_daum_touch_accounts_and_moderation.sql` acrescenta idade, atribui a função de administrador exclusivamente ao email autorizado, remove perfis de demonstração e activa os campos e permissões de destaque Premium.

No ambiente que tenha a variável segura `LOVABLE_DB_MIGRATION_URL` configurada:

```bash
bunx drizzle-kit migrate
```

## Publicar a Edge Function

```bash
supabase functions deploy issue-initial-code --project-ref yqhwkmmvbajxehlbaasd
```

## Teste recomendado

1. Abra a Dá Um Touch e escolha **Criar conta**.
2. Seleccione **Sou cliente** ou **Sou profissional**.
3. Preencha nome completo, idade e email.
4. Confirme que recebe o código permanente e a ligação para a página **Entrar**.
5. Entre com email e código.
6. Na área pessoal, altere o código e confirme que consegue entrar com o novo código.
7. Confirme que a área administrativa só abre com o email autorizado e que consegue verificar, publicar, destacar por 30 dias e remover perfis profissionais.