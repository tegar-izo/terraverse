<script setup>
import { ref, onMounted } from "vue";
import { halaman, pindahHalaman, imporData } from "./lib/state.js";
import { alihkanTema, ikutSistem } from "./lib/tema.js";
import { unduhEkspor } from "./lib/storage.js";
import BerandaView from "./views/BerandaView.vue";
import TugasView from "./views/TugasView.vue";
import KalenderView from "./views/KalenderView.vue";

const MENU = [
  { id: "beranda", ikon: "home", label: "Beranda" },
  { id: "tugas", ikon: "checklist", label: "Tugas" },
  { id: "kalender", ikon: "calendar_month", label: "Kalender" },
];

const masukkan = ref(null);
const temaAktif = ref(document.documentElement.dataset.tema || "terang");

onMounted(() => {
  temaAktif.value = document.documentElement.dataset.tema || "terang";
});

function klikTema() {
  alihkanTema();
  temaAktif.value = document.documentElement.dataset.tema || "terang";
}

function pilihFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const pembaca = new FileReader();
  pembaca.onload = () => {
    const sukses = imporData(String(pembaca.result || ""));
    alert(
      sukses
        ? "Berhasil impor — data lama telah diganti."
        : 'Gagal impor: file tidak valid (harus berisi "tasks" dan "tujuan" berupa array).'
    );
  };
  pembaca.readAsText(file);
  e.target.value = "";
}
</script>

<template>
  <div class="md-shell">
    <!-- ===== Navigation drawer (expanded ≥1200px) ===== -->
    <aside class="md-nav-drawer" aria-label="Navigasi utama">
      <div class="drawer-brand">
        <span class="msr msr--isi drawer-brand__logo">planet</span>
        <div>
          <h1 class="md-title-medium">Terraverse</h1>
          <p class="md-body-small drawer-brand__sub">my space, my universe</p>
        </div>
      </div>

      <nav class="drawer-nav">
        <button
          v-for="m of MENU"
          :key="m.id"
          class="md-nav-item"
          :class="{ 'md-nav-item--aktif': halaman === m.id }"
          :data-uji="`nav-${m.id}`"
          :aria-current="halaman === m.id ? 'page' : null"
          @click="pindahHalaman(m.id)"
        >
          <span class="md-nav-item__ikon">
            <span class="msr" :class="{ 'msr--isi': halaman === m.id }">{{ m.ikon }}</span>
          </span>
          <span>{{ m.label }}</span>
        </button>
      </nav>

      <div class="drawer-foot">
        <button class="md-list-item" title="Ekspor data" @click="unduhEkspor">
          <span class="msr">download</span>
          <span class="md-label-large">Ekspor data</span>
        </button>
        <button class="md-list-item" title="Impor data" @click="masukkan.click()">
          <span class="msr">upload</span>
          <span class="md-label-large">Impor data</span>
        </button>
        <button
          class="md-list-item"
          :title="ikutSistem() ? 'Tema: ikut sistem' : 'Tema: pilihanmu'"
          @click="klikTema"
        >
          <span class="msr msr--isi">{{ temaAktif === "gelap" ? "light_mode" : "dark_mode" }}</span>
          <span class="md-label-large">
            {{ temaAktif === "gelap" ? "Tema terang" : "Tema gelap" }}
          </span>
        </button>
      </div>
    </aside>

    <!-- ===== Navigation rail (600–1199px) ===== -->
    <nav class="md-nav-rail" aria-label="Navigasi utama">
      <button
        class="md-icon-button rail-brand"
        title="Terraverse"
        @click="pindahHalaman('beranda')"
      >
        <span class="msr msr--isi">planet</span>
      </button>

      <button
        v-for="m of MENU"
        :key="m.id"
        class="rail-item"
        :data-uji="`nav-${m.id}`"
        :aria-current="halaman === m.id ? 'page' : null"
        @click="pindahHalaman(m.id)"
      >
        <span class="rail-indikator">
          <span class="msr" :class="{ 'msr--isi': halaman === m.id }">{{ m.ikon }}</span>
        </span>
        <span class="md-label-medium">{{ m.label }}</span>
      </button>

      <div class="rail-foot">
        <button class="md-icon-button" title="Ekspor data" @click="unduhEkspor">
          <span class="msr">download</span>
        </button>
        <button class="md-icon-button" title="Impor data" @click="masukkan.click()">
          <span class="msr">upload</span>
        </button>
        <button
          class="md-icon-button"
          :title="ikutSistem() ? 'Tema: ikut sistem' : 'Tema: pilihanmu'"
          @click="klikTema"
        >
          <span class="msr msr--isi">{{ temaAktif === "gelap" ? "light_mode" : "dark_mode" }}</span>
        </button>
      </div>
    </nav>

    <!-- ===== Top app bar + konten (compact) ===== -->
    <div class="shell-main">
      <header class="md-top-app-bar">
        <div class="topbar-brand">
          <span class="msr msr--isi">planet</span>
          <b class="md-title-medium">Terraverse</b>
        </div>
        <div class="topbar-aksi">
          <button class="md-icon-button" title="Ekspor data" @click="unduhEkspor">
            <span class="msr">download</span>
          </button>
          <button class="md-icon-button" title="Impor data" @click="masukkan.click()">
            <span class="msr">upload</span>
          </button>
          <button class="md-icon-button" title="Ganti tema" @click="klikTema">
            <span class="msr msr--isi">{{ temaAktif === "gelap" ? "light_mode" : "dark_mode" }}</span>
          </button>
        </div>
      </header>

      <main class="md-content">
        <Transition name="md-view" mode="out-in">
          <BerandaView v-if="halaman === 'beranda'" key="beranda" />
          <TugasView v-else-if="halaman === 'tugas'" key="tugas" />
          <KalenderView v-else key="kalender" />
        </Transition>
      </main>
    </div>

    <!-- ===== Navigation bar (compact <600px) ===== -->
    <nav class="md-nav-bar" aria-label="Navigasi utama">
      <button
        v-for="m of MENU"
        :key="m.id"
        class="navbar-item"
        :data-uji="`nav-${m.id}`"
        :aria-current="halaman === m.id ? 'page' : null"
        @click="pindahHalaman(m.id)"
      >
        <span class="navbar-indikator">
          <span class="msr" :class="{ 'msr--isi': halaman === m.id }">{{ m.ikon }}</span>
        </span>
        <span class="md-label-medium">{{ m.label }}</span>
      </button>
    </nav>

    <input
      ref="masukkan"
      type="file"
      accept="application/json,.json"
      hidden
      @change="pilihFile"
    />
  </div>
