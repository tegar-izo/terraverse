# 🌌 Terraverse — my space, my universe

Dashboard untuk semua tools-mu (kedap-link ke halaman **GitHub Pages** tiap tool), lengkap dengan **tugas**, **planning tujuan bulanan**, dan **kalender**. Dibangun dengan **HTML, CSS, dan JavaScript murni** — tanpa framework, tanpa library animasi, tanpa proses build. Tampilan mengikuti **Material 3 Expressive** dengan palet hijau gelap yang sama seperti sebelumnya.

Seluruh UI memakai token warna kertas/tinta/garis dengan aksen **hijau pastel**; yang berubah adalah bentuknya: sudut besar dan membulat, permukaan tonal, tombol serta chip berbentuk pil, bayangan lembut, dan gerak pegas yang ekspresif. Tipografi memakai **Nunito** dari Google Fonts untuk semua teks (termasuk angka dan label), sedangkan font ikon *Material Symbols Rounded* tetap di-host lokal di `fonts/`. Animasi memakai CSS biasa.

## ✨ Fitur

-   **Beranda** — kartu statistik (tools, tugas aktif, selesai bulan ini, 3 deadline terdekat) + grid kartu tools + mini kalender
-   **Tugas** — board 3 kolom (Todo / Dikerjakan / Selesai), drag & drop atau tombol panah, prioritas, tag tool; tombol “Tugas Baru” membuka dialog tugas
-   **Kalender** — grid bulanan 7 kolom (mulai Senin), agenda tanggal terpilih
-   **Planning (di dalam Kalender)** — panel “Tujuan <bulan>”: milestone bulanan ber-checkbox, tampil juga sebagai penanda di sel kalender
-   **Navigasi adaptif** — tautan bernomor di desktop, rail nomor di layar sedang, dan navigation bar di layar kecil
-   **Tema** — hitam kehijauan sebagai bawaan, dengan toggle putih kehijauan (terang) yang tersimpan
-   **Ekspor / Impor data** — backup satu file JSON
-   **PWA** — bisa dipasang ke layar utama dan tetap terbuka saat offline

## 🗂️ Struktur

```
index.html            ← seluruh kerangka tampilan (satu halaman)
styles.css            ← token & semua gaya (termasuk media query)
manifest.webmanifest  ← manifest PWA
sw.js                 ← service worker (cache offline)
js/
├── app.js            ← navigasi, tema, ekspor/impor, PWA
├── state.js          ← data + CRUD + pemberitahuan perubahan
├── storage.js        ← localStorage, skema v1, ekspor/impor
├── calendar.js       ← util kalender (Indonesia)
├── tools.js          ← DAFTAR TOOLS — tambah tool baru di sini
├── beranda.js        ← render Beranda + mini kalender
├── tugas.js          ← render board, drag & drop, dialog tugas
├── kalender.js       ← render grid bulan, agenda, planning
└── util.js           ← helper kecil (escape HTML, nomor)
fonts/                ← Material Symbols Rounded (Nunito dari Google Fonts)
icons/                ← ikon PWA 192, 512, dan maskable
```

## 🔧 Menambah tool baru

Edit `js/tools.js`, satu objek per tool:

```js
{
  nama: "Nama Tool",
  deskripsi: "Deskripsi singkat tool.",
  ikonUrl: "https://raw.githubusercontent.com/USERNAME/REPO/main/ikon.svg",
  url: "https://USERNAME.github.io/REPO/",
}
```

> Jika `ikonUrl` gagal dimuat, kartu menampilkan inisial otomatis. Klik kartu membuka tab baru.

## 💾 Penyimpanan data

Semua data disimpan di browser (`localStorage`):

| Kunci                 | Isi                                      |
| --------------------- | ---------------------------------------- |
| `terraverse.tasks`    | `{ "schemaVersion": 1, "tasks": [...] }` |
| `terraverse.planning` | `{ "schemaVersion": 1, "tujuan": [...] }` |
| `terraverse.tema`     | `gelap` (bawaan) / `terang`              |

Gunakan tombol **Ekspor** untuk backup dan **Impor** untuk restore (mengganti data lama).

## 🚀 Menjalankan lokal

Tidak perlu `npm install`. Karena memakai ES module, jalankan lewat server statis:

```bash
python3 -m http.server 4173
# buka http://localhost:4173
```

Atau `npx serve .`. Deploy cukup unggah seluruh folder (Vercel/Netlify/GitHub Pages) tanpa build command.

## 📱 PWA

`sw.js` menyimpan semua aset inti saat dipasang, lalu melayaninya offline. Berkas Nunito dari Google Fonts ikut disimpan di cache saat pertama kali dimuat, sehingga tampilan tetap memakai huruf yang sama ketika offline (jika belum pernah dimuat, teks memakai huruf sistem). Saat ada versi baru, banner **Pembaruan tersedia** muncul dan service worker baru aktif setelah tombol **Muat ulang** ditekan. Tombol **Pasang** di header muncul saat browser mengirim `beforeinstallprompt`.
