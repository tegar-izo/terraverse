# 🌌 Terraverse — my space, my universe

Dashboard untuk semua tools-mu (kedap-link ke halaman **GitHub Pages** tiap tool), lengkap dengan **tugas**, **planning tujuan bulanan**, dan **kalender**. Dibangun dengan **Vue 3 + Vite**, JavaScript & CSS murni, dengan tampilan **Material 3 (M3)** hijau pastel — tanpa library komponen tambahan.

Seluruh UI memakai role warna, typescale, shape, elevation, state layer, dan motion token M3. Tipografi tetap memakai **Paper Mono** sebagai brand typeface di semua teks.

## ✨ Fitur

-   **Beranda** — kartu statistik (tools, tugas aktif, selesai bulan ini, 3 deadline terdekat) + grid kartu tools + mini kalender
-   **Tugas** — board 3 kolom (Todo / Dikerjakan / Selesai), drag & drop atau tombol panah, prioritas, tag tool; FAB “Tugas Baru” membuka dialog M3
-   **Kalender** — grid bulanan 7 kolom (mulai Senin), agenda tanggal terpilih
-   **Planning (di dalam Kalender)** — panel “Tujuan <bulan>” di kolom kanan: milestone bulanan ber-checkbox, tampil juga sebagai penanda di sel kalender
-   **Navigasi adaptif M3** — navigation bar di layar kecil, navigation rail di sedang, navigation drawer di lebar
-   **Tema adaptif** — ikut sistem + toggle terang/gelap yang tersimpan, dengan token M3 terang & gelap
-   **Ekspor / Impor data** — backup satu file JSON

## 🗂️ Struktur penting

```
src/
├── data/tools.json   ← tambahkan tool baru DI SINI saja
├── lib/
│   ├── storage.js    ← localStorage, skema v1, ekspor/impor
│   ├── state.js      ← state reaktif + CRUD
│   ├── calendar.js   ← util kalender (Indonesia)
│   └── tema.js       ← logika tema adaptif
├── views/            ← Beranda, Tugas, Kalender (planning ada di Kalender)
├── components/
│   └── MiniKalender.vue  ← kalender ringkas di samping Beranda
└── styles/main.css   ← token & komponen M3 (color roles, typescale,
                        shape, elevation, state layer, motion)
```

## 🎨 Material 3

-   **Color roles** — role lengkap untuk skema terang & gelap: `primary`, `secondary`, `tertiary`, `error`, `surface-container-lowest…highest`, `outline`, `inverse-*`, `scrim`.
-   **Tipografi** — typescale M3 (display/headline/title/body/label × large/medium/small) diterapkan pada Paper Mono; M3 memperbolehkan brand typeface sebagai pengganti Roboto.
-   **Shape** — skala 10 / 14 / 20 / 24 / 32 / full: field 10, chip 14, kartu/kolom/sel kalender 20, FAB 24, dialog 32, tombol & indikator full.
-   **Elevation & state layer** — level 1–5 plus state layer hover 8%, focus 10%, pressed 10%, dragged 16%.
-   **Motion** — transisi halaman *fade-through*, kartu tugas/tujuan masuk–keluar & bergeser antar kolom, dialog *scale + fade*, pergantian bulan, dan animasi indikator navigasi. Semua memakai durasi/easing M3 (standard & emphasized) dan otomatis dinonaktifkan dengan `prefers-reduced-motion`.
-   **Breakpoint** — mengikuti window size class: `<600px` navigation bar, `600–1199px` navigation rail, `≥1200px` navigation drawer.

## 🔧 Menambah tool baru (tanpa ubah kode!)

Edit `src/data/tools.json`, satu objek per tool:

```json
{
  "nama": "Nama Tool",
  "deskripsi": "Deskripsi singkat tool.",
  "ikonUrl": "https://raw.githubusercontent.com/USERNAME/REPO/main/ikon.svg",
  "url": "https://USERNAME.github.io/REPO/"
}
```

> `url` di-set **absolute** (bukan di-generate) supaya fleksibel; jika `ikonUrl` gagal dimuat, kartu menampilkan inisial otomatis. Klik kartu membuka **tab baru**.

## 💾 Penyimpanan data

Semua data disimpan di browser (`localStorage`) dengan struktur bersih siap migrasi sinkronisasi:

| Kunci              | Isi                                  |
| ------------------ | ------------------------------------ |
| `terraverse.tasks` | `{ "schemaVersion": 1, "tasks": [...] }` |
| `terraverse.planning` | `{ "schemaVersion": 1, "tujuan": [...] }`    |
| `terraverse.tema`  | `terang` / `gelap` (kosong = ikut sistem) |

Gunakan tombol **Ekspor Data** untuk backup & **Impor Data** untuk restore (mengganti data lama).

## 🚀 Menjalankan lokal

```bash
npm install
npm run dev        # buka http://localhost:5173
```

## 🧪 Verifikasi

Belum ada framework test; pengecekan dilakukan lewat script [jsdom](https://github.com/jsdom/jsdom) yang mengimpor bundle hasil build. **Jalankan `npm run build` dulu**, lalu dari root project:

```bash
npm run test:muat     # app termuat (tidak layar putih) & semua view bisa dibuka
npm run test:fungsi   # tambah tugas → tersimpan → muncul di kalender; tambah/centang tujuan
node scripts/cek-minis.mjs      # MiniKalender tampil di Beranda dengan 42 sel
node scripts/cek-navigasi.mjs   # navigation bar/rail/drawer ada & halaman aktif ditandai
```

`test:muat` dan `test:fungsi` terdaftar di `package.json`; dua script terakhir dijalankan manual dengan `node`.

## ☁️ Deploy ke Vercel + domain sendiri

1. Push repo ini ke **GitHub**.
2. Buka [vercel.com/new](https://vercel.com/new) → **Import** repo-mu. Vercel otomatis mengenali Vite: build **`npm run build`**, output **`dist`**.
3. Klik **Deploy**. Selesai — kamu dapat URL sementara `https://terraverse-xxx.vercel.app` untuk dites.
4. **Pasang domain-mu:**
    - Menu **Project → Settings → Domains → Add**, tulis domainmu (`domainku.com` atau `www.domainku.com`).
    - Di pengelola domainmu (registrar), tambahkan DNS yang diminta Vercel:
        - APEX: `A` → `76.76.21.21`
        - atau `CNAME` → `cname.vercel-dns.com`
    - Tunggu DNS merambat (biasanya beberapa menit). HTTPS/SSL otomatis dari Vercel.

Setelah itu, setiap push ke **branch utama** di GitHub akan otomatis memicu deploy ulang ke domainmu.
