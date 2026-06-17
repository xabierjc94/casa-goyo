# Casa Goyo Restaurant App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (ES/EN) web app for Restaurante Casa Goyo with a mobile-first digital menu (accessed via QR), online reservations, restaurant info, photo gallery, and a full admin panel for the owner to manage all content.

**Architecture:** Next.js 14 App Router with a `[locale]` segment for i18n (next-intl), a separate `/admin` route protected by Supabase Auth, and Supabase as the backend (PostgreSQL + Storage + Auth). All public content is fetched server-side for performance; the admin panel uses client components for interactivity.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (DB + Storage + Auth), Framer Motion, next-intl, shadcn/ui, React Hook Form, Zod, Resend (email)

---

## File Map

```
casa-goyo/
├── app/
│   ├── [locale]/                         # Public app (ES/EN)
│   │   ├── layout.tsx                    # Root layout with nav + footer
│   │   ├── page.tsx                      # Carta (digital menu)
│   │   ├── reservas/
│   │   │   └── page.tsx                  # Reservations form
│   │   ├── info/
│   │   │   └── page.tsx                  # Restaurant info
│   │   └── galeria/
│   │       └── page.tsx                  # Photo gallery
│   ├── admin/
│   │   ├── layout.tsx                    # Admin layout (auth guard + sidebar)
│   │   ├── login/
│   │   │   └── page.tsx                  # Admin login
│   │   ├── page.tsx                      # Admin dashboard
│   │   ├── carta/
│   │   │   └── page.tsx                  # Manage menu items
│   │   ├── reservas/
│   │   │   └── page.tsx                  # Manage reservations
│   │   ├── galeria/
│   │   │   └── page.tsx                  # Manage gallery
│   │   └── info/
│   │       └── page.tsx                  # Manage restaurant info
│   └── api/
│       └── reservas/
│           └── route.ts                  # POST handler: save + send emails
├── components/
│   ├── carta/
│   │   ├── SeccionCarta.tsx              # Animated section with title + dish grid
│   │   ├── CardPlato.tsx                 # Dish card (image, name, price, tags)
│   │   └── NavCarta.tsx                  # Sticky section nav (scroll spy)
│   ├── reservas/
│   │   └── FormularioReserva.tsx         # Reservation form with validation
│   ├── galeria/
│   │   └── GaleriaGrid.tsx               # Masonry photo grid
│   ├── admin/
│   │   ├── FormPlato.tsx                 # Add/edit dish form
│   │   ├── ListaPlatos.tsx               # Draggable dish list with toggle
│   │   ├── TablaReservas.tsx             # Reservations table with actions
│   │   ├── GaleriaAdmin.tsx              # Upload + reorder photos
│   │   └── FormInfo.tsx                  # Edit restaurant info
│   └── shared/
│       ├── Navbar.tsx                    # Public nav + language switcher
│       ├── Footer.tsx                    # Footer with contact info
│       └── ImagenPlato.tsx               # Dish image with generic fallback
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   ├── server.ts                     # Server Supabase client (cookies)
│   │   └── types.ts                      # Database TypeScript types
│   ├── validations.ts                    # Zod schemas (reserva, plato)
│   └── utils.ts                          # cn(), formatPrice(), allergenLabel()
├── messages/
│   ├── es.json                           # Spanish translations
│   └── en.json                           # English translations
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # All tables + RLS policies
├── middleware.ts                          # next-intl locale routing
├── i18n.ts                               # next-intl config
└── tailwind.config.ts                    # Design tokens (Casa Goyo brand)
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`

- [ ] **Step 1: Create Next.js app in the existing directory**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
```
When prompted: choose `Yes` for all defaults. If asked about src directory, say No.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr next-intl framer-motion react-hook-form zod @hookform/resolvers resend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react clsx tailwind-merge
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```
Choose: Default style, Zinc color base, yes for CSS variables.

- [ ] **Step 4: Add shadcn components used throughout the app**

```bash
npx shadcn@latest add button input label textarea select badge card dialog alert-dialog table tabs toast sheet skeleton switch
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```
Expected: `ready - started server on 0.0.0.0:3000`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js project with shadcn/ui and dependencies"
```

---

## Task 2: Design Tokens & Brand Setup

**Files:**
- Modify: `tailwind.config.ts`
- Create: `app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts with Casa Goyo brand colors**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crema: "#FAF0E6",
        burdeos: {
          DEFAULT: "#7B1527",
          dark: "#5A0F1C",
          light: "#9B2537",
        },
        dorado: {
          DEFAULT: "#F0A500",
          dark: "#C8880A",
          light: "#F5BC3A",
        },
        carbon: "#1A1A1A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

- [ ] **Step 2: Update app/globals.css with CSS variables and base styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 38 60% 95%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --primary: 349 70% 28%;
    --primary-foreground: 38 60% 95%;
    --secondary: 38 90% 47%;
    --secondary-foreground: 0 0% 10%;
    --muted: 38 30% 90%;
    --muted-foreground: 0 0% 40%;
    --border: 38 20% 85%;
    --radius: 0.5rem;
  }

  body {
    @apply bg-crema text-carbon font-sans;
  }

  h1, h2, h3 {
    @apply font-serif;
  }
}
```

- [ ] **Step 3: Add Google Fonts (Playfair Display + Inter) to app/layout.tsx**

```typescript
// app/layout.tsx
import { Inter, Playfair_Display } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Casa Goyo brand design tokens and typography"
```

---

## Task 3: Supabase Setup & Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts`
- Create: `.env.local`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com, create a new project called `casa-goyo`. Wait for it to initialize (~2 min). Copy the Project URL and anon key.

- [ ] **Step 2: Create .env.local**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
ADMIN_EMAIL=owner@casagoyo.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Add `.env.local` to `.gitignore` if not already there.

- [ ] **Step 3: Create the database migration SQL**

