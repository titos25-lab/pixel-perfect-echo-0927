# Configuração do envio de códigos iniciais — DA UM TOUCH

A função `issue-initial-code` cria a conta no Supabase Auth e envia um código inicial por email através da Resend API. O código é a palavra-passe inicial da conta; o utilizador pode substituí-lo em **Minha conta → Segurança e código de acesso**.

## Requisitos

1. Uma conta Resend com um domínio de envio verificado.
2. O endereço remetente verificado no Resend (por exemplo, `acesso@seudominio.co.mz`).
3. Supabase CLI autenticada e ligada ao projecto `yqhwkmmvbajxehlbaasd`.

## Configurar os segredos

No terminal, a partir da raiz do repositório:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set FROM_EMAIL=acesso@seudominio.co.mz
```

O Supabase disponibiliza `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente das Edge Functions. **Nunca** coloque a service role key no frontend, no GitHub ou em ficheiros públicos.

## Publicar a Edge Function

```bash
supabase functions deploy issue-initial-code --project-ref yqhwkmmvbajxehlbaasd
```

O nome apresentado ao destinatário será **DA UM TOUCH**. O endereço real do remetente é o valor verificado configurado em `FROM_EMAIL`.

## Teste recomendado

1. Abra a página de registo da DA UM TOUCH.
2. Crie uma conta com um email que possa consultar.
3. Confirme que recebeu a mensagem com assunto **O seu código inicial de acesso — DA UM TOUCH**.
4. Entre com email e código recebido.
5. Em Minha conta, altere o código e confirme que consegue entrar com o novo código.
