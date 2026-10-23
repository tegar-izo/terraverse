export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
export const NAMA_HARI_PENUH = [
  "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu",
];

/** Tanggal lokal ke ISO "YYYY-MM-DD" (bukan UTC, agar tidak geser hari). */
export function formatIso(t) {
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoHariIni() {
  return formatIso(new Date());
}

/**
 * Grid 6 minggu × 7 hari untuk satu bulan (0–11), mulai Senin.
 * Sel tanggal tetangga tetap disertakan (tanda dalamBulan: false).
 */
export function gridBulan(tahun, bulan) {
  const awal = new Date(tahun, bulan, 1);
  const geser = (awal.getDay() + 6) % 7; // Senin=0 … Minggu=6
  const sel = [];
  for (let i = 0; i < 42; i++) {
    const t = new Date(tahun, bulan, 1 - geser + i);
    sel.push({
      iso: formatIso(t),
      dalamBulan: t.getMonth() === bulan,
      hari: t.getDate(),
    });
  }
  return sel;
}

/** "Senin, 27 Oktober 2026" dari ISO "YYYY-MM-DD". */
export function formatPanjang(iso) {
  const [y, b, d] = iso.split("-").map(Number);
  const t = new Date(y, b - 1, d);
  return `${NAMA_HARI_PENUH[(t.getDay() + 6) % 7]}, ${d} ${NAMA_BULAN[b - 1]} ${y}`;
}

/** ISO hari ini minus/plus n hari. */
export function geserHari(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(y, m - 1, d + n);
  return formatIso(t);
}
