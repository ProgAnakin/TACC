# Caderninho Digital 📒

CRM pessoal para o dia a dia do varejo — substitui o caderno físico com casos, ligações, lembretes, fotos e comprovante PDF. Feito para uso 100% no celular (PWA instalável).

## Funcionalidades

- **Casos** por categoria: 📦 Aviso de Chegada, 🛠️ Assistência, 🎯 Lead/Interesse, 🚨 Perrengue
- **Filtros e busca** instantânea por nome, telefone, produto ou nº de pedido Shopify
- **Histórico de contatos** (ligação, visita, mensagem, WhatsApp) com contador e timestamps
- **Lembretes** com aviso dentro do app + notificações push no celular (VAPID)
- **Som de notificação configurável** (sino / carrilhão / bipe / silencioso)
- **Fotos** por caso (até 5, com captura pela câmera e compressão automática)
- **Comprovante PDF** para casos de assistência (gerado no cliente, IT/PT)
- **Estatísticas** com períodos (esta semana / mês / mês passado / tudo) e comparação vs. período anterior
- **Arquivo** de casos resolvidos, pesquisável, reabrível e exportável em CSV
- **Puxar para atualizar** (pull-to-refresh) na tela inicial
- **PWA** instalável no iPhone/Android (adicionar à tela inicial), com cache offline
- Login com e-mail e senha — dados isolados por usuário (RLS)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS + shadcn/ui |
| Backend / Auth / Storage | Supabase (Postgres + RLS + Storage) |
| Notificações push | Web Push API (VAPID) + Supabase Edge Function |
| Estado assíncrono | TanStack Query v5 |
| Formulários | React Hook Form + Zod |
| PDF | jsPDF (client-side) |
| PWA | vite-plugin-pwa + Workbox |

## Setup

### 1. Clone e instale dependências

```bash
npm install
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, rode as migrations em ordem (`supabase/migrations/`):
   `001_initial` → `002_service_fields` → `003_lead_outcome` → `004_deal_value` →
   `005_push_subscriptions` → `006_case_photos` → `007_indexes`
3. Copie as credenciais do projeto

```bash
cp .env.example .env
```

Edite `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
# Necessária apenas para notificações push (ver seção abaixo)
VITE_VAPID_PUBLIC_KEY=sua-chave-publica-vapid
```

### 3. Rode em desenvolvimento

```bash
npm run dev
```

### 4. Build para produção

```bash
npm run build
```

## Notificações push (opcional)

Para receber lembretes no celular mesmo com o app fechado:

1. Gere as chaves VAPID:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. **Vercel**: adicione `VITE_VAPID_PUBLIC_KEY` (a chave *pública*) às env vars e faça redeploy.
3. **Supabase → Edge Functions**: faça deploy de `send-push-reminders` e defina os secrets
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT` (ex.: `mailto:voce@email.com`).
4. **Supabase → Database**: habilite as extensões `pg_cron` e `pg_net` e agende a função
   (snippet comentado no fim de `005_push_subscriptions.sql`).

Enquanto o app estiver aberto, os lembretes tocam o som configurado e aparecem no topo da tela —
o push do sistema é só a rede de segurança para quando o app está fechado.

## Instalar como PWA no iPhone

1. Abra o app no Safari
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**
3. O app funciona como nativo — notificações push exigem iOS 16.4+ e o app instalado

## Banco de dados

Tabelas principais (criadas pelas migrations):

- `cases` — casos com categoria, urgência, status, valor de negócio e contador de contatos
- `call_logs` — cada contato registrado para um caso
- `reminders` — lembretes com data/hora e flag de enviado
- `push_subscriptions` — inscrições de push por dispositivo
- `case_photos` — metadados das fotos (arquivos no bucket privado `case-photos`)

Row Level Security (RLS) garante que cada usuário vê apenas seus próprios dados.

## CI

`.github/workflows/ci.yml` roda typecheck, build e lint a cada push/PR.
