<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
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
const STATUS = [
  { id: "todo", label: "Todo" },
  { id: "dikerjakan", label: "Proses" },
  { id: "selesai", label: "Selesai" },
];
const URUT_PRIORITAS = { tinggi: 0, sedang: 1, rendah: 2 };
const NAMA_PRIORITAS = { tinggi: "Tinggi", sedang: "Sedang", rendah: "Rendah" };

function kelasPrioritas(p) {
  if (p === "tinggi") return "md-chip--error";
  if (p === "sedang") return "md-chip--primary";
  return "";
}

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
  if (terangkatId.value && tugas.value.some((t) => t.id === terangkatId.value)) {
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

/* ---------- Dialog buat/edit ---------- */
const dialogTerbuka = ref(false);
const idSedangEdit = ref(null);
const inputJudul = ref(null);
const rancangan = reactive({
  judul: "",
  deskripsi: "",
  tanggalTarget: "",
  status: "todo",
  prioritas: "sedang",
  tagTool: "",
});

async function bukaTambah() {
  idSedangEdit.value = null;
  Object.assign(rancangan, {
    judul: "",
    deskripsi: "",
    tanggalTarget: "",
    status: "todo",
    prioritas: "sedang",
    tagTool: "",
  });
  dialogTerbuka.value = true;
  await nextTick();
  inputJudul.value?.focus();
}

async function bukaEdit(t) {
  idSedangEdit.value = t.id;
  Object.assign(rancangan, {
    judul: t.judul,
    deskripsi: t.deskripsi || "",
    tanggalTarget: t.tanggalTarget || "",
    status: t.status,
    prioritas: t.prioritas || "sedang",
    tagTool: t.tagTool || "",
  });
  dialogTerbuka.value = true;
  await nextTick();
  inputJudul.value?.focus();
}

function simpanModal() {
  if (!rancangan.judul.trim()) return;
  const isi = { ...rancangan, judul: rancangan.judul.trim() };
  if (idSedangEdit.value) {
    perbaruiTugas(idSedangEdit.value, isi);
  } else {
    tambahTugas(isi);
  }
  dialogTerbuka.value = false;
}

function batalModal() {
  dialogTerbuka.value = false;
}

function hapusDgnKonfirmasi(t) {
  if (confirm(`Hapus tugas "${t.judul}"?`)) hapusTugas(t.id);
}

function onTombol(e) {
  if (e.key === "Escape" && dialogTerbuka.value) batalModal();
}
onMounted(() => document.addEventListener("keydown", onTombol));
onUnmounted(() => document.removeEventListener("keydown", onTombol));
</script>

<template>
  <section class="tugas">
    <header class="tugas__kepala">
      <div>
        <h2 class="md-headline-medium">Tugas</h2>
        <p class="md-body-medium tugas__sub">
          Geser kartu antar kolom, atau klik untuk mengedit.
        </p>
      </div>
      <button
        class="md-fab md-fab--extended tugas__fab"
        data-uji="tugas-baru"
        aria-label="Tugas baru"
        @click="bukaTambah"
      >
        <span class="msr">add</span>
        <span class="md-label-large tugas__fab-teks">Tugas Baru</span>
      </button>
    </header>

    <div class="board">
      <section
        v-for="k of kolom"
        :key="k.id"
        class="kolom"
        :class="{ 'kolom--sasaran': atasKolom === k.id }"
        @dragover.prevent="partasKolom(k.id)"
        @dragleave.prevent="atasKolom === k.id && (atasKolom = null)"
        @drop.prevent="lepasKolom(k.id)"
      >
        <header class="kolom__kepala">
          <h3 class="md-title-small">
            <span class="msr">{{ k.ikon }}</span>
            {{ k.label }}
          </h3>
          <span class="md-chip md-chip--kecil">{{ k.daftar.length }}</span>
        </header>

        <div v-if="k.id === 'todo' && k.daftar.length === 0" class="kolom__kosong md-body-small">
          Belum ada tugas. Tekan tombol Tugas Baru untuk mulai.
        </div>

        <TransitionGroup name="md-list" tag="div" class="kolom__daftar">
          <article
            v-for="t of k.daftar"
            :key="t.id"
            class="md-card md-card--filled tugas-card"
            :class="{ 'tugas-card--selesai': t.status === 'selesai' }"
            data-uji="kartu-tugas"
            draggable="true"
            @dragstart="(e) => mulaiDrag(e, t)"
            @dragend="terangkatId = null"
            @click="bukaEdit(t)"
          >
            <div class="tugas-card__kepala">
              <b class="md-title-small tugas-card__judul" data-uji="judul-tugas">{{ t.judul }}</b>
              <span class="md-chip md-chip--kecil" :class="kelasPrioritas(t.prioritas)">
                {{ NAMA_PRIORITAS[t.prioritas] || "Sedang" }}
              </span>
            </div>

            <p v-if="t.deskripsi" class="md-body-small tugas-card__deskripsi">
              {{ t.deskripsi }}
            </p>

            <div v-if="t.tanggalTarget || t.tagTool" class="tugas-card__meta">
              <span v-if="t.tanggalTarget" class="md-chip md-chip--kecil md-chip--tonal">
                <span class="msr">event</span>{{ t.tanggalTarget }}
              </span>
              <span v-if="t.tagTool" class="md-chip md-chip--kecil">
                <span class="msr">build</span>{{ t.tagTool }}
              </span>
            </div>

            <div class="tugas-card__aksi" @click.stop>
              <button
                class="md-icon-button"
                :disabled="k.id === 'todo'"
                title="Geser ke kiri"
                @click="geserPanah(t.id, -1)"
              >
                <span class="msr">arrow_back</span>
              </button>
              <button class="md-icon-button" title="Hapus" @click="hapusDgnKonfirmasi(t)">
                <span class="msr">delete</span>
              </button>
              <button
                class="md-icon-button"
                :disabled="k.id === 'selesai'"
                title="Geser ke kanan"
                @click="geserPanah(t.id, +1)"
              >
                <span class="msr">arrow_forward</span>
              </button>
            </div>
          </article>
        </TransitionGroup>
      </section>
    </div>

    <!-- ===== Dialog tugas ===== -->
    <Transition name="md-dialog">
    <div
      v-if="dialogTerbuka"
      class="md-scrim"
      data-uji="dialog-tugas"
      @click.self="batalModal"
    >
      <form
        class="md-dialog tugas-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-dialog"
        @submit.prevent="simpanModal"
      >
        <h3 id="judul-dialog" class="md-headline-small">
          {{ idSedangEdit ? "Edit Tugas" : "Tugas Baru" }}
        </h3>

        <label class="md-text-field" :class="{ 'md-text-field--terisi': rancangan.judul }">
          <span class="md-text-field__label">Judul</span>
          <input
            ref="inputJudul"
            v-model="rancangan.judul"
            data-uji="tugas-judul"
            required
            placeholder=" "
          />
        </label>

        <label class="md-text-field md-text-field--area">
          <span class="md-text-field__label">Deskripsi</span>
          <textarea
            v-model="rancangan.deskripsi"
            data-uji="tugas-deskripsi"
            rows="3"
            placeholder=" "
          />
        </label>

        <div class="form-baris">
          <label
            class="md-text-field"
            :class="{ 'md-text-field--terisi': rancangan.tanggalTarget }"
          >
            <span class="md-text-field__label">Tanggal target</span>
            <input
              v-model="rancangan.tanggalTarget"
              data-uji="tugas-tanggal"
              type="date"
              required
            />
          </label>

          <label class="md-text-field md-text-field--terisi">
            <span class="md-text-field__label">Prioritas</span>
            <select v-model="rancangan.prioritas" data-uji="tugas-prioritas">
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi</option>
            </select>
            <span class="msr md-text-field__trailing">arrow_drop_down</span>
          </label>
        </div>

        <div class="form-status">
          <span class="md-label-large form-status__label">Status</span>
          <div class="md-segmented" role="group" aria-label="Status tugas">
            <button
              v-for="s of STATUS"
              :key="s.id"
              type="button"
              class="md-segmented__item"
              :class="{ 'md-segmented__item--aktif': rancangan.status === s.id }"
              :data-uji="`status-${s.id}`"
              @click="rancangan.status = s.id"
            >
              <span v-if="rancangan.status === s.id" class="msr">check</span>
              {{ s.label }}
            </button>
          </div>
        </div>

        <label class="md-text-field md-text-field--terisi">
          <span class="md-text-field__label">Tag tool</span>
          <select v-model="rancangan.tagTool" data-uji="tugas-tag">
            <option value="">Tanpa tag</option>
            <option v-for="tl of tools" :key="tl.nama" :value="tl.nama">{{ tl.nama }}</option>
          </select>
          <span class="msr md-text-field__trailing">arrow_drop_down</span>
        </label>

        <div class="md-dialog__actions">
          <button type="button" class="md-text-button" data-uji="tugas-batal" @click="batalModal">
            Batal
          </button>
          <button type="submit" class="md-filled-button" data-uji="tugas-simpan" :disabled="!rancangan.judul.trim()">
            Simpan
          </button>
        </div>
      </form>
    </div>
    </Transition>
  </section>
</template>

<style scoped>
.tugas {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tugas__kepala {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tugas__sub {
  margin-top: 4px;
  color: var(--md-on-surface-variant);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 12px;
  align-items: start;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x proximity;
}

.kolom {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 220px;
  padding: 12px;
  border-radius: var(--md-shape-md);
  background: var(--md-surface-container-low);
  scroll-snap-align: start;
  transition: background-color var(--md-duration-short-3) var(--md-easing-standard);
}

.kolom--sasaran {
  background: var(--md-secondary-container);
}

.kolom__kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 4px 0;
}

.kolom__kepala h3 {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--md-on-surface-variant);
}

.kolom__kepala .msr {
  font-size: 18px;
}

.kolom__kosong {
  color: var(--md-on-surface-variant);
  padding: 4px;
}

.kolom__daftar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tugas-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  cursor: grab;
  background: var(--md-surface-container-highest);
}

