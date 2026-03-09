"use client";

import { useState, useMemo, useEffect } from "react";
import type { TotemConfig } from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/types";
import { temelBoyutlariHesapla } from "@/lib/calculations";
import TotemForm from "@/components/TotemForm";
import ResultPanel from "@/components/ResultPanel";
import TotemDiagram from "@/components/TotemDiagram";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Disclaimer from "@/components/Disclaimer";

function useIsIframe() {
  const [isIframe, setIsIframe] = useState(false);
  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);
  return isIframe;
}

export default function Home() {
  const [config, setConfig] = useState<TotemConfig>(DEFAULT_CONFIG);
  const isIframe = useIsIframe();

  const sonuc = useMemo(() => temelBoyutlariHesapla(config), [config]);

  // iframe icinde acildiginda parent'a yukseklik bilgisi gonder
  useEffect(() => {
    if (!isIframe) return;
    const sendHeight = () => {
      window.parent.postMessage(
        { type: "totem-resize", height: document.body.scrollHeight },
        "*"
      );
    };
    sendHeight();
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", sendHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sendHeight);
    };
  }, [isIframe]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* HEADER */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
          E
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">
            Totem Tabela Temel Hesaplama
          </h1>
          <p className="text-[10px] text-gray-500">
            Eymen Reklam - Tabela Imalati & UV Baski
          </p>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* SOL: Form */}
        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800 overflow-y-auto max-h-[calc(100vh-120px)]">
          <TotemForm config={config} onChange={setConfig} />
        </div>

        {/* SAG: Diyagram + Sonuclar */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <TotemDiagram config={config} sonuc={sonuc} />
          <ResultPanel sonuc={sonuc} />
          <Disclaimer />
        </div>
      </main>

      {/* WhatsApp - iframe icinde gizle */}
      {!isIframe && <WhatsAppCTA />}
    </div>
  );
}
