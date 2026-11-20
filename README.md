# LigaPro MZ

**LigaPro MZ** é uma plataforma moçambicana de descoberta de profissionais e empresas. Ajuda clientes a encontrar prestadores de serviços por categoria e localização, consultar os seus perfis e entrar em contacto.

**Aplicação:** https://pixel-perfect-echo-0927.lovable.app  
**Repositório:** https://github.com/titos25-lab/pixel-perfect-echo-0927

## Funcionalidades actuais

- Pesquisa de profissionais por serviço, especialidade e localização.
- Categorias para saúde, psicologia, advocacia, fotografia, beleza, educação, tecnologia, consultoria, construção, automóveis, eventos, limpeza, marketing e outros serviços.
- Perfis públicos de profissionais e empresas.
- Registo e autenticação de clientes e profissionais.
- Edição e publicação do perfil profissional.
- Página de planos com opções gratuitas e subscrições mensais.
- Interface responsiva em português (Moçambique).

## Planos mensais

| Plano | Preço mensal |
| --- | ---: |
| Gratuito | 0 MT |
| Basic | 150 MT |
| Professional | 350 MT |
| Premium | 750 MT |
| Business | 1.500 MT |

Os planos pagos são solicitados na plataforma e, nesta fase, a validação do pagamento e a activação são manuais. Não existe cobrança automática ou renovação automática implementada.

## Stack técnica

- React + TypeScript
- TanStack Start e TanStack Router
- Tailwind CSS e componentes shadcn/ui
- Supabase para autenticação, base de dados e armazenamento
- Vitest e ESLint

## Desenvolvimento local

Requisitos: Node.js compatível com o projecto e npm ou Bun.

```bash
git clone https://github.com/titos25-lab/pixel-perfect-echo-0927.git
cd pixel-perfect-echo-0927
npm install
npm run dev
```

Comandos disponíveis:

```bash
npm run build
npm run lint
npm test
```

## Configuração e segurança

- Configure as variáveis de ambiente exigidas pela integração Supabase no ambiente de desenvolvimento e no painel de Secrets do Lovable.
- Nunca adicione `.env`, tokens, palavras-passe, chaves privadas ou credenciais ao Git.
- O ficheiro `.env.example` pode conter apenas nomes de variáveis e valores fictícios, nunca segredos reais.
- As chaves privadas e operações privilegiadas devem permanecer no servidor.
- Antes de publicar alterações, execute build, lint e testes.

## Desenvolvimento com Lovable

O projecto está ligado ao Lovable. Alterações feitas na branch principal podem sincronizar para o editor Lovable. Evite reescrever o histórico Git publicado; faça alterações através de novos commits.
