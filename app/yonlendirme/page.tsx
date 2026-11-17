"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ZEMIN_TIPLERI } from "@/lib/constants";
import {
  yonlendirmeHesapla,
  yonlendirmeOner,
  VARSAYILAN_YON,
  PROFIL_LISTESI,
  CIVATA_ALAN,
} from "@/lib/yonlendirme";
import type { YonGirdi } from "@/lib/yonlendirme";
import { raporHTML, profilAd, flansAd, temelAd } from "@/lib/rapor";
import { formatKN, formatKNm, formatSayi } from "@/lib/formatters";
import Disclaimer from "@/components/Disclaimer";

type SayiAlani = {
  [K in keyof YonGirdi]-?: YonGirdi[K] extends number ? K : never;
}[keyof YonGirdi];

const ALANLAR: { baslik: string; alanlar: [SayiAlani, string, number][] }[] = [
  {
    baslik: "Tabela",
    alanlar: [
      ["panelGenislik", "Panel genişliği (m)", 0.05],
      ["logoYukseklik", "Logo paneli yüksekliği (m)", 0.05],
      ["modulYukseklik", "Modül yüksekliği (m)", 0.01],
      ["modulAdet", "Modül adedi", 1],
      ["zeminBoslugu", "Zeminden boşluk (m)", 0.05],
    ],
  },
  {
    baslik: "Rüzgâr",
    alanlar: [
      ["ruzgarHizi", "Rüzgâr hızı (km/sa)", 10],
      ["cfPanel", "Kuvvet katsayısı c_f", 0.1],
    ],
  },
  {
    baslik: "Flanş ve ankraj",
    alanlar: [
      ["flansKenar", "Flanş kenarı (mm)", 10],
      ["flansKalinlik", "Flanş kalınlığı (mm)", 1],
      ["ankrajKenarMesafe", "Cıvata – kenar mesafesi (mm)", 5],
      ["ankrajFub", "Cıvata dayanımı f_ub (MPa)", 50],
    ],
  },
  {
    baslik: "Temel (direk başına)",
    alanlar: [
      ["temelB", "Rüzgâr yönünde kenar (m)", 0.05],
      ["temelL", "Diğer kenar (m)", 0.05],
      ["temelD", "Derinlik (m)", 0.05],
    ],
  },
];

const girdiSinifi =
  "w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mt-1";

