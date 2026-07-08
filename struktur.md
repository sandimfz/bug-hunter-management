# Struktur Folder & Aplikasi — Frontend & Backend

## Gambaran Umum

Proyek dipecah jadi 2 codebase terpisah (bisa juga digabung dalam 1 monorepo pakai Turborepo/Nx bila mau share types antara FE-BE): **frontend** (Next.js) dan **backend** (NestJS). Struktur di bawah mengikuti konvensi arsitektur berbasis domain/fitur (Program, Asset, Finding) yang sudah dibahas di halaman utama.

---

## Struktur Folder — Frontend (Next.js App Router)

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Topbar wrapper
│   │   ├── page.tsx                # Dashboard overview / ringkasan
│   │   ├── programs/
│   │   │   ├── page.tsx            # List semua program
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Form buat program baru
│   │   │   └── [programId]/
│   │   │       ├── page.tsx        # Detail program
│   │   │       ├── assets/
│   │   │       │   └── page.tsx    # Tabel aset dalam program
│   │   │       └── findings/
│   │   │           └── page.tsx    # List temuan/vulnerability
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── billing/
│   │       └── page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts        # Handler webhook Stripe
│   ├── layout.tsx                  # Root layout
│   └── globals.css
├── components/
│   ├── ui/                         # Komponen dasar (shadcn/ui): button, input, dialog, dll
│   ├── dashboard/
│   │   ├── AssetTable.tsx
│   │   ├── ProgramCard.tsx
│   │   ├── FindingForm.tsx
│   │   └── StatsCard.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Topbar.tsx
├── lib/
│   ├── api-client.ts               # tRPC client / fetch wrapper ke backend
│   ├── auth.ts                     # helper sesi/auth
│   └── utils.ts
├── hooks/
│   ├── usePrograms.ts
│   ├── useAssets.ts
│   └── useFindings.ts
├── types/
│   └── index.ts                    # Tipe bersama (bisa diimpor dari backend jika monorepo)
├── public/
├── .env.local
├── next.config.js
├── package.json
└── tailwind.config.ts
```

---

## Struktur Folder — Backend (NestJS)

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── programs/
│   │   ├── programs.module.ts
│   │   ├── programs.controller.ts
│   │   ├── programs.service.ts
│   │   ├── dto/
│   │   │   ├── create-program.dto.ts
│   │   │   └── update-program.dto.ts
│   │   └── entities/
│   │       └── program.entity.ts
│   ├── assets/
│   │   ├── assets.module.ts
│   │   ├── assets.controller.ts
│   │   ├── assets.service.ts
│   │   ├── dto/
│   │   │   ├── create-asset.dto.ts
│   │   │   └── bulk-import-asset.dto.ts
│   │   └── entities/
│   │       ├── asset.entity.ts
│   │       └── asset-snapshot.entity.ts   # untuk diffing histori
│   ├── findings/
│   │   ├── findings.module.ts
│   │   ├── findings.controller.ts
│   │   ├── findings.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │       └── finding.entity.ts
│   ├── recon/
│   │   ├── recon.module.ts
│   │   ├── recon.service.ts        # integrasi API pihak ketiga (mis. Chaos)
│   │   └── recon.processor.ts      # BullMQ job: fetch data & diffing terjadwal
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   └── channels/
│   │       ├── email.channel.ts    # Resend/Postmark
│   │       └── webhook.channel.ts  # Slack/Discord
│   ├── billing/
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts
│   │   └── billing.service.ts      # integrasi Stripe (subscription)
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/                # exception filters
│   │   ├── interceptors/
│   │   └── pipes/                  # validation pipes
│   ├── config/
│   │   └── configuration.ts        # env config terpusat
│   └── database/
│       ├── prisma/
│       │   └── schema.prisma       # skema Prisma (User, Program, Asset, Finding, dll)
│       └── migrations/
├── test/
│   ├── unit/
│   └── e2e/
├── .env
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Catatan Struktur

- **Pemisahan per domain (feature-based)**: setiap fitur (programs, assets, findings, billing) punya module/controller/service sendiri agar mudah di-maintain saat aplikasi berkembang.
- **`recon/` dan `notifications/`** sengaja dipisah dari domain utama karena sifatnya lintas-fitur (dipakai oleh assets & findings sekaligus).
- **`asset-snapshot.entity.ts`** menyimpan histori tiap scan — dipakai untuk fitur diffing "aset baru vs lama" di Fase 2.
- Jika nanti ingin **monorepo** (frontend + backend + shared types dalam satu repo), strukturnya tinggal dibungkus jadi:

```
bug-hunter-dashboard/
├── apps/
│   ├── web/        # isi dari frontend/ di atas
│   └── api/         # isi dari backend/ di atas
├── packages/
│   ├── shared-types/ # tipe TypeScript yang dipakai FE & BE
│   └── config/        # eslint, tsconfig bersama
├── turbo.json
└── package.json
```

Opsi monorepo ini direkomendasikan begitu proyek mulai butuh sinkronisasi tipe data antara frontend dan backend secara ketat.