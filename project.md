# Bug Hunter Dashboard — Product & Tech Plan

## Ringkasan Produk

**Nama kerja:** Bug Hunter Dashboard

**Target pengguna:** Bug bounty hunter individu & tim kecil, freelancer pentest, program kecil (SME) yang butuh pelacakan scope rapi.

**Positioning:** "Personal CRM + recon dashboard" untuk hunter — bukan enterprise ASM (Assetnote-class), tapi tool prosumer yang menggantikan spreadsheet/BBRF self-hosted dengan pengalaman SaaS yang rapi.

**Model bisnis:** Freemium → subscription tier bulanan, harga terjangkau untuk individu.

---

## Fitur

### MVP (Fase 1 — validasi cepat)

- [ ]  Autentikasi & manajemen akun (email/password + OAuth GitHub/Google)
- [ ]  CRUD **Program**: nama program, platform (HackerOne/Bugcrowd/private), status (aktif/paused/selesai), catatan scope & out-of-scope
- [ ]  CRUD **Target/Asset** di dalam program: domain, subdomain, endpoint, API path, IP, tag/kategori
- [ ]  Import massal aset (paste list / upload file .txt/.csv)
- [ ]  Status per aset: aktif, mati, belum dicek, menarik (flagged)
- [ ]  Catatan bebas (notes) per aset — mendukung markdown
- [ ]  Dashboard ringkasan: jumlah program aktif, jumlah aset, aset baru minggu ini
- [ ]  Pencarian & filter aset (by tag, status, program)

### Fase 2 — diferensiasi

- [ ]  **Integrasi recon**: tarik data dari API pihak ketiga (ProjectDiscovery Chaos API, Subfinder via job, dsb) untuk auto-populate subdomain
- [ ]  **Diffing/histori**: simpan snapshot aset per waktu, tampilkan "aset baru" atau "aset hilang" dibanding scan sebelumnya
- [ ]  Notifikasi (email/Slack/Discord webhook) saat ada aset baru terdeteksi
- [ ]  Tagging temuan/kerentanan (vulnerability) yang terhubung ke aset spesifik, dengan status (draft, submitted, triaged, paid)
- [ ]  Kolaborasi tim: undang anggota ke program, role (owner/editor/viewer)
- [ ]  Tracking bounty/pendapatan per program (jumlah submit, reward diterima)

### Fase 3 — monetisasi lanjutan

- [ ]  Generator laporan (export temuan ke PDF/Markdown siap submit)
- [ ]  Public "security page"/profile hunter (opsional, untuk portofolio)
- [ ]  API/webhook untuk integrasi tools recon eksternal milik user sendiri (bring-your-own-pipeline)
- [ ]  Dashboard analitik: aset paling sering ditemukan vuln, waktu rata-rata dari asset baru → temuan

---

## Alur Aplikasi (User Flow)

1. **Onboarding**
    - Sign up → buat workspace pribadi (atau tim) → tur singkat fitur.
2. **Buat Program**
    - User klik "New Program" → isi nama, link platform bug bounty, scope rules (in-scope/out-of-scope), tag.
3. **Tambah Target/Aset**
    - Manual add satu-satu, atau paste list domain/subdomain/endpoint sekaligus.
    - (Fase 2) Trigger recon job otomatis → sistem menjalankan/menarik data dari API recon → aset baru masuk ke tabel dengan status "baru".
4. **Kelola & Investigasi**
    - User membuka daftar aset dalam program → filter by status/tag → tandai aset yang menarik → tambahkan catatan investigasi.
5. **Deteksi Perubahan (Fase 2)**
    - Job terjadwal (mis. harian/mingguan) membandingkan snapshot lama vs baru → aset baru/hilang otomatis di-highlight di dashboard dan dikirim notifikasi.
6. **Catat Temuan**
    - Saat menemukan vulnerability, user buat entry "Finding" terhubung ke aset → isi detail (severity, deskripsi, PoC) → status berubah seiring proses submit ke platform.