</template>

<style scoped>
.md-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 100vh;
  background: var(--md-surface);
}

.md-content {
  min-width: 0;
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  padding: 8px 16px calc(104px + env(safe-area-inset-bottom));
}

.shell-main {
  min-width: 0;
}

/* ---------- Drawer ---------- */
.md-nav-drawer {
  display: none;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  padding: 16px 12px;
  background: var(--md-surface-container-low);
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 20px;
}

.drawer-brand__logo {
  font-size: 40px;
  color: var(--md-primary);
}

.drawer-brand__sub {
  margin-top: 2px;
  color: var(--md-on-surface-variant);
  font-style: italic;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-foot {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--md-outline-variant);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-foot .md-list-item {
  min-height: 48px;
}

/* ---------- Rail ---------- */
.md-nav-rail {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 12px 0;
  background: var(--md-surface);
  border-right: 1px solid var(--md-outline-variant);
}

.rail-brand {
  color: var(--md-primary);
  font-size: 24px;
  margin-bottom: 12px;
}
.rail-brand .msr {
  font-size: 28px;
}

.rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 72px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  font-family: inherit;
}

.rail-indikator {
  display: grid;
  place-items: center;
  width: 56px;
  height: 32px;
  border-radius: var(--md-shape-full);
  transition: background-color var(--md-duration-short-3) var(--md-easing-standard);
}

.rail-item:hover .rail-indikator {
  background: color-mix(in srgb, var(--md-on-surface) var(--md-state-hover), transparent);
}

.rail-item[aria-current="page"] {
  color: var(--md-on-surface);
}

.rail-item[aria-current="page"] .rail-indikator {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.rail-item[aria-current="page"] .rail-indikator .msr,
.navbar-item[aria-current="page"] .navbar-indikator .msr,
.md-nav-item--aktif .md-nav-item__ikon .msr {
  animation: md-nav-pop var(--md-duration-medium-1) var(--md-easing-emphasized-decelerate);
}

@keyframes md-nav-pop {
  0% { transform: scale(0.7); }
  55% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.rail-foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ---------- Navigation bar ---------- */
.md-nav-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  justify-content: space-around;
  gap: 4px;
  height: 80px;
  padding: 0 8px env(safe-area-inset-bottom);
  background: var(--md-surface-container);
}

.navbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0 0;
  border: none;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  font-family: inherit;
}

.navbar-indikator {
  display: grid;
  place-items: center;
  width: 64px;
  height: 32px;
  border-radius: var(--md-shape-full);
  transition: background-color var(--md-duration-short-3) var(--md-easing-standard);
}

.navbar-item:hover .navbar-indikator {
  background: color-mix(in srgb, var(--md-on-surface) var(--md-state-hover), transparent);
}

.navbar-item[aria-current="page"] {
  color: var(--md-on-surface);
}

.navbar-item[aria-current="page"] .navbar-indikator {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

/* ---------- Top app bar (compact) ---------- */
.topbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--md-primary);
}

.topbar-brand b {
  color: var(--md-on-surface);
}

.topbar-aksi {
  display: flex;
  gap: 4px;
}

/* ---------- Breakpoint M3 ---------- */
@media (min-width: 600px) {
  .md-shell {
    grid-template-columns: 80px minmax(0, 1fr);
  }
  .md-nav-rail {
    display: flex;
  }
  .md-nav-bar,
  .md-top-app-bar {
    display: none;
  }
  .md-content {
    padding: 24px 24px 40px;
  }
}

@media (min-width: 1200px) {
  .md-shell {
    grid-template-columns: 280px minmax(0, 1fr);
  }
  .md-nav-rail {
    display: none;
  }
  .md-nav-drawer {
    display: flex;
  }
  .md-content {
    padding: 32px 32px 48px;
  }
}
</style>
