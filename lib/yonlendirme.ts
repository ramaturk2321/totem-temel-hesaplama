// Çift direkli yönlendirme tabelası ön statik hesabı.
// Yöntem: TS EN 1991-1-4 (rüzgâr, tabela levhası cf = 1,8 ve yatay eksantriklik),
// TS EN 1993-1-1 (kutu profil eğilme/kesme), TS EN 1993-1-8 (ankraj cıvatası).
// Temel devrilme/kayma/zemin gerilmesi: bu araçtaki totem hesabıyla aynı Rankine pasif itki yaklaşımı.
import { ZEMIN_TIPLERI, BETON_YOGUNLUGU, YERCEKIM } from "./constants.ts";
import type { ZeminTipi } from "./types";

export const RHO_HAVA = 1.25; // kg/m³ (EN 1991-1-4 önerilen değer)
export const CF_KUTU_PROFIL = 2.0; // keskin köşeli kare kesit
export const GAMMA_Q = 1.5; // rüzgâr yük katsayısı (taşıma sınır durumu)
export const GAMMA_M2 = 1.25; // cıvata malzeme katsayısı
export const E_CELIK = 210000; // MPa
export const GK_MIN = 1.5; // devrilme ve kayma için en az güvenlik katsayısı
export const SURTUNME = 0.5; // beton–zemin sürtünme katsayısı
const CELIK_YOGUNLUK = 7850; // kg/m³
const PANEL_BIRIM_AGIRLIK = 8; // kg/m² (3 mm kompozit + arka kuşak + bağlantı)

/** Metrik cıvata çekme gerilme alanları (mm²) */
export const CIVATA_ALAN: Record<number, number> = { 12: 84.3, 16: 157, 20: 245, 24: 353 };

/** Öneri taramasında denenecek kutu profiller [kenar mm, et mm] */
export const PROFIL_LISTESI: [number, number][] = [
  [80, 3], [80, 4], [90, 4], [100, 3], [100, 4], [100, 5], [120, 4], [120, 5], [140, 5], [150, 6],
];

export interface YonGirdi {
  ad: string; // tabela tanımı
  panelGenislik: number; // m, direkler arası panel
  logoYukseklik: number; // m
  modulYukseklik: number; // m
  modulAdet: number;
  zeminBoslugu: number; // m, panel alt kenarı – zemin
  profilB: number; // mm
  profilT: number; // mm
  celikFy: number; // MPa
  ruzgarHizi: number; // km/sa, tepe (hamle) hızı
  cfPanel: number;
  eksantriklik: boolean; // EN 1991-1-4 7.4.3: e = ±0,25·b
  flansKenar: number; // mm
  flansKalinlik: number; // mm
  ankrajCap: number; // mm
  ankrajKenarMesafe: number; // mm, cıvata ekseni – flanş kenarı
  ankrajFub: number; // MPa, cıvata çekme dayanımı
  temelB: number; // m, rüzgâr yönündeki kenar (direk başına ayrı temel)
  temelL: number; // m
  temelD: number; // m
  zeminTipiId: string;
}

export interface Kontrol {
  ad: string;
  hesap: string;
  sinir: string;
  oran: number; // talep / kapasite; ≤ 1 uygun
  uygun: boolean;
}

export interface YonSonuc {
  hiz: number; // m/s
  q: number; // Pa
  panelYukseklik: number; // m
  toplamYukseklik: number; // m
  toplamGenislik: number; // m
  refAlan: number; // m²
  fPanel: number; // N
  fDirek: number; // N
  fToplam: number; // N
  pay: number; // en çok yüklenen direğin panel yükünden payı
  mK: number; // N·m, karakteristik, zemin kotu, tek direk
  vK: number; // N
  mEd: number; // N·m
  vEd: number; // N
  kesitAlan: number; // mm²
  atalet: number; // mm⁴
  wEl: number; // mm³
  wPl: number; // mm³
  kesitSinifi: number;
  wKullanilan: number; // mm³
  mRd: number; // N·m
  vRd: number; // N
  gerilme: number; // MPa (M_Ed / W)
  sehim: number; // mm, karakteristik yükte tepe
  sehimSinir: number; // mm
  ankrajKol: number; // mm
  ankrajCekme: number; // N, cıvata başına
  ankrajKesme: number; // N, cıvata başına
  ftRd: number; // N
  fvRd: number; // N
  flansGerilme: number; // MPa
  flansGerekliKalinlik: number; // mm
  agirlik: number; // kg, tabela toplam (tahmin)
  temelAgirlik: number; // N, tek blok
  mDevrilme: number; // N·m
  mDirenc: number; // N·m
  gkDevrilme: number;
  gkKayma: number;
  zeminGerilme: number; // kPa
  zemin: ZeminTipi;
  betonHacmi: number; // m³, iki blok
  kontroller: Kontrol[];
  uygun: boolean;
}

