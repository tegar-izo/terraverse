<script setup>
import { computed, ref } from "vue";
import {
  tugas,
  tools,
  pindahHalaman,
  tanggalKalender,
} from "../lib/state.js";
import { isoHariIni } from "../lib/calendar.js";
import { useAnimasiMasuk } from "../lib/animasi.js";
import MiniKalender from "../components/MiniKalender.vue";

const akar = ref(null);
useAnimasiMasuk(akar);

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

function nomorUrut(i) {
  return String(i + 1).padStart(2, "0");
}
</script>

<template>
  <section ref="akar" class="beranda">
    <header class="page-head" data-anim="kepala">
      <div class="page-head__kiri">
        <p class="eyebrow"><span class="eyebrow__no">01</span> Dasbor</p>
        <h2 class="md-headline-medium">Dashboard</h2>
        <p class="md-body-medium page-head__sub">Ringkasan ruang kerjamu hari ini.</p>
      </div>
    </header>

    <div class="beranda__tata">
      <div class="beranda__utama">
        <!-- ===== Statistik ===== -->
        <div class="stat-grid">
          <div class="stat" data-anim="item">
            <span class="stat__angka md-display-small">{{ tools.length }}</span>
            <span class="stat__label">Tools</span>
          </div>

          <button
            class="stat stat--aksi"
            data-anim="item"
            data-uji="stat-tugas"
            @click="pindahHalaman('tugas')"
          >
            <span class="msr stat__panah">arrow_outward</span>
            <span class="stat__angka md-display-small">{{ jumlahTugasAktif }}</span>
            <span class="stat__label">Tugas aktif</span>
          </button>

          <div class="stat" data-anim="item">
            <span class="stat__angka md-display-small">{{ jumlahSelesaiBulanIni }}</span>
            <span class="stat__label">Selesai bulan ini</span>
          </div>

          <div class="stat stat--deadline" data-anim="item">
            <span class="stat__label">Deadline terdekat</span>
            <div class="deadline-list">
              <button
                v-for="d of deadlineTerdekat"
                :key="d.id"
                class="deadline-item"
                data-uji="deadline-item"
                @click="bukaDiKalender(d.tanggalTarget)"
              >
                <span class="deadline-item__tanggal">{{ d.tanggalTarget.slice(5) }}</span>
                <span class="deadline-item__judul">{{ d.judul }}</span>
                <span class="msr">arrow_outward</span>
              </button>
              <span v-if="deadlineTerdekat.length === 0" class="deadline-kosong">
                — Tidak ada deadline.
              </span>
            </div>
          </div>
        </div>

        <!-- ===== Tools ===== -->
        <section class="bagian">
          <div class="section-head" data-anim="item">
            <span class="section-head__dot" aria-hidden="true"></span>
            <span class="section-head__name">Tools</span>
            <span class="section-head__lead" aria-hidden="true"></span>
            <span class="tag">{{ tools.length }} tersedia</span>
          </div>

          <div class="grid-tool">
            <a
              v-for="(t, i) of tools"
              :key="t.nama"
              class="md-card md-card--outlined tool-card"
              data-anim="item"
              data-uji="kartu-tool"
              :href="t.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="tool-card__atas">
                <span class="tool-card__no">{{ nomorUrut(i) }}</span>
                <span class="msr tool-card__buka">arrow_outward</span>
              </span>

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
                  <span class="tool-card__judul">{{ t.nama }}</span>
                  <span class="tag">GitHub Pages</span>
                </span>
              </span>

              <span class="tool-card__deskripsi">{{ t.deskripsi }}</span>
            </a>
          </div>

          <p v-if="tools.length === 0" class="kosong">
            Belum ada tools. Tambahkan lewat <code>src/data/tools.json</code>.
          </p>
        </section>
      </div>

      <!-- ===== Kalender mini ===== -->
      <aside class="beranda__samping" data-anim="item">
        <MiniKalender />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.beranda {
  display: flex;
  flex-direction: column;
  gap: var(--s6);
}

.beranda__tata {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s6);
  align-items: start;
}

.beranda__utama {
  display: flex;
  flex-direction: column;
  gap: var(--s6);
  min-width: 0;
}

