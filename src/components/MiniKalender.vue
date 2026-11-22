<script setup>
import { computed, ref } from "vue";
import {
  tugas,
  tujuan,
  pindahHalaman,
  tanggalKalender,
} from "../lib/state.js";
import { NAMA_BULAN, NAMA_HARI, gridBulan, isoHariIni } from "../lib/calendar.js";

const hariIni = isoHariIni();
const [th, bl] = hariIni.split("-").map(Number);
const tahun = ref(th);
const bulan = ref(bl - 1);

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

const labelBulan = computed(() => `${NAMA_BULAN[bulan.value]} ${tahun.value}`);

const grid = computed(() =>
  gridBulan(tahun.value, bulan.value).map((sel) => ({
    ...sel,
    satuTugas: tugas.value.some((t) => t.tanggalTarget === sel.iso),
    satuTujuan: tujuan.value.some((t) => t.tanggalTarget === sel.iso),
  }))
);

function buka(sel) {
  tanggalKalender.value = sel.iso;
  pindahHalaman("kalender");
}
</script>

<template>
  <div class="mini-kalender" data-uji="mini-kalender">
    <div class="mini-kalender__atas">
      <span class="tag">Kalender</span>
      <span class="mini-kalender__garis" aria-hidden="true"></span>
      <span class="mini-kalender__panah-dekor" aria-hidden="true">→</span>
    </div>

    <div class="mini-kalender__kepala">
      <button
        class="md-icon-button mini-kalender__nav"
        title="Bulan sebelumnya"
        data-uji="mini-sebelum"
        @click="geserBulan(-1)"
      >
        <span class="msr">chevron_left</span>
      </button>
      <b class="mini-kalender__label" data-uji="mini-label">{{ labelBulan }}</b>
      <button
        class="md-icon-button mini-kalender__nav"
        title="Bulan berikutnya"
        data-uji="mini-sesudah"
        @click="geserBulan(1)"
      >
        <span class="msr">chevron_right</span>
      </button>
    </div>

    <div class="mini-kalender__hari">
      <span v-for="h of NAMA_HARI" :key="h">{{ h }}</span>
    </div>

    <Transition name="md-fade" mode="out-in">
    <div class="mini-kalender__grid" :key="labelBulan">
      <button
        v-for="sel of grid"
        :key="sel.iso"
        class="mini-kalender__sel"
        data-uji="mini-sel"
        :class="{ 'mini-kalender__sel--luar': !sel.dalamBulan, 'mini-kalender__sel--kini': sel.iso === hariIni }"
        :aria-label="sel.iso"
        :title="`${sel.iso}${sel.satuTugas ? ' · tugas' : ''}${sel.satuTujuan ? ' · tujuan' : ''}`"
        @click="buka(sel)"
      >
        <span class="mini-kalender__angka">{{ String(sel.hari).padStart(2, "0") }}</span>
        <span class="mini-kalender__titik">
          <i v-if="sel.satuTugas" class="mini-kalender__tugas"></i>
          <i v-if="sel.satuTujuan" class="mini-kalender__tujuan"></i>
        </span>
      </button>
    </div>
    </Transition>
  </div>
</template>

<style scoped>
.mini-kalender {
  padding: var(--s4);
  border: 1px solid var(--line);
  background: transparent;
}

.mini-kalender__atas {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin-bottom: var(--s3);
}

.mini-kalender__garis {
  flex: 1;
  height: 1px;
  background: var(--line-soft);
}

.mini-kalender__panah-dekor {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  color: var(--ink-faint);
}

.mini-kalender__kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s1);
  padding-bottom: var(--s3);
  margin-bottom: var(--s2);
  border-bottom: 1px solid var(--line);
}

.mini-kalender__label {
  font-family: var(--f-mono);
  font-size: 0.6875rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
}

.mini-kalender__nav {
  width: 24px;
  height: 24px;
  border-color: transparent;
}

.mini-kalender__nav .msr {
  font-size: 16px;
}

.mini-kalender__hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: var(--ink-faint);
  margin-bottom: 2px;
}

.mini-kalender__hari span {
  padding: 4px 0;
  font-family: var(--f-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mini-kalender__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--line-soft);
}

.mini-kalender__sel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 34px;
  padding: 3px 0;
  border: none;
  background: var(--paper);
  color: var(--ink-dim);
  cursor: pointer;
  font-family: inherit;
  transition:
    background-color var(--md-duration-short-2) var(--md-easing-standard),
    color var(--md-duration-short-2) var(--md-easing-standard);
}

.mini-kalender__sel:hover {
  background: var(--tint5);
  color: var(--ink);
}

.mini-kalender__sel--luar {
  color: var(--ink-faint);
}
.mini-kalender__sel--luar .mini-kalender__angka,
.mini-kalender__sel--luar .mini-kalender__titik {
  opacity: 0.4;
}

.mini-kalender__sel--kini {
  background: color-mix(in srgb, var(--sun) 7%, var(--paper));
  box-shadow: inset 0 0 0 1px var(--sun);
}

.mini-kalender__sel--kini .mini-kalender__angka {
  color: var(--sun);
}

.mini-kalender__angka {
  font-family: var(--f-mono);
  font-size: 0.625rem;
  line-height: 1;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.mini-kalender__titik {
  display: flex;
  gap: 2px;
  min-height: 3px;
}

.mini-kalender__tugas {
  width: 3px;
  height: 3px;
  background: var(--sun);
}

.mini-kalender__tujuan {
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--ink-muted);
}
</style>