7. **Laporan (Fase 3)**
    - User generate laporan dari Finding → export ke format siap kirim ke program.
8. **Review Dashboard**
    - Halaman utama menampilkan ringkasan lintas program: total aset, aset baru, temuan aktif, dan (opsional) statistik bounty.

---

## Rekomendasi Arsitektur & Tech Stack

### Frontend

- **Next.js (React)** — SSR/SSG untuk landing & dashboard cepat, ekosistem besar, mudah deploy di Vercel.
- **Tailwind CSS + shadcn/ui** — untuk membangun UI dashboard secara cepat dan konsisten.
- **TanStack Query** — untuk data fetching & caching di sisi client.

### Backend

- **Node.js dengan NestJS (atau Express/Fastify jika ingin lebih ringan)** — struktur modular cocok untuk domain seperti Program, Asset, Finding, User.
- **REST atau tRPC** — tRPC lebih cepat untuk solo dev karena type-safety end-to-end dengan Next.js.
- **Auth**: Clerk atau Auth.js (NextAuth) — hindari membangun auth dari nol di awal.

### Database

- **PostgreSQL** (mis. via Supabase, Neon, atau RDS) — cocok untuk data relasional (Program → Asset → Finding) dan mendukung JSONB untuk data fleksibel seperti hasil recon mentah.
- **Redis** — untuk caching, rate limiting, dan sebagai broker antrian job.

### Background Jobs / Recon Pipeline

- **BullMQ (di atas Redis)** atau [**Trigger.dev](http://Trigger.dev) / Inngest** — untuk menjalankan job terjadwal (fetch recon data, diffing, kirim notifikasi) tanpa memblokir request utama.
- Integrasi awal cukup lewat API pihak ketiga (mis. Chaos API dari ProjectDiscovery) daripada menjalankan tools recon (subfinder/nuclei) sendiri di server — lebih murah & sederhana untuk MVP.

### Infra & Hosting

- **Vercel** untuk frontend/Next.js.
- **Railway atau [Fly.io](http://Fly.io)** untuk backend service + worker jobs (lebih murah & fleksibel dibanding AWS penuh saat masih tahap validasi).
- **Object storage** (Cloudflare R2 / S3) jika perlu simpan file upload (bukti PoC, laporan PDF).

### Billing & Notifikasi

- **Stripe** — untuk subscription tier (Free/Pro/Team).
- **Resend atau Postmark** — email transaksional (notifikasi aset baru, laporan).
- **Webhook out** (Slack/Discord) sebagai fitur opsional di Fase 2.

---

## Gambaran Skema Data (disederhanakan)

| Entity | Field kunci |
| --- | --- |
| **User** | id, email, name, plan |
| **Workspace/Team** | id, name, owner_id |
| **Program** | id, workspace_id, name, platform, status, scope_notes |
| **Asset** | id, program_id, type (domain/subdomain/endpoint/api/ip), value, status, tags, first_seen_at, last_seen_at |
| **AssetSnapshot** | id, asset_id, scan_date, is_new, is_removed (untuk diffing) |
| **Finding** | id, asset_id, title, severity, status, poc, reward_amount |
| **Notification** | id, user_id, type, payload, sent_at |

---

## Rekomendasi Langkah Selanjutnya

1. Validasi ide ke komunitas hunter (Reddit r/bugbounty, Discord) sebelum coding penuh.
2. Bangun MVP dengan fitur Fase 1 saja — target 2-4 minggu solo dev.
3. Onboarding 10-20 early user gratis untuk feedback sebelum menambahkan billing.
4. Baru tambahkan integrasi recon otomatis & diffing setelah ada traction jelas.

[Struktur Folder & Aplikasi — Frontend & Backend](https://app.notion.com/p/Struktur-Folder-Aplikasi-Frontend-Backend-642f2b9a4f6f407182dc04657d53b7ed?pvs=21)