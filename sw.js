// Service worker sederhana: cache semua aset inti saat dipasang,
// lalu layani dari cache (offline-first) dan perbarui di latar.
const VERSI = "terraverse-v2";

// Huruf Nunito diambil dari Google Fonts; font ikon tetap lokal.
const HOST_HURUF = ["fonts.googleapis.com", "fonts.gstatic.com"];

const ASET = [
  "./",
  "index.html",
  "styles.css",
  "manifest.webmanifest",
  "js/app.js",
  "js/beranda.js",
  "js/tugas.js",
  "js/kalender.js",
  "js/state.js",
  "js/storage.js",
  "js/calendar.js",
  "js/tools.js",
  "js/util.js",
  "fonts/MaterialSymbolsRounded.woff2",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSI).then((cache) => cache.addAll(ASET)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((kunci) => Promise.all(kunci.filter((k) => k !== VERSI).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const permintaan = e.request;
  if (permintaan.method !== "GET") return;

  const alamat = new URL(permintaan.url);
  const asetHuruf = HOST_HURUF.includes(alamat.hostname);
  if (alamat.origin !== location.origin && !asetHuruf) return;

  // Huruf dari Google Fonts: simpan sekali, lalu pakai cache saat offline.
  if (asetHuruf) {
    e.respondWith(
      caches.match(permintaan).then(
        (tersimpan) =>
          tersimpan ||
          fetch(permintaan)
            .then((respons) => {
              if (respons.ok || respons.type === "opaque") {
                const salinan = respons.clone();
                caches.open(VERSI).then((cache) => cache.put(permintaan, salinan));
              }
              return respons;
            })
            .catch(() => Response.error())
      )
    );
    return;
  }

  e.respondWith(
    caches.match(permintaan).then((tersimpan) => {
      const jaringan = fetch(permintaan)
        .then((respons) => {
          const salinan = respons.clone();
          caches.open(VERSI).then((cache) => cache.put(permintaan, salinan));
          return respons;
        })
        .catch(() => tersimpan);
      return tersimpan || jaringan;
    })
  );
});
