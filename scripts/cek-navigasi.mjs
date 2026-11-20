import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM(
  "<!doctype html><html><head><title>t</title></head><body><div id='app'></div></body></html>",
  { pretendToBeVisual: true, url: "http://localhost:4173/" }
);
for (const k of [
  "window", "document", "localStorage", "HTMLElement", "Element", "Node",
  "SVGElement", "requestAnimationFrame", "cancelAnimationFrame",
  "getComputedStyle", "MutationObserver", "FileReader", "CustomEvent", "Event",
  "Document", "HTMLInputElement", "HTMLSelectElement", "HTMLButtonElement",
  "HTMLAnchorElement", "KeyboardEvent",
]) {
  if (dom.window[k] !== undefined) {
    try { globalThis[k] = dom.window[k]; }
    catch { Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true }); }
  }
}
globalThis.matchMedia = undefined;

const asetJs = fs.readFileSync("dist/index.html", "utf8").match(/assets\/index-[\w-]+\.js/)[0];
await import(path.join("..", "dist", asetJs));
await new Promise((r) => setTimeout(r, 300));

// 1. Ketiga varian navigasi M3 tersedia (CSS yang memilih per breakpoint).
for (const sel of [".md-nav-bar", ".md-nav-rail", ".md-nav-drawer", ".md-top-app-bar"]) {
  if (!document.querySelector(sel)) {
    console.error(`❌ ${sel} tidak ada`);
    process.exit(1);
  }
}
console.log("✅ Navigation bar, rail, drawer, dan top app bar tersedia");

// 2. Fitur ciut sidebar lama sudah tidak ada.
if (document.querySelector(".tombol-gulir") || localStorage.getItem("terraverse.sidebar") !== null) {
  console.error("❌ fitur sidebar ciut masih tersisa");
  process.exit(2);
}
console.log("✅ Tidak ada state sidebar lama");

// 3. Navigasi menandai halaman aktif di semua varian.
const tujuan = document.querySelector('[data-uji="nav-kalender"]');
if (!tujuan) { console.error("❌ butir navigasi Kalender tidak ada"); process.exit(3); }
tujuan.click();
await new Promise((r) => setTimeout(r, 100));

const judul = document.querySelector('[data-uji="label-bulan"]')?.textContent.trim();
console.log("Judul kalender:", judul);
if (!judul?.includes("2026")) { console.error("❌ view Kalender tidak terbuka"); process.exit(4); }

const semuaKalender = [...document.querySelectorAll('[data-uji="nav-kalender"]')];
for (const b of semuaKalender) {
  if (b.getAttribute("aria-current") !== "page") {
    console.error("❌ aria-current tidak dipasang di semua varian navigasi");
    process.exit(5);
  }
}
const beranda = document.querySelector('[data-uji="nav-beranda"]');
if (beranda?.getAttribute("aria-current") !== null) {
  console.error("❌ halaman lama masih ditandai aktif");
  process.exit(6);
}
console.log(`✅ ${semuaKalender.length} varian navigasi menandai halaman aktif`);

console.log("🏁 Navigasi adaptif M3 berjalan");
