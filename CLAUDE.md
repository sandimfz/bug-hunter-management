# CLAUDE.md — Bug Hunter Dashboard

## Project Overview

**Bug Hunter Dashboard** — personal CRM + recon dashboard untuk bug bounty hunter individu & tim kecil. Menggantikan spreadsheet/BBRF self-hosted dengan pengalaman SaaS.

Model bisnis: freemium → subscription bulanan (Stripe).

Lihat `project.md` untuk rencana produk lengkap, `struktur.md` untuk rencana struktur folder, dan `design.md` untuk design system.

---

## Monorepo Structure

Turborepo monorepo dengan bun sebagai package manager.

```
bug-hunting/
├── apps/
│   ├── web/          # Next.js 16 (App Router) — frontend
│   └── api/          # NestJS 11 — backend REST API
├── packages/
│   ├── ui/           # shadcn/ui shared components (@workspace/ui)
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
└── package.json
```

**Workspace protocol:** `workspace:*` untuk dependency antar package.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (base-nova style) |
| Backend | NestJS 11, Express |
| Shared UI | `@workspace/ui` — shadcn components + `cn()` utility |
| Database | PostgreSQL (Drizzle ORM) |
| Cache/Queue | Redis + BullMQ — belum di-setup |
| Auth | Belum di-setup (direkomendasikan: Auth.js / Clerk) |
| Package Manager | bun 1.3.14 |
| Build System | Turborepo |
| Linting | ESLint 9 (flat config per package) |
| Formatting | Prettier (no semi, double quotes, trailing comma es5) |
| Testing | Jest (backend), belum ada setup frontend |

---

## Development Commands

```bash
# Jalankan semua (web + api) dalam mode dev
bun dev

# Jalankan satu app saja
bun --filter web dev
bun --filter api dev

# Build semua
bun build

# Lint semua
bun lint

# Format semua
bun format

# Typecheck semua
bun typecheck

# Test backend
bun --filter api test
bun --filter api test:e2e
```

---

## Port Convention

- **web** (Next.js): default `3000`
- **api** (NestJS): `4000` (lihat `apps/api/src/main.ts`)

---

## Code Conventions

### General

- Bahasa: **TypeScript** everywhere, strict mode.
- **No semicolons**, double quotes, trailing commas (es5).
- File naming: `kebab-case.ts` untuk module, `PascalCase.tsx` untuk React components.
- Import pakai `@workspace/ui` untuk shared components, `@/` alias untuk internal app.

### Frontend (apps/web)

- **App Router** (`app/` directory) — gunakan Server Components by default, `'use client'` hanya saat perlu.
- Route groups: `(auth)/` untuk halaman auth, `(dashboard)/` untuk halaman login.
- shadcn/ui components di `@workspace/ui/components` — tambah komponen baru via `bunx --bun shadcn@latest add <component>`.
- Styling: Tailwind CSS utility classes, `cn()` dari `@workspace/ui/lib/utils` untuk conditional classes.
- Data fetching: rencanakan TanStack Query untuk client-side fetching.
- State: hindari global state library di MVP — cukup React state + server components.

### Backend (apps/api)

- **NestJS module pattern**: setiap domain punya `module.ts`, `controller.ts`, `service.ts`, `dto/`, `entities/`.
- Module baru harus di-import di `app.module.ts`.
- DTO pakai `class-validator` dan `class-transformer` untuk validasi input.
- Controller menangani HTTP, Service menangkan business logic.
- Database akses via DatabaseService (Drizzle ORM) di `src/database/`.

### Shared (packages/ui)

- Komponen shadcn di `packages/ui/src/components/`.
- Utility functions di `packages/ui/src/lib/`.
- Global styles (Tailwind + CSS variables) di `packages/ui/src/styles/globals.css`.
- Web app mengimpor via `@workspace/ui` — sudah dikonfigurasi di `next.config.ts` transpilePackages.

---

## Domain Model (Target MVP)

| Entity | Key Fields |
|---|---|
| **User** | id, email, name, plan |
| **Workspace** | id, name, owner_id |
| **Program** | id, workspace_id, name, platform, status, scope_notes |
| **Asset** | id, program_id, type, value, status, tags, first_seen_at, last_seen_at |
| **Finding** | id, asset_id, title, severity, status, poc, reward_amount |

Relasi: Workspace → Program → Asset → Finding.

---

## Architecture Decisions

1. **Monorepo (Turborepo)** — share types FE-BE, single `bun install`, unified CI.
2. **Separate apps** — `web` dan `api` terpisah agar bisa deploy independen (Vercel + Railway/Fly.io).
3. **shadcn/ui di packages/ui** — komponen bisa dipakai di web app, konsisten, dan customizable.
4. **Feature-based module** di NestJS — setiap domain (programs, assets, findings) punya module sendiri.
5. **Recon & notifications** dipisah sebagai cross-cutting modules (lintas domain).

---

## Design System