export default function Yonlendirme() {
  const [g, setG] = useState<YonGirdi>(VARSAYILAN_YON);
  const [musteri, setMusteri] = useState("");
  const [adet, setAdet] = useState(1);
  const s = useMemo(() => yonlendirmeHesapla(g), [g]);
  const oneri = useMemo(() => yonlendirmeOner(g), [g]);
  const oneriFarkli = JSON.stringify(oneri) !== JSON.stringify(g);
  const guncelle = (p: Partial<YonGirdi>) => setG({ ...g, ...p });

  const raporAc = () => {
    const html = raporHTML({
      musteri: musteri || "—",
      proje: g.ad,
      referans: "—",
      tarih: new Date().toLocaleDateString("tr-TR"),
      durumlar: [{ girdi: g, adet }],
    });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
          E
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">
            Yönlendirme Tabelası Statik Ön Hesap
          </h1>
          <p className="text-[10px] text-gray-500">
            Çift direkli, flanşlı tabela — rüzgâr, direk, ankraj, temel
          </p>
        </div>
        <Link href="/" className="text-xs text-gray-400 hover:text-orange-300">
          Totem temel hesabı →
        </Link>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800 space-y-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-xs text-gray-400">Tabela tanımı</label>
              <input
                value={g.ad}
                onChange={(e) => guncelle({ ad: e.target.value })}
                className={girdiSinifi}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Müşteri (rapor için)</label>
              <input
                value={musteri}
                onChange={(e) => setMusteri(e.target.value)}
                className={girdiSinifi}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Adet</label>
              <input
                type="number"
                min={1}
                value={adet}
                onChange={(e) => setAdet(parseInt(e.target.value) || 1)}
                className={girdiSinifi}
              />
            </div>
          </div>

          {ALANLAR.map((grup) => (
            <div key={grup.baslik}>
              <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
                {grup.baslik}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {grup.alanlar.map(([alan, etiket, adim]) => (
                  <div key={alan}>
                    <label className="text-xs text-gray-400">{etiket}</label>
                    <input
                      type="number"
                      step={adim}
                      min={0}
                      value={g[alan]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v) && v > 0) guncelle({ [alan]: v });
                      }}
                      className={girdiSinifi}
                    />
                  </div>
                ))}
                {grup.baslik === "Rüzgâr" && (
                  <label className="col-span-2 flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={g.eksantriklik}
                      onChange={(e) => guncelle({ eksantriklik: e.target.checked })}
                    />
                    Yatay eksantriklik uygula (genişliğin ¼&apos;ü, EN 1991-1-4)
                  </label>
                )}
                {grup.baslik === "Flanş ve ankraj" && (
                  <div>
                    <label className="text-xs text-gray-400">Ankraj çapı</label>
                    <select
                      value={g.ankrajCap}
                      onChange={(e) => guncelle({ ankrajCap: parseInt(e.target.value) })}
                      className={girdiSinifi}
                    >
                      {Object.keys(CIVATA_ALAN).map((c) => (
                        <option key={c} value={c}>
                          M{c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {grup.baslik === "Temel (direk başına)" && (
                  <div>
                    <label className="text-xs text-gray-400">Zemin</label>
                    <select
                      value={g.zeminTipiId}
                      onChange={(e) => guncelle({ zeminTipiId: e.target.value })}
                      className={girdiSinifi}
                    >
                      {ZEMIN_TIPLERI.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
              Direk profili
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Kutu profil</label>
                <select
                  value={`${g.profilB}x${g.profilT}`}
                  onChange={(e) => {
                    const [b, t] = e.target.value.split("x").map(Number);
                    guncelle({ profilB: b, profilT: t });
                  }}
                  className={girdiSinifi}
                >
                  {PROFIL_LISTESI.map(([b, t]) => (
                    <option key={`${b}x${t}`} value={`${b}x${t}`}>
                      {b}×{b}×{t} mm
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Akma dayanımı f_y (MPa)</label>
                <select
                  value={g.celikFy}
                  onChange={(e) => guncelle({ celikFy: parseInt(e.target.value) })}
                  className={girdiSinifi}
                >
                  <option value={235}>S235 — 235</option>
                  <option value={275}>S275 — 275</option>
                  <option value={355}>S355 — 355</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-bold text-orange-400 uppercase mb-3">Yükler</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">Hız basıncı</div>
                <div className="font-semibold">{formatSayi(s.q, 0)} Pa</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Toplam rüzgâr kuvveti</div>
                <div className="font-semibold">{formatKN(s.fToplam)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Direk dibi M_Ed</div>
                <div className="font-semibold text-orange-400">{formatKNm(s.mEd)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-orange-400 uppercase">Kontroller</h3>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  s.uygun ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                }`}
              >
                {s.uygun ? "Tümü uygun" : "Yetersiz kontrol var"}
              </span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-700">
                  <th className="py-1.5 font-normal">Kontrol</th>
                  <th className="font-normal">Hesap</th>
                  <th className="font-normal">Sınır</th>
                  <th className="font-normal text-right">Oran</th>
                </tr>
              </thead>
              <tbody>
                {s.kontroller.map((c) => (
                  <tr key={c.ad} className="border-b border-gray-800 align-top">
                    <td className="py-1.5 pr-2">{c.ad}</td>
                    <td className="pr-2 text-gray-300">{c.hesap}</td>
                    <td className="pr-2 text-gray-400">{c.sinir}</td>
                    <td
                      className={`text-right font-bold tabular-nums ${
                        c.uygun ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {Number.isFinite(c.oran) ? formatSayi(c.oran, 2) : "∞"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {oneriFarkli && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="text-xs text-orange-300 mb-1">
                Tüm kontrolleri sağlayan ölçüler
              </div>
              <div className="text-sm font-semibold">
                Profil {profilAd(oneri)} · flanş {flansAd(oneri)} · 4 × M{oneri.ankrajCap} ·
                temel {temelAd(oneri)}
              </div>
              <button
                onClick={() => setG(oneri)}
                className="mt-3 border border-orange-500 text-orange-300 hover:bg-orange-500/10 rounded px-3 py-1.5 text-xs"
              >
                Bu ölçüleri uygula
              </button>
            </div>
          )}

          <button
            onClick={raporAc}
            className="bg-orange-600 hover:bg-orange-500 rounded-lg px-4 py-3 text-sm font-semibold"
          >
            Rapor oluştur (PDF olarak yazdır)
          </button>
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}