export function zeminBul(id: string): ZeminTipi {
  const z = ZEMIN_TIPLERI.find((x) => x.id === id);
  if (!z) throw new Error(`Bilinmeyen zemin tipi: ${id}`);
  return z;
}

/** Kutu profil kesit değerleri (köşe yarıçapı ihmal) */
export function kutuKesit(b: number, t: number, fy: number) {
  const bi = b - 2 * t;
  const alan = b * b - bi * bi;
  const atalet = (b ** 4 - bi ** 4) / 12;
  const wEl = atalet / (b / 2);
  const wPl = (b ** 3 - bi ** 3) / 4;
  const eps = Math.sqrt(235 / fy);
  const ct = (b - 3 * t) / t;
  const sinif = ct <= 33 * eps ? 1 : ct <= 38 * eps ? 2 : ct <= 42 * eps ? 3 : 4;
  return { alan, atalet, wEl, wPl, sinif };
}

/**
 * Konsol direğin tepe sehimi (mm): zeminden a..L arası yayılı w (N/m) + 0..a arası yayılı w0 (N/m).
 * Birim yük yöntemiyle sayısal integral.
 */
export function konsolSehim(L: number, a: number, w: number, w0: number, EI: number): number {
  const n = 2000;
  const dx = L / n;
  let toplam = 0;
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * dx;
    // x kesitindeki moment: üstte kalan yüklerin momenti
    let m = 0;
    if (x < a) {
      m += (w0 * (a - x) * (a - x)) / 2;
      m += w * (L - a) * ((a + L) / 2 - x);
    } else {
      m += (w * (L - x) * (L - x)) / 2;
    }
    toplam += m * (L - x) * dx;
  }
  return (toplam / EI) * 1000;
}

