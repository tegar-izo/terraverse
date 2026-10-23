<script setup>
import { computed, ref, reactive } from "vue";
import {
  tugas,
  tools,
  tambahTugas,
  perbaruiTugas,
  hapusTugas,
} from "../lib/state.js";

const ID_KOLOM = ["todo", "dikerjakan", "selesai"];
const KOLOM = [
  { id: "todo", label: "Todo", ikon: "inbox" },
  { id: "dikerjakan", label: "Dikerjakan", ikon: "pending" },
  { id: "selesai", label: "Selesai", ikon: "check_circle" },
];
const URUT_PRIORITAS = { tinggi: 0, sedang: 1, rendah: 2 };
const NAMA_PRIORITAS = { tinggi: "Tinggi", sedang: "Sedang", rendah: "Rendah" };

/* ---------- Board ---------- */
function bandingkan(a, b) {
  const p = (URUT_PRIORITAS[a.prioritas] ?? 1) - (URUT_PRIORITAS[b.prioritas] ?? 1);
  if (p !== 0) return p;
  const ta = a.tanggalTarget || "9999-12-31";
  const tb = b.tanggalTarget || "9999-12-31";
  return ta.localeCompare(tb);
}

const kolom = computed(() =>
  KOLOM.map((k) => ({
    ...k,
    daftar: tugas.value.filter((t) => t.status === k.id).sort(bandingkan),
  }))
);

/* ---------- Drag & drop ---------- */
const terangkatId = ref(null);
const atasKolom = ref(null);

function mulaiDrag(e, t) {
  terangkatId.value = t.id;
  e.dataTransfer.setData("text/plain", t.id);
  e.dataTransfer.effectAllowed = "move";
}
function partasKolom(status) {
  atasKolom.value = status;
}
function lepasKolom(status) {
  atasKolom.value = null;
  if (
    terangkatId.value &&
    tugas.value.some((t) => t.id === terangkatId.value)
  ) {
    pindahStatus(terangkatId.value, status);
  }
}
function pindahStatus(id, status) {
  const t = tugas.value.find((x) => x.id === id);
  if (t && t.status !== status) perbaruiTugas(id, { status });
}
function geserPanah(id, arah) {
  const t = tugas.value.find((x) => x.id === id);
  if (!t) return;
  const i = ID_KOLOM.indexOf(t.status);
  const j = Math.min(ID_KOLOM.length - 1, Math.max(0, i + arah));
  if (j !== i) pindahStatus(id, ID_KOLOM[j]);
}

/* ---------- Modal buat/edit ---------- */
const modalTerbuka = ref(false);
const idSedangEdit = ref(null);
const rancangan = reactive({
  judul: "",
  deskripsi: "",
  tanggalTarget: "",
  status: "todo",
  prioritas: "sedang",
  tagTool: "",
});

function bukaTambah() {
  idSedangEdit.value = null;
  Object.assign(rancangan, {
    judul: "",
    deskripsi: "",
    tanggalTarget: "",
    status: "todo",
    prioritas: "sedang",
    tagTool: "",
  });
  modalTerbuka.value = true;
}

function bukaEdit(t) {
  idSedangEdit.value = t.id;
  Object.assign(rancangan, {
    judul: t.judul,
    deskripsi: t.deskripsi || "",
    tanggalTarget: t.tanggalTarget || "",
    status: t.status,
    prioritas: t.prioritas || "sedang",
    tagTool: t.tagTool || "",
  });
  modalTerbuka.value = true;
}

function simpanModal() {
  if (!rancangan.judul.trim()) return;
  const isi = { ...rancangan, judul: rancangan.judul.trim() };
  if (idSedangEdit.value) {
    perbaruiTugas(idSedangEdit.value, isi);
  } else {
    tambahTugas(isi);
  }
  modalTerbuka.value = false;
}

function batalModal() {
  modalTerbuka.value = false;
}

function hapusDgnKonfirmasi(t) {
  if (confirm(`Hapus tugas "${t.judul}"?`)) hapusTugas(t.id);
}
</script>

