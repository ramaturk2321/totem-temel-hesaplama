"use client";

import type { TemelSonuc } from "@/lib/types";
import { formatKN, formatKNm, formatM3, formatCm, formatSayi } from "@/lib/formatters";

interface Props {
  sonuc: TemelSonuc;
}

export default function ResultPanel({ sonuc }: Props) {
  const guvenlikRenk =
    sonuc.guvenlikKatsayisi >= 1.5
      ? "text-green-400"
      : sonuc.guvenlikKatsayisi >= 1.2
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800">
      <h3 className="text-sm font-bold text-orange-400 uppercase mb-4">
        Hesaplama Sonuçları
      </h3>

      <div className="space-y-3">
        {/* Rüzgar Kuvveti */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Rüzgar Kuvveti</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Panel</span>
              <div className="font-semibold">{formatKN(sonuc.panelRuzgarKuvveti)}</div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Direk</span>
              <div className="font-semibold">{formatKN(sonuc.direktRuzgarKuvveti)}</div>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Toplam</span>
              <div className="font-semibold text-orange-400">
                {formatKN(sonuc.toplamRuzgarKuvveti)}
              </div>
            </div>
          </div>
        </div>

        {/* Devrilme Momenti */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Devrilme Momenti</div>
          <div className="text-lg font-bold">{formatKNm(sonuc.devrilmeMomenti)}</div>
        </div>

        {/* Temel Boyutları */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Temel Boyutları</div>
          <div className="text-lg font-bold text-orange-400">
            {formatCm(sonuc.temelGenislik)} × {formatCm(sonuc.temelUzunluk)} ×{" "}
            {formatCm(sonuc.temelDerinlik)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            (en × boy × derinlik)
          </div>
        </div>

        {/* Beton Hacmi */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <div className="text-xs text-orange-300 mb-1">Beton Hacmi</div>
          <div className="text-2xl font-bold text-orange-400">
            {formatM3(sonuc.betonHacmi)}
          </div>
        </div>

        {/* Demir Donati */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Demir Donatı Önerisi</div>
          <div className="text-sm font-semibold">{sonuc.demirDonati}</div>
        </div>

        {/* Güvenlik Katsayısı */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Güvenlik Katsayısı</div>
          <div className={`text-lg font-bold ${guvenlikRenk}`}>
            {formatSayi(sonuc.guvenlikKatsayisi, 2)}x
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {sonuc.guvenlikKatsayisi >= 1.5
              ? "Güvenli"
              : sonuc.guvenlikKatsayisi >= 1.2
              ? "Sınırda - mühendis onayı alınmalı"
              : "Yetersiz - temel boyutları arttırılmalı"}
          </div>
        </div>
      </div>
    </div>
  );
}
