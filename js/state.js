import {
  buatId,
  muatTugas,
  muatTujuan,
  simpanTugas,
  simpanTujuan,
  imporBersih,
} from "./storage.js";
import { isoHariIni } from "./calendar.js";
import { tools } from "./tools.js";

export { tools };

/* ---------- Keadaan aplikasi ---------- */
export const tugas = muatTugas().tasks;
export const tujuan = muatTujuan().tujuan;

/** Halaman aktif + tanggal yang dibuka di kalender. */
export const aplikasi = {
  halaman: "beranda",
  tanggalKalender: isoHariIni(),
};

/* ---------- Pemberitahuan perubahan (pengganti reaktivitas Vue) ---------- */
const pendengar = new Set();

export function saatBerubah(fn) {
  pendengar.add(fn);
}

function umumkan() {
  for (const fn of pendengar) fn();
}

export function pindahHalaman(h) {
  if (aplikasi.halaman === h) return;
  aplikasi.halaman = h;
  umumkan();
}

export function pilihTanggal(iso) {
  aplikasi.tanggalKalender = iso;
  umumkan();
}

function stamp() {
  return new Date().toISOString();
}

/* ---------- CRUD Tugas ---------- */
export function tambahTugas(data) {
  tugas.push({
    id: buatId(),
    dibuatPada: stamp(),
    diubahPada: stamp(),
    ...data,
  });
  simpanTugas(tugas);
  umumkan();
}

export function perbaruiTugas(id, perubahan) {
  const i = tugas.findIndex((t) => t.id === id);
  if (i === -1) return;
  tugas[i] = { ...tugas[i], diubahPada: stamp(), ...perubahan };
  simpanTugas(tugas);
  umumkan();
}

export function hapusTugas(id) {
  tugas.splice(0, tugas.length, ...tugas.filter((t) => t.id !== id));
  simpanTugas(tugas);
  umumkan();
}

/* ---------- CRUD Tujuan (planning) ---------- */
export function tambahTujuan(data) {
  tujuan.push({
    id: buatId(),
    selesai: false,
    dibuatPada: stamp(),
    diubahPada: stamp(),
    ...data,
  });
  simpanTujuan(tujuan);
  umumkan();
}

export function tandaiTujuan(id, selesai) {
  const i = tujuan.findIndex((t) => t.id === id);
  if (i === -1) return;
  tujuan[i] = { ...tujuan[i], selesai, diubahPada: stamp() };
  simpanTujuan(tujuan);
  umumkan();
}

export function hapusTujuan(id) {
  tujuan.splice(0, tujuan.length, ...tujuan.filter((t) => t.id !== id));
  simpanTujuan(tujuan);
  umumkan();
}

/* ---------- Impor ---------- */
export function imporData(teksJson) {
  const bersih = imporBersih(teksJson);
  if (!bersih) return false;
  tugas.splice(0, tugas.length, ...bersih.tasks);
  tujuan.splice(0, tujuan.length, ...bersih.tujuan);
  simpanTugas(tugas);
  simpanTujuan(tujuan);
  umumkan();
  return true;
}
