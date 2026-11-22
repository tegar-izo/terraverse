import { ref } from "vue";

/**
 * `beforeinstallprompt` bisa muncul sebelum Vue selesai mount, jadi listener
 * dipasang di level modul agar tombol Pasang tidak melewatkan event tersebut.
 */
export const bisaPasang = ref(false);
const promptPasang = ref(null);

function tangkapPrompt(peristiwa) {
  peristiwa.preventDefault();
  if (window.matchMedia?.("(display-mode: standalone)").matches) return;
  promptPasang.value = peristiwa;
  bisaPasang.value = true;
}

function selesaiPasang() {
  promptPasang.value = null;
  bisaPasang.value = false;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", tangkapPrompt);
  window.addEventListener("appinstalled", selesaiPasang);
}

export async function pasangAplikasi() {
  const peristiwa = promptPasang.value;
  if (!peristiwa) return;

  try {
    peristiwa.prompt();
    await peristiwa.userChoice;
  } finally {
    // Prompt hanya bisa dipakai sekali; browser akan mengirim event baru
    // jika aplikasi masih memenuhi syarat pemasangan.
    promptPasang.value = null;
    bisaPasang.value = false;
  }
}
