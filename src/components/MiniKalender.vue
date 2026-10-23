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
  <div class="kartu mini-kalender">
    <div class="kecil-kepala">
      <button class="mini-nav" title="Bulan sebelumnya" @click="geserBulan(-1)">
        <span class="msr">chevron_left</span>
      </button>
      <b class="judul-kecil">{{ labelBulan }}</b>
      <button class="mini-nav" title="Bulan berikutnya" @click="geserBulan(1)">
        <span class="msr">chevron_right</span>
      </button>
    </div>

    <div class="kecil-hari">
      <span v-for="h of NAMA_HARI" :key="h">{{ h }}</span>
    </div>

    <div class="kecil-grid">
      <button
        v-for="sel of grid"
        :key="sel.iso"
        class="kecil-sel"
        :class="{ luar: !sel.dalamBulan, beranda: sel.iso === hariIni, tetap: sel.satuTugas || sel.satuTujuan }"
        :title="`${sel.iso}${sel.satuTugas ? ' · tugas' : ''}${sel.satuTujuan ? ' · tujuan' : ''}`"
        @click="buka(sel)"
      >
        <span class="kecil-angka">{{ sel.hari }}</span>
        <span class="titik-tanda">
          <i v-if="sel.satuTugas" class="titik titik-tugas"></i>
          <i v-if="sel.satuTujuan" class="titik titik-tujuan"></i>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mini-kalender {
  padding: 1rem;
}
.kecil-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}
.judul-kecil {
  font-size: 0.9rem;
}
.mini-nav {
  border: none;
  cursor: pointer;
  background: var(--md-surface-container-high);
  border-radius: 999px;
  padding: 0.25rem;
  display: grid;
  place-items: center;
  color: var(--md-on-surface);
}
.kecil-hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--md-on-surface-variant);
  margin-bottom: 0.25rem;
}
.kecil-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.kecil-sel {
  border: none;
  cursor: pointer;
  font-family: inherit;
  background: transparent;
  color: var(--md-on-surface);
  border-radius: 10px;
  padding: 0.3rem 0 0.22rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 34px;
}
.kecil-sel:hover {
  background: var(--md-surface-container-high);
}
.kecil-sel.luar {
  opacity: 0.35;
}
.kecil-sel.beranda {
  outline: 1.5px solid var(--md-primary);
}
.kecil-sel.tetap {
  background: var(--md-surface-container-high);
}
.kecil-angka {
  font-size: 0.7rem;
  font-weight: 600;
}
.titik-tanda {
  display: flex;
  gap: 2px;
  min-height: 4px;
}
.titik {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  display: inline-block;
}
.titik-tugas {
  background: var(--md-primary);
}
.titik-tujuan {
  background: transparent;
  box-shadow: inset 0 0 0 1.2px var(--md-primary);
}
</style>