<template>
  <section>
    <div class="kepala">
      <h2>Tugas</h2>
      <button class="tombol" @click="bukaTambah"><span class="msr">add</span> Tugas Baru</button>
    </div>

    <div class="board">
      <div
        v-for="k of kolom"
        :key="k.id"
        class="kolom kartu"
        :class="{ dipilih: atasKolom === k.id }"
        @dragover.prevent="partasKolom(k.id)"
        @dragleave.prevent="atasKolom === k.id && (atasKolom = null)"
        @drop.prevent="lepasKolom(k.id)"
      >
        <h3 class="judul-kolom"><span class="msr">{{ k.ikon }}</span> {{ k.label }} <small>{{ k.daftar.length }}</small></h3>

        <div v-if="k.id === 'todo' && k.daftar.length === 0" class="kosong-kolom">
          Belum ada tugas — tekan “＋ Tugas Baru”.
        </div>

        <article
          v-for="t of k.daftar"
          :key="t.id"
          class="kartu kartu-tugas"
          :class="[{ selesai: t.status === 'selesai' }, `pr-${t.prioritas}`]"
          draggable="true"
          @dragstart="(e) => mulaiDrag(e, t)"
          @dragend="terangkatId = null"
          @click="bukaEdit(t)"
        >
          <div class="baris-kartu">
            <b class="judul-tugas">{{ t.judul }}</b>
            <span class="chip-prioritas">{{ NAMA_PRIORITAS[t.prioritas] || "Sedang" }}</span>
          </div>
          <p v-if="t.deskripsi" class="deskripsi-tugas">{{ t.deskripsi }}</p>
          <div class="baris-meta">
            <span v-if="t.tanggalTarget" class="chip chip-tanggal"><span class="msr">event</span> {{ t.tanggalTarget }}</span>
            <span v-if="t.tagTool" class="chip chip-tool"><span class="msr">build</span> {{ t.tagTool }}</span>
          </div>
          <div class="baris-aksi" @click.stop>
            <button
              class="panah"
              :disabled="k.id === 'todo'"
              title="Geser ke kiri"
              @click="geserPanah(t.id, -1)"
            >
              <span class="msr">arrow_back</span>
            </button>
            <button class="ikon-kecil" title="Hapus" @click="hapusDgnKonfirmasi(t)">
              <span class="msr">delete</span>
            </button>
            <button
              class="panah"
              :disabled="k.id === 'selesai'"
              title="Geser ke kanan"
              @click="geserPanah(t.id, +1)"
            >
              <span class="msr">arrow_forward</span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- ===== Modal ===== -->
    <div v-if="modalTerbuka" class="tirai" @click.self="batalModal">
      <form class="modal kartu" @submit.prevent="simpanModal">
        <h3>{{ idSedangEdit ? "Edit Tugas" : "Tugas Baru" }}</h3>

        <label class="bidang">
          Judul
          <input v-model="rancangan.judul" required placeholder="Apa yang harus dikerjakan?" />
        </label>
        <label class="bidang">
          Deskripsi
          <textarea v-model="rancangan.deskripsi" rows="3" placeholder="Detail (boleh kosong)" />
        </label>
        <div class="baris-form">
          <label class="bidang">
            Tanggal target
            <input v-model="rancangan.tanggalTarget" type="date" required />
          </label>
          <label class="bidang">
            Prioritas
            <select v-model="rancangan.prioritas">
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi</option>
            </select>
          </label>
        </div>
        <div class="baris-form">
          <label class="bidang">
            Status
            <select v-model="rancangan.status">
              <option value="todo">Todo</option>
              <option value="dikerjakan">Dikerjakan</option>
              <option value="selesai">Selesai</option>
            </select>
          </label>
          <label class="bidang">
            Tag tool
            <select v-model="rancangan.tagTool">
              <option value="">— tanpa tag —</option>
              <option v-for="tl of tools" :key="tl.nama" :value="tl.nama">{{ tl.nama }}</option>
            </select>
          </label>
        </div>

        <div class="baris-tombol">
          <button type="button" class="tombol tombol--stengah" @click="batalModal">Batal</button>
          <button type="submit" class="tombol">Simpan</button>
        </div>
      </form>
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
  font-size: 1.6rem;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: start;
}
.kolom {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.kolom.dipilih {
  background: var(--md-surface-container-high);
}
.judul-kolom {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.chip .msr {
  font-size: 14px;
  vertical-align: -2px;
}
.judul-kolom small {
  color: var(--md-on-surface-variant);
}
.kosong-kolom {
  color: var(--md-on-surface-variant);
  font-style: italic;
  font-size: 0.85rem;
}

.kartu-tugas {
  background: var(--md-surface-container-high);
  padding: 0.85rem;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-left: 5px solid var(--md-primary);
}
.kartu-tugas.selesai {
  opacity: 0.65;
  text-decoration: line-through;
  border-left-color: var(--md-outline-variant);
}
.kartu-tugas.pr-tinggi {
  border-left-color: #c9563f;
}
.baris-kartu {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}
.judul-tugas {
  font-size: 0.95rem;
}
.deskripsi-tugas {
  margin: 0;
  font-size: 0.82rem;
  color: var(--md-on-surface-variant);
}
.chip-prioritas {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  white-space: nowrap;
}
.baris-meta {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.chip {
  font-size: 0.72rem;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  background: var(--md-surface-container);
  color: var(--md-on-surface-variant);
}
.baris-aksi {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
}
.panah,
.ikon-kecil {
  border: none;
  cursor: pointer;
  background: var(--md-surface-container);
  border-radius: 999px;
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
}
.panah:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Modal */
.tirai {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 1rem;
}
.modal {
  width: min(520px, 100%);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: var(--md-surface);
}
.modal h3 {
  margin: 0;
}
.baris-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
.baris-tombol {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
  }
  .baris-form {
    grid-template-columns: 1fr;
  }
}
</style>
