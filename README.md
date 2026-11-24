# AGAPE

AGAPE é uma plataforma de relacionamentos cristãos com funcionalidades de rede social, destinada a adultos solteiros de todas as denominações cristãs.

## Funcionalidades no código
- Registo e autenticação por email, com idade mínima de 18 anos.
- Perfis pessoais e cristãos, localização, denominação, profissão e área de serviço.
- Descoberta de membros e filtros por cidade e objectivo.
- Pedidos de conversa que o destinatário pode aceitar ou recusar.
- Mensagens privadas apenas depois da aceitação.
- Feed com publicações, gostos e comentários.
- Check-in bilateral após 14 dias de conexão.
- Convites para associar perfis de casal em Nossa Jornada.
- Denúncias, bloqueios e painel administrativo.
- Moderação automática de texto e verificação de fotografias de perfil por IA, através de funções Supabase.

## Stack
React 19, TypeScript, TanStack Start/Router, Tailwind CSS, Supabase Auth/Postgres/Storage e Row Level Security.

## Configuração e activação
Configura as variáveis Supabase já utilizadas pelo projecto e aplica todas as migrações:
```bash
bunx drizzle-kit migrate
```
As migrações 0003 a 0011 criam perfis sociais, mensagens, feed, segurança, check-ins e bloqueios.

Configura o segredo `OPENAI_API_KEY` no projecto Supabase e publica as funções:
```bash
supabase secrets set OPENAI_API_KEY=...
supabase functions deploy moderate-content --project-ref yqhwkmmvbajxehlbaasd
supabase functions deploy verify-profile-photo --project-ref yqhwkmmvbajxehlbaasd
```
A função de moderação é chamada antes de publicar posts, comentários e enviar mensagens. Se a função ou a chave não estiver disponível, o conteúdo não é enviado. A função de fotografias rejeita imagens que não mostrem um rosto claramente visível, bem como imagens inadequadas. A revisão automática pode errar e não constitui verificação de identidade nem prova de idade.

## Privacidade
O conteúdo de publicações, comentários e mensagens submetido à moderação é enviado ao fornecedor de moderação por IA para análise. Esta utilização deve estar descrita na política de privacidade e nos termos da plataforma. A política pública de privacidade está disponível em /privacidade. As informações de igreja são opcionais e o utilizador pode deixá-las em branco.
