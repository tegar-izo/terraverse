// Lapisan penyimpanan local.
// Struktur payload sengaja lengkap dari awal (skema v1) supaya
// sinkronisasi antar perangkat nanti tinggal menambah field "syncedAt"
// tanpa migrasi yang merusak data.

const KUNCI_TUGAS = "terraverse.tasks";
const KUNCI_TUJUAN = "terraverse.planning";
const KUNCI_TEMA = "terraverse.tema";
const NAMA_FILE_EKSPOR = "terraverse-data.json";

export function buatId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function bacaJson(kunci, cadangan) {
  try {
    const teks = localStorage.getItem(kunci);
    if (!teks) return cadangan;
    const data = JSON.parse(teks);
    if (data?.schemaVersion !== 1) return cadangan;
    return data;
  } catch {
    return cadangan;
  }
}

/* ---------- Tugas ---------- */
export function muatTugas() {
  return bacaJson(KUNCI_TUGAS, { schemaVersion: 1, tasks: [] });
}

export function simpanTugas(tasks) {
  localStorage.setItem(KUNCI_TUGAS, JSON.stringify({ schemaVersion: 1, tasks }));
}

/* ---------- Tujuan (planning) ---------- */
export function muatTujuan() {
  return bacaJson(KUNCI_TUJUAN, { schemaVersion: 1, tujuan: [] });
}

export function simpanTujuan(tujuan) {
  localStorage.setItem(
    KUNCI_TUJUAN,
    JSON.stringify({ schemaVersion: 1, tujuan })
  );
}

/* ---------- Tema ---------- */
export function bacaTema() {
  return localStorage.getItem(KUNCI_TEMA) || "";
}

export function simpanTema(nilai) {
  localStorage.setItem(KUNCI_TEMA, nilai);
}

/* ---------- Ekspor / Impor ---------- */
export function dataEkspor() {
  return {
    aplikasi: "terraverse",
    schemaVersion: 1,
    dieksporPada: new Date().toISOString(),
    tasks: muatTugas().tasks,
    tujuan: muatTujuan().tujuan,
  };
}

export function unduhEkspor() {
  const blob = new Blob([JSON.stringify(dataEkspor(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = NAMA_FILE_EKSPOR;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Mengimpor file ekspor dan MENGGANTIKAN data lokal.
 * Validasi minimal: tasks & tujuan harus berupa array.
 * Mengembalikan { tasks, tujuan } yang sudah bersih, null jika tidak valid.
 */
export function imporBersih(teksJson) {
  let data;
  try {
    data = JSON.parse(teksJson);
  } catch {
    return null;
  }
  if (!Array.isArray(data?.tasks) || !Array.isArray(data?.tujuan)) return null;

  const kunciTugas = ["id", "judul", "deskripsi", "tanggalTarget", "status", "prioritas", "tagTool", "dibuatPada", "diubahPada"];
  const kunciTujuan = ["id", "judul", "tanggalTarget", "bulan", "selesai", "dibuatPada", "diubahPada"];
  const ambil = (sel, kunci) => sel.map((o) => Object.fromEntries(kunci.map((k) => [k, o[k] ?? ""])));

  return {
    tasks: ambil(data.tasks, kunciTugas),
    tujuan: ambil(data.tujuan, kunciTujuan),
  };
}
