# Caderninho Digital 📒

CRM pessoal para o dia a dia do varejo — substitui o caderno físico com casos, ligações, lembretes e comprovante PDF.

## Funcionalidades

- **Casos** por categoria: 📦 Aviso de Chegada, 🛠️ Assistência, 🎯 Lead/Interesse, 🚨 Perrengue
- **Filtros e busca** por nome, telefone, produto ou nº de pedido Shopify
- **Histórico de ligações** com contador e timestamps
- **Lembretes** com notificações push (navegador)
- **Comprovante PDF** para casos de assistência (gerado no cliente)
- **Arquivo** de casos resolvidos, pesquisável e reabríveis
- **PWA** instalável no iPhone/Android (adicionar à tela inicial)
- Login com e-mail e senha — dados isolados por usuário (RLS)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS + shadcn/ui |
| Backend / Auth | Supabase (Postgres + RLS) |
| Estado assíncrono | TanStack Query v5 |
| Formulários | React Hook Form + Zod |
| PDF | jsPDF (client-side) |
| PWA | vite-plugin-pwa + Workbox |
| Notificações | Web Notifications API |

## Setup

### 1. Clone e instale dependências

```bash
npm install
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/migrations/001_initial.sql` no SQL Editor
3. Copie as credenciais do projeto

```bash
cp .env.example .env
```

Edite `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Rode em desenvolvimento

```bash
npm run dev
```

### 4. Build para produção

```bash
npm run build
```

## Instalar como PWA no iPhone

1. Abra o app no Safari
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**
3. O app funciona como nativo — notificações push funcionam com iOS 16.4+

## Banco de dados

As tabelas são criadas via `supabase/migrations/001_initial.sql`:

- `cases` — casos com categoria, urgência, status e contador de ligações
- `call_logs` — cada ligação registrada para um caso
- `reminders` — lembretes com data/hora e flag de enviado

Row Level Security (RLS) garante que cada usuário vê apenas seus próprios dados.
