import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM(
  "<!doctype html><html><head><title>t</title></head><body><div id='app'></div></body></html>",
  { pretendToBeVisual: true, url: "http://localhost:4173/" }
);
dom.window.onerror = (msg, src, line, col, err) =>
  console.error("WINDOW.onerror:", msg, err?.stack ?? "");

for (const k of [
  "window", "document", "localStorage", "HTMLElement", "Element", "Node",
  "SVGElement", "requestAnimationFrame", "cancelAnimationFrame",
  "getComputedStyle", "MutationObserver", "FileReader", "CustomEvent",
  "Event", "FocusEvent", "DragEvent", "Document", "Window", "HTMLInputElement",
  "HTMLTextAreaElement", "HTMLSelectElement", "HTMLButtonElement",
  "HTMLAnchorElement", "KeyboardEvent", "MouseEvent", "PointerEvent",
]) {
  if (dom.window[k] !== undefined) {
    try { globalThis[k] = dom.window[k]; }
    catch { Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true }); }
  }
}
try {
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
} catch { /* sudah ada */ }
globalThis.matchMedia = undefined;

const asetJs = fs.readFileSync("dist/index.html", "utf8").match(/assets\/index-[\w-]+\.js/)[0];
await import(path.join("..", "dist", asetJs));

await new Promise((r) => setTimeout(r, 300));
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

function butirNav(id) {
  return document.querySelector(`[data-uji="nav-${id}"]`);
}

/* ---------- 1. Tambah tugas via dialog ---------- */
butirNav("tugas").click();
await tunggu(100);
const tombolTambah = document.querySelector('[data-uji="tugas-baru"]');
if (!tombolTambah) { console.error("❌ tombol Tugas Baru tidak ada"); process.exit(1); }
tombolTambah.click();
await tunggu(50);

const inputJudul = document.querySelector('[data-uji="tugas-judul"]');
const inputTgl = document.querySelector('[data-uji="tugas-tanggal"]');
if (!inputJudul || !inputTgl) {
  console.error("❌ dialog tidak terbuka / field tugas tak ditemukan");
  process.exit(1);
}

inputJudul.value = "Uji otomatis tugas";
inputJudul.dispatchEvent(new Event("input", { bubbles: true }));
inputTgl.value = "2026-11-05";
inputTgl.dispatchEvent(new Event("input", { bubbles: true }));
await tunggu(50);

document.querySelector('[data-uji="tugas-simpan"]').click();
await tunggu(100);

const tersimpan = JSON.parse(localStorage.getItem("terraverse.tasks") || "{}");
console.log("tasks tersimpan:", tersimpan.tasks?.length, JSON.stringify(tersimpan.tasks?.[0]));
if (tersimpan.tasks?.length !== 1) { console.error("❌ tugas tidak tersimpan"); process.exit(2); }

const kartu = [...document.querySelectorAll('[data-uji="kartu-tugas"]')].find((k) =>
  k.textContent.includes("Uji otomatis tugas")
);
if (!kartu) { console.error("❌ kartu tugas tidak tampil di board"); process.exit(3); }
console.log("✅ Board menampilkan tugas:", kartu.querySelector('[data-uji="judul-tugas"]')?.textContent);

/* ---------- 2. Tugas muncul di kalender ---------- */
butirNav("kalender").click();
await tunggu(100);
console.log("Bulan tampil:", document.querySelector('[data-uji="label-bulan"]')?.textContent.trim());

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Geser kalender ke bulan dari ISO target, ke arah mana pun. */
async function keBulan(iso) {
  const [th, bl] = iso.split("-").map(Number);
  const target = th * 12 + (bl - 1);
  for (let i = 0; i < 60; i++) {
    const label = document.querySelector('[data-uji="label-bulan"]')?.textContent.trim() ?? "";
    const [nama, tahun] = label.split(" ");
    const kini = Number(tahun) * 12 + BULAN.indexOf(nama);
    if (kini === target) return;
    const tombol = document.querySelector(
      kini < target ? '[data-uji="bulan-sesudah"]' : '[data-uji="bulan-sebelum"]'
    );
    tombol.click();
    await tunggu(50);
  }
}

await keBulan("2026-11");
const chip = [...document.querySelectorAll('[data-uji="chip-tugas"]')].find((c) =>
  c.textContent.includes("Uji otomatis tugas")
);
console.log("Bulan target:", document.querySelector('[data-uji="label-bulan"]')?.textContent.trim());
if (!chip) { console.error("❌ chip tugas tidak muncul di kalender November"); process.exit(4); }
console.log("✅ Chip tugas di kalender:", chip.textContent.trim());

/* ---------- 3. Tambah tujuan planning ---------- */
const formTujuan = document.querySelector('[data-uji="form-tujuan"]');
const inputTujuan = formTujuan.querySelector('[data-uji="tujuan-judul"]');
const inputTglTujuan = formTujuan.querySelector('[data-uji="tujuan-tanggal"]');
inputTujuan.value = "Uji otomatis tujuan";
inputTujuan.dispatchEvent(new Event("input", { bubbles: true }));
inputTglTujuan.value = "2026-11-20";
inputTglTujuan.dispatchEvent(new Event("input", { bubbles: true }));
await tunggu(50);
formTujuan.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
await tunggu(100);

const tujuanTersimpan = JSON.parse(localStorage.getItem("terraverse.planning") || "{}");
console.log("tujuan tersimpan:", tujuanTersimpan.tujuan?.length, JSON.stringify(tujuanTersimpan.tujuan?.[0]));
if (tujuanTersimpan.tujuan?.length !== 1) { console.error("❌ tujuan tidak tersimpan"); process.exit(5); }

const chipTujuan = [...document.querySelectorAll('[data-uji="chip-tujuan"]')].find((c) =>
  c.textContent.includes("Uji otomatis tujuan")
);
if (!chipTujuan) { console.error("❌ chip tujuan tidak muncul di kalender"); process.exit(6); }
console.log("✅ Chip tujuan di kalender:", chipTujuan.textContent.trim());

/* ---------- 4. Checkbox tujuan ---------- */
const ceklis = document.querySelector('[data-uji="tujuan-cek"]');
ceklis.click();
await tunggu(50);
const cekUlang = JSON.parse(localStorage.getItem("terraverse.planning"));
console.log("selesai =", cekUlang.tujuan[0].selesai);
if (cekUlang.tujuan[0].selesai !== true) { console.error("❌ checkbox tidak tersimpan"); process.exit(7); }
console.log("✅ Checkbox tujuan bekerja");

console.log("🏁 Semua uji interaksi lulus");
