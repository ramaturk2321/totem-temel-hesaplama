import type { ZeminTipi, RuzgarBolgesi, BoruSecenegi } from "./types";

// Fiziksel sabitler
export const HAVA_YOGUNLUGU = 1.225;       // kg/m³
export const BETON_YOGUNLUGU = 2400;        // kg/m³
export const YERCEKIM = 9.81;               // m/s²
export const GUVENLIK_KATSAYISI_MIN = 1.5;
export const CD_DUZLEM = 1.2;               // duz panel suruklenme katsayisi
export const CD_SILINDIR = 0.7;             // silindirik boru suruklenme katsayisi

// Standart celik boru caaplari
export const BORU_SECENEKLERI: BoruSecenegi[] = [
  { capCm: 14.1, label: "Ø141 mm (DN125)", etKalinlik: 4.0 },
  { capCm: 21.9, label: "Ø219 mm (DN200)", etKalinlik: 5.0 },
  { capCm: 32.4, label: "Ø324 mm (DN300)", etKalinlik: 6.3 },
  { capCm: 50,   label: "Ø500 mm (DN500)", etKalinlik: 8.0 },
  { capCm: 61,   label: "Ø610 mm (DN600)", etKalinlik: 10.0 },
  { capCm: 81,   label: "Ø813 mm (DN800)", etKalinlik: 12.0 },
];

// Direk boyuna gore otomatik boru capi eslesmesi
export const DIREK_BORU_ESLEME: Record<number, number> = {
  6: 50,
  8: 61,
  10: 81,
};

// Direk boyuna gore minimum temel derinligi (metre)
export const DIREK_DERINLIK_ESLEME: Record<number, number> = {
  8: 1.8,
  10: 1.8,
};

// Ruzgar hizi bolgeleri
export const RUZGAR_BOLGELERI: RuzgarBolgesi[] = [
  { id: "hafif",    label: "Hafif Ruzgar",     hiz: 50 },
  { id: "orta",     label: "Orta Ruzgar",       hiz: 80 },
  { id: "kuvvetli", label: "Kuvvetli Ruzgar",   hiz: 110 },
  { id: "firtina",  label: "Firtina",           hiz: 130 },
  { id: "siddetli", label: "Siddetli Firtina",  hiz: 150 },
];

// Zemin tipleri ve muhendislik parametreleri
export const ZEMIN_TIPLERI: ZeminTipi[] = [
  {
    id: "kaya",
    label: "Kaya",
    aciklama: "Sert kaya zemin",
    tasimagucu: 600,
    pasifBasincKatsayisi: 8.0,
    yogunluk: 2600,
  },
  {
    id: "siki_kum",
    label: "Siki Kum",
    aciklama: "Yogun, sikistirilmis kum",
    tasimagucu: 300,
    pasifBasincKatsayisi: 4.0,
    yogunluk: 1900,
  },
  {
    id: "gevsek_kum",
    label: "Gevsek Kum",
    aciklama: "Gevsek kumlu zemin",
    tasimagucu: 150,
    pasifBasincKatsayisi: 2.5,
    yogunluk: 1600,
  },
  {
    id: "kil",
    label: "Kil",
    aciklama: "Killi zemin",
    tasimagucu: 200,
    pasifBasincKatsayisi: 3.0,
    yogunluk: 1800,
  },
  {
    id: "yumusak",
    label: "Yumusak Zemin",
    aciklama: "Yumusak, dolgulu zemin",
    tasimagucu: 75,
    pasifBasincKatsayisi: 1.5,
    yogunluk: 1400,
  },
];

// Panel boyut onayarlari
export const PANEL_ONAYARLARI = [
  { genislik: 1.0, yukseklik: 1.5, label: "1.0 × 1.5 m" },
  { genislik: 1.0, yukseklik: 2.0, label: "1.0 × 2.0 m" },
  { genislik: 1.5, yukseklik: 2.0, label: "1.5 × 2.0 m" },
  { genislik: 2.0, yukseklik: 3.0, label: "2.0 × 3.0 m" },
  { genislik: 2.0, yukseklik: 4.0, label: "2.0 × 4.0 m" },
  { genislik: 3.0, yukseklik: 5.0, label: "3.0 × 5.0 m" },
];

// Direk boyu secenekleri (metre)
export const DIREK_BOYLARI = [3, 4, 5, 6, 7, 8, 10];
