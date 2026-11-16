// Çalıştır: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  yonlendirmeHesapla,
  yonlendirmeOner,
  kutuKesit,
  konsolSehim,
  VARSAYILAN_YON,
} from "./yonlendirme.ts";

const yakin = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= Math.abs(b) * tol, `${a} ≠ ${b} (±%${tol * 100})`);

test("rüzgâr basıncı: 180 km/sa → 1562,5 Pa", () => {
  const s = yonlendirmeHesapla(VARSAYILAN_YON);
  yakin(s.hiz, 50);
  yakin(s.q, 1562.5);
});

test("panel kuvveti elle hesapla tutuyor", () => {
  const s = yonlendirmeHesapla(VARSAYILAN_YON);
  // panel 1,80 m yüksek; genişlik 1,00 + 2×0,08 = 1,16 m; A = 2,088 m²
  yakin(s.panelYukseklik, 1.8);
  yakin(s.refAlan, 2.088);
  yakin(s.fPanel, 1562.5 * 1.8 * 2.088); // 5.872,5 N
  yakin(s.fDirek, 1562.5 * 2.0 * (2 * 0.08 * 0.5)); // 250 N
  // pay = 0,5 + 0,25×1,16 / 1,08 = 0,7685
  yakin(s.pay, 0.5 + 0.29 / 1.08);
  // M_k = 0,7685 × 5872,5 × 1,40 + 125 × 0,25
  yakin(s.mK, (0.5 + 0.29 / 1.08) * 5872.5 * 1.4 + 31.25);
  yakin(s.mEd, 1.5 * s.mK);
});

test("eksantriklik kapalıyken yük iki direğe eşit dağılır", () => {
  const s = yonlendirmeHesapla({ ...VARSAYILAN_YON, eksantriklik: false });
  yakin(s.pay, 0.5);
});

test("kutu profil 80×80×3 kesit değerleri", () => {
  const k = kutuKesit(80, 3, 235);
  yakin(k.alan, 924);
  yakin(k.atalet, (80 ** 4 - 74 ** 4) / 12);
  yakin(k.wEl, 22861, 0.001);
  yakin(k.wPl, 26694, 0.001);
  assert.equal(k.sinif, 1);
});

test("konsol sehimi kapalı formülle tutuyor (tam boy yayılı yük: wL⁴/8EI)", () => {
  const L = 2, w = 1000, EI = 5e5;
  yakin(konsolSehim(L, 0.0001, w, w, EI), ((w * L ** 4) / (8 * EI)) * 1000, 0.002);
});

test("şartname asgarisi 180 km/sa için yetmiyor; öneri tüm kontrolleri geçiriyor", () => {
  const asgari = yonlendirmeHesapla(VARSAYILAN_YON);
  assert.equal(asgari.uygun, false);
  const oneri = yonlendirmeOner(VARSAYILAN_YON);
  const s = yonlendirmeHesapla(oneri);
  assert.equal(s.uygun, true, JSON.stringify(s.kontroller.filter((c) => !c.uygun)));
  assert.ok(oneri.profilB >= VARSAYILAN_YON.profilB);
  assert.ok(oneri.temelB >= VARSAYILAN_YON.temelB && oneri.temelD >= VARSAYILAN_YON.temelD);
});

test("yeterli girdide öneri girdiyi değiştirmez", () => {
  const iyi = yonlendirmeOner(VARSAYILAN_YON);
  assert.deepEqual(yonlendirmeOner(iyi), iyi);
});

test("daha kısa tabela daha az moment üretir", () => {
  const on = yonlendirmeHesapla(VARSAYILAN_YON);
  const bes = yonlendirmeHesapla({ ...VARSAYILAN_YON, modulAdet: 5 });
  assert.ok(bes.mEd < on.mEd);
  yakin(bes.panelYukseklik, 1.05);
});
