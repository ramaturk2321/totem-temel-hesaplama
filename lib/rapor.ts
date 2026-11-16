// Çift direkli yönlendirme tabelası ön statik hesap raporu (A4, yazdırılabilir HTML).
// Saf fonksiyon: hem sayfadaki "Rapor" düğmesi hem scripts/rapor-pdf.mjs kullanır.
import {
  yonlendirmeHesapla,
  yonlendirmeOner,
  RHO_HAVA,
  CF_KUTU_PROFIL,
  GAMMA_Q,
  GAMMA_M2,
  GK_MIN,
  SURTUNME,
} from "./yonlendirme.ts";
import type { YonGirdi, YonSonuc } from "./yonlendirme.ts";

export interface RaporDurum {
  girdi: YonGirdi;
  adet: number;
}

export interface RaporBilgi {
  musteri: string;
  proje: string;
  referans: string;
  tarih: string; // GG.AA.YYYY
  durumlar: RaporDurum[];
}

const f = (n: number, d = 2) =>
  Number.isFinite(n)
    ? new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: d }).format(n)
    : "∞";
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cm = (m: number) => f(m * 100, 0);

export const profilAd = (g: YonGirdi) => `${g.profilB}×${g.profilB}×${g.profilT} mm`;
export const temelAd = (g: YonGirdi) => `${cm(g.temelB)}×${cm(g.temelL)}×${cm(g.temelD)} cm`;
export const flansAd = (g: YonGirdi) => `${g.flansKenar}×${g.flansKenar}×${g.flansKalinlik} mm`;

function sema(g: YonGirdi, s: YonSonuc): string {
  // Ön görünüş, 1 cm = 1 birim
  const b = g.profilB / 10;
  const W = g.panelGenislik * 100;
  const H = s.toplamYukseklik * 100;
  const cl = g.zeminBoslugu * 100;
  const tb = g.temelL * 100;
  const td = g.temelD * 100;
  const x0 = 40;
  const y0 = 12;
  const zeminY = y0 + H;
  const xs = [x0, x0 + b + W];
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x0 * 2 + W + 2 * b + 30} ${H + td + 20}" class="sema">`;
  o += `<line x1="0" y1="${zeminY}" x2="${x0 * 2 + W + 2 * b + 30}" y2="${zeminY}" stroke="#555" stroke-width="0.8"/>`;
  for (const x of xs) {
    o += `<rect x="${x + b / 2 - tb / 2}" y="${zeminY}" width="${tb}" height="${td}" fill="#e6e8eb" stroke="#8a9098" stroke-width="0.5" stroke-dasharray="3 2"/>`;
    o += `<rect x="${x}" y="${y0}" width="${b}" height="${H}" fill="#383e42"/>`;
    o += `<rect x="${x + b / 2 - g.flansKenar / 20}" y="${zeminY - 1.5}" width="${g.flansKenar / 10}" height="1.5" fill="#111"/>`;
  }
  o += `<rect x="${x0 + b}" y="${y0}" width="${W}" height="${g.logoYukseklik * 100}" fill="#fff" stroke="#003362" stroke-width="0.6"/>`;
  for (let i = 0; i < g.modulAdet; i++) {
    o += `<rect x="${x0 + b}" y="${y0 + g.logoYukseklik * 100 + i * g.modulYukseklik * 100}" width="${W}" height="${g.modulYukseklik * 100}" fill="#003362" stroke="#fff" stroke-width="0.5"/>`;
  }
  const t = (x: number, y: number, s: string, a = "middle") =>
    `<text x="${x}" y="${y}" font-size="9" text-anchor="${a}" fill="#222">${s}</text>`;
  const xr = x0 + 2 * b + W + 10;
  o += `<line x1="${xr}" y1="${y0}" x2="${xr}" y2="${zeminY}" stroke="#222" stroke-width="0.4"/>`;
  o += t(xr + 3, y0 + H / 2, `${f(H, 0)} cm`, "start");
  o += `<line x1="${x0 - 8}" y1="${zeminY - cl}" x2="${x0 - 8}" y2="${zeminY}" stroke="#222" stroke-width="0.4"/>`;
  o += t(x0 - 11, zeminY - cl / 2 + 2, `${f(cl, 0)}`, "end");
  o += t(x0 + b + W / 2, y0 - 4, `${f(W + 2 * b, 0)} cm`);
    o += `</svg>`;
  return o;
}

