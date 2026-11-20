<script setup>
import { computed, reactive, ref } from "vue";
import {
  tugas,
  tujuan,
  tanggalKalender,
  tambahTujuan,
  tandaiTujuan,
  hapusTujuan,
  pindahHalaman,
} from "../lib/state.js";
import {
  NAMA_BULAN,
  NAMA_HARI,
  gridBulan,
  formatPanjang,
  isoHariIni,
} from "../lib/calendar.js";

const kini = isoHariIni();
const [th, bl] = kini.split("-").map(Number);
const tahun = ref(th);
const bulan = ref(bl - 1);

const labelBulan = computed(() => `${NAMA_BULAN[bulan.value]} ${tahun.value}`);

function geserBulan(n) {
  let b = bulan.value + n;
  if (b < 0) {
    b = 11;
    tahun.value--;
  } else if (b > 11) {
    b = 0;
    tahun.value++;
  }
  bulan.value = b;
}

function keHariIni() {
  tahun.value = th;
  bulan.value = bl - 1;
  terpilih.value = kini;
}

/* ---------- Isi sel kalender ---------- */
const grid = computed(() =>
  gridBulan(tahun.value, bulan.value).map((sel) => ({
    ...sel,
    tugasDiHari: tugas.value
      .filter((t) => t.tanggalTarget === sel.iso)
      .sort((a, b) => (a.status === "selesai") - (b.status === "selesai")),
    tujuanDiHari: tujuan.value.filter((t) => t.tanggalTarget === sel.iso),
  }))
);

const terpilih = tanggalKalender;

/* ---------- Agenda tanggal terpilih ---------- */
const agendaTugas = computed(() =>
  tugas.value
    .filter((t) => t.tanggalTarget === terpilih.value)
    .sort((a, b) => (a.status === "selesai") - (b.status === "selesai"))
);
const agendaTujuan = computed(() =>
  tujuan.value.filter((t) => t.tanggalTarget === terpilih.value)
);

/* ---------- Tujuan bulan ini (planning) ---------- */
const bulanIso = computed(
  () => `${tahun.value}-${String(bulan.value + 1).padStart(2, "0")}`
);
const tujuanBulan = computed(() =>
  tujuan.value
    .filter(
      (t) => (t.bulan || (t.tanggalTarget || "").slice(0, 7)) === bulanIso.value
    )
    .sort((a, b) => (a.tanggalTarget || "").localeCompare(b.tanggalTarget || ""))
);

const rancangan = reactive({ judul: "", tanggalTarget: `${kini.slice(0, 8)}01` });

function tambah() {
  if (!rancangan.judul.trim()) return;
  tambahTujuan({
    judul: rancangan.judul.trim(),
    tanggalTarget: rancangan.tanggalTarget || `${bulanIso.value}-01`,
    bulan: bulanIso.value,
  });
  rancangan.judul = "";
}

function buang(t) {
  if (confirm(`Hapus tujuan "${t.judul}"?`)) hapusTujuan(t.id);
}

function keTugas() {
  pindahHalaman("tugas");
}
</script>

