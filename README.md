# AGAPE

AGAPE é uma plataforma de relacionamentos cristãos com funcionalidades de rede social, destinada a adultos solteiros de todas as denominações cristãs.

## Funcionalidades implementadas no projecto
- Registo e autenticação por email.
- Perfis pessoais e cristãos.
- Descoberta de membros por cidade e objectivo.
- Pedidos de conversa com aceitação ou recusa.
- Mensagens privadas após aceitação.
- Feed comunitário com publicações e gostos.
- Pedidos de associação de perfis de casal.
- Denúncias, bloqueios e painel administrativo.
- Regras de comunidade e restrição de registo a maiores de 18 anos.

## Stack
React 19, TypeScript, TanStack Start/Router, Tailwind CSS e Supabase Auth/Postgres/Storage com Row Level Security.

## Activação
Configura as variáveis Supabase já utilizadas pelo projecto e aplica as migrações:
```bash
bunx drizzle-kit migrate
```
A migração 0003 cria as tabelas sociais e a migração 0004 cria bloqueios e comentários. Estas migrações ainda precisam de ser aplicadas no projecto Supabase ligado.

A moderação automática por IA e a validação de fotografias de rosto requerem um serviço de moderação e credenciais próprias. As ferramentas de denúncia e revisão administrativa não substituem essa integração.