```sql
-- supabase/migrations/001_initial_schema.sql

-- SECCIONES (menu categories)
CREATE TABLE secciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nombre_es TEXT NOT NULL,
  nombre_en TEXT NOT NULL,
  padre_slug TEXT REFERENCES secciones(slug),
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PLATOS (menu items)
CREATE TABLE platos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seccion_slug TEXT NOT NULL REFERENCES secciones(slug),
  nombre_es TEXT NOT NULL,
  nombre_en TEXT NOT NULL,
  descripcion_es TEXT,
  descripcion_en TEXT,
  precio NUMERIC(8,2) NOT NULL,
  foto_url TEXT,
  alergenos TEXT[] DEFAULT '{}',
  es_vegano BOOLEAN NOT NULL DEFAULT false,
  sin_gluten BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RESERVAS
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  personas INTEGER NOT NULL,
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GALERIA
CREATE TABLE galeria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  foto_url TEXT NOT NULL,
  alt_es TEXT,
  alt_en TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INFO_RESTAURANTE (single row)
CREATE TABLE info_restaurante (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre TEXT NOT NULL DEFAULT 'Restaurante Casa Goyo',
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  horario_es TEXT,
  horario_en TEXT,
  descripcion_es TEXT,
  descripcion_en TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default info row
INSERT INTO info_restaurante (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Insert menu sections
INSERT INTO secciones (slug, nombre_es, nombre_en, orden) VALUES
  ('primeros', 'Primeros Platos', 'First Courses', 1),
  ('segundos', 'Segundos Platos', 'Main Courses', 2),
  ('postres', 'Postres', 'Desserts', 3),
  ('temporada', 'De Temporada', 'Seasonal', 4),
  ('encargo', 'De Encargo', 'Made to Order', 5),
  ('dulces', 'Dulces Caseros', 'Homemade Sweets', 6),
  ('bebidas', 'Bebidas y Vinos', 'Drinks & Wines', 7),
  ('bar', 'Bar', 'Bar', 8);

INSERT INTO secciones (slug, nombre_es, nombre_en, padre_slug, orden) VALUES
  ('carnes', 'Carnes', 'Meat', 'segundos', 1),
  ('pescados', 'Pescados', 'Fish', 'segundos', 2),
  ('vinos-casa', 'Vinos de la Casa', 'House Wines', 'bebidas', 1),
  ('vinos-blancos', 'Blancos y Rosados', 'Whites & Rosés', 'bebidas', 2),
  ('vinos-tintos', 'Vinos Tintos', 'Red Wines', 'bebidas', 3),
  ('rioja', 'Rioja', 'Rioja', 'vinos-tintos', 1),
  ('ribera', 'Ribera del Duero', 'Ribera del Duero', 'vinos-tintos', 2),
  ('espumosos', 'Vinos Espumosos', 'Sparkling Wines', 'bebidas', 4);

-- RLS Policies
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_restaurante ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Public read secciones" ON secciones FOR SELECT USING (activo = true);
CREATE POLICY "Public read platos" ON platos FOR SELECT USING (activo = true);
CREATE POLICY "Public read galeria" ON galeria FOR SELECT USING (activo = true);
CREATE POLICY "Public read info" ON info_restaurante FOR SELECT USING (true);
CREATE POLICY "Public insert reservas" ON reservas FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) have full access
CREATE POLICY "Admin all secciones" ON secciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all platos" ON platos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all reservas" ON reservas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all galeria" ON galeria FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all info" ON info_restaurante FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 4: Run migration in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste the migration → Run.
Expected: "Success. No rows returned."

- [ ] **Step 5: Create Storage bucket for images**

In Supabase Dashboard → Storage → New bucket → Name: `imagenes` → Public: Yes.

- [ ] **Step 6: Create lib/supabase/client.ts**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 7: Create lib/supabase/server.ts**

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 8: Create lib/supabase/types.ts**

```typescript
// lib/supabase/types.ts
export type Seccion = {
  id: string
  slug: string
  nombre_es: string
  nombre_en: string
  padre_slug: string | null
  orden: number
  activo: boolean
}

export type Plato = {
  id: string
  seccion_slug: string
  nombre_es: string
  nombre_en: string
  descripcion_es: string | null
  descripcion_en: string | null
  precio: number
  foto_url: string | null
  alergenos: string[]
  es_vegano: boolean
  sin_gluten: boolean
  activo: boolean
  orden: number
}

export type Reserva = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  fecha: string
  hora: string
  personas: number
  notas: string | null
  estado: "pendiente" | "confirmada" | "cancelada"
  created_at: string
}

export type Galeria = {
  id: string
  foto_url: string
  alt_es: string | null
  alt_en: string | null
  orden: number
  activo: boolean
}

export type InfoRestaurante = {
  id: number
  nombre: string
  direccion: string | null
  telefono: string | null
  email: string | null
  horario_es: string | null
  horario_en: string | null
  descripcion_es: string | null
  descripcion_en: string | null
}
```

- [ ] **Step 9: Create lib/utils.ts**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(precio)
}

export const ALERGENOS_LABELS: Record<string, { es: string; en: string }> = {
  gluten: { es: "Gluten", en: "Gluten" },
  lacteos: { es: "Lácteos", en: "Dairy" },
  huevos: { es: "Huevos", en: "Eggs" },
  pescado: { es: "Pescado", en: "Fish" },
  marisco: { es: "Marisco", en: "Shellfish" },
  frutos_secos: { es: "Frutos Secos", en: "Nuts" },
  soja: { es: "Soja", en: "Soy" },
  apio: { es: "Apio", en: "Celery" },
  mostaza: { es: "Mostaza", en: "Mustard" },
  sesamo: { es: "Sésamo", en: "Sesame" },
  sulfitos: { es: "Sulfitos", en: "Sulphites" },
  moluscos: { es: "Moluscos", en: "Molluscs" },
}
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Supabase setup, schema migration and TypeScript types"
```

---

## Task 4: i18n Setup (next-intl)

**Files:**
- Create: `i18n.ts`
- Modify: `middleware.ts`
- Create: `messages/es.json`
- Create: `messages/en.json`

- [ ] **Step 1: Create i18n.ts**

```typescript
// i18n.ts
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))
```

- [ ] **Step 2: Create middleware.ts**

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware"

export default createMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
})