function girdiTablosu(g: YonGirdi, s: YonSonuc): string {
  const r = (a: string, b: string) => `<tr><td>${a}</td><td>${b}</td></tr>`;
  return `<table class="kv">
${r("Panel genişliği / toplam genişlik", `${cm(g.panelGenislik)} cm / ${cm(s.toplamGenislik)} cm`)}
${r("Panel yüksekliği", `${cm(s.panelYukseklik)} cm (logo ${cm(g.logoYukseklik)} + ${g.modulAdet} × ${cm(g.modulYukseklik)})`)}
${r("Zeminden boşluk / toplam yükseklik", `${cm(g.zeminBoslugu)} cm / ${cm(s.toplamYukseklik)} cm`)}
${r("Direk", `2 adet kutu profil ${profilAd(g)}, f<sub>y</sub> = ${f(g.celikFy, 0)} MPa`)}
${r("Flanş ve ankraj", `${flansAd(g)}, 4 × M${g.ankrajCap} (f<sub>ub</sub> = ${f(g.ankrajFub, 0)} MPa)`)}
${r("Temel (direk başına)", `${temelAd(g)}, C25/30`)}
${r("Zemin kabulü", `${esc(s.zemin.label)} — σ<sub>em</sub> = ${f(s.zemin.tasimagucu, 0)} kPa, K<sub>p</sub> = ${f(s.zemin.pasifBasincKatsayisi, 1)}`)}
${r("Tahmini tabela ağırlığı", `${f(s.agirlik, 0)} kg`)}
</table>`;
}

function kontrolTablosu(s: YonSonuc): string {
  return `<table class="kontrol"><thead><tr><th>Kontrol</th><th>Hesap</th><th>Sınır</th><th>Oran</th><th>Sonuç</th></tr></thead><tbody>
${s.kontroller
  .map(
    (c) =>
      `<tr class="${c.uygun ? "ok" : "no"}"><td>${esc(c.ad)}</td><td>${esc(c.hesap)}</td><td>${esc(c.sinir)}</td><td>${f(c.oran)}</td><td>${c.uygun ? "Uygun" : "Yetersiz"}</td></tr>`
  )
  .join("\n")}
</tbody></table>`;
}

function yukHesabi(g: YonGirdi, s: YonSonuc): string {
  const zp = g.zeminBoslugu + s.panelYukseklik / 2;
  return `<div class="hesap">
<p>Tepe hız basıncı: q<sub>p</sub> = ½ · ρ · V² = 0,5 · ${f(RHO_HAVA)} · ${f(s.hiz, 1)}² = <b>${f(s.q, 0)} N/m²</b></p>
<p>Referans alan: A = ${f(s.toplamGenislik)} · ${f(s.panelYukseklik)} = ${f(s.refAlan, 3)} m²</p>
<p>Panel kuvveti: F<sub>p</sub> = q<sub>p</sub> · c<sub>f</sub> · A = ${f(s.q, 0)} · ${f(g.cfPanel, 1)} · ${f(s.refAlan, 3)} = <b>${f(s.fPanel / 1000)} kN</b>, etki yüksekliği ${f(zp)} m</p>
<p>Panel altı direk kuvveti: F<sub>d</sub> = q<sub>p</sub> · ${f(CF_KUTU_PROFIL, 1)} · (2 · ${f(g.profilB / 1000, 2)} · ${f(g.zeminBoslugu)}) = ${f(s.fDirek / 1000)} kN</p>
<p>En çok yüklenen direğin payı: ${g.eksantriklik ? `0,5 + 0,25 · ${f(s.toplamGenislik)} / ${f(g.panelGenislik + g.profilB / 1000)}` : "eksantriklik alınmadı"} = <b>${f(s.pay, 3)}</b></p>
<p>Direk dibi momenti: M<sub>k</sub> = ${f(s.mK / 1000)} kN·m → M<sub>Ed</sub> = ${f(GAMMA_Q, 1)} · M<sub>k</sub> = <b>${f(s.mEd / 1000)} kN·m</b>; kesme V<sub>Ed</sub> = ${f(s.vEd / 1000)} kN</p>
<p>Kesit: A = ${f(s.kesitAlan, 0)} mm², I = ${f(s.atalet / 1e4, 1)} cm⁴, W<sub>el</sub> = ${f(s.wEl / 1000, 1)} cm³, W<sub>pl</sub> = ${f(s.wPl / 1000, 1)} cm³, kesit sınıfı ${s.kesitSinifi} → M<sub>Rd</sub> = ${f(s.mRd / 1000)} kN·m</p>
<p>Ankraj: kuvvet kolu z = ${f(s.ankrajKol, 0)} mm → cıvata başına çekme F<sub>t</sub> = M<sub>Ed</sub> / (2 · z) = ${f(s.ankrajCekme / 1000)} kN</p>
<p>Temel tabanında devrilme momenti ${f(s.mDevrilme / 1000)} kN·m, karşı koyan moment ${f(s.mDirenc / 1000)} kN·m (blok ağırlığı ${f(s.temelAgirlik / 1000)} kN + pasif zemin itkisi)</p>
</div>`;
}