export function yonlendirmeHesapla(g: YonGirdi): YonSonuc {
  const zemin = zeminBul(g.zeminTipiId);
  const b = g.profilB / 1000;

  // 1) Rüzgâr
  const hiz = g.ruzgarHizi / 3.6;
  const q = 0.5 * RHO_HAVA * hiz * hiz;
  const panelYukseklik = g.logoYukseklik + g.modulAdet * g.modulYukseklik;
  const toplamYukseklik = g.zeminBoslugu + panelYukseklik;
  const toplamGenislik = g.panelGenislik + 2 * b;
  const refAlan = toplamGenislik * panelYukseklik; // panel + panel hizasındaki direkler
  const fPanel = q * g.cfPanel * refAlan;
  const zPanel = g.zeminBoslugu + panelYukseklik / 2;
  const fDirek = q * CF_KUTU_PROFIL * (2 * b * g.zeminBoslugu); // panel altındaki iki direk parçası
  const fToplam = fPanel + fDirek;

  // 2) En çok yüklenen direk
  const aks = g.panelGenislik + b; // direk eksenleri arası
  const e = g.eksantriklik ? 0.25 * toplamGenislik : 0;
  const pay = 0.5 + e / aks;
  const mK = pay * fPanel * zPanel + (fDirek / 2) * (g.zeminBoslugu / 2);
  const vK = pay * fPanel + fDirek / 2;
  const mEd = GAMMA_Q * mK;
  const vEd = GAMMA_Q * vK;

  // 3) Kesit
  const k = kutuKesit(g.profilB, g.profilT, g.celikFy);
  const wKullanilan = k.sinif <= 2 ? k.wPl : k.wEl;
  const mRd = (wKullanilan * g.celikFy) / 1000; // N·m
  const vRd = ((k.alan / 2) * g.celikFy) / Math.sqrt(3); // N
  const gerilme = (mEd * 1000) / wKullanilan;
  const EI = (E_CELIK * k.atalet) / 1e6; // N·m²
  const sehim = konsolSehim(
    toplamYukseklik,
    g.zeminBoslugu,
    (pay * fPanel) / panelYukseklik,
    fDirek / 2 / g.zeminBoslugu,
    EI
  );
  const sehimSinir = (toplamYukseklik * 1000) / 100;

  // 4) Ankraj ve flanş (4 cıvata, 2'si çekmede; basınç bileşkesi profilin basınç yüzünde)
  const civataAraligi = g.flansKenar - 2 * g.ankrajKenarMesafe;
  const ankrajKol = civataAraligi / 2 + g.profilB / 2; // mm
  const ankrajCekme = (mEd * 1000) / (2 * ankrajKol);
  const ankrajKesme = vEd / 4;
  const as = CIVATA_ALAN[g.ankrajCap];
  if (!as) throw new Error(`Desteklenmeyen ankraj çapı: M${g.ankrajCap}`);
  const ftRd = (0.9 * g.ankrajFub * as) / GAMMA_M2;
  const fvRd = (0.5 * g.ankrajFub * as) / GAMMA_M2;
  const ankrajOran = ankrajKesme / fvRd + ankrajCekme / (1.4 * ftRd);
  const flansKol = Math.max((civataAraligi - g.profilB) / 2, 0); // mm, cıvata ekseni – profil yüzü
  const flansMoment = 2 * ankrajCekme * flansKol; // N·mm
  const flansW = (g.flansKenar * g.flansKalinlik ** 2) / 4;
  const flansGerilme = flansMoment / flansW;
  const flansGerekliKalinlik = Math.sqrt((4 * flansMoment) / (g.flansKenar * g.celikFy));

  // 5) Temel (direk başına ayrı blok, en çok yüklenen direk)
  const agirlik =
    2 * (k.alan / 1e6) * CELIK_YOGUNLUK * toplamYukseklik +
    PANEL_BIRIM_AGIRLIK * g.panelGenislik * panelYukseklik;
  const temelAgirlik = g.temelB * g.temelL * g.temelD * BETON_YOGUNLUGU * YERCEKIM;
  const N = temelAgirlik + (agirlik / 2) * YERCEKIM;
  const mDevrilme =
    pay * fPanel * (zPanel + g.temelD) + (fDirek / 2) * (g.zeminBoslugu / 2 + g.temelD);
  const pasifKuvvet =
    0.5 * zemin.pasifBasincKatsayisi * zemin.yogunluk * YERCEKIM * g.temelD ** 2 * g.temelL;
  const mPasif = pasifKuvvet * (g.temelD / 3);
  const mDirenc = N * (g.temelB / 2) + mPasif;
  const gkDevrilme = mDirenc / mDevrilme;
  const gkKayma = (N * SURTUNME + pasifKuvvet) / vK;
  const mNet = Math.max(mDevrilme - mPasif, 0);
  const eks = mNet / N;
  let zeminGerilme: number;
  if (eks <= g.temelB / 6) {
    zeminGerilme = (N / (g.temelB * g.temelL)) * (1 + (6 * eks) / g.temelB);
  } else if (eks < g.temelB / 2) {
    zeminGerilme = (2 * N) / (3 * g.temelL * (g.temelB / 2 - eks));
  } else {
    zeminGerilme = Infinity;
  }
  zeminGerilme /= 1000; // kPa

  const s = (n: number, d = 2) =>
    Number.isFinite(n)
      ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: d }).format(n)
      : "∞";
  const kontroller: Kontrol[] = [
    {
      ad: "Direk eğilme dayanımı",
      hesap: `M_Ed = ${s(mEd / 1000)} kN·m`,
      sinir: `M_Rd = ${s(mRd / 1000)} kN·m`,
      oran: mEd / mRd,
      uygun: mEd <= mRd && k.sinif <= 3,
    },
    {
      ad: "Direk kesme dayanımı",
      hesap: `V_Ed = ${s(vEd / 1000)} kN`,
      sinir: `V_Rd = ${s(vRd / 1000)} kN`,
      oran: vEd / vRd,
      uygun: vEd <= vRd,
    },
    {
      ad: "Tepe sehimi (karakteristik yük)",
      hesap: `δ = ${s(sehim, 1)} mm`,
      sinir: `H/100 = ${s(sehimSinir, 1)} mm`,
      oran: sehim / sehimSinir,
      uygun: sehim <= sehimSinir,
    },
    {
      ad: `Ankraj cıvatası M${g.ankrajCap} (çekme + kesme)`,
      hesap: `F_t = ${s(ankrajCekme / 1000)} kN, F_v = ${s(ankrajKesme / 1000)} kN`,
      sinir: `F_t,Rd = ${s(ftRd / 1000)} kN, F_v,Rd = ${s(fvRd / 1000)} kN`,
      oran: ankrajOran,
      uygun: ankrajOran <= 1 && ankrajCekme <= ftRd,
    },
    {
      ad: "Flanş plakası eğilmesi",
      hesap: `σ = ${s(flansGerilme, 0)} MPa (t = ${s(g.flansKalinlik)} mm)`,
      sinir: `f_y = ${s(g.celikFy, 0)} MPa (gerekli t ≥ ${s(flansGerekliKalinlik, 1)} mm)`,
      oran: flansGerilme / g.celikFy,
      uygun: flansGerilme <= g.celikFy,
    },
    {
      ad: "Temel devrilme güvenliği",
      hesap: `GK = ${s(gkDevrilme)}`,
      sinir: `GK ≥ ${s(GK_MIN, 1)}`,
      oran: GK_MIN / gkDevrilme,
      uygun: gkDevrilme >= GK_MIN,
    },
    {
      ad: "Temel kayma güvenliği",
      hesap: `GK = ${s(gkKayma)}`,
      sinir: `GK ≥ ${s(GK_MIN, 1)}`,
      oran: GK_MIN / gkKayma,
      uygun: gkKayma >= GK_MIN,
    },
    {
      ad: "Zemin gerilmesi",
      hesap: `σ_maks = ${s(zeminGerilme, 0)} kPa`,
      sinir: `σ_em = ${s(zemin.tasimagucu, 0)} kPa`,
      oran: zeminGerilme / zemin.tasimagucu,
      uygun: zeminGerilme <= zemin.tasimagucu,
    },
  ];

  return {
    hiz, q, panelYukseklik, toplamYukseklik, toplamGenislik, refAlan,
    fPanel, fDirek, fToplam, pay, mK, vK, mEd, vEd,
    kesitAlan: k.alan, atalet: k.atalet, wEl: k.wEl, wPl: k.wPl, kesitSinifi: k.sinif,
    wKullanilan, mRd, vRd, gerilme, sehim, sehimSinir,
    ankrajKol, ankrajCekme, ankrajKesme, ftRd, fvRd, flansGerilme, flansGerekliKalinlik,
    agirlik, temelAgirlik, mDevrilme, mDirenc, gkDevrilme, gkKayma, zeminGerilme, zemin,
    betonHacmi: 2 * g.temelB * g.temelL * g.temelD,
    kontroller,
    uygun: kontroller.every((c) => c.uygun),
  };
}

