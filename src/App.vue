<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";
import { halaman, pindahHalaman, imporData } from "./lib/state.js";
import { alihkanTema } from "./lib/tema.js";
import { unduhEkspor } from "./lib/storage.js";
import { kurangiGerak, putarIkon } from "./lib/animasi.js";
import BerandaView from "./views/BerandaView.vue";
import TugasView from "./views/TugasView.vue";
import KalenderView from "./views/KalenderView.vue";

const MENU = [
  { id: "beranda", ikon: "home", label: "Beranda" },
  { id: "tugas", ikon: "checklist", label: "Tugas" },
  { id: "kalender", ikon: "calendar_month", label: "Kalender" },
];

const masukkan = ref(null);
const temaAktif = ref(document.documentElement.dataset.tema || "gelap");

onMounted(() => {
  temaAktif.value = document.documentElement.dataset.tema || "gelap";
  if (!kurangiGerak()) {
    gsap.from(".site-head__in", {
      y: -14,
      opacity: 0,
      duration: 0.55,
      ease: "power3.out",
      clearProps: "transform,opacity",
    });
  }
});

function klikTema() {
  alihkanTema();
  temaAktif.value = document.documentElement.dataset.tema || "gelap";
  putarIkon(document.querySelector(".util-tema .msr"));
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
  <div class="site">
    <!-- ===== Kepala situs ===== -->
    <header class="site-head">
      <div class="site-head__in md-top-app-bar">
        <button class="brand" title="Terraverse — Beranda" @click="pindahHalaman('beranda')">
          <span class="msr msr--isi brand__mark" aria-hidden="true">planet</span>
          <span class="brand__text">
            <span class="brand__name">Terraverse</span>
            <span class="brand__sub">my space, my universe</span>
          </span>
        </button>

        <nav class="md-nav-drawer" aria-label="Navigasi utama">
          <button
            v-for="(m, i) of MENU"
            :key="m.id"
            class="md-nav-item"
            :class="{ 'md-nav-item--aktif': halaman === m.id }"
            :data-uji="`nav-${m.id}`"
            :aria-current="halaman === m.id ? 'page' : null"
            @click="pindahHalaman(m.id)"
          >
            <span class="nav-no">{{ String(i + 1).padStart(2, "0") }}</span>
            <span>{{ m.label }}</span>
          </button>
        </nav>

        <nav class="md-nav-rail" aria-label="Navigasi utama">
          <button
            v-for="(m, i) of MENU"
            :key="m.id"
            class="md-nav-item rail-item"
            :class="{ 'md-nav-item--aktif': halaman === m.id }"
            :data-uji="`nav-${m.id}`"
            :aria-current="halaman === m.id ? 'page' : null"
            :title="m.label"
            :aria-label="m.label"
            @click="pindahHalaman(m.id)"
          >
            <span class="nav-no">{{ String(i + 1).padStart(2, "0") }}</span>
          </button>
        </nav>

        <div class="site-head__util">
          <button class="util-btn" title="Ekspor data" @click="unduhEkspor">
            <span class="msr">download</span>
            <span class="util-btn__teks">Ekspor</span>
          </button>
          <button class="util-btn" title="Impor data" @click="masukkan.click()">
            <span class="msr">upload</span>
            <span class="util-btn__teks">Impor</span>
          </button>
          <span class="util-sep" aria-hidden="true"></span>
          <button
            class="md-icon-button util-tema"
            :title="temaAktif === 'gelap' ? 'Tema terang' : 'Tema gelap'"
            :aria-label="temaAktif === 'gelap' ? 'Tema terang' : 'Tema gelap'"
            @click="klikTema"
          >
            <span class="msr msr--isi">{{ temaAktif === "gelap" ? "light_mode" : "dark_mode" }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ===== Konten ===== -->
    <main class="md-content">
      <Transition name="md-view" mode="out-in">
        <BerandaView v-if="halaman === 'beranda'" key="beranda" />
        <TugasView v-else-if="halaman === 'tugas'" key="tugas" />
        <KalenderView v-else key="kalender" />
      </Transition>
    </main>

    <footer class="site-foot">
      <div class="site-foot__in">
        <span class="msr site-foot__mark" aria-hidden="true">planet</span>
        <span>Terraverse</span>
        <span class="site-foot__lead" aria-hidden="true"></span>
        <span class="tag">Data tersimpan di peramban ini</span>
      </div>
    </footer>

    <!-- ===== Navigasi bawah (layar kecil) ===== -->
    <nav class="md-nav-bar" aria-label="Navigasi utama">
      <button
        v-for="(m, i) of MENU"
        :key="m.id"
        class="navbar-item"
        :class="{ 'navbar-item--aktif': halaman === m.id }"
        :data-uji="`nav-${m.id}`"
        :aria-current="halaman === m.id ? 'page' : null"
        @click="pindahHalaman(m.id)"
      >
        <span class="navbar-no">{{ String(i + 1).padStart(2, "0") }}</span>
        <span class="navbar-label">{{ m.label }}</span>
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
.site {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--paper);
}

/* ---------- Kepala ---------- */
.site-head {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.site-head__in {
  max-width: var(--max);
  margin-inline: auto;
  padding: 0 var(--gutter);
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--s5);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  flex: none;
}

.brand__mark {
  font-size: 22px;
  line-height: 1;
  color: var(--sun);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand__name {
  font-family: var(--f-display);
  font-size: 21px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
}

.brand__sub {
  font-family: var(--f-mono);
  font-size: 7.5px;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-faint);
  white-space: nowrap;
}

/* ---------- Navigasi desktop / sedang ---------- */
.md-nav-drawer {
  display: none;
  align-items: center;
  gap: 26px;
  margin-inline: auto;
}

.md-nav-rail {
  display: none;
  align-items: center;
  gap: 20px;
  margin-inline: auto;
}

.nav-no {
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  transition: color var(--md-duration-short-3) var(--md-easing-standard);
}

.md-nav-item--aktif .nav-no {
  color: var(--sun);
}

.rail-item {
  width: 32px;
  height: 32px;
  justify-content: center;
  border: 1px solid var(--line-soft);
  color: var(--ink-faint);
}
.rail-item:hover {
  border-color: var(--line-strong);
}
.rail-item.md-nav-item--aktif {
  border-color: var(--line-strong);
  background: var(--tint5);
}

.md-nav-item {
  position: relative;
}
.md-nav-item--aktif::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 1px;
  background: var(--sun);
}

