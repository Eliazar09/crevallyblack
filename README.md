# Crevally Black — Streetwear Premium

Loja de roupas Crevally Black. Stack moderno com identidade visual forte e urbana: branco + preto + marrom coffee.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v3** com tokens de cor customizados (coffee, neutral)
- **Framer Motion** — animações, scroll reveal, page transitions
- **React Router v7** — navegação SPA
- **Zustand** — carrinho persistido no localStorage
- **Supabase** — banco de dados e autenticação
- **Lucide React** — ícones
- **jsPDF** — geração de fatura PDF ao finalizar pedido

## Como rodar

```bash
npm install
npm run dev
npm run build
npm run preview
```

O site roda em `http://localhost:5173` por padrão.

## Variáveis de ambiente

Crie um `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
VITE_APP_URL=https://crevallyblack.com.br
```

## Estrutura

```
src/
├── components/
│   ├── layout/      Navbar, Footer, MobileMenu
│   ├── ui/          Button, Badge, Modal, Input
│   ├── home/        Hero, BenefitsMarquee, Categories, Featured, Testimonials, CTASection
│   ├── shop/        ProductCard, Filters, ProductQuickView
│   ├── cart/        CartDrawer, CartItem, CheckoutForm
│   └── kits/        KitTiers, ProfitCalculator
├── pages/           Home, Shop, Product, Kits, About, Contact
├── data/            products.ts, kits.ts, categories.ts, testimonials.ts
├── hooks/           useCart, useCursorGlow, useScrollReveal
├── lib/             cn.ts, currency.ts, whatsapp.ts, invoice.ts
└── styles/          globals.css
```

## Rotas

| Rota | Página |
|------|--------|
| `/` | Home |
| `/loja` | Catálogo completo |
| `/produto/:id` | Detalhe do produto |
| `/kits` | Programa atacado |
| `/sobre` | História da marca |
| `/contato` | Contato e FAQ |

## Fluxo do carrinho

1. Usuário adiciona produtos na `/loja` ou via ProductCard
2. Cart Drawer abre (desliza da direita)
3. Ao finalizar, exibe formulário de dados (nome, telefone, endereço)
4. Gera PDF da fatura com jsPDF
5. Abre WhatsApp com mensagem pré-preenchida

## Deploy na Vercel

1. Push para o repositório GitHub
2. Importar na Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configurar as variáveis de ambiente no painel da Vercel

## Supabase — Schema

Rode o SQL em `scripts/schema.sql` no Supabase SQL Editor para criar as tabelas.
Para popular com produtos de exemplo:

```bash
node scripts/seed.mjs
```
