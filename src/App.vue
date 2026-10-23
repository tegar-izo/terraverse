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
const tertutup = ref(localStorage.getItem("terraverse.sidebar") === "tutup");

function alihkanSisi() {
  tertutup.value = !tertutup.value;
  localStorage.setItem("terraverse.sidebar", tertutup.value ? "tutup" : "buka");
}

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
  <div class="cangkang" :class="{ 'cangkang-tutup': tertutup }">
    <!-- ===== Sidebar (desktop) ===== -->
    <aside class="bilah-sisi">
      <div class="merek">
        <span class="logo msr msr--isi">planet</span>
        <div class="teks-merek">
          <h1>Terraverse</h1>
          <p>my space, my universe</p>
        </div>
        <button
          class="tombol-gulir mini"
          :title="tertutup ? 'Tampilkan sidebar' : 'Sembunyikan sidebar (ikon saja)'"
          @click="alihkanSisi"
        >
          <span class="msr">{{ tertutup ? "left_panel_open" : "left_panel_close" }}</span>
        </button>
      </div>

      <nav class="nav-utama">
        <button
          v-for="m of MENU"
          :key="m.id"
          class="butir-nav"
          :class="{ aktif: halaman === m.id }"
          @click="pindahHalaman(m.id)"
        >
          <span class="msr ikon">{{ m.ikon }}</span><span class="teks">{{ m.label }}</span>
        </button>
      </nav>

      <div class="bawah-sisi">
        <button class="tombol tombol--stengah" @click="unduhEkspor" title="Ekspor Data">
          <span class="msr">download</span><span class="teks"> Ekspor Data</span>
        </button>
        <button class="tombol tombol--stengah" @click="masukkan.click()" title="Impor Data">
          <span class="msr">upload</span><span class="teks"> Impor Data</span>
        </button>
        <input
          ref="masukkan"
          type="file"
          accept="application/json,.json"
          hidden
          @change="pilihFile"
        />
        <button
          class="tombol-tema"
          :title="ikutSistem() ? 'Tema: ikut sistem' : 'Tema: pilihanmu'"
          @click="klikTema"
        >
          <span class="msr msr--isi">{{ temaAktif === "gelap" ? "light_mode" : "dark_mode" }}</span>
        </button>
      </div>
    </aside>

    <!-- ===== Konten ===== -->
    <main class="konten">
      <header class="kepala-seluler">
        <div class="merek-mini msr msr--isi merek-mini-ikon">planet<b>Terraverse</b></div>
        <div class="aksi-mini">
          <button class="mini" @click="unduhEkspor" title="Ekspor data"><span class="msr">download</span></button>
          <button class="mini" @click="masukkan.click()" title="Impor data"><span class="msr">upload</span></button>
          <button class="mini" @click="klikTema" title="Ganti tema">
            <span class="msr msr--isi">{{ temaAktif === "gelap" ? "light_mode" : "dark_mode" }}</span>
          </button>
        </div>
      </header>

      <BerandaView v-if="halaman === 'beranda'" />
      <TugasView v-else-if="halaman === 'tugas'" />
      <KalenderView v-else />
    </main>

    <!-- ===== Bottom bar (mobile) ===== -->
    <nav class="bilah-bawah">
      <button
        v-for="m of MENU"
        :key="m.id"
        class="butir-bawah"
        :class="{ aktif: halaman === m.id }"
        @click="pindahHalaman(m.id)"
      >
        <span class="msr">{{ m.ikon }}</span><small>{{ m.label }}</small>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.cangkang {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

/* Sidebar */
.bilah-sisi {
  background: var(--md-surface-container);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
  width: 280px;
  transition: width 0.2s ease;
  overflow: hidden;
}
.cangkang {
  transition: grid-template-columns 0.2s ease;
}

/* ===== Mode sisi tertutup: rail ikon-saja ===== */
.cangkang-tutup {
  grid-template-columns: 76px 1fr;
}
.cangkang-tutup .bilah-sisi {
  width: 76px;
  padding: 1.5rem 0.75rem;
}
.cangkang-tutup .teks,
.cangkang-tutup .teks-merek {
  display: none;
}
.cangkang-tutup .merek {
  justify-content: center;
}
.cangkang-tutup .butir-nav,
.cangkang-tutup .bawah-sisi .tombol {
  justify-content: center;
  padding-inline: 0;
}
.cangkang-tutup .butir-nav .ikon {
  font-size: 1.2rem;
}

.merek {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.logo {
  font-size: 2.4rem;
  color: var(--md-primary);
}
.merek h1 {
  font-size: 1.4rem;
  margin: 0;
}
.merek p {
  margin: 0.1rem 0 0;
  font-size: 0.8rem;
  color: var(--md-on-surface-variant);
  font-style: italic;
}

.nav-utama {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.butir-nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  color: var(--md-on-surface-variant);
  border-radius: 999px;
}
.butir-nav:hover {
  background: var(--md-surface-container-high);
}
.butir-nav.aktif {
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.tombol-gulir {
  margin-left: auto;
  border: none;
  cursor: pointer;
  padding: 0.45rem;
  border-radius: 999px;
  background: var(--md-surface-container-high);
  display: grid;
  place-items: center;
  color: var(--md-on-surface);
  flex: none;
}
.cangkang-tutup .tombol-gulir {
  margin-left: 0;
}
.cangkang-tutup .merek {
  flex-direction: column;
  gap: 0.5rem;
}

.bawah-sisi {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.tombol-tema {
  border: none;
  cursor: pointer;
  padding: 0.55rem;
  border-radius: 999px;
  background: var(--md-surface-container-high);
  font-size: 1.2rem;
}

/* Konten */
.konten {
  padding: 1.75rem;
  min-width: 0;
}

.kepala-seluler,
.merek-mini,
.aksi-mini,
.bilah-bawah {
  display: none;
}

/* Mobile */
@media (max-width: 900px) {
  .cangkang {
    grid-template-columns: 1fr;
  }
  .bilah-sisi {
    display: none;
  }
  .kepala-seluler {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -0.5rem 0 1rem;
  }
  .merek-mini {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 1.1rem;
  }
  .aksi-mini {
    display: inline-flex;
    gap: 0.4rem;
  }
  .mini {
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 999px;
    background: var(--md-surface-container-high);
    font-size: 1rem;
    display: grid;
    place-items: center;
  }
  .merek-mini-ikon {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .bilah-bawah {
    position: fixed;
    inset: auto 1rem 1rem 1rem;
    display: flex;
    justify-content: space-around;
    background: var(--md-surface-container);
    border-radius: 999px;
    box-shadow: var(--shadow-kartu);
    padding: 0.5rem;
    z-index: 10;
  }
  .butir-bawah {
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    padding: 0.35rem 1.1rem;
    border-radius: 999px;
    background: transparent;
    color: var(--md-on-surface-variant);
    font-size: 1.1rem;
  }
  .butir-bawah small {
    font-size: 0.7rem;
    font-weight: 600;
  }
  .butir-bawah.aktif {
    background: var(--md-primary-container);
    color: var(--md-on-primary-container);
  }
  .konten {
    padding: 1rem 1rem 5rem;
  }
}
</style>
