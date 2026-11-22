import { bacaTema, simpanTema } from "./storage.js";

let temaTersimpan = bacaTema(); // "gelap" secara bawaan, "terang" bila dipilih

const WARNA_TEMA = { gelap: "#07130d", terang: "#f1f7f1" };

function saatIni() {
  return temaTersimpan === "terang" ? "terang" : "gelap";
}

export function terapkanTema() {
  const tema = saatIni();
  document.documentElement.dataset.tema = tema;

  // Warna bilah browser / status bar mengikuti tema aplikasi.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", WARNA_TEMA[tema]);
}

export function alihkanTema() {
  temaTersimpan = saatIni() === "gelap" ? "terang" : "gelap";
  simpanTema(temaTersimpan);
  terapkanTema();
}

terapkanTema();
