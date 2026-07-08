# 🐛 Bug Hunter Dashboard — Design System

Dokumentasi lengkap design rules untuk membangun Bug Hunter Dashboard menggunakan **React + shadcn/ui + Tailwind CSS**. Dark terminal aesthetic, bukan "AI slop".

---

## 🎨 Color System

Palette berbasis `zinc` dari Tailwind. Tidak ada gradient, tidak ada warna cerah berlebihan.

| Token | Tailwind Class | Hex | Kegunaan |
| --- | --- | --- | --- |
| Background | `bg-zinc-950` | `#09090b` | Base layer seluruh halaman |
| Surface | `bg-zinc-900` | `#18181b` | Card, panel, sidebar |
| Border | `border-zinc-800` | `#27272a` | Divider, outline |
| Muted | `text-zinc-500` | `#71717a` | Label, placeholder |
| Primary text | `text-zinc-100` | `#f4f4f5` | Body text |
| Accent (success) | `text-emerald-400` | `#34d399` | Status aktif, bounty earned |

### Severity Colors

Dipakai konsisten di Badge, row highlight, dan icon.

| Level | Text | Background | Border |
| --- | --- | --- | --- |
| `critical` | `text-red-400` | `bg-red-500/15` | `border-red-500/30` |
| `high` | `text-orange-400` | `bg-orange-500/15` | `border-orange-500/30` |
| `medium` | `text-yellow-400` | `bg-yellow-500/15` | `border-yellow-500/30` |
| `low` | `text-blue-400` | `bg-blue-500/15` | `border-blue-500/30` |

### HTTP Method Colors (Endpoint Map)

| Method | Color |
| --- | --- |
| `GET` | `text-emerald-400` |
| `POST` | `text-blue-400` |
| `PUT` | `text-yellow-400` |
| `DELETE` | `text-red-400` |
| `PATCH` | `text-orange-400` |

---

## 🔤 Typography Rules

- **Font utama**: `font-mono` di seluruh app — kesan terminal, bukan generic
- **Label section**: `text-xs uppercase tracking-widest text-zinc-500`
- **Nilai metrik besar**: `text-3xl font-mono font-bold`
- **ID / kode**: `text-[11px] font-mono text-zinc-500`
- **Body table**: `text-sm text-zinc-200`
- **Hindari** Inter font, heading besar centered di halaman utama

---

## 🧱 Component Patterns

### StatCard

Komponen kecil untuk angka penting di bagian atas dashboard.

```tsx
function StatCard({ label, value, sub, accent }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-mono font-bold ${accent ?? "text-white"}`}>{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
```

### Badge — Severity & Status

Selalu gunakan `variant="outline"` dengan custom class per level:

```tsx
// Severity badge
<Badge variant="outline" className="text-[10px] border border-red-500/30 bg-red-500/15 text-red-400">
  critical
</Badge>

// Status badge
<Badge variant="outline" className="text-[10px] border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
  accepted
</Badge>
```

### Table Rows

Row highlight untuk vulnerable endpoint:

```tsx
<TableRow className={`border-zinc-800 hover:bg-zinc-800/40 cursor-pointer ${
  ep.vuln ? "bg-red-500/5" : ""
}`}>
```

### Tabs Navigation

```tsx
<TabsList className="bg-zinc-900 border border-zinc-800">
  <TabsTrigger
    value="targets"
    className="text-xs capitalize data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500"
  >
    Targets
  </TabsTrigger>
</TabsList>
```

### Top Bar

```tsx
<header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
```

---

## 📐 Layout Structure

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

---

## 🗂️ Pages (Rencana)

| Halaman | Path | Deskripsi |
| --- | --- | --- |
| Dashboard | `/` | Stat overview + tab utama |
| Target Detail | `/targets/:id` | Subdomains, endpoints, notes |
| Findings | `/findings` | Semua vulnerability + filter |
| Endpoint Map | `/endpoints` | Full endpoint list + tested status |
| Bounty Tracker | `/bounty` | Grafik earning, program stats |
| Settings | `/settings` | API keys, export, scope config |

---

## 🚫 Anti-Pattern (Hindari)

- ❌ `bg-gradient-to-r from-purple-500 to-blue-500` — terlalu generik
- ❌ `rounded-2xl` di semua card — terlalu "bubbly"
- ❌ Layout full centered dengan max-w-sm — terasa landing page bukan tool
- ❌ Font `Inter` sebagai default — tidak berkarakter untuk hacking tool
- ❌ Shadow tebal `shadow-xl` — flat lebih clean untuk dark theme

---

## ✅ Design Checklist

- [ ]  Semua background pakai `zinc-950` / `zinc-900`
- [ ]  Semua border pakai `zinc-800`
- [ ]  Font utama `font-mono`
- [ ]  Severity color konsisten di semua component
- [ ]  HTTP method punya warna masing-masing
- [ ]  Hover state subtle: `hover:bg-zinc-800/40`
- [ ]  TopBar sticky dengan `backdrop-blur`
- [ ]  Tidak ada gradient