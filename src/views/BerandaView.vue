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

const jumlahTugasAktif = computed(
  () => tugas.value.filter((t) => t.status !== "selesai").length
);

const jumlahSelesaiBulanIni = computed(() => {
  const kini = isoHariIni().slice(0, 7);
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
  <section class="beranda">
    <header class="beranda__kepala">
      <h2 class="md-headline-medium">Dashboard</h2>
      <p class="md-body-medium beranda__sub">Ringkasan ruang kerjamu hari ini.</p>
    </header>

    <div class="beranda__tata">
      <div class="beranda__utama">
        <!-- ===== Statistik ===== -->
        <div class="stat-grid">
          <div class="md-card md-card--filled stat">
            <span class="md-display-small stat__angka">{{ tools.length }}</span>
            <span class="md-label-medium stat__label">Tools</span>
          </div>

          <button
            class="md-card md-card--filled stat stat--aksi"
            data-uji="stat-tugas"
            @click="pindahHalaman('tugas')"
          >
            <span class="md-display-small stat__angka">{{ jumlahTugasAktif }}</span>
            <span class="md-label-medium stat__label">Tugas aktif</span>
          </button>

          <div class="md-card md-card--filled stat">
            <span class="md-display-small stat__angka">{{ jumlahSelesaiBulanIni }}</span>
            <span class="md-label-medium stat__label">Selesai bulan ini</span>
          </div>

          <div class="md-card md-card--filled stat stat--deadline">
            <span class="md-label-medium stat__label">Deadline terdekat</span>
            <button
              v-for="d of deadlineTerdekat"
              :key="d.id"
              class="deadline-item"
              data-uji="deadline-item"
              @click="bukaDiKalender(d.tanggalTarget)"
            >
              <span class="msr">schedule</span>
              <span class="deadline-item__tanggal">{{ d.tanggalTarget }}</span>
              <span class="deadline-item__judul">{{ d.judul }}</span>
            </button>
            <span v-if="deadlineTerdekat.length === 0" class="md-body-small kosong">
              Tidak ada deadline.
            </span>
          </div>
        </div>

        <!-- ===== Tools ===== -->
        <section class="bagian">
          <h3 class="md-title-large bagian__judul">Tools</h3>
          <div class="grid-tool">
            <a
              v-for="t of tools"
              :key="t.nama"
              class="md-card md-card--elevated tool-card"
              data-uji="kartu-tool"
              :href="t.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="tool-card__kepala">
                <span class="tool-card__ikon">
                  <span class="tool-card__inisial">{{ ikonTool(t) }}</span>
                  <img
                    class="tool-card__gambar"
                    :src="t.ikonUrl"
                    :alt="t.nama"
                    loading="lazy"
                    @error="($event) => ($event.target.style.display = 'none')"
                  />
                </span>
                <span class="tool-card__nama">
                  <span class="md-title-small">{{ t.nama }}</span>
                  <span class="md-chip md-chip--kecil md-chip--tonal">GitHub Pages</span>
                </span>
                <span class="msr tool-card__buka">arrow_outward</span>
              </span>
              <span class="md-body-small tool-card__deskripsi">{{ t.deskripsi }}</span>
            </a>
          </div>
          <p v-if="tools.length === 0" class="md-body-medium kosong">
            Belum ada tools. Tambahkan lewat <code>src/data/tools.json</code>.
          </p>
        </section>
      </div>

      <!-- ===== Kalender mini ===== -->
      <aside class="beranda__samping">
        <MiniKalender />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.beranda {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.beranda__kepala {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.beranda__sub {
  color: var(--md-on-surface-variant);
}

.beranda__tata {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.beranda__utama {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.beranda__samping {
  min-width: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  min-height: 96px;
  border: none;
  text-align: left;
  font-family: inherit;
}

.stat--aksi {
  cursor: pointer;
  transition: background-color var(--md-duration-short-3) var(--md-easing-standard);
}

.stat--aksi:hover {
  background: color-mix(
    in srgb,
    var(--md-on-surface) var(--md-state-hover),
    var(--md-surface-container-highest)
  );
}

.stat__angka {
  color: var(--md-primary);
  font-weight: 600;
}

.stat__label {
  color: var(--md-on-surface-variant);
}

.stat--deadline {
  gap: 8px;
  justify-content: flex-start;
}

.deadline-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--md-primary);
  font-family: inherit;
  font-size: 12px;
  line-height: 16px;
  text-align: left;
  cursor: pointer;
}

.deadline-item:hover {
  text-decoration: underline;
}

.deadline-item .msr {
  font-size: 16px;
}

.deadline-item__tanggal {
  font-weight: 700;
  flex: none;
}

.deadline-item__judul {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bagian {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bagian__judul {
  color: var(--md-on-surface);
}

.grid-tool {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
}

.tool-card:hover {
  box-shadow: var(--md-elevation-2);
  transform: translateY(-2px);
  background: color-mix(
    in srgb,
    var(--md-primary) 4%,
    var(--md-surface-container-low)
  );
}

.tool-card__kepala {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-card__ikon {
  position: relative;
  flex: none;
  width: 48px;
  height: 48px;
}

.tool-card__inisial {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: var(--md-shape-md);
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.tool-card__gambar {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tool-card__nama {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.tool-card__buka {
  color: var(--md-on-surface-variant);
  align-self: flex-start;
}

.tool-card__deskripsi {
  color: var(--md-on-surface-variant);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kosong {
  color: var(--md-on-surface-variant);
}

code {
  padding: 1px 6px;
  border-radius: var(--md-shape-xs);
  background: var(--md-surface-container-high);
  font-family: inherit;
}

@media (min-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .beranda__tata {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 28px;
  }
  .beranda__samping {
    position: sticky;
    top: 24px;
  }
}
</style>
