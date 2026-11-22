<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import {
  tugas,
  tujuan,
  tanggalKalender,
  tambahTujuan,
  tandaiTujuan,
  hapusTujuan,
  pindahHalaman,
} from "../lib/state.js";
import { animasiDaftar, useAnimasiMasuk } from "../lib/animasi.js";
import {
  NAMA_BULAN,
  NAMA_HARI,
  gridBulan,
  formatPanjang,
  isoHariIni,
} from "../lib/calendar.js";

const akar = ref(null);
const gridEl = ref(null);
useAnimasiMasuk(akar);

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

function animasiBulan() {
  animasiDaftar(gridEl.value, ".kalender__sel", { stagger: 0.008 });
}

onMounted(async () => {
  await nextTick();
  animasiBulan();
});

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
  <section ref="akar" class="kalender">
    <header class="page-head kalender__kepala" data-anim="kepala">
      <div class="page-head__kiri">
        <p class="eyebrow"><span class="eyebrow__no">03</span> Kalender</p>
        <h2 class="md-headline-medium" data-uji="label-bulan">{{ labelBulan }}</h2>
        <p class="md-body-medium page-head__sub">
          Klik tanggal untuk melihat agenda dan tujuan bulan ini.
        </p>
      </div>
      <div class="kalender__kanan">
        <div class="kalender__nav">
          <button class="md-icon-button" data-uji="bulan-sebelum" title="Bulan sebelumnya" @click="geserBulan(-1)">
            <span class="msr">chevron_left</span>
          </button>
          <button class="md-outlined-button kalender__hari-ini" @click="keHariIni">Hari ini</button>
          <button class="md-icon-button" data-uji="bulan-sesudah" title="Bulan berikutnya" @click="geserBulan(1)">
            <span class="msr">chevron_right</span>
          </button>
        </div>
      </div>
    </header>

    <div class="kalender__tata">
      <!-- ===== Grid bulan ===== -->
      <div class="kalender__kartu" data-anim="item">
        <div class="kalender__hari">
          <span v-for="h of NAMA_HARI" :key="h">{{ h }}</span>
        </div>

        <Transition name="md-fade" mode="out-in" @after-enter="animasiBulan">
        <div ref="gridEl" class="kalender__grid" :key="bulanIso">
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
            <span class="kalender__angka">{{ String(sel.hari).padStart(2, "0") }}</span>

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
        <div class="panel" data-anim="item">
          <div class="panel__kepala">
            <p class="tag">Tanggal terpilih</p>
            <h3 class="panel__judul">Agenda</h3>
            <p class="panel__sub">{{ formatPanjang(terpilih) }}</p>
          </div>

          <div
            v-if="agendaTugas.length === 0 && agendaTujuan.length === 0"
            class="kosong"
          >
            — Tidak ada agenda di tanggal ini.
          </div>

          <ul class="daftar">
            <li v-for="t of agendaTujuan" :key="t.id" class="agenda-item">
              <span class="agenda-item__ikon agenda-item__ikon--tujuan" aria-hidden="true"></span>
              <span class="agenda-item__teks" :class="{ selesai: t.selesai }">{{ t.judul }}</span>
            </li>
            <li v-for="t of agendaTugas" :key="t.id" class="agenda-item">
              <span class="agenda-item__ikon" aria-hidden="true"></span>
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
        <div class="panel" data-anim="item">
          <div class="panel__kepala panel__kepala--baris">
            <div>
              <p class="tag">Rencana bulanan</p>
              <h3 class="panel__judul">Tujuan {{ NAMA_BULAN[bulan] }}</h3>
            </div>
            <span class="panel__jumlah">{{ String(tujuanBulan.length).padStart(2, "0") }}</span>
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
              <small class="tujuan-item__tanggal">
                {{ (t.tanggalTarget || "").slice(8) }}/{{ (t.tanggalTarget || "").slice(5, 7) }}
              </small>
              <button class="md-icon-button tujuan-item__hapus" title="Hapus" @click="buang(t)">
                <span class="msr">close</span>
              </button>
            </li>
            <li v-if="tujuanBulan.length === 0" key="tujuan-kosong" class="kosong">
              — Belum ada tujuan bulan ini.
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
  gap: var(--s6);
}

.kalender__kanan {
  display: flex;
  align-items: flex-end;
  gap: var(--s3);
  flex: none;
}

.kalender__nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kalender__hari-ini {
  height: 34px;
  padding: 0 12px;
}

.kalender__tata {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s4);
  align-items: start;
}

/* ---------- Grid bulan ---------- */
.kalender__kartu {
  border: 1px solid var(--line);
  background: var(--paper);
  min-width: 0;
}

.kalender__hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--line);
}

.kalender__hari span {
  padding: 9px 7px;
  font-family: var(--f-mono);
  font-size: 0.5rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  border-right: 1px solid var(--line-soft);
}
.kalender__hari span:last-child {
  border-right: none;
}