**Dark terminal aesthetic** — bukan "AI slop". Lihat `design.md` untuk dokumentasi lengkap.

### Color Palette (zinc-based)

| Token | Tailwind Class | Hex | Kegunaan |
|---|---|---|---|
| Background | `bg-zinc-950` | `#09090b` | Base layer seluruh halaman |
| Surface | `bg-zinc-900` | `#18181b` | Card, panel, sidebar |
| Border | `border-zinc-800` | `#27272a` | Divider, outline |
| Muted | `text-zinc-500` | `#71717a` | Label, placeholder |
| Primary text | `text-zinc-100` | `#f4f4f5` | Body text |
| Accent (success) | `text-emerald-400` | `#34d399` | Status aktif, bounty earned |

### Severity Colors

| Level | Text | Background | Border |
|---|---|---|---|
| `critical` | `text-red-400` | `bg-red-500/15` | `border-red-500/30` |
| `high` | `text-orange-400` | `bg-orange-500/15` | `border-orange-500/30` |
| `medium` | `text-yellow-400` | `bg-yellow-500/15` | `border-yellow-500/30` |
| `low` | `text-blue-400` | `bg-blue-500/15` | `border-blue-500/30` |

### HTTP Method Colors

| Method | Color |
|---|---|
| `GET` | `text-emerald-400` |
| `POST` | `text-blue-400` |
| `PUT` | `text-yellow-400` |
| `DELETE` | `text-red-400` |
| `PATCH` | `text-orange-400` |

### Typography

- **Font utama:** `font-mono` di seluruh app — kesan terminal
- **Label section:** `text-xs uppercase tracking-widest text-zinc-500`
- **Nilai metrik besar:** `text-3xl font-mono font-bold`
- **ID / kode:** `text-[11px] font-mono text-zinc-500`
- **Body table:** `text-sm text-zinc-200`
- **Hindari:** Inter font, heading besar centered

### Key Component Patterns

**StatCard** — angka penting di dashboard:
```tsx
<Card className="bg-zinc-900 border-zinc-800">
  <CardContent className="pt-5 pb-4">
    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-mono font-bold ${accent ?? "text-white"}`}>{value}</p>
  </CardContent>
</Card>
```

**Badge** — severity & status, selalu `variant="outline"`:
```tsx
<Badge variant="outline" className="text-[10px] border border-red-500/30 bg-red-500/15 text-red-400">
  critical
</Badge>
```

**TableRow** — highlight untuk vulnerable endpoint:
```tsx
<TableRow className={`border-zinc-800 hover:bg-zinc-800/40 cursor-pointer ${ep.vuln ? "bg-red-500/5" : ""}`}>
```

**TopBar** — sticky dengan backdrop-blur:
```tsx
<header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
```

### Layout Structure

```
┌─────────────────────────────────────────┐
│  TopBar: Logo | Search | + Add Target   │ ← sticky, backdrop-blur
├─────────────────────────────────────────┤
│  StatCards (4 col grid)                 │ ← Total Bounty, Targets, Findings, Endpoints
├─────────────────────────────────────────┤
│  Tabs: Targets | Findings | Endpoints   │
│  ┌───────────────────────────────────┐  │
│  │  Table content per tab            │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Footer: last recon timestamp           │
└─────────────────────────────────────────┘
```

### Design Anti-Patterns (Hindari)

- ❌ `bg-gradient-to-r from-purple-500 to-blue-500` — terlalu generik
- ❌ `rounded-2xl` di semua card — terlalu "bubbly"
- ❌ Layout full centered dengan `max-w-sm` — terasa landing page bukan tool
- ❌ Font `Inter` sebagai default — tidak berkarakter
- ❌ Shadow tebal `shadow-xl` — flat lebih clean untuk dark theme

---

## Current State

- [x] Monorepo scaffold (Turborepo + bun)
- [x] Next.js 16 app dengan shadcn/ui + theme provider
- [x] NestJS 11 app scaffold (basic controller/service)
- [x] Shared UI package dengan button component
- [x] Database (Drizzle ORM + PostgreSQL)
- [x] Auth (basic auth module)
- [x] Domain modules (Programs, Assets, Findings)
- [x] API routes & controllers
- [x] Frontend pages & components
- [x] Background jobs (BullMQ — placeholder, needs Redis)
- [ ] Billing (Stripe)

---

## Important Notes

- **Next.js 16** — ada breaking changes dari versi sebelumnya. Baca guide di `node_modules/next/dist/docs/` sebelum menulis kode Next.js baru.
- **Tailwind CSS 4** — gunakan `@tailwindcss/postcss` (bukan `tailwindcss` langsung sebagai PostCSS plugin).
- **React 19** — gunakan fitur baru (Server Components, Server Actions) daripada pattern lama.
- Jangan install dependency di root — selalu di package yang tepat (`bun --filter <package> add <dep>`).
- shadcn components ditambahkan ke `packages/ui`, bukan ke `apps/web` langsung.
