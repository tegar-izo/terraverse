import {
  tugas,
  tujuan,
  tools,
  pilihTanggal,
  pindahHalaman,
} from "./state.js";
import { isoHariIni, NAMA_BULAN, gridBulan, geserBulan } from "./calendar.js";
import { esc, nomor } from "./util.js";

const hariIni = isoHariIni();
const mini = {
  tahun: Number(hariIni.slice(0, 4)),
  bulan: Number(hariIni.slice(5, 7)) - 1,
};

const $ = (id) => document.getElementById(id);

/* ---------- Statistik ---------- */
function renderStat() {
  const kini = hariIni.slice(0, 7);
  const aktif = tugas.filter((t) => t.status !== "selesai").length;
  const selesai = tugas.filter(
    (t) => t.status === "selesai" && (t.tanggalTarget || "").slice(0, 7) === kini
  ).length;

  $("stat-tools").textContent = tools.length;
  $("stat-tugas-aktif").textContent = aktif;
  $("stat-selesai").textContent = selesai;

  const deadline = tugas
    .filter((t) => t.status !== "selesai" && t.tanggalTarget && t.tanggalTarget >= hariIni)
    .sort((a, b) => a.tanggalTarget.localeCompare(b.tanggalTarget))
    .slice(0, 3);

  $("daftar-deadline").innerHTML = deadline.length
    ? deadline
        .map(
          (t) => `
          <button class="deadline-item" data-uji="deadline-item" data-iso="${esc(t.tanggalTarget)}">
            <span class="deadline-item__tanggal">${esc(t.tanggalTarget.slice(5))}</span>
            <span class="deadline-item__judul">${esc(t.judul)}</span>
            <span class="msr">arrow_outward</span>
          </button>`
        )
        .join("")
    : '<span class="deadline-kosong">— Tidak ada deadline.</span>';
}

/* ---------- Grid tools ---------- */
function renderTools() {
  $("jumlah-tools").textContent = `${tools.length} tersedia`;

  $("grid-tool").innerHTML = tools.length
    ? tools
        .map(
          (t, i) => `
          <a class="md-card md-card--outlined tool-card" data-uji="kartu-tool"
             href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">
            <span class="tool-card__atas">
              <span class="tool-card__no">${nomor(i + 1)}</span>
              <span class="msr tool-card__buka">arrow_outward</span>
            </span>
            <span class="tool-card__kepala">
              <span class="tool-card__ikon">
                <span class="tool-card__inisial">${esc(t.nama.trim().slice(0, 2).toUpperCase())}</span>
                <img class="tool-card__gambar" src="${esc(t.ikonUrl)}" alt="${esc(t.nama)}" loading="lazy" />
              </span>
              <span class="tool-card__nama">
                <span class="tool-card__judul">${esc(t.nama)}</span>
                <span class="tag">GitHub Pages</span>
              </span>
            </span>
            <span class="tool-card__deskripsi">${esc(t.deskripsi)}</span>
          </a>`
        )
        .join("")
    : '<p class="kosong">Belum ada tools. Tambahkan lewat <code>js/tools.js</code>.</p>';

  // Jika ikon gagal dimuat, sembunyikan gambar agar inisial tetap terlihat.
  for (const img of $("grid-tool").querySelectorAll(".tool-card__gambar")) {
    img.addEventListener("error", () => {
      img.style.display = "none";
    });
  }
}

/* ---------- Mini kalender ---------- */
function renderMini() {
  $("mini-label").textContent = `${NAMA_BULAN[mini.bulan]} ${mini.tahun}`;

  $("mini-grid").innerHTML = gridBulan(mini.tahun, mini.bulan)
    .map((sel) => {
      const adaTugas = tugas.some((t) => t.tanggalTarget === sel.iso);
      const adaTujuan = tujuan.some((t) => t.tanggalTarget === sel.iso);
      const kelas = [
        "mini-kalender__sel",
        sel.dalamBulan ? "" : "mini-kalender__sel--luar",
        sel.iso === hariIni ? "mini-kalender__sel--kini" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const judul = `${sel.iso}${adaTugas ? " · tugas" : ""}${adaTujuan ? " · tujuan" : ""}`;
      return `
        <button class="${kelas}" data-uji="mini-sel" data-iso="${sel.iso}"
                aria-label="${sel.iso}" title="${esc(judul)}">
          <span class="mini-kalender__angka">${nomor(sel.hari)}</span>
          <span class="mini-kalender__titik">
            ${adaTugas ? '<i class="mini-kalender__tugas"></i>' : ""}
            ${adaTujuan ? '<i class="mini-kalender__tujuan"></i>' : ""}
          </span>
        </button>`;
    })
    .join("");
}

/* ---------- Inisialisasi ---------- */
export function renderBeranda() {
  renderStat();
  renderTools();
  renderMini();
}

export function inisialisasiBeranda() {
  const geser = (n) => {
    Object.assign(mini, geserBulan(mini.tahun, mini.bulan, n));
    renderMini();
  };

  $("mini-sebelum").addEventListener("click", () => geser(-1));
  $("mini-sesudah").addEventListener("click", () => geser(1));

  $("mini-grid").addEventListener("click", (e) => {
    const sel = e.target.closest("[data-iso]");
    if (!sel) return;
    pilihTanggal(sel.dataset.iso);
    pindahHalaman("kalender");
  });

  $("daftar-deadline").addEventListener("click", (e) => {
    const item = e.target.closest("[data-iso]");
    if (!item) return;
    pilihTanggal(item.dataset.iso);
    pindahHalaman("kalender");
  });

  renderBeranda();
}