const TEMEL_ADLARI = ["Temel devrilme güvenliği", "Temel kayma güvenliği", "Zemin gerilmesi"];
const yukari = (x: number, adim: number) => Math.ceil(x / adim - 1e-9) * adim;

/**
 * Girdideki değerlerden başlayıp tüm kontroller sağlanana kadar büyütür:
 * profil (listeden ilk yeten), flanş kalınlığı (2 mm adım), ankraj çapı, temel (5 cm adım).
 * Girdi zaten yeterliyse aynısını döndürür.
 */
export function yonlendirmeOner(g: YonGirdi): YonGirdi {
  let o: YonGirdi = { ...g };
  const gecti = (x: YonGirdi, adlar: (ad: string) => boolean) =>
    yonlendirmeHesapla(x).kontroller.filter((c) => adlar(c.ad)).every((c) => c.uygun);

  // Profil
  const direkMi = (ad: string) => ad.startsWith("Direk") || ad.startsWith("Tepe");
  if (!gecti(o, direkMi)) {
    const aday = PROFIL_LISTESI.find(
      ([b, t]) =>
        (b > g.profilB || (b === g.profilB && t > g.profilT)) &&
        gecti({ ...o, profilB: b, profilT: t }, direkMi)
    );
    if (aday) o = { ...o, profilB: aday[0], profilT: aday[1] };
  }
  // Flanş, profilden en az 2×(kenar mesafesi + 35 mm) geniş olmalı
  o.flansKenar = Math.max(o.flansKenar, yukari(o.profilB + 2 * (o.ankrajKenarMesafe + 35), 10));
  // Ankraj
  for (const cap of [16, 20, 24]) {
    if (cap < g.ankrajCap) continue;
    o.ankrajCap = cap;
    if (gecti(o, (ad) => ad.startsWith("Ankraj"))) break;
  }
  // Flanş kalınlığı
  const gerekli = yonlendirmeHesapla(o).flansGerekliKalinlik;
  if (gerekli > o.flansKalinlik) o.flansKalinlik = yukari(gerekli, 2);
  // Temel: önce derinlik (en çok 1,20 m), sonra kare taban
  const temelMi = (ad: string) => TEMEL_ADLARI.includes(ad);
  let tur = 400;
  while (!gecti(o, temelMi) && tur-- > 0) {
    if (o.temelD < 1.2 - 1e-9) o.temelD = Math.round((o.temelD + 0.05) * 100) / 100;
    else {
      o.temelB = Math.round((o.temelB + 0.05) * 100) / 100;
      o.temelL = Math.max(o.temelL, o.temelB);
    }
  }
  return o;
}

/** WAM EurAsia şartnamesindeki (REF 2026ISG0004) asgari değerlerle varsayılan girdi */
export const VARSAYILAN_YON: YonGirdi = {
  ad: "10 modüllü yönlendirme tabelası",
  panelGenislik: 1.0,
  logoYukseklik: 0.3,
  modulYukseklik: 0.15,
  modulAdet: 10,
  zeminBoslugu: 0.5,
  profilB: 80,
  profilT: 3,
  celikFy: 235,
  ruzgarHizi: 180,
  cfPanel: 1.8,
  eksantriklik: true,
  flansKenar: 200,
  flansKalinlik: 10,
  ankrajCap: 16,
  ankrajKenarMesafe: 25,
  ankrajFub: 500,
  temelB: 0.6,
  temelL: 0.6,
  temelD: 0.8,
  zeminTipiId: "kil",
};
