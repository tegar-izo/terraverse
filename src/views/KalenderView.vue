<script setup>
import { computed, ref, reactive } from "vue";
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

const labelBulan = computed(
  () => `${NAMA_BULAN[bulan.value]} ${tahun.value}`
);

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
const bulanIso = computed(() => `${tahun.value}-${String(bulan.value + 1).padStart(2, "0")}`);
const tujuanBulan = computed(() =>
  tujuan.value
    .filter((t) => (t.bulan || (t.tanggalTarget || "").slice(0, 7)) === bulanIso.value)
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
  <section>
    <div class="kepala">
      <button class="tombol tombol--efekteks" @click="geserBulan(-1)"><span class="msr">chevron_left</span></button>
      <h2>{{ labelBulan }}</h2>
      <button class="tombol tombol--efekteks" @click="geserBulan(1)"><span class="msr">chevron_right</span></button>
    </div>

    <div class="isi-kalender">
      <!-- ===== Kalender ===== -->
      <div class="kartu kotak-grid">
        <div class="baris-hari">
          <span v-for="h of NAMA_HARI" :key="h">{{ h }}</span>
        </div>
        <div class="grid-hari">
          <button
            v-for="(sel, i) of grid"
            :key="sel.iso"
            class="sel"
            :class="{
              luar: !sel.dalamBulan,
              hariIni: sel.iso === kini,
              dipilih: sel.iso === terpilih,
            }"
            @click="terpilih = sel.iso"
          >
            <span class="angka-sel">{{ sel.hari }}</span>
            <span v-if="sel.tugasDiHari.length" class="chip chip-tugas">{{
              sel.tugasDiHari[0].judul
            }}</span>
            <span v-if="sel.tujuanDiHari.length" class="chip chip-tujuan">{{
              sel.tujuanDiHari[0].judul
            }}</span>
            <span
              v-if="sel.tugasDiHari.length + sel.tujuanDiHari.length > 2"
              class="chip chip-lebih"
              >+{{ sel.tugasDiHari.length + sel.tujuanDiHari.length - 2 }}</span
            >
          </button>
        </div>
      </div>

      <!-- ===== Kolom samping ===== -->
      <div class="kolom-samping">
        <!-- Agenda -->
        <div class="kartu agenda">
          <h3>Agenda</h3>
          <p class="sub">{{ formatPanjang(terpilih) }}</p>

          <div v-if="agendaTugas.length === 0 && agendaTujuan.length === 0" class="kosong">
            Tidak ada apa pun di tanggal ini.
          </div>

          <ul class="daftar">
            <li v-for="t of agendaTujuan" :key="t.id" class="butir butir-tujuan">
              <span class="msr">flag</span>
              <span :class="{ selesai: t.selesai }">{{ t.judul }}</span>
            </li>
            <li v-for="t of agendaTugas" :key="t.id" class="butir">
              <span class="msr">list</span>
              <span :class="{ selesai: t.status === 'selesai' }">{{ t.judul }}</span>
              <button class="mini-link" @click="keTugas">lihat di Tugas</button>
            </li>
          </ul>
        </div>

        <!-- Planning tujuan bulanan -->
        <div class="kartu agenda">
          <h3><span class="msr msr--isi">flag</span> Tujuan {{ NAMA_BULAN[bulan.value] }}</h3>
          <ul class="daftar">
            <li v-for="t of tujuanBulan" :key="t.id" class="butir">
              <label class="baris-salin">
                <input
                  type="checkbox"
                  :checked="t.selesai"
                  @change="tandaiTujuan(t.id, $event.target.checked)"
                />
                <span :class="{ selesai: t.selesai }">{{ t.judul }}</span>
                <small class="tanggal-tujuan">{{ (t.tanggalTarget || "").slice(8) }}/{{ (t.tanggalTarget || "").slice(5, 7) }}</small>
              </label>
              <button class="ikon-hapus" title="Hapus" @click="buang(t)"><span class="msr">close</span></button>
            </li>
            <li v-if="tujuanBulan.length === 0" class="kosong">
              Belum ada tujuan bulan ini.
            </li>
          </ul>

          <form class="form-tujuan" @submit.prevent="tambah">
            <input v-model="rancangan.judul" placeholder="Tujuan baru…" />
            <input v-model="rancangan.tanggalTarget" type="date" />
            <button class="tombol" type="submit" :disabled="!rancangan.judul.trim()">Tambah</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kepala {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.kepala h2 {
  margin: 0;
  font-size: 1.5rem;
}

.isi-kalender {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 1fr);
  gap: 1rem;
  align-items: start;
}

.kotak-grid {
  padding: 1rem;
}
.baris-hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--md-on-surface-variant);
  margin-bottom: 0.4rem;
}
.grid-hari {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.sel {
  border: none;
  cursor: pointer;
  background: var(--md-surface-container-high);
  border-radius: 14px;
  min-height: 74px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
  font-family: inherit;
  overflow: hidden;
}
.sel.luar {
  opacity: 0.4;
}
.sel.hariIni {
  outline: 2px solid var(--md-primary);
}
.sel.dipilih {
  background: var(--md-primary-container);
}
.angka-sel {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--md-on-surface);
}
.chip {
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 1px 7px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.chip-tugas {
  background: var(--md-primary);
  color: var(--md-on-primary);
}
.chip-tujuan {
  background: var(--md-surface);
  color: var(--md-primary);
  box-shadow: inset 0 0 0 1.5px var(--md-primary);
}
.chip-lebih {
  background: var(--md-surface-container-high);
  color: var(--md-on-surface-variant);
}

.kolom-samping {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.agenda {
  padding: 1.1rem;
}
.agenda h3 {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.ikon-hapus {
  display: inline-grid;
  place-items: center;
}
.sub {
  margin: 0.2rem 0 0.6rem;
  font-size: 0.8rem;
  color: var(--md-on-surface-variant);
}
.kosong {
  color: var(--md-on-surface-variant);
  font-style: italic;
  font-size: 0.85rem;
}
.daftar {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.butir {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.butir .msr {
  font-size: 18px;
  color: var(--md-primary);
}
.selesai {
  text-decoration: line-through;
  opacity: 0.6;
}
.mini-link {
  border: none;
  background: transparent;
  color: var(--md-primary);
  cursor: pointer;
  font-size: 0.75rem;
  margin-left: auto;
}
.baris-salin {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
  cursor: pointer;
}
.baris-salin input {
  width: auto;
}
.tanggal-tujuan {
  margin-left: auto;
  color: var(--md-on-surface-variant);
}
.ikon-hapus {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--md-error);
  font-size: 0.9rem;
}
.form-tujuan {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 1100px) {
  .isi-kalender {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .sel {
    min-height: 56px;
  }
  .chip {
    display: none;
  }
  .chip-lebih {
    display: block;
  }
}
</style>
