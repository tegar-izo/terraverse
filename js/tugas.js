import {
  tugas,
  tools,
  tambahTugas,
  perbaruiTugas,
  hapusTugas,
} from "./state.js";
import { isoHariIni } from "./calendar.js";
import { esc, nomor } from "./util.js";

const KOLOM = ["todo", "dikerjakan", "selesai"];
const URUT_PRIORITAS = { tinggi: 0, sedang: 1, rendah: 2 };
const NAMA_PRIORITAS = { tinggi: "Tinggi", sedang: "Sedang", rendah: "Rendah" };

const $ = (id) => document.getElementById(id);

let idEdit = null;
let statusPilihan = "todo";
let terangkatId = null;

function kelasPrioritas(p) {
  if (p === "tinggi") return "md-chip--error";
  if (p === "sedang") return "md-chip--primary";
  return "";
}

function bandingkan(a, b) {
  const p = (URUT_PRIORITAS[a.prioritas] ?? 1) - (URUT_PRIORITAS[b.prioritas] ?? 1);
  if (p !== 0) return p;
  const ta = a.tanggalTarget || "9999-12-31";
  const tb = b.tanggalTarget || "9999-12-31";
  return ta.localeCompare(tb);
}

/* ---------- Kartu ---------- */
function kartuHtml(t, status) {
  const meta = [];
  if (t.tanggalTarget) {
    meta.push(`<span class="md-chip md-chip--kecil md-chip--tonal">
      <span class="msr">event</span>${esc(t.tanggalTarget)}</span>`);
  }
  if (t.tagTool) {
    meta.push(`<span class="md-chip md-chip--kecil">
      <span class="msr">build</span>${esc(t.tagTool)}</span>`);
  }

  return `
    <article class="md-card md-card--outlined tugas-card${t.status === "selesai" ? " tugas-card--selesai" : ""}"
             data-uji="kartu-tugas" data-id="${esc(t.id)}" draggable="true">
      <div class="tugas-card__kepala">
        <b class="tugas-card__judul" data-uji="judul-tugas">${esc(t.judul)}</b>
        <span class="md-chip md-chip--kecil ${kelasPrioritas(t.prioritas)}">
          ${esc(NAMA_PRIORITAS[t.prioritas] || "Sedang")}
        </span>
      </div>

      ${t.deskripsi ? `<p class="tugas-card__deskripsi">${esc(t.deskripsi)}</p>` : ""}

      ${meta.length ? `<div class="tugas-card__meta">${meta.join("")}</div>` : ""}

      <div class="tugas-card__aksi">
        <button class="md-icon-button" data-aksi="kiri" title="Geser ke kiri"
                ${status === "todo" ? "disabled" : ""}>
          <span class="msr">arrow_back</span>
        </button>
        <button class="md-icon-button" data-aksi="hapus" title="Hapus">
          <span class="msr">delete</span>
        </button>
        <button class="md-icon-button" data-aksi="kanan" title="Geser ke kanan"
                ${status === "selesai" ? "disabled" : ""}>
          <span class="msr">arrow_forward</span>
        </button>
      </div>
    </article>`;
}

/* ---------- Board ---------- */
export function renderTugas() {
  for (const status of KOLOM) {
    const daftar = tugas.filter((t) => t.status === status).sort(bandingkan);
    $("jumlah-" + status).textContent = nomor(daftar.length);
    $("daftar-" + status).innerHTML = daftar.map((t) => kartuHtml(t, status)).join("");
  }
  $("kosong-todo").hidden = tugas.some((t) => t.status === "todo");
}

function pindahStatus(id, status) {
  const t = tugas.find((x) => x.id === id);
  if (t && t.status !== status) perbaruiTugas(id, { status });
}

function geserPanah(id, arah) {
  const t = tugas.find((x) => x.id === id);
  if (!t) return;
  const i = KOLOM.indexOf(t.status);
  const j = Math.min(KOLOM.length - 1, Math.max(0, i + arah));
  if (j !== i) pindahStatus(id, KOLOM[j]);
}

/* ---------- Dialog ---------- */
function setStatus(nilai) {
  statusPilihan = nilai;
  for (const tombol of $("pilih-status").querySelectorAll("[data-status]")) {
    const aktif = tombol.dataset.status === nilai;
    tombol.classList.toggle("md-segmented__item--aktif", aktif);
    tombol.querySelector(".msr").hidden = !aktif;
  }
}

function segarkanLabelField() {
  $("field-judul").classList.toggle("md-text-field--terisi", !!$("input-judul").value);
  $("field-tanggal").classList.toggle("md-text-field--terisi", !!$("input-tanggal").value);
  $("tombol-simpan").disabled = !$("input-judul").value.trim();
}