export const config = {
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
}
```

- [ ] **Step 3: Create messages/es.json**

```json
{
  "nav": {
    "carta": "Carta",
    "reservas": "Reservas",
    "info": "Información",
    "galeria": "Galería"
  },
  "carta": {
    "titulo": "Nuestra Carta",
    "sin_foto": "Sin imagen disponible",
    "vegano": "Vegano",
    "sin_gluten": "Sin Gluten",
    "alergenos": "Alérgenos",
    "encargo_nota": "Consultar disponibilidad",
    "llevar": "Para llevar"
  },
  "reservas": {
    "titulo": "Reservar Mesa",
    "nombre": "Nombre completo",
    "email": "Correo electrónico",
    "telefono": "Teléfono",
    "fecha": "Fecha",
    "hora": "Hora",
    "personas": "Número de personas",
    "notas": "Notas adicionales",
    "enviar": "Confirmar Reserva",
    "exito": "¡Reserva recibida! Te contactaremos para confirmar.",
    "error": "Error al enviar la reserva. Inténtalo de nuevo."
  },
  "info": {
    "titulo": "El Restaurante",
    "horario": "Horario",
    "direccion": "Dirección",
    "telefono": "Teléfono",
    "como_llegar": "Cómo Llegar"
  },
  "galeria": {
    "titulo": "Galería"
  },
  "footer": {
    "derechos": "Todos los derechos reservados"
  }
}
```

- [ ] **Step 4: Create messages/en.json**

```json
{
  "nav": {
    "carta": "Menu",
    "reservas": "Reservations",
    "info": "Information",
    "galeria": "Gallery"
  },
  "carta": {
    "titulo": "Our Menu",
    "sin_foto": "No image available",
    "vegano": "Vegan",
    "sin_gluten": "Gluten Free",
    "alergenos": "Allergens",
    "encargo_nota": "Ask for availability",
    "llevar": "Takeaway"
  },
  "reservas": {
    "titulo": "Book a Table",
    "nombre": "Full name",
    "email": "Email address",
    "telefono": "Phone",
    "fecha": "Date",
    "hora": "Time",
    "personas": "Number of guests",
    "notas": "Additional notes",
    "enviar": "Confirm Reservation",
    "exito": "Reservation received! We will contact you to confirm.",
    "error": "Error sending reservation. Please try again."
  },
  "info": {
    "titulo": "The Restaurant",
    "horario": "Opening Hours",
    "direccion": "Address",
    "telefono": "Phone",
    "como_llegar": "How to Get Here"
  },
  "galeria": {
    "titulo": "Gallery"
  },
  "footer": {
    "derechos": "All rights reserved"
  }
}
```

- [ ] **Step 5: Update next.config.ts to use next-intl**

```typescript
// next.config.ts
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 6: Move app/layout.tsx to app/[locale]/layout.tsx and create locale wrapper**

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { Inter, Playfair_Display } from "next/font/google"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${playfair.variable} bg-crema`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

Update `app/layout.tsx` (root) to just be a pass-through:
```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add next-intl i18n with ES/EN translations"
```

---

## Task 5: Shared Components (Navbar + Footer)

**Files:**
- Create: `components/shared/Navbar.tsx`
- Create: `components/shared/Footer.tsx`

- [ ] **Step 1: Create components/shared/Navbar.tsx**

```typescript
// components/shared/Navbar.tsx
"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const links = [
    { href: `/${locale}`, label: t("carta") },
    { href: `/${locale}/reservas`, label: t("reservas") },
    { href: `/${locale}/info`, label: t("info") },
    { href: `/${locale}/galeria`, label: t("galeria") },
  ]

  function toggleLocale() {
    const newLocale = locale === "es" ? "en" : "es"
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <nav className="sticky top-0 z-50 bg-crema/95 backdrop-blur border-b border-dorado/20">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href={`/${locale}`}>
          <Image src="/logo.png" alt="Casa Goyo" width={120} height={48} className="object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-carbon hover:text-burdeos font-medium transition-colors text-sm uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleLocale}
            className="ml-4 px-3 py-1 border border-burdeos text-burdeos text-xs font-bold rounded hover:bg-burdeos hover:text-crema transition-colors"
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-crema border-t border-dorado/20 px-4 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-carbon font-medium"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={toggleLocale} className="text-left text-burdeos font-bold text-sm">
            {locale === "es" ? "Switch to English" : "Cambiar a Español"}
          </button>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Add logo file**

Place the Casa Goyo logo PNG at `public/logo.png`. Also create a generic dish placeholder at `public/plato-generico.jpg` (any food image or gradient).

- [ ] **Step 3: Create components/shared/Footer.tsx**

```typescript
// components/shared/Footer.tsx
import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations("footer")
  const year = new Date().getFullYear()

  return (
    <footer className="bg-carbon text-crema/80 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="font-serif text-xl text-dorado mb-2">Restaurante Casa Goyo</p>
        <p className="text-sm">Alcocer, Guadalajara</p>
        <p className="text-xs mt-4 text-crema/40">
          © {year} Casa Goyo — {t("derechos")}
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Navbar with language switcher and Footer"
```

---

## Task 6: Carta Pública — Dish Card & Section Components

**Files:**
- Create: `components/shared/ImagenPlato.tsx`
- Create: `components/carta/CardPlato.tsx`
- Create: `components/carta/SeccionCarta.tsx`
- Create: `components/carta/NavCarta.tsx`

- [ ] **Step 1: Create components/shared/ImagenPlato.tsx**

```typescript
// components/shared/ImagenPlato.tsx
"use client"
import Image from "next/image"
import { useState } from "react"

type Props = {
  src: string | null
  alt: string
  className?: string
}

export default function ImagenPlato({ src, alt, className = "" }: Props) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-dorado/20 to-burdeos/10 flex items-center justify-center ${className}`}>
        <span className="text-4xl opacity-40">🍽</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  )
}
```

- [ ] **Step 2: Create components/carta/CardPlato.tsx**

```typescript
// components/carta/CardPlato.tsx
"use client"
import { motion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import { Leaf, WheatOff } from "lucide-react"
import ImagenPlato from "@/components/shared/ImagenPlato"
import { formatPrecio, ALERGENOS_LABELS } from "@/lib/utils"
import type { Plato } from "@/lib/supabase/types"

type Props = { plato: Plato }

export default function CardPlato({ plato }: Props) {
  const locale = useLocale() as "es" | "en"
  const t = useTranslations("carta")

  const nombre = locale === "es" ? plato.nombre_es : plato.nombre_en
  const descripcion = locale === "es" ? plato.descripcion_es : plato.descripcion_en

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-dorado/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative h-44 w-full">
        <ImagenPlato src={plato.foto_url} alt={nombre} />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-serif text-base font-semibold text-carbon leading-tight">{nombre}</h3>
          <span className="text-burdeos font-bold text-sm whitespace-nowrap">{formatPrecio(plato.precio)}</span>
        </div>

        {descripcion && (
          <p className="text-xs text-carbon/60 leading-relaxed mb-3">{descripcion}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {plato.es_vegano && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              <Leaf size={10} /> {t("vegano")}
            </span>
          )}
          {plato.sin_gluten && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
              <WheatOff size={10} /> {t("sin_gluten")}
            </span>
          )}
          {plato.alergenos.map((a) => (
            <span key={a} className="bg-crema text-carbon/50 text-xs px-2 py-0.5 rounded-full">
              {ALERGENOS_LABELS[a]?.[locale] ?? a}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Create components/carta/SeccionCarta.tsx**

```typescript
// components/carta/SeccionCarta.tsx
"use client"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import CardPlato from "./CardPlato"
import type { Plato, Seccion } from "@/lib/supabase/types"

type Props = {
  seccion: Seccion
  platos: Plato[]
  hijos?: { seccion: Seccion; platos: Plato[] }[]
}

export default function SeccionCarta({ seccion, platos, hijos }: Props) {
  const locale = useLocale() as "es" | "en"
  const nombre = locale === "es" ? seccion.nombre_es : seccion.nombre_en

  return (
    <section id={seccion.slug} className="scroll-mt-20 mb-14">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="font-serif text-2xl text-burdeos">{nombre}</h2>
        <div className="w-16 h-0.5 bg-dorado mt-1" />
      </motion.div>

      {platos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {platos.map((plato) => <CardPlato key={plato.id} plato={plato} />)}
        </div>
      )}

      {hijos?.map(({ seccion: hijo, platos: platosHijo }) => (
        <div key={hijo.id} className="mb-6">
          <h3 className="font-serif text-lg text-carbon/70 mb-4 pl-2 border-l-2 border-dorado">
            {locale === "es" ? hijo.nombre_es : hijo.nombre_en}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {platosHijo.map((plato) => <CardPlato key={plato.id} plato={plato} />)}
          </div>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 4: Create components/carta/NavCarta.tsx**

```typescript
// components/carta/NavCarta.tsx
"use client"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import type { Seccion } from "@/lib/supabase/types"

type Props = { secciones: Seccion[] }

export default function NavCarta({ secciones: secciones }: Props) {
  const locale = useLocale() as "es" | "en"
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    secciones.forEach(({ slug }) => {
      const el = document.getElementById(slug)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [secciones])

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
      {secciones.map((s) => (
        <a
          key={s.slug}
          href={`#${s.slug}`}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            active === s.slug
              ? "bg-burdeos text-crema border-burdeos"
              : "border-burdeos/30 text-burdeos hover:bg-burdeos/10"
          }`}
        >
          {locale === "es" ? s.nombre_es : s.nombre_en}
        </a>
      ))}
    </nav>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add dish card, section and nav components for the menu"
```

---

## Task 7: Carta Page

**Files:**
- Create: `app/[locale]/page.tsx`

- [ ] **Step 1: Create the carta page with server-side data fetching**

```typescript
// app/[locale]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import SeccionCarta from "@/components/carta/SeccionCarta"
import NavCarta from "@/components/carta/NavCarta"
import type { Plato, Seccion } from "@/lib/supabase/types"

export default async function CartaPage() {
  const t = await getTranslations("carta")
  const supabase = await createClient()

  const [{ data: secciones }, { data: platos }] = await Promise.all([
    supabase.from("secciones").select("*").is("padre_slug", null).order("orden"),
    supabase.from("platos").select("*").eq("activo", true).order("orden"),
  ])

  const { data: subsecciones } = await supabase
    .from("secciones")
    .select("*")
    .not("padre_slug", "is", null)
    .order("orden")

  const platosArr: Plato[] = platos ?? []
  const seccionesArr: Seccion[] = secciones ?? []
  const subArr: Seccion[] = subsecciones ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">{t("titulo")}</h1>
      <div className="flex justify-center mb-8">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>

      <NavCarta secciones={seccionesArr} />

      {seccionesArr.map((seccion) => {
        const hijosDeEsta = subArr.filter((s) => s.padre_slug === seccion.slug)
        const platosDirectos = platosArr.filter((p) => p.seccion_slug === seccion.slug)

        const hijos = hijosDeEsta.map((hijo) => ({
          seccion: hijo,
          platos: platosArr.filter((p) => p.seccion_slug === hijo.slug),
        }))

        return (
          <SeccionCarta
            key={seccion.id}
            seccion={seccion}
            platos={platosDirectos}
            hijos={hijos.length > 0 ? hijos : undefined}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify the page loads at http://localhost:3000**

Run `npm run dev` and open `http://localhost:3000`. Expected: carta page with empty sections (no dishes yet).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add public carta page with server-side data fetching"
```

---

## Task 8: Reservas Page

**Files:**
- Create: `lib/validations.ts`
- Create: `app/api/reservas/route.ts`
- Create: `components/reservas/FormularioReserva.tsx`
- Create: `app/[locale]/reservas/page.tsx`

- [ ] **Step 1: Create lib/validations.ts**

```typescript
// lib/validations.ts
import { z } from "zod"

export const ReservaSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  fecha: z.string().min(1, "Fecha requerida"),
  hora: z.string().min(1, "Hora requerida"),
  personas: z.coerce.number().min(1).max(50),
  notas: z.string().optional(),
})

export type ReservaInput = z.infer<typeof ReservaSchema>

export const PlatoSchema = z.object({
  seccion_slug: z.string().min(1),
  nombre_es: z.string().min(1),
  nombre_en: z.string().min(1),
  descripcion_es: z.string().optional(),
  descripcion_en: z.string().optional(),
  precio: z.coerce.number().min(0),
  alergenos: z.array(z.string()).default([]),
  es_vegano: z.boolean().default(false),
  sin_gluten: z.boolean().default(false),
  activo: z.boolean().default(true),
})

export type PlatoInput = z.infer<typeof PlatoSchema>
```

- [ ] **Step 2: Create app/api/reservas/route.ts**

```typescript
// app/api/reservas/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ReservaSchema } from "@/lib/validations"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = ReservaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("reservas").insert(parsed.data).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send confirmation email to customer
  await resend.emails.send({
    from: "Casa Goyo <reservas@casagoyo.com>",
    to: parsed.data.email,
    subject: "Reserva recibida — Restaurante Casa Goyo",
    html: `
      <h2>¡Hola ${parsed.data.nombre}!</h2>
      <p>Hemos recibido tu solicitud de reserva para el <strong>${parsed.data.fecha}</strong> a las <strong>${parsed.data.hora}</strong> para <strong>${parsed.data.personas} personas</strong>.</p>
      <p>En breve te contactaremos para confirmar. Si tienes alguna duda, llámanos.</p>
      <p>Gracias — <em>Restaurante Casa Goyo, Alcocer (Guadalajara)</em></p>
    `,
  })

  // Notify owner
  await resend.emails.send({
    from: "Casa Goyo App <noreply@casagoyo.com>",
    to: process.env.ADMIN_EMAIL!,
    subject: `Nueva reserva: ${parsed.data.nombre} — ${parsed.data.fecha}`,
    html: `
      <h2>Nueva solicitud de reserva</h2>
      <ul>
        <li><strong>Nombre:</strong> ${parsed.data.nombre}</li>
        <li><strong>Email:</strong> ${parsed.data.email}</li>
        <li><strong>Teléfono:</strong> ${parsed.data.telefono ?? "—"}</li>
        <li><strong>Fecha:</strong> ${parsed.data.fecha}</li>
        <li><strong>Hora:</strong> ${parsed.data.hora}</li>
        <li><strong>Personas:</strong> ${parsed.data.personas}</li>
        <li><strong>Notas:</strong> ${parsed.data.notas ?? "—"}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reservas">Gestionar en el panel de admin</a></p>
    `,
  })

  return NextResponse.json({ ok: true, id: data.id })
}
```

- [ ] **Step 3: Create components/reservas/FormularioReserva.tsx**

```typescript
// components/reservas/FormularioReserva.tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ReservaSchema, type ReservaInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function FormularioReserva() {
  const t = useTranslations("reservas")
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ReservaInput>({
    resolver: zodResolver(ReservaSchema),
  })

  async function onSubmit(data: ReservaInput) {
    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setStatus("ok")
      reset()
    } else {
      setStatus("error")
    }
  }

  if (status === "ok") {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
        <p className="font-serif text-xl">{t("exito")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-2xl p-6 shadow-sm border border-dorado/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">{t("nombre")}</Label>
          <Input id="nombre" {...register("nombre")} className="mt-1" />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" {...register("email")} className="mt-1" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fecha">{t("fecha")}</Label>
          <Input id="fecha" type="date" {...register("fecha")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="hora">{t("hora")}</Label>
          <Input id="hora" type="time" {...register("hora")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="personas">{t("personas")}</Label>
          <Input id="personas" type="number" min={1} max={50} {...register("personas")} className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="telefono">{t("telefono")}</Label>
        <Input id="telefono" type="tel" {...register("telefono")} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="notas">{t("notas")}</Label>
        <Textarea id="notas" {...register("notas")} className="mt-1" rows={3} />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm">{t("error")}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-burdeos hover:bg-burdeos-dark text-crema">
        {isSubmitting ? "..." : t("enviar")}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Create app/[locale]/reservas/page.tsx**

```typescript
// app/[locale]/reservas/page.tsx
import { getTranslations } from "next-intl/server"
import FormularioReserva from "@/components/reservas/FormularioReserva"

export default async function ReservasPage() {
  const t = await getTranslations("reservas")
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">{t("titulo")}</h1>
      <div className="flex justify-center mb-8">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>
      <FormularioReserva />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add reservations form with email notifications via Resend"
```

---

## Task 9: Info & Galería Pages

**Files:**
- Create: `app/[locale]/info/page.tsx`
- Create: `components/galeria/GaleriaGrid.tsx`
- Create: `app/[locale]/galeria/page.tsx`

- [ ] **Step 1: Create app/[locale]/info/page.tsx**

```typescript
// app/[locale]/info/page.tsx
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import { MapPin, Phone, Clock } from "lucide-react"

export default async function InfoPage() {
  const t = await getTranslations("info")
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: info } = await supabase.from("info_restaurante").select("*").single()

  const horario = locale === "es" ? info?.horario_es : info?.horario_en

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">{t("titulo")}</h1>
      <div className="flex justify-center mb-10">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>

      <div className="space-y-6">
        {info?.telefono && (
          <div className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-dorado/10">
            <Phone className="text-burdeos mt-0.5" size={20} />
            <div>
              <p className="font-medium text-sm uppercase tracking-wide text-carbon/50 mb-1">{t("telefono")}</p>
              <a href={`tel:${info.telefono}`} className="text-lg font-serif text-carbon hover:text-burdeos">{info.telefono}</a>
            </div>
          </div>
        )}

        {info?.direccion && (
          <div className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-dorado/10">
            <MapPin className="text-burdeos mt-0.5" size={20} />
            <div>
              <p className="font-medium text-sm uppercase tracking-wide text-carbon/50 mb-1">{t("direccion")}</p>
              <p className="text-lg font-serif text-carbon">{info.direccion}</p>
            </div>
          </div>
        )}

        {horario && (
          <div className="flex gap-4 items-start bg-white rounded-xl p-5 shadow-sm border border-dorado/10">
            <Clock className="text-burdeos mt-0.5" size={20} />
            <div>
              <p className="font-medium text-sm uppercase tracking-wide text-carbon/50 mb-1">{t("horario")}</p>
              <pre className="text-sm text-carbon whitespace-pre-wrap font-sans leading-relaxed">{horario}</pre>
            </div>
          </div>
        )}

        {info?.direccion && (
          <div className="rounded-xl overflow-hidden border border-dorado/10 h-56">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(info.direccion)}&output=embed`}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/galeria/GaleriaGrid.tsx**

```typescript
// components/galeria/GaleriaGrid.tsx
"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import type { Galeria } from "@/lib/supabase/types"

export default function GaleriaGrid({ fotos }: { fotos: Galeria[] }) {
  const locale = useLocale() as "es" | "en"

  return (
    <div className="columns-2 sm:columns-3 gap-3 space-y-3">
      {fotos.map((foto, i) => (
        <motion.div
          key={foto.id}
          className="break-inside-avoid relative rounded-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <Image
            src={foto.foto_url}
            alt={locale === "es" ? foto.alt_es ?? "" : foto.alt_en ?? ""}
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </motion.div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create app/[locale]/galeria/page.tsx**

```typescript
// app/[locale]/galeria/page.tsx
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import GaleriaGrid from "@/components/galeria/GaleriaGrid"

export default async function GaleriaPage() {
  const t = await getTranslations("galeria")
  const supabase = await createClient()
  const { data: fotos } = await supabase.from("galeria").select("*").eq("activo", true).order("orden")

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl text-burdeos text-center mb-2">{t("titulo")}</h1>
      <div className="flex justify-center mb-10">
        <div className="w-24 h-0.5 bg-dorado" />
      </div>
      <GaleriaGrid fotos={fotos ?? []} />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add info and gallery public pages"
```

---

## Task 10: Admin Auth & Layout

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`
- Modify: `middleware.ts`

- [ ] **Step 1: Create an admin user in Supabase**

Supabase Dashboard → Authentication → Users → Invite user → enter the owner's email. The owner gets an email to set their password.

- [ ] **Step 2: Create app/admin/login/page.tsx**

```typescript
// app/admin/login/page.tsx
"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Credenciales incorrectas")
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center p-4">
      <div className="bg-crema rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="font-serif text-2xl text-burdeos mb-6 text-center">Panel de Administración</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-burdeos hover:bg-burdeos-dark text-crema">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/admin/layout.tsx with auth guard**

```typescript
// app/admin/layout.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Create components/admin/AdminSidebar.tsx**

```typescript
// components/admin/AdminSidebar.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, UtensilsCrossed, CalendarCheck, Images, Info, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/carta", label: "Carta", icon: UtensilsCrossed },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/galeria", label: "Galería", icon: Images },
  { href: "/admin/info", label: "Información", icon: Info },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <aside className="w-56 bg-carbon text-crema min-h-screen flex flex-col py-6 px-3">
      <div className="mb-8 px-2">
        <p className="font-serif text-dorado text-lg">Casa Goyo</p>
        <p className="text-crema/40 text-xs">Admin</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === href
                ? "bg-burdeos text-crema"
                : "text-crema/60 hover:bg-white/10 hover:text-crema"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 text-crema/40 hover:text-crema text-sm transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </aside>
  )
}
```

- [ ] **Step 5: Create app/admin/page.tsx (dashboard)**

```typescript
// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [
    { count: totalPlatos },
    { count: reservasPendientes },
    { count: totalFotos },
  ] = await Promise.all([
    supabase.from("platos").select("*", { count: "exact", head: true }),
    supabase.from("reservas").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("galeria").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    { label: "Platos en carta", value: totalPlatos ?? 0 },
    { label: "Reservas pendientes", value: reservasPendientes ?? 0 },
    { label: "Fotos en galería", value: totalFotos ?? 0 },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-4xl font-bold text-burdeos">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add admin login, layout with auth guard and dashboard"
```

---

## Task 11: Admin — Gestión de Carta

**Files:**
- Create: `components/admin/FormPlato.tsx`
- Create: `components/admin/ListaPlatos.tsx`
- Create: `app/admin/carta/page.tsx`

- [ ] **Step 1: Create components/admin/FormPlato.tsx**

```typescript
// components/admin/FormPlato.tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlatoSchema, type PlatoInput } from "@/lib/validations"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Plato, Seccion } from "@/lib/supabase/types"

type Props = {
  secciones: Seccion[]
  plato?: Plato
  onSaved: () => void
}

const ALERGENOS_OPTIONS = [
  "gluten", "lacteos", "huevos", "pescado", "marisco",
  "frutos_secos", "soja", "apio", "mostaza", "sesamo", "sulfitos", "moluscos"
]

export default function FormPlato({ secciones, plato, onSaved }: Props) {
  const [uploading, setUploading] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(plato?.foto_url ?? "")

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PlatoInput>({
    resolver: zodResolver(PlatoSchema),
    defaultValues: plato ? {
      seccion_slug: plato.seccion_slug,
      nombre_es: plato.nombre_es,
      nombre_en: plato.nombre_en,
      descripcion_es: plato.descripcion_es ?? "",
      descripcion_en: plato.descripcion_en ?? "",
      precio: plato.precio,
      alergenos: plato.alergenos,
      es_vegano: plato.es_vegano,
      sin_gluten: plato.sin_gluten,
      activo: plato.activo,
    } : { alergenos: [], es_vegano: false, sin_gluten: false, activo: true },
  })

  const alergenos = watch("alergenos") ?? []
  const esVegano = watch("es_vegano")
  const sinGluten = watch("sin_gluten")
  const activo = watch("activo")

  function toggleAlergeno(a: string) {
    const current = alergenos
    setValue("alergenos", current.includes(a) ? current.filter((x) => x !== a) : [...current, a])
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `platos/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("imagenes").upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from("imagenes").getPublicUrl(path)
      setFotoUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function onSubmit(data: PlatoInput) {
    const supabase = createClient()
    const payload = { ...data, foto_url: fotoUrl || null }

    if (plato) {
      await supabase.from("platos").update(payload).eq("id", plato.id)
    } else {
      await supabase.from("platos").insert(payload)
    }
    onSaved()
  }

  // Filter out subsections (only leaf sections in the menu)
  const seccionesHoja = secciones.filter((s) => !secciones.some((other) => other.padre_slug === s.slug))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label>Sección</Label>
        <Select onValueChange={(v) => setValue("seccion_slug", v)} defaultValue={plato?.seccion_slug}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Seleccionar sección..." />
          </SelectTrigger>
          <SelectContent>
            {secciones.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>{s.nombre_es}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre (ES)</Label>
          <Input {...register("nombre_es")} className="mt-1" />
        </div>
        <div>
          <Label>Name (EN)</Label>
          <Input {...register("nombre_en")} className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Descripción (ES)</Label>
          <Textarea {...register("descripcion_es")} className="mt-1" rows={3} />
        </div>
        <div>
          <Label>Description (EN)</Label>
          <Textarea {...register("descripcion_en")} className="mt-1" rows={3} />
        </div>
      </div>

      <div>
        <Label>Precio (€)</Label>
        <Input type="number" step="0.01" {...register("precio")} className="mt-1 w-32" />
      </div>

      <div>
        <Label>Foto</Label>
        <input type="file" accept="image/*" onChange={handleFotoUpload} className="mt-1 text-sm" />
        {uploading && <p className="text-xs text-gray-400 mt-1">Subiendo...</p>}
        {fotoUrl && <img src={fotoUrl} alt="preview" className="mt-2 h-24 w-auto rounded-lg object-cover" />}
      </div>

      <div>
        <Label className="mb-2 block">Alérgenos</Label>
        <div className="flex flex-wrap gap-2">
          {ALERGENOS_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAlergeno(a)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                alergenos.includes(a) ? "bg-burdeos text-crema border-burdeos" : "border-gray-300 text-gray-600 hover:border-burdeos"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={esVegano} onCheckedChange={(v) => setValue("es_vegano", v)} />
          <Label>Vegano</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={sinGluten} onCheckedChange={(v) => setValue("sin_gluten", v)} />
          <Label>Sin Gluten</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={activo} onCheckedChange={(v) => setValue("activo", v)} />
          <Label>Activo</Label>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || uploading} className="bg-burdeos text-crema">
        {plato ? "Guardar cambios" : "Añadir plato"}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create components/admin/ListaPlatos.tsx**

```typescript
// components/admin/ListaPlatos.tsx
"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Plato, Seccion } from "@/lib/supabase/types"
import { formatPrecio } from "@/lib/utils"
import FormPlato from "./FormPlato"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Props = { platos: Plato[]; secciones: Seccion[]; onRefresh: () => void }

export default function ListaPlatos({ platos, secciones, onRefresh }: Props) {
  const [editando, setEditando] = useState<Plato | null>(null)
  const supabase = createClient()

  async function toggleActivo(plato: Plato) {
    await supabase.from("platos").update({ activo: !plato.activo }).eq("id", plato.id)
    onRefresh()
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este plato?")) return
    await supabase.from("platos").delete().eq("id", id)
    onRefresh()
  }

  return (
    <>
      <div className="space-y-2">
        {platos.map((plato) => (
          <div key={plato.id} className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm ${!plato.activo ? "opacity-50" : ""}`}>
            {plato.foto_url && <img src={plato.foto_url} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{plato.nombre_es}</p>
              <p className="text-xs text-gray-400">{plato.seccion_slug} · {formatPrecio(plato.precio)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => toggleActivo(plato)} className="p-1.5 text-gray-400 hover:text-burdeos">
                {plato.activo ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
              </button>
              <button onClick={() => setEditando(plato)} className="p-1.5 text-gray-400 hover:text-burdeos">
                <Pencil size={16} />
              </button>
              <button onClick={() => eliminar(plato.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar plato</DialogTitle>
          </DialogHeader>
          {editando && (
            <FormPlato
              secciones={secciones}
              plato={editando}
              onSaved={() => { setEditando(null); onRefresh() }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 3: Create app/admin/carta/page.tsx**

```typescript
// app/admin/carta/page.tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import FormPlato from "@/components/admin/FormPlato"
import ListaPlatos from "@/components/admin/ListaPlatos"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Plato, Seccion } from "@/lib/supabase/types"

export default function AdminCarta() {
  const [platos, setPlatos] = useState<Plato[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("platos").select("*").order("orden"),
      supabase.from("secciones").select("*").order("orden"),
    ])
    setPlatos(p ?? [])
    setSecciones(s ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-gray-800">Carta</h1>
        <Button onClick={() => setShowForm(true)} className="bg-burdeos text-crema gap-2">
          <Plus size={16} /> Añadir plato
        </Button>
      </div>

      <ListaPlatos platos={platos} secciones={secciones} onRefresh={load} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo plato</DialogTitle>
          </DialogHeader>
          <FormPlato secciones={secciones} onSaved={() => { setShowForm(false); load() }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add admin carta management (CRUD + toggle active)"
```

---

## Task 12: Admin — Reservas, Galería e Info

**Files:**
- Create: `app/admin/reservas/page.tsx`
- Create: `app/admin/galeria/page.tsx`
- Create: `app/admin/info/page.tsx`

- [ ] **Step 1: Create app/admin/reservas/page.tsx**

```typescript
// app/admin/reservas/page.tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Reserva } from "@/lib/supabase/types"

const estadoColors = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase.from("reservas").select("*").order("fecha", { ascending: true }).order("hora")
    setReservas(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function updateEstado(id: string, estado: Reserva["estado"]) {
    await supabase.from("reservas").update({ estado }).eq("id", id)
    load()
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-gray-800 mb-6">Reservas</h1>
      <div className="space-y-3">
        {reservas.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800">{r.nombre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColors[r.estado]}`}>
                    {r.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{r.fecha} · {r.hora} · {r.personas} personas</p>
                <p className="text-sm text-gray-400">{r.email} {r.telefono ? `· ${r.telefono}` : ""}</p>
                {r.notas && <p className="text-sm text-gray-400 mt-1 italic">"{r.notas}"</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {r.estado !== "confirmada" && (
                  <Button size="sm" className="bg-green-600 text-white h-8 text-xs" onClick={() => updateEstado(r.id, "confirmada")}>
                    Confirmar
                  </Button>
                )}
                {r.estado !== "cancelada" && (
                  <Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200" onClick={() => updateEstado(r.id, "cancelada")}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {reservas.length === 0 && <p className="text-gray-400 text-sm">No hay reservas aún.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create app/admin/galeria/page.tsx**

```typescript
// app/admin/galeria/page.tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Galeria } from "@/lib/supabase/types"

export default function AdminGaleria() {
  const [fotos, setFotos] = useState<Galeria[]>([])
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase.from("galeria").select("*").order("orden")
    setFotos(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const ext = file.name.split(".").pop()
      const path = `galeria/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from("imagenes").upload(path, file)
      if (!error) {
        const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path)
        await supabase.from("galeria").insert({ foto_url: urlData.publicUrl, orden: fotos.length + 1 })
      }
    }
    setUploading(false)
    load()
  }

  async function eliminar(foto: Galeria) {
    if (!confirm("¿Eliminar esta foto?")) return
    await supabase.from("galeria").delete().eq("id", foto.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-gray-800">Galería</h1>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-burdeos text-crema text-sm rounded-lg hover:bg-burdeos-dark transition-colors">
            {uploading ? "Subiendo..." : "+ Añadir fotos"}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fotos.map((foto) => (
          <div key={foto.id} className="relative group rounded-xl overflow-hidden aspect-square">
            <img src={foto.foto_url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => eliminar(foto)}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/admin/info/page.tsx**

```typescript
// app/admin/info/page.tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { InfoRestaurante } from "@/lib/supabase/types"

export default function AdminInfo() {
  const [info, setInfo] = useState<Partial<InfoRestaurante>>({})
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("info_restaurante").select("*").single().then(({ data }) => {
      if (data) setInfo(data)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from("info_restaurante").update({ ...info, updated_at: new Date().toISOString() }).eq("id", 1)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-gray-800 mb-6">Información del restaurante</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5 max-w-xl">
        <div>
          <Label>Dirección</Label>
          <Input value={info.direccion ?? ""} onChange={(e) => setInfo({ ...info, direccion: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input value={info.telefono ?? ""} onChange={(e) => setInfo({ ...info, telefono: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>Email de contacto</Label>
          <Input value={info.email ?? ""} onChange={(e) => setInfo({ ...info, email: e.target.value })} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Horario (ES)</Label>
            <Textarea value={info.horario_es ?? ""} onChange={(e) => setInfo({ ...info, horario_es: e.target.value })} className="mt-1" rows={5} placeholder="Lunes: cerrado&#10;Martes-Viernes: 13:00-16:00, 20:00-23:00" />
          </div>
          <div>
            <Label>Hours (EN)</Label>
            <Textarea value={info.horario_en ?? ""} onChange={(e) => setInfo({ ...info, horario_en: e.target.value })} className="mt-1" rows={5} />
          </div>
        </div>
        <Button type="submit" className="bg-burdeos text-crema">
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add admin reservas, galeria and info management pages"
```

---

## Task 13: Final Polish & Deploy Prep

**Files:**
- Modify: `app/[locale]/layout.tsx` (metadata)
- Create: `.env.example`

- [ ] **Step 1: Add metadata to locale layout**

```typescript
// Add to app/[locale]/layout.tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: "Restaurante Casa Goyo — Alcocer, Guadalajara",
    description: locale === "es"
      ? "Restaurante tradicional en Alcocer, Guadalajara. Cocina casera, productos de temporada y vinos de la tierra."
      : "Traditional restaurant in Alcocer, Guadalajara. Home cooking, seasonal produce and local wines.",
    icons: { icon: "/favicon.ico" },
  }
}
```

- [ ] **Step 2: Create .env.example**

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

- [ ] **Step 3: Add .env.local to .gitignore (verify)**

```bash
grep ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 4: Run build to check for type errors**

```bash
npm run build
```
Expected: no TypeScript errors, build completes successfully.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: add metadata, env example and production build check"
```

---

## Self-Review

### Spec coverage check:
- [x] Carta digital mobile-first con imágenes, animaciones, texto — Tasks 6, 7
- [x] Panel de administración responsive — Tasks 10, 11, 12
- [x] Secciones: primeros, segundos (carnes/pescados), postres, temporada, encargo, dulces, bebidas/vinos (subsecciones), bar — Task 3 (migration)
- [x] Cada plato: nombre, descripción, precio, foto, alérgenos, vegano/sin gluten — Tasks 6, 11
- [x] CRUD platos + precio + reordenar + activar/desactivar — Task 11
- [x] Reservas: formulario → email cliente + notificación dueño — Task 8
- [x] Admin gestiona reservas (confirmar/cancelar) — Task 12
- [x] Galería pública con animaciones — Task 9
- [x] Admin gestiona galería (subir/eliminar) — Task 12
- [x] Info restaurante (horario, dirección, teléfono) — Tasks 9, 12
- [x] Admin edita info — Task 12
- [x] Bilingüe ES/EN con selector de idioma — Tasks 4, 5
- [x] Stack: Next.js + React + Supabase — todos los tasks
- [x] Identidad visual: crema, burdeos, dorado, tipografía serif — Tasks 2, 5, 6

### Ambigüedades pendientes (no bloqueantes):
- Confirmación de reserva por WhatsApp: implementado via email; WhatsApp API requiere cuenta Business y aprobación de Meta (añadir después)
- Reordenar platos con drag-and-drop: @dnd-kit instalado pero no implementado en esta versión inicial (se puede añadir en Sprint 2)
- Límite de comensales por franja horaria: no implementado (requiere lógica de negocio específica del dueño)

---

**Plan completo guardado.** Dos opciones de ejecución:

**1. Subagent-Driven (recomendado)** — Un subagente por task, revisión entre tasks, iteración rápida

**2. Inline Execution** — Ejecutar en esta sesión usando executing-plans, con checkpoints

¿Cuál prefieres?
