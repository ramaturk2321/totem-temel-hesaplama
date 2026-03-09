import type { TotemConfig, TemelSonuc } from "./types";
import {
  HAVA_YOGUNLUGU,
  BETON_YOGUNLUGU,
  YERCEKIM,
  GUVENLIK_KATSAYISI_MIN,
  CD_DUZLEM,
  CD_SILINDIR,
  ZEMIN_TIPLERI,
  DIREK_DERINLIK_ESLEME,
} from "./constants";
import type { ZeminTipi } from "./types";

/** km/h -> m/s */
function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

/** Ruzgar dinamik basinci: q = 0.5 * rho * V^2 (Pa) */
export function ruzgarBasinciHesapla(ruzgarHiziKmh: number): number {
  const v = kmhToMs(ruzgarHiziKmh);
  return 0.5 * HAVA_YOGUNLUGU * v * v;
}

/** Panel ruzgar kuvveti: F = q * Cd * A (N) */
export function panelRuzgarKuvveti(
  basincPa: number,
  panelGenislik: number,
  panelYukseklik: number
): number {
  return basincPa * CD_DUZLEM * panelGenislik * panelYukseklik;
}

/** Silindirik direk ruzgar kuvveti: F = q * Cd * D * H (N) */
export function direktRuzgarKuvveti(
  basincPa: number,
  boruCapiCm: number,
  direkBoyu: number
): number {
  const capMetre = boruCapiCm / 100;
  return basincPa * CD_SILINDIR * capMetre * direkBoyu;
}

/**
 * Devrilme momenti (temel tabanindan):
 * M = F_panel * H_eff_panel + F_direk * H_eff_direk
 */
export function devrilmeMomentiHesapla(
  panelKuvvet: number,
  direktKuvvet: number,
  direkBoyu: number,
  panelYukseklik: number,
  temelDerinlik: number
): number {
  const hEffPanel = temelDerinlik + direkBoyu + panelYukseklik / 2;
  const hEffDirek = temelDerinlik + direkBoyu / 2;
  return panelKuvvet * hEffPanel + direktKuvvet * hEffDirek;
}

/**
 * Direnc momenti:
 * Beton agirligi * kol mesafesi + pasif zemin basinci momenti
 */
export function direncMomentiHesapla(
  temelGenislikM: number,
  temelUzunlukM: number,
  temelDerinlikM: number,
  zemin: ZeminTipi
): number {
  // Beton agirligi momenti
  const betonHacim = temelGenislikM * temelUzunlukM * temelDerinlikM;
  const betonAgirlik = betonHacim * BETON_YOGUNLUGU * YERCEKIM;
  const betonMoment = betonAgirlik * (temelGenislikM / 2);

  // Pasif zemin basinci momenti
  const pasifKuvvet =
    0.5 *
    zemin.pasifBasincKatsayisi *
    zemin.yogunluk *
    YERCEKIM *
    temelDerinlikM *
    temelDerinlikM *
    temelUzunlukM;
  const pasifMoment = pasifKuvvet * (temelDerinlikM / 3);

  return betonMoment + pasifMoment;
}

/**
 * Ana hesaplama: Iteratif temel boyutlandirma
 * Guvenlik katsayisi >= 1.5 olana kadar boyutlari arttirir
 */
export function temelBoyutlariHesapla(config: TotemConfig): TemelSonuc {
  const zemin = ZEMIN_TIPLERI.find((z) => z.id === config.zeminTipiId)!;

  // Ruzgar hesaplari
  const basincPa = ruzgarBasinciHesapla(config.ruzgarHizi);
  const fPanel = panelRuzgarKuvveti(basincPa, config.panelGenislik, config.panelYukseklik);
  const fDirek = direktRuzgarKuvveti(basincPa, config.boruCapi, config.direkBoyu);
  const fToplam = fPanel + fDirek;

  // Baslangic boyutlari
  let genislik = Math.max(config.panelGenislik * 0.6, 0.8);
  let uzunluk = Math.max(config.panelGenislik * 0.6, 0.8);
  const minDerinlik = DIREK_DERINLIK_ESLEME[config.direkBoyu] ?? config.direkBoyu * 0.15;
  let derinlik = Math.max(minDerinlik, 0.8);

  const STEP = 0.1; // 10cm artis
  let guvenlik = 0;
  let direncM = 0;
  let devrilmeM = 0;
  let maxIter = 300;

  while (maxIter-- > 0) {
    devrilmeM = devrilmeMomentiHesapla(fPanel, fDirek, config.direkBoyu, config.panelYukseklik, derinlik);
    direncM = direncMomentiHesapla(genislik, uzunluk, derinlik, zemin);
    guvenlik = devrilmeM > 0 ? direncM / devrilmeM : 99;

    if (guvenlik >= GUVENLIK_KATSAYISI_MIN) break;

    if (derinlik < 3.0) {
      derinlik += STEP;
    } else if (genislik < 4.0) {
      genislik += STEP;
      uzunluk = Math.max(uzunluk, genislik);
    } else {
      uzunluk += STEP;
    }
  }

  if (uzunluk < genislik) uzunluk = genislik;

  // 5cm'ye yuvarla
  const roundTo5cm = (m: number) => Math.ceil(m * 20) / 20;
  genislik = roundTo5cm(genislik);
  uzunluk = roundTo5cm(uzunluk);
  derinlik = roundTo5cm(derinlik);

  // Yuvarlama sonrasi son hesaplama
  devrilmeM = devrilmeMomentiHesapla(fPanel, fDirek, config.direkBoyu, config.panelYukseklik, derinlik);
  direncM = direncMomentiHesapla(genislik, uzunluk, derinlik, zemin);
  guvenlik = devrilmeM > 0 ? direncM / devrilmeM : 99;

  const betonHacmi = genislik * uzunluk * derinlik;

  // Donati onerisi
  let demirDonati: string;
  if (betonHacmi > 2.0) {
    demirDonati = "Ø16 hasır donatı, 15×15 cm aralıklı, çift kat";
  } else if (betonHacmi > 1.0) {
    demirDonati = "Ø14 hasır donatı, 15×15 cm aralıklı";
  } else if (betonHacmi > 0.5) {
    demirDonati = "Ø12 hasır donatı, 20×20 cm aralıklı";
  } else {
    demirDonati = "Ø10 hasır donatı, 20×20 cm aralıklı";
  }

  return {
    ruzgarBasinci: basincPa,
    panelRuzgarKuvveti: fPanel,
    direktRuzgarKuvveti: fDirek,
    toplamRuzgarKuvveti: fToplam,
    devrilmeMomenti: devrilmeM,
    temelGenislik: Math.round(genislik * 100),
    temelUzunluk: Math.round(uzunluk * 100),
    temelDerinlik: Math.round(derinlik * 100),
    betonHacmi: Math.round(betonHacmi * 1000) / 1000,
    demirDonati,
    guvenlikKatsayisi: Math.round(guvenlik * 100) / 100,
    direncMomenti: direncM,
  };
}