function bukaDialog(tugasEdit) {
  idEdit = tugasEdit ? tugasEdit.id : null;

  $("dialog-tag").textContent = tugasEdit ? "Ubah entri" : "Entri baru";
  $("judul-dialog").textContent = tugasEdit ? "Edit Tugas" : "Tugas Baru";
  $("input-judul").value = tugasEdit?.judul ?? "";
  $("input-deskripsi").value = tugasEdit?.deskripsi ?? "";
  $("input-tanggal").value = tugasEdit?.tanggalTarget ?? isoHariIni();
  $("input-prioritas").value = tugasEdit?.prioritas || "sedang";
  $("input-tag").value = tugasEdit?.tagTool || "";
  setStatus(tugasEdit?.status || "todo");
  segarkanLabelField();

  $("dialog-tugas").hidden = false;
  $("input-judul").focus();
}

function tutupDialog() {
  $("dialog-tugas").hidden = true;
  idEdit = null;
}

function simpanDialog(e) {
  e.preventDefault();
  const judul = $("input-judul").value.trim();
  if (!judul) return;

  const isi = {
    judul,
    deskripsi: $("input-deskripsi").value.trim(),
    tanggalTarget: $("input-tanggal").value,
    status: statusPilihan,
    prioritas: $("input-prioritas").value,
    tagTool: $("input-tag").value,
  };

  if (idEdit) perbaruiTugas(idEdit, isi);
  else tambahTugas(isi);

  tutupDialog();
}

/* ---------- Inisialisasi ---------- */
export function inisialisasiTugas() {
  $("tombol-tugas-baru").addEventListener("click", () => bukaDialog(null));
  $("tombol-batal").addEventListener("click", tutupDialog);
  $("form-tugas").addEventListener("submit", simpanDialog);

  $("dialog-tugas").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) tutupDialog();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("dialog-tugas").hidden) tutupDialog();
  });

  $("input-judul").addEventListener("input", segarkanLabelField);
  $("input-tanggal").addEventListener("input", segarkanLabelField);

  $("pilih-status").addEventListener("click", (e) => {
    const tombol = e.target.closest("[data-status]");
    if (tombol) setStatus(tombol.dataset.status);
  });

  for (const tl of tools) {
    const opt = document.createElement("option");
    opt.value = tl.nama;
    opt.textContent = tl.nama;
    $("input-tag").append(opt);
  }

  // Klik kartu membuka edit; tombol aksi ditangani lebih dulu.
  $("board").addEventListener("click", (e) => {
    const aksi = e.target.closest("[data-aksi]");
    const kartu = e.target.closest("[data-id]");
    if (!kartu) return;

    if (aksi) {
      e.stopPropagation();
      const t = tugas.find((x) => x.id === kartu.dataset.id);
      if (!t) return;
      if (aksi.dataset.aksi === "hapus") {
        if (confirm(`Hapus tugas "${t.judul}"?`)) hapusTugas(t.id);
      } else {
        geserPanah(t.id, aksi.dataset.aksi === "kiri" ? -1 : 1);
      }
      return;
    }

    const t = tugas.find((x) => x.id === kartu.dataset.id);
    if (t) bukaDialog(t);
  });

  // Drag & drop antar kolom.
  $("board").addEventListener("dragstart", (e) => {
    const kartu = e.target.closest("[data-id]");
    if (!kartu) return;
    terangkatId = kartu.dataset.id;
    e.dataTransfer.setData("text/plain", terangkatId);
    e.dataTransfer.effectAllowed = "move";
  });

  $("board").addEventListener("dragend", () => {
    terangkatId = null;
    for (const k of document.querySelectorAll(".kolom--sasaran")) {
      k.classList.remove("kolom--sasaran");
    }
  });

  $("board").addEventListener("dragover", (e) => {
    const kolom = e.target.closest("[data-kolom]");
    if (!kolom) return;
    e.preventDefault();
    kolom.classList.add("kolom--sasaran");
  });

  $("board").addEventListener("dragleave", (e) => {
    const kolom = e.target.closest("[data-kolom]");
    if (kolom && !kolom.contains(e.relatedTarget)) {
      kolom.classList.remove("kolom--sasaran");
    }
  });

  $("board").addEventListener("drop", (e) => {
    const kolom = e.target.closest("[data-kolom]");
    if (!kolom) return;
    e.preventDefault();
    kolom.classList.remove("kolom--sasaran");
    const id = terangkatId || e.dataTransfer.getData("text/plain");
    if (id) pindahStatus(id, kolom.dataset.kolom);
    terangkatId = null;
  });

  renderTugas();
}
