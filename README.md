# 🌌 Terraverse — my space, my universe

Dashboard untuk semua tools-mu (kedap-link ke halaman **GitHub Pages** tiap tool), lengkap dengan **tugas**, **planning tujuan bulanan**, dan **kalender**. Dibangun dengan **Vue 3 + Vite**, JavaScript & CSS murni, gaya Material Expressive hijau pastel.

## ✨ Fitur

-   **Beranda** — strip statistik (tools, tugas aktif, selesai bulan ini, 3 deadline terdekat) + grid kartu tools
-   **Tugas** — board 3 kolom (Todo / Dikerjakan / Selesai), drag & drop atau tombol panah, prioritas, tag tool
-   **Planning** — tujuan/milestone bulanan ber-checkbox, tampil di kalender dengan badge berbeda
-   **Kalender** — grid bulanan 7 kolom, agenda per tanggal
-   **Tema adaptif** — ikut sistem + toggle terang/gelap yang tersimpan
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
├── views/            ← Beranda, Tugas, Kalender
└── styles/main.css   ← token warna M3 hijau pastel
```

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
| `terraverse.tema`  | `terang` / `gelap`                     |

Gunakan tombol **Ekspor Data** untuk backup & **Impor Data** untuk restore (mengganti data lama).

## 🚀 Menjalankan lokal

```bash
npm install
npm run dev        # buka http://localhost:5173
```

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
