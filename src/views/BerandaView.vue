<script setup>
import { computed } from "vue";
import {
  tugas,
  tools,
  pindahHalaman,
  tanggalKalender,
} from "../lib/state.js";
import { isoHariIni } from "../lib/calendar.js";
import MiniKalender from "../components/MiniKalender.vue";

const STATUSSOS = ["todo", "dikerjakan", "selesai"];

const jumlahTugasAktif = computed(
  () => tugas.value.filter((t) => t.status !== "selesai").length
);

const jumlahSelesaiBulanIni = computed(() => {
  const kini = isoHariIni().slice(0, 7); // "YYYY-MM"
  return tugas.value.filter(
    (t) => t.status === "selesai" && (t.tanggalTarget || "").slice(0, 7) === kini
  ).length;
});

const deadlineTerdekat = computed(() => {
  const kini = isoHariIni();
  return tugas.value
    .filter((t) => t.status !== "selesai" && t.tanggalTarget)
    .filter((t) => t.tanggalTarget >= kini)
    .sort((a, b) => a.tanggalTarget.localeCompare(b.tanggalTarget))
    .slice(0, 3);
});

function bukaDiKalender(iso) {
  tanggalKalender.value = iso;
  pindahHalaman("kalender");
}

function ikonTool(t) {
  return t.nama.trim().slice(0, 2).toUpperCase();
}
</script>

<template>
  <section>
    <div class="beranda-tata">
      <div class="kolom-utama">
        <h2 class="judul-selamat">Dashboard</h2>

        <!-- ===== Strip statistik ===== -->
        <div class="strip-stat">
      <div class="kartu stat">
        <span class="angka">{{ tools.length }}</span>
        <span class="label">Tools</span>
      </div>
      <div class="kartu stat" @click="pindahHalaman('tugas')" role="button">
        <span class="angka">{{ jumlahTugasAktif }}</span>
        <span class="label">Tugas aktif</span>
      </div>
      <div class="kartu stat">
        <span class="angka">{{ jumlahSelesaiBulanIni }}</span>
        <span class="label">Selesai bulan ini</span>
      </div>
      <div class="kartu stat stat--deadline">
        <span class="label label--tebalkan">Deadline terdekat</span>
        <button
          v-for="d of deadlineTerdekat"
          :key="d.id"
          class="butir-deadline"
          @click="bukaDiKalender(d.tanggalTarget)"
        >
          <span class="msr">schedule</span><span class="tanggal">{{ d.tanggalTarget }}</span> · {{ d.judul }}
        </button>
        <span v-if="deadlineTerdekat.length === 0" class="kosong">
          Tidak ada
        </span>
      </div>
    </div>

    <!-- ===== Grid tools ===== -->
    <h2 class="judul-reguler">Tools</h2>
    <div class="grid-tool">
      <a
        v-for="t of tools"
        :key="t.nama"
        class="kartu kartu-tool"
        :href="t.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="kepala-tool">
          <span class="wadah-ikon">
            <span class="pengganti-ikon">{{ ikonTool(t) }}</span>
            <img
              class="ikon-tool"
              :src="t.ikonUrl"
              :alt="t.nama"
              loading="lazy"
              @error="($event) => ($event.target.style.display = 'none')"
            />
          </span>
          <span class="blok-nama">
            <span class="nama">{{ t.nama }}</span>
            <span class="host">GitHub Pages</span>
          </span>
          <span class="msr buka">arrow_outward</span>
        </span>
        <span class="deskripsi">{{ t.deskripsi }}</span>
      </a>
    </div>
    <p v-if="tools.length === 0" class="kosong">
      Belum ada tools. Tambahkan lewat <code>src/data/tools.json</code>.
    </p>
      </div>

      <!-- ===== Kalender mini di samping ===== -->
      <aside class="kolom-samping">
        <MiniKalender />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.beranda-tata {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 1.25rem;
  align-items: start;
}
.kolom-samping {
  position: sticky;
  top: 1.25rem;
}

.judul-selamat {
  font-size: 1.6rem;
  margin: 0 0 1.25rem;
}
.judul-reguler {
  font-size: 1.2rem;
  margin: 1.75rem 0 1rem;
}

.strip-stat {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
}
.stat {
  padding: 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat [role="button"] {
  cursor: pointer;
}
.angka {
  font-size: 2rem;
  font-weight: 800;
  color: var(--md-primary);
}
.label {
  font-size: 0.85rem;
  color: var(--md-on-surface-variant);
}
.label--tebalkan {
  font-weight: 700;
}
.stat--deadline {
  gap: 0.45rem;
}
.butir-deadline {
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0;
  font-size: 0.85rem;
  color: var(--md-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.butir-deadline .msr {
  font-size: 16px;
}
.butir-deadline .tanggal {
  font-weight: 800;
}

.grid-tool {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1rem;
}
.kartu-tool {
  padding: 1.2rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: transform 0.15s ease;
}
.kartu-tool:hover {
  transform: translateY(-2px);
  background: var(--md-surface-container-high);
}
.kepala-tool {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.wadah-ikon {
  position: relative;
  flex: none;
  width: 48px;
  height: 48px;
}
.wadah-ikon .pengganti-ikon {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}
.wadah-ikon .ikon-tool {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.blok-nama {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  min-width: 0;
  flex: 1;
}
.nama {
  font-weight: 700;
  font-size: 1rem;
  overflow-wrap: anywhere;
}
.buka {
  margin-left: auto;
  flex: none;
  color: var(--md-on-surface-variant);
}
.deskripsi {
  font-size: 0.8rem;
  color: var(--md-on-surface-variant);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.host {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--md-on-primary-container);
  background: var(--md-primary-container);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
}

.kosong {
  color: var(--md-on-surface-variant);
  font-style: italic;
}
code {
  background: var(--md-surface-container-high);
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
}

@media (max-width: 900px) {
  .strip-stat {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 1100px) {
  .beranda-tata {
    grid-template-columns: 1fr;
  }
  .kolom-samping {
    position: static;
  }
}
</style>
