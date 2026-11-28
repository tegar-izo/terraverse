import {
  aplikasi,
  tugas,
  tujuan,
  pilihTanggal,
  tambahTujuan,
  tandaiTujuan,
  hapusTujuan,
  pindahHalaman,
} from "./state.js";
import {
  NAMA_BULAN,
  gridBulan,
  geserBulan,
  formatPanjang,
  isoHariIni,
} from "./calendar.js";
import { esc, nomor } from "./util.js";

const $ = (id) => document.getElementById(id);

const kini = isoHariIni();
let tahun = Number(kini.slice(0, 4));
let bulan = Number(kini.slice(5, 7)) - 1;

function bulanIso() {
  return `${tahun}-${String(bulan + 1).padStart(2, "0")}`;
}

/* ---------- Grid bulan ---------- */
function renderGrid() {
  const isoBulan = bulanIso();
  $("label-bulan").textContent = `${NAMA_BULAN[bulan]} ${tahun}`;

  $("kalender-grid").innerHTML = gridBulan(tahun, bulan)
    .map((sel) => {
      const tugasHari = tugas
        .filter((t) => t.tanggalTarget === sel.iso)
        .sort((a, b) => (a.status === "selesai") - (b.status === "selesai"));
      const tujuanHari = tujuan.filter((t) => t.tanggalTarget === sel.iso);
      const jumlah = tugasHari.length + tujuanHari.length;

      const kelas = [
        "kalender__sel",
        sel.dalamBulan ? "" : "kalender__sel--luar",
        sel.iso === kini ? "kalender__sel--kini" : "",
        sel.iso === aplikasi.tanggalKalender ? "kalender__sel--dipilih" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const acara = [];
      if (tugasHari.length) {
        acara.push(`<span class="kalender__acara" data-uji="chip-tugas">
          <i class="kalender__titik kalender__titik--tugas"></i>
          <span class="kalender__acara-teks">${esc(tugasHari[0].judul)}</span></span>`);
      }
      if (tujuanHari.length) {
        acara.push(`<span class="kalender__acara kalender__acara--tujuan" data-uji="chip-tujuan">
          <i class="kalender__titik kalender__titik--tujuan"></i>
          <span class="kalender__acara-teks">${esc(tujuanHari[0].judul)}</span></span>`);
      }
      if (jumlah > 2) {
        acara.push(`<span class="kalender__lebih">+${jumlah - 2}</span>`);
      }

      return `
        <button class="${kelas}" data-uji="sel-${sel.iso}" data-iso="${sel.iso}" aria-label="${sel.iso}">
          <span class="kalender__angka">${nomor(sel.hari)}</span>
          ${acara.join("")}
        </button>`;
    })
    .join("");

  // Simpan ISO bulan untuk input tanggal tujuan.
  $("kalender-grid").dataset.bulan = isoBulan;
}

/* ---------- Agenda tanggal terpilih ---------- */
function renderAgenda() {
  const iso = aplikasi.tanggalKalender;
  $("tanggal-terpilih").textContent = formatPanjang(iso);

  const agendaTujuan = tujuan.filter((t) => t.tanggalTarget === iso);
  const agendaTugas = tugas
    .filter((t) => t.tanggalTarget === iso)
    .sort((a, b) => (a.status === "selesai") - (b.status === "selesai"));

  $("agenda-kosong").hidden = agendaTujuan.length + agendaTugas.length > 0;

  const baris = [];
  for (const t of agendaTujuan) {
    baris.push(`<li class="agenda-item">
      <span class="agenda-item__ikon agenda-item__ikon--tujuan" aria-hidden="true"></span>
      <span class="agenda-item__teks${t.selesai ? " selesai" : ""}">${esc(t.judul)}</span>
    </li>`);
  }
  for (const t of agendaTugas) {
    baris.push(`<li class="agenda-item">
      <span class="agenda-item__ikon" aria-hidden="true"></span>
      <span class="agenda-item__teks${t.status === "selesai" ? " selesai" : ""}">${esc(t.judul)}</span>
      <button class="md-text-button agenda-item__tautan" data-buka-tugas>Tugas</button>
    </li>`);
  }
  $("agenda-list").innerHTML = baris.join("");
}

/* ---------- Tujuan bulan ini ---------- */
function renderTujuan() {
  const isoBulan = bulanIso();
  const daftar = tujuan
    .filter((t) => (t.bulan || (t.tanggalTarget || "").slice(0, 7)) === isoBulan)
    .sort((a, b) => (a.tanggalTarget || "").localeCompare(b.tanggalTarget || ""));

  $("judul-tujuan").textContent = `Tujuan ${NAMA_BULAN[bulan]}`;
  $("jumlah-tujuan").textContent = nomor(daftar.length);

  $("tujuan-list").innerHTML = daftar.length
    ? daftar
        .map((t) => {
          const tgl = t.tanggalTarget || "";
          return `<li class="tujuan-item">
            <label class="md-checkbox tujuan-item__cek">
              <input type="checkbox" data-uji="tujuan-cek" data-id="${esc(t.id)}" ${t.selesai ? "checked" : ""} />
              <span class="tujuan-item__teks${t.selesai ? " selesai" : ""}">${esc(t.judul)}</span>
            </label>
            <small class="tujuan-item__tanggal">${esc(tgl.slice(8))}/${esc(tgl.slice(5, 7))}</small>
            <button class="md-icon-button tujuan-item__hapus" data-hapus="${esc(t.id)}" title="Hapus">
              <span class="msr">close</span>
            </button>
          </li>`;
        })
        .join("")
    : '<li class="kosong">— Belum ada tujuan bulan ini.</li>';

  // Tanggal default mengikuti bulan yang sedang dilihat.
  if (!$("input-tujuan-tanggal").value) {
    $("input-tujuan-tanggal").value = `${isoBulan}-01`;
  }
}

/* ---------- Render gabungan ---------- */
export function renderKalender() {
  renderGrid();
  renderAgenda();
  renderTujuan();
}

/* ---------- Inisialisasi ---------- */
export function inisialisasiKalender() {
  $("bulan-sebelum").addEventListener("click", () => {
    const baru = geserBulan(tahun, bulan, -1);
    tahun = baru.tahun;
    bulan = baru.bulan;
    renderGrid();
    renderTujuan();
  });

  $("bulan-sesudah").addEventListener("click", () => {
    const baru = geserBulan(tahun, bulan, 1);
    tahun = baru.tahun;
    bulan = baru.bulan;
    renderGrid();
    renderTujuan();
  });

  $("tombol-hari-ini").addEventListener("click", () => {
    tahun = Number(kini.slice(0, 4));
    bulan = Number(kini.slice(5, 7)) - 1;
    pilihTanggal(kini);
    renderGrid();
    renderTujuan();
  });

  $("kalender-grid").addEventListener("click", (e) => {
    const sel = e.target.closest("[data-iso]");
    if (!sel) return;
    pilihTanggal(sel.dataset.iso);
    renderAgenda();
  });

  $("agenda-list").addEventListener("click", (e) => {
    if (e.target.closest("[data-buka-tugas]")) pindahHalaman("tugas");
  });

  $("tujuan-list").addEventListener("change", (e) => {
    const cek = e.target.closest("[data-uji='tujuan-cek']");
    if (cek) tandaiTujuan(cek.dataset.id, cek.checked);
  });

  $("tujuan-list").addEventListener("click", (e) => {
    const hapus = e.target.closest("[data-hapus]");
    if (!hapus) return;
    const t = tujuan.find((x) => x.id === hapus.dataset.id);
    if (t && confirm(`Hapus tujuan "${t.judul}"?`)) hapusTujuan(t.id);
  });

  $("form-tujuan").addEventListener("submit", (e) => {
    e.preventDefault();
    const judul = $("input-tujuan").value.trim();
    if (!judul) return;

    const tanggal = $("input-tujuan-tanggal").value || `${bulanIso()}-01`;
    tambahTujuan({
      judul,
      tanggalTarget: tanggal,
      bulan: tanggal.slice(0, 7),
    });

    $("input-tujuan").value = "";
    $("field-tujuan").classList.remove("md-text-field--terisi");
    $("tombol-tujuan").disabled = true;
    renderTujuan();
  });

  // Gaya label mengambang + status tombol pada form tujuan.
  $("input-tujuan").addEventListener("input", () => {
    const ada = !!$("input-tujuan").value.trim();
    $("field-tujuan").classList.toggle("md-text-field--terisi", ada);
    $("tombol-tujuan").disabled = !ada;
  });

  $("tombol-tujuan").disabled = true;
  renderKalender();
}
