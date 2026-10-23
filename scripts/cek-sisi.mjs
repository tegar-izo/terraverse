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
  "HTMLAnchorElement",
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

const cangkang = document.querySelector(".cangkang");
const tombol = document.querySelector(".tombol-gulir");
if (!tombol) { console.error("❌ tombol-gulir tidak ada"); process.exit(1); }

// Awal: terbuka
if (cangkang.classList.contains("cangkang-tutup")) {
  console.error("❌ awal harus terbuka (localStorage kosong)");
  process.exit(2);
}

// Klik pertama → tertutup, ikon-saja
tombol.click();
await new Promise((r) => setTimeout(r, 100));
if (!cangkang.classList.contains("cangkang-tutup")) { console.error("❌ tidak tertutup setelah klik"); process.exit(3); }
// teks nav harus tersembunyi (display:none → offsetParent null)
const hasilTeks = document.querySelector(".butir-nav .teks");
if (hasilTeks?.offsetParent !== null) {
  console.error("❌ teks nav masih tampil saat tertutup");
  process.exit(4);
}
const tersimpan = localStorage.getItem("terraverse.sidebar");
console.log("localStorage sidebar:", tersimpan);
if (tersimpan !== "tutup") { console.error("❌ persistensi gagal"); process.exit(5); }

// Klik kedua → terbuka lagi
tombol.click();
await new Promise((r) => setTimeout(r, 100));
if (cangkang.classList.contains("cangkang-tutup")) { console.error("❌ tidak terbuka setelah klik kedua"); process.exit(6); }
if (localStorage.getItem("terraverse.sidebar") !== "buka") { console.error("❌ persistensi buka gagal"); process.exit(7); }

console.log("✅ Toggle sidebar (ikon-saja + persistensi) berjalan");
