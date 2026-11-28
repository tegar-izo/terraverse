import {
  aplikasi,
  imporData,
  pindahHalaman,
  saatBerubah,
} from "./state.js";
import { bacaTema, simpanTema, unduhEkspor } from "./storage.js";
import { inisialisasiBeranda, renderBeranda } from "./beranda.js";
import { inisialisasiTugas, renderTugas } from "./tugas.js";
import { inisialisasiKalender, renderKalender } from "./kalender.js";

const $ = (id) => document.getElementById(id);

/* ---------- Tema ---------- */
const WARNA_TEMA = { gelap: "#07130d", terang: "#f1f7f1" };

function terapkanTema() {
  const tema = bacaTema() === "terang" ? "terang" : "gelap";
  document.documentElement.dataset.tema = tema;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", WARNA_TEMA[tema]);

  const label = tema === "gelap" ? "Tema terang" : "Tema gelap";
  $("ikon-tema").textContent = tema === "gelap" ? "light_mode" : "dark_mode";
  $("tombol-tema").title = label;
  $("tombol-tema").setAttribute("aria-label", label);
}

function alihkanTema() {
  simpanTema(bacaTema() === "terang" ? "gelap" : "terang");
  terapkanTema();
}

/* ---------- Navigasi ---------- */
function tampilkanHalaman() {
  for (const bagian of document.querySelectorAll("[data-halaman]")) {
    bagian.hidden = bagian.dataset.halaman !== aplikasi.halaman;
  }

  for (const tombol of document.querySelectorAll("[data-uji^='nav-']")) {
    const aktif = tombol.dataset.pindah === aplikasi.halaman;
    if (aktif) tombol.setAttribute("aria-current", "page");
    else tombol.removeAttribute("aria-current");
    tombol.classList.toggle("md-nav-item--aktif", aktif);
    tombol.classList.toggle("navbar-item--aktif", aktif);
  }
}

function renderSemua() {
  renderBeranda();
  renderTugas();
  renderKalender();
  tampilkanHalaman();
}

/* ---------- Impor / ekspor ---------- */
function pilihFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const pembaca = new FileReader();
  pembaca.onload = () => {
    const sukses = imporData(String(pembaca.result || ""));
    alert(
      sukses
        ? "Berhasil impor — data lama telah diganti."
        : 'Gagal impor: file tidak valid (harus berisi "tasks" dan "tujuan" berupa array).'
    );
  };
  pembaca.readAsText(file);
  e.target.value = "";
}

/* ---------- PWA: tombol pasang ---------- */
let promptPasang = null;

function siapkanPasang() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;
    promptPasang = e;
    $("tombol-pasang").hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    promptPasang = null;
    $("tombol-pasang").hidden = true;
  });

  $("tombol-pasang").addEventListener("click", async () => {
    if (!promptPasang) return;
    promptPasang.prompt();
    await promptPasang.userChoice;
    promptPasang = null;
    $("tombol-pasang").hidden = true;
  });
}

/* ---------- PWA: service worker & banner pembaruan ---------- */
function siapkanServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;

  let pekerjaMenunggu = null;

  const tampilkanBanner = (worker) => {
    pekerjaMenunggu = worker;
    $("pwa-banner").hidden = false;
  };

  navigator.serviceWorker
    .register("sw.js")
    .then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) tampilkanBanner(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const baru = reg.installing;
        baru?.addEventListener("statechange", () => {
          if (baru.state === "installed" && navigator.serviceWorker.controller) {
            tampilkanBanner(baru);
          }
        });
      });
    })
    .catch(() => {
      /* offline pertama tetap jalan tanpa service worker */
    });

  $("pwa-nanti").addEventListener("click", () => {
    $("pwa-banner").hidden = true;
  });

  $("pwa-muat-ulang").addEventListener("click", () => {
    if (!pekerjaMenunggu) return location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), {
      once: true,
    });
    pekerjaMenunggu.postMessage({ type: "SKIP_WAITING" });
  });
}

/* ---------- Mulai ---------- */
terapkanTema();

$("tombol-tema").addEventListener("click", alihkanTema);
$("tombol-ekspor").addEventListener("click", unduhEkspor);
$("tombol-impor").addEventListener("click", () => $("masukan-file").click());
$("masukan-file").addEventListener("change", pilihFile);

document.addEventListener("click", (e) => {
  const tujuan = e.target.closest("[data-pindah]");
  if (tujuan) pindahHalaman(tujuan.dataset.pindah);
});

saatBerubah(renderSemua);

inisialisasiBeranda();
inisialisasiTugas();
inisialisasiKalender();
tampilkanHalaman();

siapkanPasang();
siapkanServiceWorker();
