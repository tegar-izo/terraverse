import { ref } from "vue";
import {
  buatId,
  muatTugas,
  muatTujuan,
  simpanTugas,
  simpanTujuan,
  imporBersih,
} from "./storage.js";
import { isoHariIni } from "./calendar.js";
import toolsAwal from "../data/tools.json";

/* ---------- Halaman ---------- */
export const halaman = ref("beranda");
export function pindahHalaman(h) {
  halaman.value = h;
}
/** Tanggal yang terpilih untuk dibuka di kalender (ISO "YYYY-MM-DD"). */
export const tanggalKalender = ref(isoHariIni());

/* ---------- Data ---------- */
export const tugas = ref(muatTugas().tasks);
export const tujuan = ref(muatTujuan().tujuan);
/** tools secara sengaja statis dari file JSON — tinggal edit file, tanpa ubah kode */
export const tools = toolsAwal;

function stamp() {
  return new Date().toISOString();
}

/* ---------- CRUD Tugas ---------- */
export function tambahTugas(data) {
  tugas.value.push({
    id: buatId(),
    dibuatPada: stamp(),
    diubahPada: stamp(),
    ...data,
  });
  simpanTugas(tugas.value);
}

export function perbaruiTugas(id, perubahan) {
  const i = tugas.value.findIndex((t) => t.id === id);
  if (i === -1) return;
  tugas.value[i] = { ...tugas.value[i], diubahPada: stamp(), ...perubahan };
  simpanTugas(tugas.value);
}

export function hapusTugas(id) {
  tugas.value = tugas.value.filter((t) => t.id !== id);
  simpanTugas(tugas.value);
}

/* ---------- CRUD Tujuan (planning) ---------- */
export function tambahTujuan(data) {
  tujuan.value.push({
    id: buatId(),
    selesai: false,
    dibuatPada: stamp(),
    diubahPada: stamp(),
    ...data,
  });
  simpanTujuan(tujuan.value);
}

export function tandaiTujuan(id, selesai) {
  const i = tujuan.value.findIndex((t) => t.id === id);
  if (i === -1) return;
  tujuan.value[i] = { ...tujuan.value[i], selesai, diubahPada: stamp() };
  simpanTujuan(tujuan.value);
}

export function hapusTujuan(id) {
  tujuan.value = tujuan.value.filter((t) => t.id !== id);
  simpanTujuan(tujuan.value);
}

/* ---------- Impor ---------- */
export function imporData(teksJson) {
  const bersih = imporBersih(teksJson);
  if (!bersih) return false;
  tugas.value = bersih.tasks;
  tujuan.value = bersih.tujuan;
  simpanTugas(tugas.value);
  simpanTujuan(tujuan.value);
  return true;
}