.kalender__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--line-soft);
}

.kalender__sel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 96px;
  padding: 7px;
  border: none;
  background: var(--paper);
  color: var(--ink-dim);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  transition: background-color var(--md-duration-short-2) var(--md-easing-standard);
}

.kalender__sel:hover {
  background: var(--tint5);
}

.kalender__sel--luar {
  color: var(--ink-faint);
}
.kalender__sel--luar .kalender__angka,
.kalender__sel--luar .kalender__acara,
.kalender__sel--luar .kalender__lebih {
  opacity: 0.4;
}

.kalender__sel--kini .kalender__angka {
  color: var(--sun);
}

.kalender__sel--dipilih {
  background: color-mix(in srgb, var(--sun) 8%, var(--paper));
  box-shadow: inset 0 0 0 1px var(--sun);
}

.kalender__sel--dipilih:hover {
  background: color-mix(in srgb, var(--sun) 12%, var(--paper));
}

.kalender__angka {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

.kalender__acara {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  font-size: 0.625rem;
  line-height: 1.4;
  color: var(--ink-dim);
}

.kalender__acara-teks {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kalender__titik {
  width: 3px;
  height: 3px;
  flex: none;
}

.kalender__titik--tugas {
  background: var(--sun);
}

.kalender__titik--tujuan {
  box-shadow: inset 0 0 0 1px var(--ink-muted);
}

.kalender__lebih {
  font-family: var(--f-mono);
  font-size: 0.5rem;
  color: var(--ink-faint);
  padding-left: 7px;
}

/* ---------- Panel samping ---------- */
.kalender__samping {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
  min-width: 0;
}

.panel {
  padding: var(--s4);
  border: 1px solid var(--line);
  background: transparent;
  --md-field-bg: var(--paper);
}

.panel__kepala {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: var(--s3);
  margin-bottom: var(--s3);
  border-bottom: 1px solid var(--line-soft);
}

.panel__kepala--baris {
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s3);
}

.panel__judul {
  font-family: var(--f-display);
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 1.2;
  letter-spacing: -0.05em;
  color: var(--ink);
}

.panel__sub {
  font-family: var(--f-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.panel__jumlah {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
}

.kosong {
  color: var(--ink-faint);
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1.6;
  padding: var(--s1) 0;
}

.daftar {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.agenda-item {
  display: flex;
  align-items: center;
  gap: var(--s2);
  min-height: 38px;
  padding: 6px 0;
  border-bottom: 1px solid var(--line-soft);
  font-size: 0.8125rem;
  line-height: 1.4;
}
.agenda-item:last-child {
  border-bottom: none;
}

.agenda-item__ikon {
  width: 5px;
  height: 5px;
  flex: none;
  background: var(--sun);
}

.agenda-item__ikon--tujuan {
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--ink-muted);
}

.agenda-item__teks {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--ink-dim);
}

.selesai {
  text-decoration: line-through;
  opacity: 0.55;
}

.agenda-item__tautan {
  height: 24px;
  padding: 0;
  font-size: 0.5rem;
}

.tujuan-item {
  display: flex;
  align-items: center;
  gap: var(--s2);
  min-height: 36px;
  padding: 4px 0;
  border-bottom: 1px solid var(--line-soft);
}
.tujuan-item:last-child {
  border-bottom: none;
}

.tujuan-item__cek {
  display: flex;
  align-items: center;
  gap: var(--s2);
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.tujuan-item__teks {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--ink-dim);
  overflow-wrap: anywhere;
}

.tujuan-item__tanggal {
  font-family: var(--f-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
  flex: none;
}

.tujuan-item__hapus {
  width: 24px;
  height: 24px;
  border-color: transparent;
}
.tujuan-item__hapus .msr {
  font-size: 14px;
}

.form-tujuan {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  margin-top: var(--s4);
  padding-top: var(--s4);
  border-top: 1px solid var(--line);
}

.form-tujuan__tombol {
  align-self: flex-start;
}

/* ---------- Breakpoint ---------- */
@media (min-width: 1100px) {
  .kalender__tata {
    grid-template-columns: minmax(0, 1.75fr) minmax(290px, 1fr);
    gap: var(--s4);
  }
}

@media (max-width: 599px) {
  .kalender__kepala {
    flex-direction: column;
    align-items: flex-start;
  }
  .kalender__kanan {
    align-items: flex-start;
  }
  .kalender__sel {
    min-height: 56px;
    padding: 5px;
    align-items: center;
  }
  .kalender__acara {
    padding: 0;
    gap: 0;
  }
  .kalender__acara-teks,
  .kalender__lebih {
    display: none;
  }
  .kalender__titik {
    width: 3px;
    height: 3px;
  }
  .kalender__hari span {
    font-size: 0.4375rem;
    padding: 7px 2px;
    text-align: center;
  }
  .kalender__angka {
    font-size: 0.5625rem;
  }
}
</style>
