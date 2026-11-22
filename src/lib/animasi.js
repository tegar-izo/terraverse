import { gsap } from "gsap";
import { nextTick, onMounted, onUnmounted } from "vue";

export function kurangiGerak() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/**
 * Animasi masuk untuk satu halaman:
 * - [data-anim="kepala"] muncul lebih dulu
 * - [data-anim="item"] menyusul dengan stagger
 */
export function useAnimasiMasuk(akar) {
  let ctx;

  onMounted(async () => {
    await nextTick();
    const el = akar?.value;
    if (!el || kurangiGerak()) return;

    ctx = gsap.context(() => {
      const kepala = el.querySelectorAll('[data-anim="kepala"]');
      const item = el.querySelectorAll('[data-anim="item"]');

      if (kepala.length) {
        gsap.fromTo(
          kepala,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }

      if (item.length) {
        gsap.fromTo(
          item,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            delay: 0.06,
            stagger: 0.045,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }
    }, el);
  });

  onUnmounted(() => ctx?.revert());
}

/** Stagger ringan untuk daftar/sel yang berubah (mis. grid bulan). */
export function animasiDaftar(akar, selector, opsi = {}) {
  const el = akar?.value ?? akar;
  if (!el || kurangiGerak()) return;
  const target = el.querySelectorAll(selector);
  if (!target.length) return;

  gsap.fromTo(
    target,
    { y: opsi.y ?? 6, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: opsi.durasi ?? 0.32,
      stagger: opsi.stagger ?? 0.01,
      ease: "power2.out",
      clearProps: "transform,opacity",
    }
  );
}

/** Animasi tombol kecil (mis. ganti tema). */
export function putarIkon(target) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el || kurangiGerak()) return;
  gsap.fromTo(
    el,
    { rotate: -90, scale: 0.65 },
    { rotate: 0, scale: 1, duration: 0.45, ease: "back.out(2)", clearProps: "transform" }
  );
}
