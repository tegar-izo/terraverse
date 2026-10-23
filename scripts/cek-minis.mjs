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

const mk = document.querySelector(".mini-kalender");
if (!mk) {
  console.error("❌ MiniKalender tidak tampil di Beranda");
  process.exit(1);
}
const judul = mk.querySelector(".judul-kecil")?.textContent.trim();
const jumlahSel = mk.querySelectorAll(".kecil-sel").length;
console.log(`MiniKalender: "${judul}", ${jumlahSel} sel tanggal`);
if (jumlahSel !== 42) { console.error("❌ jumlah sel tidak 42"); process.exit(2); }
console.log("✅ MiniKalender tampil di Beranda");