function durumBolumu(d: RaporDurum, no: number): string {
  const g = d.girdi;
  const s = yonlendirmeHesapla(g);
  const o = yonlendirmeOner(g);
  const so = yonlendirmeHesapla(o);
  const degisti = JSON.stringify(o) !== JSON.stringify(g);
  return `<section class="sayfa">
<h2>Ek ${no} — ${esc(g.ad)} (${d.adet} adet)</h2>
<div class="iki">
  <figure>${sema(degisti ? o : g, degisti ? so : s)}<figcaption>${degisti ? "Önerilen ölçülerle" : "Şartname ölçüleriyle"}</figcaption></figure>
  <div><h3>Girdiler (şartname asgarisi)</h3>${girdiTablosu(g, s)}</div>
</div>
<h3>Yük ve kesit hesabı</h3>
${yukHesabi(g, s)}
<h3>Kontroller — şartname asgari ölçüleriyle</h3>
${kontrolTablosu(s)}
${
  degisti
    ? `<h3>Kontroller — önerilen ölçülerle</h3>
<p class="oneri">Profil <b>${profilAd(o)}</b> · flanş <b>${flansAd(o)}</b> · ankraj <b>4 × M${o.ankrajCap}</b> · temel <b>${temelAd(o)}</b> (toplam beton ${f(so.betonHacmi, 2)} m³ / tabela)</p>
${kontrolTablosu(so)}`
    : `<p class="oneri">Şartname asgari ölçüleri tüm kontrolleri sağlıyor.</p>`
}
</section>`;
}

