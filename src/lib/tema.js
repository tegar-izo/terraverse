import { bacaTema, simpanTema } from "./storage.js";

let temaTersimpan = bacaTema(); // "gelap" secara bawaan, "terang" bila dipilih

function saatIni() {
  return temaTersimpan === "terang" ? "terang" : "gelap";
}

export function terapkanTema() {
  document.documentElement.dataset.tema = saatIni();
}

export function alihkanTema() {
  temaTersimpan = saatIni() === "gelap" ? "terang" : "gelap";
  simpanTema(temaTersimpan);
  terapkanTema();
}

terapkanTema();