.beranda__samping {
  min-width: 0;
}

/* ---------- Statistik ---------- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--line-soft);
  border: 1px solid var(--line-soft);
}

.stat {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--s3);
  min-height: 124px;
  padding: var(--s4);
  border: none;
  background: var(--paper);
  color: var(--ink);
  text-align: left;
  font-family: inherit;
}

.stat__angka {
  font-family: var(--f-display);
  font-weight: 400;
  font-size: clamp(2.2rem, 4.6vw, 3.1rem);
  line-height: 0.9;
  letter-spacing: -0.06em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.stat__label {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  line-height: 1.4;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.stat--aksi {
  cursor: pointer;
  transition: background-color var(--md-duration-short-3) var(--md-easing-standard);
}
.stat--aksi:hover {
  background: var(--tint5);
}

.stat__panah {
  position: absolute;
  top: var(--s3);
  right: var(--s3);
  font-size: 15px;
  color: var(--ink-faint);
  opacity: 0;
  transition: opacity var(--md-duration-short-3) var(--md-easing-standard);
}
.stat--aksi:hover .stat__panah {
  opacity: 1;
}

.stat--deadline {
  gap: var(--s2);
  grid-column: 1 / -1;
  justify-content: flex-start;
  min-height: 0;
}

.deadline-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.deadline-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s2);
  padding: 5px 0;
  border: none;
  border-bottom: 1px solid var(--line-soft);
  background: transparent;
  color: var(--ink-dim);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
  transition: color var(--md-duration-short-3) var(--md-easing-standard);
}
.deadline-item:last-child {
  border-bottom: none;
}
.deadline-item:hover {
  color: var(--ink);
}
.deadline-item .msr {
  font-size: 12px;
  color: var(--ink-faint);
}

.deadline-item__tanggal {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  color: var(--sun);
  flex: none;
}

.deadline-item__judul {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deadline-kosong {
  font-family: var(--f-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
}

/* ---------- Bagian tools ---------- */
.bagian {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

.grid-tool {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
  gap: var(--s2);
}

.tool-card {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  padding: var(--s4);
  background: var(--paper);
  color: var(--ink-dim);
  border: 1px solid var(--line-soft);
}

.tool-card:hover {
  background: var(--tint5);
}

.tool-card__atas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
}

.tool-card__no {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  color: var(--ink-faint);
}

.tool-card__buka {
  font-size: 15px;
  color: var(--ink-faint);
  transition:
    color var(--md-duration-short-3) var(--md-easing-standard),
    transform var(--md-duration-short-3) var(--md-easing-standard);
}
.tool-card:hover .tool-card__buka {
  color: var(--sun);
  transform: translate(2px, -2px);
}

.tool-card__kepala {
  display: flex;
  align-items: center;
  gap: var(--s3);
  min-width: 0;
}

.tool-card__ikon {
  position: relative;
  flex: none;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line-soft);
  background: var(--paper-raised);
}

.tool-card__inisial {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ink-muted);
  font-family: var(--f-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
}

.tool-card__gambar {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
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

.tool-card__judul {
  font-family: var(--f-display);
  font-weight: 600;
  font-size: 1.15rem;
  line-height: 1.15;
  letter-spacing: -0.05em;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.tool-card__deskripsi {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--ink-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kosong {
  color: var(--ink-muted);
  font-size: 0.9375rem;
}

code {
  padding: 1px 5px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: var(--tint5);
  font-family: var(--f-mono);
  font-size: 0.85em;
}

/* ---------- Breakpoint ---------- */
@media (min-width: 600px) {
  .stat--deadline {
    grid-column: auto;
  }
}

@media (min-width: 1000px) {
  .stat-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1160px) {
  .beranda__tata {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: var(--s6);
  }
  .beranda__samping {
    position: sticky;
    top: 92px;
  }
}

@media (max-width: 599px) {
  .stat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .stat {
    min-height: 96px;
    padding: var(--s3);
  }
  .stat__angka {
    font-size: 2.1rem;
  }
  .stat__label {
    letter-spacing: 0.1em;
  }
  .stat--deadline {
    grid-column: 1 / -1;
    min-height: 0;
  }
}
</style>
