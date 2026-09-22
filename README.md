# TEN — Ruang Personal & Catatan Karya (iam-ten)

Platform profil personal, arsip karya, catatan perjalanan, eksplorasi inisiatif, dan katalog modul digital berbasis arsitektur modern Next.js dan Cloudflare Edge.

🌐 **Domain Produksi**: [https://ten.my.id](https://ten.my.id)  
🔐 **SSO Gateway**: [https://auth.ten.my.id](https://auth.ten.my.id)

---

## 🌟 Fitur Unggulan

- **Arsitektur Next.js 16 (App Router)**: Static export (`output: 'export'`) yang cepat, ringan, dan ramah SEO di Cloudflare Workers.
- **Desain Minimalis Monokromik**: Desain bersih dengan kenyamanan tinggi di perangkat seluler (mobile-first) dan desktop.
- **Katalog Inisiatif Terpadu**:
  - `/work`: Riwayat pengalaman dan peran inisiatif.
  - `/projects`: Arsip proyek web dan modul live.
  - `/publications`: Catatan tertulis dan evaluasi sistem.
  - `/news`: Warta dan pembaruan kegiatan berkala.
- **Pencarian & Pengalih Tampilan Cepat**: Mendukung mode **Grid ▦**, **List ▤**, dan **Ringkas ☰** serta pencarian real-time di seluruh rute.
- **Navigasi Paging (Pagination)**: Penataan halaman dinamis yang rapi dan terpusat.
- **Fitur Berbagi (Share)**: Native Web Share API pada browser ponsel serta fallback modal salin tautan dan pintasan WhatsApp, X, LinkedIn, Telegram di desktop.
- **Portal Admin Pengelola (`/admin`)**:
  - 📊 Ringkasan & Metrik Analitik Edge
  - 📑 Manajemen Konten (Tambah, Edit, Hapus, Filter)
  - ⚙️ Pengaturan Profil, Headline, Narasi Bio & Tautan
  - 🔐 SSO Identity & Token Inspector
  - 💾 Ekspor & Impor Cadangan Data (JSON)
- **Optimasi SEO Lengkap**: OpenGraph, Twitter Cards, Canonical links, dan Schema.org JSON-LD Structured Data (`WebSite`, `Person`, `ProfilePage`).

---

## 📁 Struktur Direktori

```
├── src/
│   ├── app/             # Routing Next.js (/, /work, /projects, /publications, /news, /admin)
│   ├── components/      # Komponen UI (Header, Footer, CardToolbar, Pagination, ShareButton)
│   └── data/            # Sumber data inisiatif (profileData.ts)
├── public/              # Aset statis & favicon
├── wrangler.jsonc       # Konfigurasi Cloudflare Workers Static Assets
├── next.config.ts       # Pengaturan Next.js static export
└── package.json
```

---

## 🔐 Konfigurasi Autentikasi SSO (accounts.ten.my.id)

Platform ini terintegrasi dengan Identity Provider terpusat **TEN Accounts** (`https://accounts.ten.my.id`) via NextAuth (Auth.js v5):

### Variabel Lingkungan (`.env.local` / Cloudflare Environment Variables):

```env
# Secret key NextAuth (generate: npx auth secret atau openssl rand -base64 32)
AUTH_SECRET="your-generated-secret-key"

# Base URL aplikasi
AUTH_URL="http://localhost:3000"

# Kredensial SSO Satelit (didapatkan dari https://accounts.ten.my.id/admin/clients)
TEN_CLIENT_ID="iam-app"
TEN_CLIENT_SECRET="your-satellite-client-secret"
```

### Registered Callback URLs di IdP:
- **Lokal Dev**: `http://localhost:3000/api/auth/callback/ten-accounts`
- **Produksi**: `https://ten.my.id/api/auth/callback/ten-accounts`

---

## 🚀 Menjalankan Secara Lokal

1. Instal dependensi:
   ```bash
   npm install
   ```

2. Jalankan server pengembang Next.js:
   ```bash
   npm run dev
   ```

3. Bangun dan simulasikan di Cloudflare Wrangler:
   ```bash
   npm run build
   npx wrangler dev --port 8787
   ```

---

## 📄 Lisensi & Hak Cipta

© 2026 **TEN** (`appten`). Semua hak dilindungi undang-undang.
