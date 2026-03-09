"use client";

import type { TotemConfig } from "@/lib/types";
import {
  PANEL_ONAYARLARI,
  DIREK_BOYLARI,
  BORU_SECENEKLERI,
  RUZGAR_BOLGELERI,
  ZEMIN_TIPLERI,
  DIREK_BORU_ESLEME,
} from "@/lib/constants";

interface Props {
  config: TotemConfig;
  onChange: (c: TotemConfig) => void;
}

export default function TotemForm({ config, onChange }: Props) {
  const update = (partial: Partial<TotemConfig>) =>
    onChange({ ...config, ...partial });

  const updateDirekBoyu = (boy: number) => {
    const esleme = DIREK_BORU_ESLEME[boy];
    if (esleme) {
      onChange({ ...config, direkBoyu: boy, boruCapi: esleme });
    } else {
      onChange({ ...config, direkBoyu: boy });
    }
  };

  const selectedBtn =
    "border-orange-500 bg-orange-500/10 text-orange-300";
  const normalBtn =
    "border-gray-700 bg-gray-800 hover:border-gray-500 text-gray-300";

  return (
    <div className="space-y-6">
      {/* PANEL BOYUTU */}
      <div>
        <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
          Panel Boyutu
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PANEL_ONAYARLARI.map((p) => {
            const isSelected =
              config.panelGenislik === p.genislik &&
              config.panelYukseklik === p.yukseklik;
            return (
              <button
                key={p.label}
                onClick={() =>
                  update({
                    panelGenislik: p.genislik,
                    panelYukseklik: p.yukseklik,
                  })
                }
                className={`border rounded px-2 py-1.5 text-xs transition-colors ${
                  isSelected ? selectedBtn : normalBtn
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-400">Genislik (m)</label>
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.1}
              value={config.panelGenislik}
              onChange={(e) =>
                update({ panelGenislik: parseFloat(e.target.value) || 0.5 })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400">Yukseklik (m)</label>
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.1}
              value={config.panelYukseklik}
              onChange={(e) =>
                update({ panelYukseklik: parseFloat(e.target.value) || 0.5 })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mt-1"
            />
          </div>
        </div>
      </div>

      {/* DIREK BOYU */}
      <div>
        <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
          Direk Boyu
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {DIREK_BOYLARI.map((boy) => (
            <button
              key={boy}
              onClick={() => updateDirekBoyu(boy)}
              className={`border rounded px-3 py-1.5 text-xs transition-colors ${
                config.direkBoyu === boy ? selectedBtn : normalBtn
              }`}
            >
              {boy} m
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-gray-400">Ozel Deger (m)</label>
          <input
            type="number"
            min={1}
            max={20}
            step={0.5}
            value={config.direkBoyu}
            onChange={(e) =>
              updateDirekBoyu(parseFloat(e.target.value) || 3)
            }
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mt-1"
          />
        </div>
      </div>

      {/* BORU CAPI */}
      <div>
        <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
          Boru Capi
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {BORU_SECENEKLERI.map((b) => (
            <button
              key={b.capCm}
              onClick={() => update({ boruCapi: b.capCm })}
              className={`border rounded px-2 py-1.5 text-xs transition-colors ${
                config.boruCapi === b.capCm ? selectedBtn : normalBtn
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* RUZGAR HIZI */}
      <div>
        <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
          Ruzgar Hizi
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {RUZGAR_BOLGELERI.map((r) => (
            <button
              key={r.id}
              onClick={() => update({ ruzgarHizi: r.hiz })}
              className={`border rounded px-2 py-1.5 text-xs transition-colors ${
                config.ruzgarHizi === r.hiz ? selectedBtn : normalBtn
              }`}
            >
              {r.label} ({r.hiz} km/h)
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-gray-400">
            Ozel Deger (km/h)
          </label>
          <input
            type="number"
            min={30}
            max={200}
            step={5}
            value={config.ruzgarHizi}
            onChange={(e) =>
              update({ ruzgarHizi: parseFloat(e.target.value) || 50 })
            }
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mt-1"
          />
        </div>
      </div>

      {/* ZEMIN TIPI */}
      <div>
        <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
          Zemin Tipi
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ZEMIN_TIPLERI.map((z) => (
            <button
              key={z.id}
              onClick={() => update({ zeminTipiId: z.id })}
              className={`border rounded px-2 py-2 text-left transition-colors ${
                config.zeminTipiId === z.id ? selectedBtn : normalBtn
              }`}
            >
              <span className="text-xs font-semibold block">{z.label}</span>
              <span className="text-[10px] text-gray-500">{z.aciklama}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
