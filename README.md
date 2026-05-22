# GreenLife — Bienestar Natural desde Venezuela

Redesign completo del sitio GreenLife. Stack moderno con identidad visual "Botanical Tech": verde-floresta + detalles dorados + tipografía editorial.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS v3** con tokens de color customizados
- **Framer Motion** — animaciones, scroll reveal, page transitions
- **React Router v6** — navegación SPA
- **Zustand** — carrito persistido en localStorage
- **Lucide React** — íconos
- **jsPDF** — generación de factura PDF al finalizar pedido

## Cómo correr

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

El sitio corre en `http://localhost:5173` por defecto.

## Estructura

```
src/
├── components/
│   ├── layout/      Navbar, Footer, MobileMenu
│   ├── ui/          Button, Badge, Modal, Input
│   ├── home/        Hero, BenefitsMarquee, Categories, Featured, HowItWorks, Testimonials, InstagramGrid, CTASection
│   ├── shop/        ProductCard, Filters, ProductQuickView
│   ├── cart/        CartDrawer, CartItem, CheckoutForm
│   └── kits/        KitTiers, ProfitCalculator
├── pages/           Home, Shop, Product, Kits, About, Contact
├── data/            products.ts, kits.ts, categories.ts, testimonials.ts
├── hooks/           useCart, useCursorGlow, useScrollReveal
├── lib/             cn.ts, currency.ts, whatsapp.ts, invoice.ts
└── styles/          globals.css
```

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Home |
| `/tienda` | Catálogo completo |
| `/producto/:id` | Detalle de producto |
| `/kits` | Programa mayorista |
| `/acerca` | Historia de la marca |
| `/contacto` | Contacto y FAQ |

## Flujo de carrito

1. Usuario agrega productos desde `/tienda` o cualquier ProductCard
2. Cart Drawer se abre (desliza desde la derecha)
3. Al finalizar, muestra form de datos (nombre, cédula, dirección, etc.)
4. Genera PDF de factura con jsPDF
5. Abre WhatsApp con mensaje pre-completado al +584128590616

## Deploy en Vercel

1. Push al repositorio GitHub
2. Importar en Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. No requiere variables de entorno

## Assets

- Imágenes en `public/images/products/` — product-p{id}.jpg
- Logo: `public/logo.jpg`
- Fuentes: Google Fonts (Fraunces + Inter + JetBrains Mono)
