import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM(
  "<!doctype html><html><head><title>t</title></head><body><div id='app'></div></body></html>",
  {
    pretendToBeVisual: true,
    url: "http://localhost:4173/",
  }
);

dom.window.onerror = (msg, src, line, col, err) => {
  console.error("WINDOW.onerror:", msg, err?.stack ?? "");
};

for (const k of [
  "window",
  "document",
  "localStorage",
  "HTMLElement",
  "Element",
  "Node",
  "SVGElement",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "getComputedStyle",
  "MutationObserver",
  "FileReader",
  "CustomEvent",
  "Event",
  "FocusEvent",
  "DragEvent",
  "Document",
  "Window",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLButtonElement",
  "HTMLAnchorElement",
  "KeyboardEvent",
  "MouseEvent",
  "PointerEvent",
]) {
  if (dom.window[k] !== undefined) {
    try {
      globalThis[k] = dom.window[k];
    } catch {
      Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true });
    }
  }
}
try {
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
} catch { /* navigator global Node sudah ada */ }
// jsdom tidak punya matchMedia — tema.js harusnya tahan dengan ?.
globalThis.matchMedia = undefined;

const asetJs = fs
  .readFileSync("dist/index.html", "utf8")
  .match(/assets\/index-[\w-]+\.js/)[0];

try {
  await import(path.join("..", "dist", asetJs));
} catch (e) {
  console.error("GAGAL IMPOR BUNDLE:", e.stack ?? e);
  process.exit(1);
}

await new Promise((r) => setTimeout(r, 300));
const app = document.getElementById("app");
const html = app.innerHTML;
console.log("Anak #app:", app.children.length);
console.log("Panjang HTML:", html.length);
console.log("Pratinjau:", html.slice(0, 160).replace(/\s+/g, " "));
if (app.children.length === 0) {
  console.error("❌ #APP KOSONG → layar putih direproduksi");
  process.exit(2);
}
console.log("✅ Aplikasi termuat");

// Navigasi: pastikan view Tugas & Kalender juga termuat tanpa error
for (const [id, nama] of [["tugas", "Tugas"], ["kalender", "Kalender"]]) {
  const butir = document.querySelector(`[data-uji="nav-${id}"]`);
  if (!butir) {
    console.error(`TIDAK KETEMU tombol ${nama}`);
    process.exit(3);
  }
  butir.click();
  await new Promise((r) => setTimeout(r, 100));
  const judul = document.querySelector(".md-content h2");
  console.log(
    `--- View ${nama}: judul="${judul?.textContent?.trim() ?? "?"}" HTML=${app.innerHTML.length}`
  );
}
console.log("✅ Semua view termuat tanpa error");