/* ---------- Util kanan ---------- */
.site-head__util {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.util-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--ink-muted);
  cursor: pointer;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition:
    border-color var(--md-duration-short-3) var(--md-easing-standard),
    color var(--md-duration-short-3) var(--md-easing-standard);
}
.util-btn .msr {
  font-size: 16px;
}
.util-btn:hover {
  border-color: var(--line-soft);
  color: var(--ink);
}
.util-btn__teks {
  display: none;
}

.util-sep {
  width: 1px;
  height: 18px;
  background: var(--line);
  margin-inline: 2px;
}

.util-tema {
  border-color: transparent;
}
.util-tema:hover {
  border-color: var(--line-strong);
}

/* ---------- Konten ---------- */
.md-content {
  flex: 1;
  width: 100%;
  max-width: var(--max);
  margin-inline: auto;
  padding: var(--s6) var(--gutter) calc(var(--s8) + 56px);
}

/* ---------- Kaki ---------- */
.site-foot {
  border-top: 1px solid var(--line-soft);
  margin-top: auto;
}
.site-foot__in {
  max-width: var(--max);
  margin-inline: auto;
  padding: var(--s4) var(--gutter) calc(var(--s4) + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: var(--s3);
  font-family: var(--f-sans);
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.site-foot__mark {
  font-size: 12px;
  color: var(--ink-faint);
}
.site-foot__lead {
  flex: 1;
  height: 1px;
  background: var(--line-soft);
}
.site-foot .tag {
  white-space: nowrap;
}

/* ---------- Navigasi bawah ---------- */
.md-nav-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 45;
  display: flex;
  background: color-mix(in srgb, var(--paper) 94%, transparent);
  border-top: 1px solid var(--line);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding-bottom: env(safe-area-inset-bottom);
}

.navbar-item {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 52px;
  padding: 0;
  border: none;
  border-right: 1px solid var(--line-soft);
  background: transparent;
  color: var(--ink-muted);
  cursor: pointer;
  font-family: var(--f-sans);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.navbar-item:last-child {
  border-right: none;
}
.navbar-item--aktif {
  color: var(--ink);
}
.navbar-item--aktif::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--sun);
}
.navbar-no {
  font-family: var(--f-mono);
  font-size: 0.4375rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
}
.navbar-item--aktif .navbar-no {
  color: var(--sun);
}

/* ---------- Breakpoint ---------- */
@media (min-width: 600px) {
  .site-head__in {
    height: 68px;
  }
  .md-content {
    padding-top: var(--s7);
    padding-bottom: var(--s8);
  }
  .md-nav-bar {
    display: none;
  }
  .md-nav-rail {
    display: flex;
  }
  .site-foot__in {
    padding-bottom: var(--s4);
  }
}

@media (min-width: 760px) {
  .util-btn__teks {
    display: inline;
  }
}

@media (min-width: 1080px) {
  .md-nav-rail {
    display: none;
  }
  .md-nav-drawer {
    display: flex;
  }
  .brand__sub {
    font-size: 8px;
  }
}

@media (max-width: 599px) {
  .site-head__in {
    height: 58px;
    gap: var(--s3);
  }
  .brand__name {
    font-size: 20px;
  }
  .brand__sub {
    display: none;
  }
  .site-head__util {
    margin-left: auto;
  }
  .md-content {
    padding-top: var(--s5);
    padding-bottom: calc(var(--s8) + 40px);
  }
  .site-foot {
    padding-bottom: 52px;
  }
  .site-foot__lead {
    display: none;
  }
  .site-foot .tag {
    margin-left: auto;
    font-size: 0.4375rem;
  }
}
</style>