<template>
  <section class="kalender">
    <header class="kalender__kepala">
      <div>
        <h2 class="md-headline-medium" data-uji="label-bulan">{{ labelBulan }}</h2>
        <p class="md-body-medium kalender__sub">
          Klik tanggal untuk melihat agenda dan tujuan bulan ini.
        </p>
      </div>
      <div class="kalender__nav">
        <button class="md-icon-button" data-uji="bulan-sebelum" title="Bulan sebelumnya" @click="geserBulan(-1)">
          <span class="msr">chevron_left</span>
        </button>
        <button class="md-text-button" @click="keHariIni">Hari ini</button>
        <button class="md-icon-button" data-uji="bulan-sesudah" title="Bulan berikutnya" @click="geserBulan(1)">
          <span class="msr">chevron_right</span>
        </button>
      </div>
    </header>

    <div class="kalender__tata">
      <!-- ===== Grid bulan ===== -->
      <div class="md-card md-card--outlined kalender__kartu">
        <div class="kalender__hari">
          <span v-for="h of NAMA_HARI" :key="h" class="md-label-medium">{{ h }}</span>
        </div>

        <Transition name="md-fade" mode="out-in">
        <div class="kalender__grid" :key="bulanIso">
          <button
            v-for="sel of grid"
            :key="sel.iso"
            class="kalender__sel"
            :class="{
              'kalender__sel--luar': !sel.dalamBulan,
              'kalender__sel--kini': sel.iso === kini,
              'kalender__sel--dipilih': sel.iso === terpilih,
            }"
            :data-uji="`sel-${sel.iso}`"
            :aria-label="sel.iso"
            @click="terpilih = sel.iso"
          >
            <span class="md-label-large kalender__angka">{{ sel.hari }}</span>

            <span v-if="sel.tugasDiHari.length" class="kalender__acara" data-uji="chip-tugas">
              <i class="kalender__titik kalender__titik--tugas"></i>
              <span class="kalender__acara-teks">{{ sel.tugasDiHari[0].judul }}</span>
            </span>

            <span v-if="sel.tujuanDiHari.length" class="kalender__acara kalender__acara--tujuan" data-uji="chip-tujuan">
              <i class="kalender__titik kalender__titik--tujuan"></i>
              <span class="kalender__acara-teks">{{ sel.tujuanDiHari[0].judul }}</span>
            </span>

            <span
              v-if="sel.tugasDiHari.length + sel.tujuanDiHari.length > 2"
              class="kalender__lebih"
            >
              +{{ sel.tugasDiHari.length + sel.tujuanDiHari.length - 2 }}
            </span>
          </button>
        </div>
        </Transition>
      </div>

      <!-- ===== Panel samping ===== -->
      <div class="kalender__samping">
        <!-- Agenda -->
        <div class="md-card md-card--filled panel">
          <div class="panel__kepala">
            <h3 class="md-title-medium">Agenda</h3>
            <p class="md-body-small panel__sub">{{ formatPanjang(terpilih) }}</p>
          </div>

          <div
            v-if="agendaTugas.length === 0 && agendaTujuan.length === 0"
            class="md-body-small kosong"
          >
            Tidak ada agenda di tanggal ini.
          </div>

          <ul class="daftar">
            <li v-for="t of agendaTujuan" :key="t.id" class="agenda-item">
              <span class="msr msr--isi agenda-item__ikon agenda-item__ikon--tujuan">flag</span>
              <span class="agenda-item__teks" :class="{ selesai: t.selesai }">{{ t.judul }}</span>
            </li>
            <li v-for="t of agendaTugas" :key="t.id" class="agenda-item">
              <span class="msr agenda-item__ikon">list</span>
              <span class="agenda-item__teks" :class="{ selesai: t.status === 'selesai' }">
                {{ t.judul }}
              </span>
              <button class="md-text-button agenda-item__tautan" @click="keTugas">
                Tugas
              </button>
            </li>
          </ul>
        </div>

        <!-- Planning tujuan bulanan -->
        <div class="md-card md-card--filled panel">
          <div class="panel__kepala panel__kepala--baris">
            <h3 class="md-title-medium">
              <span class="msr msr--isi panel__ikon">flag</span>
              Tujuan {{ NAMA_BULAN[bulan.value] }}
            </h3>
            <span class="md-chip md-chip--kecil">{{ tujuanBulan.length }}</span>
          </div>

          <TransitionGroup name="md-list" tag="ul" class="daftar">
            <li v-for="t of tujuanBulan" :key="t.id" class="tujuan-item">
              <label class="md-checkbox tujuan-item__cek">
                <input
                  type="checkbox"
                  data-uji="tujuan-cek"
                  :checked="t.selesai"
                  @change="tandaiTujuan(t.id, $event.target.checked)"
                />
                <span class="tujuan-item__teks" :class="{ selesai: t.selesai }">
                  {{ t.judul }}
                </span>
              </label>
              <small class="md-label-small tujuan-item__tanggal">
                {{ (t.tanggalTarget || "").slice(8) }}/{{ (t.tanggalTarget || "").slice(5, 7) }}
              </small>
              <button class="md-icon-button tujuan-item__hapus" title="Hapus" @click="buang(t)">
                <span class="msr">close</span>
              </button>
            </li>
            <li v-if="tujuanBulan.length === 0" key="tujuan-kosong" class="md-body-small kosong">
              Belum ada tujuan bulan ini.
            </li>
          </TransitionGroup>

          <form class="form-tujuan" data-uji="form-tujuan" @submit.prevent="tambah">
            <label
              class="md-text-field"
              :class="{ 'md-text-field--terisi': rancangan.judul }"
            >
              <span class="md-text-field__label">Tujuan baru</span>
              <input v-model="rancangan.judul" data-uji="tujuan-judul" placeholder=" " />
            </label>

            <label class="md-text-field md-text-field--terisi">
              <span class="md-text-field__label">Tanggal</span>
              <input
                v-model="rancangan.tanggalTarget"
                data-uji="tujuan-tanggal"
                type="date"
              />
            </label>

            <button
              class="md-filled-button form-tujuan__tombol"
              type="submit"
              :disabled="!rancangan.judul.trim()"
            >
              Tambah tujuan
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kalender {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.kalender__kepala {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.kalender__sub {
  margin-top: 4px;
  color: var(--md-on-surface-variant);
}

.kalender__nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.kalender__tata {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.kalender__kartu {
  padding: 12px;
}

.kalender__hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: var(--md-on-surface-variant);
  padding-bottom: 8px;
}

.kalender__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.kalender__sel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  min-height: 92px;
  padding: 6px;
  border: none;
  border-radius: var(--md-shape-md);
  background: transparent;
  color: var(--md-on-surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  transition: background-color var(--md-duration-short-2) var(--md-easing-standard);
}

.kalender__sel:hover {
  background: color-mix(in srgb, var(--md-on-surface) var(--md-state-hover), transparent);
}

.kalender__sel--luar {
  opacity: 0.38;
}

.kalender__sel--kini {
  box-shadow: inset 0 0 0 1px var(--md-primary);
}

.kalender__sel--dipilih {
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
}

.kalender__sel--dipilih:hover {
  background: color-mix(
    in srgb,
    var(--md-on-primary-container) 6%,
    var(--md-primary-container)
  );
}

.kalender__angka {
  font-weight: 600;
}

.kalender__acara {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 1px 6px;
  border-radius: var(--md-shape-xs);
  background: var(--md-surface-container);
  color: var(--md-on-surface-variant);
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.4px;
}

.kalender__sel--dipilih .kalender__acara {
  background: var(--md-surface-container-lowest);
}

.kalender__acara--tujuan {
  background: var(--md-tertiary-container);
  color: var(--md-on-tertiary-container);
}

.kalender__acara-teks {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kalender__titik {
  width: 5px;
  height: 5px;
  border-radius: var(--md-shape-full);
  flex: none;
}

.kalender__titik--tugas {
  background: var(--md-primary);
}

.kalender__titik--tujuan {
  background: var(--md-tertiary);
}

.kalender__lebih {
  font-size: 11px;
  line-height: 16px;
  color: var(--md-on-surface-variant);
  padding-left: 4px;
}

/* ---------- Panel samping ---------- */
.kalender__samping {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.panel {
  padding: 16px;
  --md-field-bg: var(--md-surface-container-highest);
}

.panel__kepala {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.panel__kepala--baris {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.panel__kepala h3 {
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel__ikon {
  color: var(--md-tertiary);
  font-size: 18px;
}

.panel__sub {
  color: var(--md-on-surface-variant);
}

.kosong {
  color: var(--md-on-surface-variant);
}

.daftar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.agenda-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  font-size: 14px;
  line-height: 20px;
}

.agenda-item__ikon {
  font-size: 18px;
  color: var(--md-primary);
}

.agenda-item__ikon--tujuan {
  color: var(--md-tertiary);
}

.agenda-item__teks {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.selesai {
  text-decoration: line-through;
  opacity: 0.6;
}

.agenda-item__tautan {
  height: 32px;
  padding: 0 8px;
  font-size: 12px;
}

.tujuan-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
}

.tujuan-item__cek {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  padding: 4px 0;
}

.tujuan-item__teks {
  overflow-wrap: anywhere;
}

.tujuan-item__tanggal {
  color: var(--md-on-surface-variant);
  flex: none;
}

.tujuan-item__hapus {
  width: 32px;
  height: 32px;
}

.tujuan-item__hapus .msr {
  font-size: 18px;
}

.form-tujuan {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--md-outline-variant);
}

.form-tujuan__tombol {
  align-self: flex-end;
}

@media (min-width: 1100px) {
  .kalender__tata {
    grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
    gap: 20px;
  }
}

@media (max-width: 599px) {
  .kalender__sel {
    min-height: 56px;
    padding: 4px;
    align-items: center;
  }
  .kalender__acara {
    padding: 0;
    background: transparent;
  }
  .kalender__acara-teks,
  .kalender__lebih {
    display: none;
  }
  .kalender__acara--tujuan {
    background: transparent;
  }
  .kalender__hari .md-label-medium {
    font-size: 10px;
  }
}
</style>