export function raporHTML(b: RaporBilgi): string {
  const ozet = b.durumlar.map((d) => {
    const s = yonlendirmeHesapla(d.girdi);
    const o = yonlendirmeOner(d.girdi);
    const so = yonlendirmeHesapla(o);
    return { d, s, o, so };
  });
  const g0 = b.durumlar[0].girdi;
  const z0 = ozet[0].s.zemin;
  const css = `
@page { size: A4; margin: 11mm 13mm 12mm; }
* { box-sizing: border-box; }
body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9pt; color: #1a1d21; margin: 0; line-height: 1.35; }
.sayfa { page-break-after: always; } .sayfa:last-child { page-break-after: auto; }
header.ust { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.2pt solid #e65c00; padding-bottom: 2mm; margin-bottom: 4mm; }
header.ust .firma { font-weight: 700; font-size: 14pt; letter-spacing: .5pt; } header.ust .firma span { color: #e65c00; }
header.ust .sag { text-align: right; font-size: 8.5pt; color: #555; }
h1 { font-size: 16pt; margin: 0 0 1mm; } h2 { font-size: 12.5pt; margin: 0 0 3mm; color: #003362; }
h3 { font-size: 9.5pt; margin: 3mm 0 1mm; color: #003362; }
table { border-collapse: collapse; width: 100%; } td, th { padding: 1mm 1.6mm; border-bottom: .3pt solid #d5d9de; text-align: left; vertical-align: top; }
th { font-size: 8.5pt; color: #555; border-bottom: .8pt solid #888; }
.kv td:first-child { color: #555; width: 42%; }
.kontrol td:nth-child(4), .kontrol td:nth-child(5) { white-space: nowrap; font-variant-numeric: tabular-nums; }
.kontrol tr.ok td:last-child { color: #1a7f37; font-weight: 700; } .kontrol tr.no td:last-child { color: #c62828; font-weight: 700; }
.kontrol tr.no td { background: #fdf1f0; }
.iki { display: grid; grid-template-columns: 44mm 1fr; gap: 6mm; align-items: start; }
.iki figure { margin: 0; text-align: center; font-size: 7.5pt; color: #555; }
.sema { width: 100%; height: auto; max-height: 46mm; }
.hesap p { margin: 0 0 .6mm; font-size: 8.5pt; }
.oneri { background: #f1f5f9; border-left: 2pt solid #003362; padding: 2mm 3mm; margin: 0 0 2mm; }
.uyari { border: .8pt solid #e0a800; background: #fff8e1; padding: 2.5mm 3mm; margin-top: 4mm; font-size: 9pt; }
ul { margin: 1mm 0 0; padding-left: 5mm; } li { margin-bottom: .8mm; }
.imza { margin-top: 4mm; font-size: 8.5pt; color: #555; }
`;
  const ozetSatir = ozet
    .map(
      ({ d, s, o }) =>
        `<tr><td>${esc(d.girdi.ad)}</td><td>${d.adet}</td><td>${cm(s.toplamGenislik)} × ${cm(s.toplamYukseklik)} cm</td><td>${f(s.fToplam / 1000)} kN</td><td>${profilAd(o)}</td><td>${flansAd(o)}<br>4 × M${o.ankrajCap}</td><td>${temelAd(o)}</td></tr>`
    )
    .join("\n");
  const asgariYeter = ozet.every(({ s }) => s.uygun);
  const kapak = `<section class="sayfa">
<h1>Yönlendirme Tabelası Ön Statik Hesap Raporu</h1>
<table class="kv" style="margin: 3mm 0 4mm">
<tr><td>İşveren</td><td>${esc(b.musteri)}</td></tr>
<tr><td>İş</td><td>${esc(b.proje)}</td></tr>
<tr><td>Şartname</td><td>${esc(b.referans)}</td></tr>
<tr><td>Tarih</td><td>${esc(b.tarih)}</td></tr>
</table>
<h3>1. Kapsam</h3>
<p>Çift direkli, modüler panelli dış alan yönlendirme tabelalarının ${f(g0.ruzgarHizi, 0)} km/sa rüzgâr hızında taşıyıcı direk, flanş, ankraj ve beton temel yeterliliği hesaplanmıştır.</p>
<h3>2. Kabuller</h3>
<ul>
<li>Rüzgâr: TS EN 1991-1-4. ${f(g0.ruzgarHizi, 0)} km/sa (${f(g0.ruzgarHizi / 3.6, 1)} m/s) tepe (hamle) hızı olarak alınmış, q<sub>p</sub> = ½ρV², ρ = ${f(RHO_HAVA)} kg/m³.</li>
<li>Tabela levhası kuvvet katsayısı c<sub>f</sub> = ${f(g0.cfPanel, 1)} (madde 7.4.3)${g0.eksantriklik ? "; bileşke kuvvet tabela genişliğinin ¼'ü kadar yatay eksantrik uygulanmış, hesap en çok yüklenen direk için yapılmıştır" : ""}.</li>
<li>Çelik: TS EN 1993-1-1, f<sub>y</sub> = ${f(g0.celikFy, 0)} MPa, γ<sub>M0</sub> = 1,0. Rüzgâr yük katsayısı γ<sub>Q</sub> = ${f(GAMMA_Q, 1)}.</li>
<li>Ankraj: TS EN 1993-1-8, γ<sub>M2</sub> = ${f(GAMMA_M2)}; 4 cıvatanın 2'si çekmede, basınç bileşkesi profilin basınç yüzünde.</li>
<li>Temel: her direk altında ayrı blok, C25/30. Devrilme ve kayma için güvenlik katsayısı en az ${f(GK_MIN, 1)}; pasif zemin itkisi Rankine, taban sürtünmesi μ = ${f(SURTUNME, 1)}.</li>
<li>Zemin: etüt yapılmamıştır; "${esc(z0.label)}" kabul edilmiştir (σ<sub>em</sub> = ${f(z0.tasimagucu, 0)} kPa).</li>
<li>Sehim sınırı toplam yüksekliğin 1/100'ü (karakteristik yükte).</li>
</ul>
<h3>3. Sonuç</h3>
<table><thead><tr><th>Tabela</th><th>Adet</th><th>Genişlik × yükseklik</th><th>Rüzgâr kuvveti</th><th>Direk profili</th><th>Flanş / ankraj</th><th>Temel (direk başına)</th></tr></thead><tbody>
${ozetSatir}
</tbody></table>
<p style="margin-top:3mm">${
    asgariYeter
      ? "Şartnamedeki asgari ölçüler tüm tabelalarda yeterlidir."
      : "Tablodaki ölçüler, şartnamedeki asgari değerlerin yetmediği kontrollerde büyütülmüş, tüm kontrolleri sağlayan ölçülerdir. Ayrıntı izleyen sayfalardadır."
  }</p>
<h3>4. Bu hesabın kapsamadıkları</h3>
<ul>
<li>Ankrajın betona gömme boyu, beton koni kopması ve kenar mesafesi kontrolü</li>
<li>Direk–flanş kaynak dikişi</li>
<li>Panel, modül vidası ve arka kuşak bağlantıları</li>
<li>Deprem, kar ve araç çarpması</li>
<li>Temel donatısı</li>
</ul>
<div class="uyari"><b>Not:</b> Bu belge ön hesaptır. Zemin etüdüne ve yetkili inşaat mühendisinin imzasına dayanan statik projenin yerine geçmez; uygulamadan önce mühendis onayı alınmalıdır.</div>
<p class="imza">Hazırlayan: Eymen Reklam — Pendik / İstanbul</p>
</section>`;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Ön Statik Hesap Raporu — ${esc(b.musteri)}</title><style>${css}</style></head><body>
<header class="ust"><div class="firma">EYMEN <span>REKLAM</span></div><div class="sag">${esc(b.referans)}<br>${esc(b.tarih)}</div></header>
${kapak}
${b.durumlar.map((d, i) => durumBolumu(d, i + 1)).join("\n")}
</body></html>`;
}
