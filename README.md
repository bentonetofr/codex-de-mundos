# 📖 Codex de Mundos

> Sistema de worldbuilding para escritores, mestres de RPG e criadores de universos fictícios.

---

## ✨ Funcionalidades

- **Dashboard** com visão geral de todos os universos
- **Universos** — criar, editar e excluir mundos fictícios com capa
- **Personagens** — CRUD completo com imagem, origem, facção e relações
- **Locais** — reinos, cidades, ruínas, templos e mais
- **Facções** — grupos, organizações, guildas e facções com ideologia e líderes
- **Linha do Tempo** — eventos históricos em timeline visual cronológica
- **Oráculo de Lore** — IA que conhece seu universo e sugere lore, conflitos, nomes e eventos
- **Livro de Lore** — exportação do universo em PDF organizado por seções
- Autenticação via Supabase Auth
- Interface dark premium responsiva (desktop + mobile)

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Banco / Auth / Storage | Supabase |
| IA | Anthropic Claude API |
| PDF | jsPDF + html2canvas |
| Ícones | Lucide React |

---

## 🚀 Instalação e execução local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/codex-de-mundos.git
cd codex-de-mundos
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

### 4. Configure o Supabase

Siga os passos abaixo em ordem.

#### 4.1 Crie um projeto no Supabase

Acesse [supabase.com](https://supabase.com) → New Project.

#### 4.2 Execute o schema SQL

No painel do Supabase, vá em **SQL Editor** → **New query** e execute o conteúdo do arquivo:

```
supabase/schema.sql
```

Isso criará todas as tabelas, triggers, funções e políticas RLS.

#### 4.3 Crie o bucket de storage

No painel do Supabase, vá em **Storage** → **New bucket**:

- Nome: `universe-covers`
- Marque **Public bucket**
- Clique em Create

#### 4.4 Configure a autenticação

Em **Authentication** → **URL Configuration**:

- Site URL: `http://localhost:3000` (dev) ou sua URL de produção
- Redirect URLs: `http://localhost:3000/**`

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 🔑 Variáveis de ambiente

| Variável | Onde encontrar | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | ✅ |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | ⚠️ Opcional (Oráculo fica desativado sem ela) |

---

## 🗄 Schema do banco

O arquivo `supabase/schema.sql` contém:

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis dos usuários (criados automaticamente no signup) |
| `universes` | Universos/mundos fictícios |
| `characters` | Personagens dos universos |
| `locations` | Locais: reinos, cidades, ruínas, etc. |
| `factions` | Facções, organizações e grupos |
| `events` | Eventos históricos da linha do tempo |
| `creatures` | Criaturas e bestiário |
| `religions` | Religiões e panteons |
| `wars` | Guerras e conflitos |
| `lineages` | Linhagens e casas nobres |
| `relations` | Relações entre entidades |
| `map_points` | Pontos no mapa interativo |
| `lore_notes` | Notas de lore livres |

Todas as tabelas têm **RLS (Row Level Security)** ativo — cada usuário vê e edita apenas seus próprios dados.

---

## 📁 Estrutura do projeto

```
codex-de-mundos/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/oracle/route.ts       # Endpoint da IA
│   │   ├── auth/page.tsx             # Login / Signup
│   │   ├── dashboard/page.tsx        # Dashboard principal
│   │   └── universes/
│   │       ├── page.tsx              # Lista de universos
│   │       ├── new/page.tsx          # Criar universo
│   │       └── [id]/                 # Módulos do universo
│   │           ├── page.tsx          # Visão geral
│   │           ├── characters/       # Personagens
│   │           ├── locations/        # Locais
│   │           ├── factions/         # Facções
│   │           ├── events/           # Linha do tempo
│   │           ├── oracle/           # Oráculo IA
│   │           ├── lore-book/        # Livro de Lore / PDF
│   │           ├── creatures/        # Criaturas
│   │           ├── religions/        # Religiões
│   │           ├── wars/             # Guerras
│   │           ├── lineages/         # Linhagens
│   │           └── notes/            # Notas de lore
│   ├── components/
│   │   ├── ui/                       # Componentes base (Button, Card, Input, Modal…)
│   │   ├── layout/                   # Sidebar, MobileNav, UniverseLayout
│   │   └── features/                 # Componentes de funcionalidade com CRUD
│   ├── lib/
│   │   ├── supabase/                 # Clients browser e server
│   │   └── utils.ts                  # Utilitários e labels
│   └── types/index.ts                # Tipagem global TypeScript
├── supabase/
│   └── schema.sql                    # Schema completo do banco
├── .env.local.example
├── package.json
└── README.md
```

---

## 🤖 Oráculo de Lore (IA)

O Oráculo usa a API da Anthropic (Claude) para responder perguntas sobre seu universo. Ele recebe automaticamente o contexto do universo selecionado — personagens, locais e facções cadastrados.

**Exemplos de perguntas:**
- "Crie uma lenda sobre a origem do Reino de Midfold"
- "Sugira 3 conflitos para as facções do universo"
- "Dê um nome épico para a capital do império"
- "Expanda a história da personagem Lyra Thornwood"

Se a `ANTHROPIC_API_KEY` não estiver configurada, o Oráculo mostra uma mensagem de aviso sem quebrar o app.

---

## 📄 Exportação PDF

A página **Livro de Lore** organiza todo o conteúdo do universo em formato de documento e permite exportar como PDF com um clique. O PDF inclui:

- Capa com título do universo
- Seção de personagens
- Seção de locais
- Seção de facções
- Seção de eventos históricos

---

## 🧩 Expansões futuras planejadas

- [ ] Mapa interativo com pins clicáveis
- [ ] Árvore genealógica visual
- [ ] Grafo de relações entre entidades
- [ ] CRUD completo para Criaturas, Religiões, Guerras e Linhagens
- [ ] Modo colaborativo (múltiplos usuários no mesmo universo)
- [ ] Temas de interface por gênero (fantasy, sci-fi, horror)

---

## 📜 Licença

MIT — use, adapte e contribua à vontade.
