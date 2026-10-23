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
const app = document.getElementById("app");
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

function butirNav(teks) {
  return [...document.querySelectorAll(".butir-nav")].find((b) => b.textContent.includes(teks));
}

/* ---------- 1. Tambah tugas via modal ---------- */
butirNav("Tugas").click();
await tunggu(100);
const tombolTambah = [...document.querySelectorAll(".tombol")].find((b) =>
  b.textContent.includes("Tugas Baru")
);
if (!tombolTambah) { console.error("❌ tombol Tugas Baru tidak ada"); process.exit(1); }
tombolTambah.click();
await tunggu(50);

const labelJdl = [...document.querySelectorAll("label.bidang")].find((l) =>
  l.textContent.trim().startsWith("Judul")
);
if (!labelJdl) { console.error("❌ modal tidak terbuka / label Judul tak ditemukan"); process.exit(1); }
const inputJudul = labelJdl.querySelector("input");
const labelTgl = [...document.querySelectorAll("label.bidang")].find((l) =>
  l.textContent.trim().startsWith("Tanggal target")
);
if (!labelTgl) { console.error("❌ label Tanggal target tak ditemukan"); process.exit(1); }
const inputTgl = labelTgl.querySelector("input");

inputJudul.value = "Uji otomatis tugas";
inputJudul.dispatchEvent(new Event("input", { bubbles: true }));
inputTgl.value = "2026-11-05";
inputTgl.dispatchEvent(new Event("input", { bubbles: true }));
await tunggu(50);

const tombolSimpan = [...document.querySelectorAll(".modal .tombol")].find((b) =>
  b.textContent.includes("Simpan")
);
tombolSimpan.click();
await tunggu(100);

const tersimpan = JSON.parse(localStorage.getItem("terraverse.tasks") || "{}");
console.log("tasks tersimpan:", tersimpan.tasks?.length, JSON.stringify(tersimpan.tasks?.[0]));
if (tersimpan.tasks?.length !== 1) { console.error("❌ tugas tidak tersimpan"); process.exit(2); }

const kartu = [...document.querySelectorAll(".kartu-tugas")].find((k) =>
  k.textContent.includes("Uji otomatis tugas")
);
if (!kartu) { console.error("❌ kartu tugas tidak tampil di board"); process.exit(3); }
console.log("✅ Board menampilkan tugas:", kartu.querySelector(".judul-tugas")?.textContent);

/* ---------- 2. Tugas muncul di kalender ---------- */
butirNav("Kalender").click();
await tunggu(100);
const namaBulan = document.querySelector(".kepala h2")?.textContent.trim();
console.log("Bulan tampil:", namaBulan);

const tombolBerikut = [...document.querySelectorAll(".kepala .tombol")].pop();
tombolBerikut.click(); // ▶ ke November
await tunggu(100);
const chip = [...document.querySelectorAll(".chip-tugas")].find((c) =>
  c.textContent.includes("Uji otomatis tugas")
);
console.log("Bulan setelah ▶:", document.querySelector(".kepala h2")?.textContent.trim());
if (!chip) { console.error("❌ chip tugas tidak muncul di kalender November"); process.exit(4); }
console.log("✅ Chip tugas di kalender:", chip.textContent.trim());

/* ---------- 3. Tambah tujuan planning ---------- */
const formTujuan = document.querySelector(".form-tujuan");
const inputTujuan = formTujuan.querySelector("input:not([type=date])");
const inputTglTujuan = formTujuan.querySelector("input[type=date]");
inputTujuan.value = "Uji otomatis tujuan";
inputTujuan.dispatchEvent(new Event("input", { bubbles: true }));
inputTglTujuan.value = "2026-11-20";
inputTglTujuan.dispatchEvent(new Event("input", { bubbles: true }));
formTujuan.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
await tunggu(100);

const tujuanTersimpan = JSON.parse(localStorage.getItem("terraverse.planning") || "{}");
console.log("tujuan tersimpan:", tujuanTersimpan.tujuan?.length, JSON.stringify(tujuanTersimpan.tujuan?.[0]));
if (tujuanTersimpan.tujuan?.length !== 1) { console.error("❌ tujuan tidak tersimpan"); process.exit(5); }

const chipTujuan = [...document.querySelectorAll(".chip-tujuan")].find((c) =>
  c.textContent.includes("Uji otomatis tujuan")
);
if (!chipTujuan) { console.error("❌ chip tujuan tidak muncul di kalender"); process.exit(6); }
console.log("✅ Chip tujuan di kalender:", chipTujuan.textContent.trim());

/* ---------- 4. Checkbox tujuan ---------- */
const ceklis = document.querySelector(".baris-salin input[type=checkbox]");
ceklis.click();
await tunggu(50);
const cekUlang = JSON.parse(localStorage.getItem("terraverse.planning"));
console.log("selesai =", cekUlang.tujuan[0].selesai);
if (ceklis !== true && cekUlang.tujuan[0].selesai !== true) { console.error("❌ checkbox tidak tersimpan"); process.exit(7); }
console.log("✅ Checkbox tujuan bekerja");

console.log("🏁 Semua uji interaksi lulus");
