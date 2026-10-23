import { bacaTema, simpanTema } from "./storage.js";

const mql = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
let temaTersimpan = bacaTema(); // "" berarti ikut sistem

function saatIni() {
  if (temaTersimpan === "gelap" || temaTersimpan === "terang") {
    return temaTersimpan;
  }
  return mql?.matches ? "gelap" : "terang";
}

export function terapkanTema() {
  document.documentElement.dataset.tema = saatIni();
}

export function ikutSistem() {
  return temaTersimpan === "";
}

export function alihkanTema() {
  temaTersimpan = saatIni() === "gelap" ? "terang" : "gelap";
  simpanTema(temaTersimpan);
  terapkanTema();
}

mql?.addEventListener("change", terapkanTema);
