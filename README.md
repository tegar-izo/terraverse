# 🌌 Terraverse — my space, my universe

Dashboard untuk semua tools-mu (kedap-link ke halaman **GitHub Pages** tiap tool), lengkap dengan **tugas**, **planning tujuan bulanan**, dan **kalender**. Dibangun dengan **Vue 3 + Vite**, JavaScript & CSS murni, dengan tampilan editorial **paper & ink** yang terinspirasi [ryoku.dev](https://ryoku.dev/) — tanpa library komponen tambahan.

Seluruh UI memakai token warna kertas/tinta/garis dengan aksen **hijau pastel**, tipografi **Paper Mono** di semua teks, sudut 2px, serta garis rambut 1px sebagai pengganti bayangan. Huruf di-host sendiri di `public/fonts/`, dan animasi memakai **GSAP**.

## ✨ Fitur

-   **Beranda** — kartu statistik (tools, tugas aktif, selesai bulan ini, 3 deadline terdekat) + grid kartu tools + mini kalender
-   **Tugas** — board 3 kolom (Todo / Dikerjakan / Selesai), drag & drop atau tombol panah, prioritas, tag tool; FAB “Tugas Baru” membuka dialog tugas
-   **Kalender** — grid bulanan 7 kolom (mulai Senin), agenda tanggal terpilih
-   **Planning (di dalam Kalender)** — panel “Tujuan <bulan>” di kolom kanan: milestone bulanan ber-checkbox, tampil juga sebagai penanda di sel kalender
-   **Navigasi adaptif** — header dengan tautan bernomor di desktop, rail nomor di layar sedang, dan navigation bar di layar kecil
-   **Tema** — kertas hitam sebagai bawaan, dengan toggle kertas tulang (terang) yang tersimpan
-   **Animasi GSAP** — reveal bertahap saat halaman dibuka, sel kalender saat bulan berganti, dan ikon tema saat diganti
-   **Ekspor / Impor data** — backup satu file JSON

## 🗂️ Struktur penting

```
src/
├── data/tools.json   ← tambahkan tool baru DI SINI saja
├── lib/
│   ├── storage.js    ← localStorage, skema v1, ekspor/impor
│   ├── state.js      ← state reaktif + CRUD
│   ├── calendar.js   ← util kalender (Indonesia)
│   ├── animasi.js    ← helper GSAP (reveal, stagger, reduced-motion)
│   └── tema.js       ← logika tema adaptif
├── views/            ← Beranda, Tugas, Kalender (planning ada di Kalender)
├── components/
│   └── MiniKalender.vue  ← kalender ringkas di samping Beranda
└── styles/main.css   ← token & komponen paper/ink (warna, tipografi,
                        garis rambut, motion)
```

## 🎨 Sistem visual

-   **Warna** — kertas hitam `#000`, tinta abu hangat `#cdc4ba`, aksen hijau pastel `#8fd3a4`, dan garis tipis dari campuran tinta 13–42%. Tema terang memakai kertas tulang `#e9e3d7` dengan aksen hijau `#3e7d52`.
-   **Tipografi** — **Paper Mono** untuk judul, teks isi, label, dan angka; ukuran judul diperbesar dan *tracking* dirapatkan agar tetap editorial.
-   **Bentuk** — sudut 2px di semua permukaan; tanpa bayangan, tanpa pil. Pemisah memakai garis rambut 1px dan latar `paper-raised`.
-   **Tekstur** — lapisan *grain* SVG halus di atas seluruh layar agar kertas terasa fisik.
-   **Motion** — reveal halaman dan kartu bertahap, sel kalender ber-stagger saat bulan berganti, serta rotasi ikon tema; dipadukan dengan transisi CSS untuk dialog dan kartu. Semua animasi GSAP otomatis dilewati saat `prefers-reduced-motion` aktif.
-   **Breakpoint** — `<600px` navigation bar bawah, `600–1079px` rail nomor, `≥1080px` tautan lengkap di header.

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
| `terraverse.tema`  | `gelap` (bawaan) / `terang` |

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