.tugas-card:hover {
  background: color-mix(
    in srgb,
    var(--md-on-surface) 4%,
    var(--md-surface-container-highest)
  );
  transform: translateY(-1px);
}

.tugas-card--selesai {
  opacity: 0.68;
}

.tugas-card--selesai .tugas-card__judul {
  text-decoration: line-through;
}

.tugas-card__kepala {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.tugas-card__judul {
  overflow-wrap: anywhere;
}

.tugas-card__deskripsi {
  color: var(--md-on-surface-variant);
  white-space: pre-wrap;
}

.tugas-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tugas-card__aksi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--md-outline-variant);
}

.tugas-card__aksi .md-icon-button {
  width: 32px;
  height: 32px;
}

.tugas-card__aksi .md-icon-button .msr {
  font-size: 18px;
}

/* ---------- Dialog ---------- */
.md-dialog-enter-active,
.md-dialog-leave-active {
  transition: opacity var(--md-duration-short-3) var(--md-easing-standard);
}

.md-dialog-enter-active .tugas-dialog,
.md-dialog-leave-active .tugas-dialog {
  transition:
    opacity var(--md-duration-medium-1) var(--md-easing-emphasized-decelerate),
    transform var(--md-duration-medium-1) var(--md-easing-emphasized-decelerate);
}

.md-dialog-enter-from,
.md-dialog-leave-to {
  opacity: 0;
}

.md-dialog-enter-from .tugas-dialog {
  opacity: 0;
  transform: translateY(24px) scale(0.92);
}

.md-dialog-leave-to .tugas-dialog {
  opacity: 0;
  transform: scale(0.96);
}

.tugas-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-baris {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-status__label {
  color: var(--md-on-surface-variant);
}

.form-status .md-segmented {
  width: 100%;
}

.form-status .md-segmented__item {
  flex: 1;
  justify-content: center;
  padding: 0 8px;
}

@media (min-width: 1000px) {
  .board {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow-x: visible;
  }
}

@media (max-width: 599px) {
  .tugas__fab {
    position: fixed;
    right: 16px;
    bottom: calc(96px + env(safe-area-inset-bottom));
    z-index: 25;
    padding: 0;
    min-width: 56px;
  }
  .tugas__fab-teks {
    display: none;
  }
  .form-baris {
    grid-template-columns: 1fr;
  }
  .md-scrim {
    padding: 0;
  }
  .tugas-dialog {
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    padding: 16px;
  }
}
</style>
