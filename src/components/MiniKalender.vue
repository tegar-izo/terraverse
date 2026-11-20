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
  <div class="md-card md-card--filled mini-kalender" data-uji="mini-kalender">
    <div class="mini-kalender__kepala">
      <button class="md-icon-button mini-kalender__nav" title="Bulan sebelumnya" data-uji="mini-sebelum" @click="geserBulan(-1)">
        <span class="msr">chevron_left</span>
      </button>
      <b class="md-title-small" data-uji="mini-label">{{ labelBulan }}</b>
      <button class="md-icon-button mini-kalender__nav" title="Bulan berikutnya" data-uji="mini-sesudah" @click="geserBulan(1)">
        <span class="msr">chevron_right</span>
      </button>
    </div>

    <div class="mini-kalender__hari">
      <span v-for="h of NAMA_HARI" :key="h" class="md-label-small">{{ h }}</span>
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
        <span class="md-label-small mini-kalender__angka">{{ sel.hari }}</span>
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
  padding: 16px;
}

.mini-kalender__kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 12px;
}

.mini-kalender__nav {
  width: 32px;
  height: 32px;
}

.mini-kalender__nav .msr {
  font-size: 20px;
}

.mini-kalender__hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: var(--md-on-surface-variant);
  margin-bottom: 4px;
}

.mini-kalender__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-kalender__sel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 34px;
  padding: 2px 0;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: var(--md-on-surface);
  cursor: pointer;
  font-family: inherit;
  transition: background-color var(--md-duration-short-2) var(--md-easing-standard);
}

.mini-kalender__sel:hover {
  background: color-mix(in srgb, var(--md-on-surface) var(--md-state-hover), transparent);
}

.mini-kalender__sel--luar {
  opacity: 0.38;
}

.mini-kalender__sel--kini {
  box-shadow: inset 0 0 0 1px var(--md-primary);
}

.mini-kalender__angka {
  font-weight: 600;
}

.mini-kalender__titik {
  display: flex;
  gap: 3px;
  min-height: 4px;
}

.mini-kalender__tugas {
  width: 4px;
  height: 4px;
  border-radius: var(--md-shape-full);
  background: var(--md-primary);
}

.mini-kalender__tujuan {
  width: 4px;
  height: 4px;
  border-radius: var(--md-shape-full);
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--md-tertiary);
}
</style>
