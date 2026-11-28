/** Escape teks agar aman dipakai di innerHTML. */
export function esc(nilai) {
  return String(nilai ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function nomor(n) {
  return String(n).padStart(2, "0");
}
