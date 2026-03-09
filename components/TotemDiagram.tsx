"use client";

import type { TotemConfig, TemelSonuc } from "@/lib/types";

interface Props {
  config: TotemConfig;
  sonuc: TemelSonuc;
}

export default function TotemDiagram({ config, sonuc }: Props) {
  const VW = 500;
  const VH = 550;
  const MARGIN = 40;

  // Fiziksel boyutlar (metre)
  const panelH = config.panelYukseklik;
  const panelW = config.panelGenislik;
  const direkH = config.direkBoyu;
  const temelD = sonuc.temelDerinlik / 100;
  const temelW = sonuc.temelGenislik / 100;
  const boruW = config.boruCapi / 100;

  const toplamYukseklik = temelD + direkH + panelH;

  // Olcekleme: yatay ve dikey ayri, en kucugu sec
  const maxYatay = Math.max(panelW, temelW) + 2;
  const drawH = VH - MARGIN * 2;
  const drawW = VW - MARGIN * 2 - 80; // olcu cizgileri icin pay
  const scale = Math.min(drawH / toplamYukseklik, drawW / maxYatay);

  // Zemin cizgisi Y konumu (temel ustunden)
  const groundY = MARGIN + (panelH + direkH) * scale;
  const centerX = VW / 2 + 20;

  // Panel
  const pW = panelW * scale;
  const pH = panelH * scale;
  const pX = centerX - pW / 2;
  const pY = MARGIN;

  // Direk
  const dW = Math.max(boruW * scale, 6);
  const dH = direkH * scale;
  const dX = centerX - dW / 2;
  const dY = pY + pH;

  // Temel
  const tW = temelW * scale;
  const tH = temelD * scale;
  const tX = centerX - tW / 2;
  const tY = groundY;

  return (
    <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800">
      <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">
        Totem Sematik Gorunum
      </h3>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full max-w-md mx-auto"
        style={{ maxHeight: 450 }}
      >
        {/* Defs */}
        <defs>
          {/* Beton cizgi deseni */}
          <pattern
            id="concrete"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="#4B5563" />
            <circle cx="2" cy="2" r="0.8" fill="#6B7280" />
            <circle cx="6" cy="6" r="0.6" fill="#6B7280" />
          </pattern>
          {/* Ok marker */}
          <marker
            id="arrowR"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L6,2 L0,4" fill="#9CA3AF" />
          </marker>
          <marker
            id="arrowL"
            markerWidth="6"
            markerHeight="4"
            refX="0"
            refY="2"
            orient="auto"
          >
            <path d="M6,0 L0,2 L6,4" fill="#9CA3AF" />
          </marker>
          <marker
            id="arrowD"
            markerWidth="4"
            markerHeight="6"
            refX="2"
            refY="6"
            orient="auto"
          >
            <path d="M0,0 L2,6 L4,0" fill="#9CA3AF" />
          </marker>
          <marker
            id="arrowU"
            markerWidth="4"
            markerHeight="6"
            refX="2"
            refY="0"
            orient="auto"
          >
            <path d="M0,6 L2,0 L4,6" fill="#9CA3AF" />
          </marker>
        </defs>

        {/* Zemin arka plan (yerin alti) */}
        <rect
          x={0}
          y={groundY}
          width={VW}
          height={VH - groundY}
          fill="#1C1917"
          opacity={0.5}
        />

        {/* Zemin cizgisi */}
        <line
          x1={0}
          y1={groundY}
          x2={VW}
          y2={groundY}
          stroke="#2ECC40"
          strokeWidth={2}
          strokeDasharray="8,4"
        />
        <text
          x={VW - 8}
          y={groundY - 6}
          textAnchor="end"
          fill="#2ECC40"
          fontSize={10}
        >
          Zemin
        </text>

        {/* Temel (beton) */}
        <rect
          x={tX}
          y={tY}
          width={tW}
          height={tH}
          fill="url(#concrete)"
          stroke="#6B7280"
          strokeWidth={1.5}
        />
        <text
          x={centerX}
          y={tY + tH / 2 + 4}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize={11}
          fontWeight="bold"
        >
          BETON
        </text>

        {/* Direk (boru) */}
        <rect
          x={dX}
          y={dY}
          width={dW}
          height={dH}
          fill="#374151"
          stroke="#6B7280"
          strokeWidth={1}
        />

        {/* Panel */}
        <rect
          x={pX}
          y={pY}
          width={pW}
          height={pH}
          fill="rgba(255,102,0,0.15)"
          stroke="#FF6600"
          strokeWidth={2}
          rx={3}
        />
        <text
          x={centerX}
          y={pY + pH / 2 - 6}
          textAnchor="middle"
          fill="#FF6600"
          fontSize={12}
          fontWeight="bold"
        >
          TOTEM
        </text>
        <text
          x={centerX}
          y={pY + pH / 2 + 8}
          textAnchor="middle"
          fill="#FF6600"
          fontSize={10}
        >
          PANEL
        </text>

        {/* Ruzgar oku */}
        <g>
          <line
            x1={pX - 50}
            y1={pY + pH / 2}
            x2={pX - 12}
            y2={pY + pH / 2}
            stroke="#60A5FA"
            strokeWidth={2}
            markerEnd="url(#arrowR)"
          />
          {/* Ruzgar dalgalari */}
          <path
            d={`M${pX - 65},${pY + pH / 2 - 8} q5,-4 10,0 q5,4 10,0`}
            fill="none"
            stroke="#60A5FA"
            strokeWidth={1}
            opacity={0.6}
          />
          <path
            d={`M${pX - 65},${pY + pH / 2 + 8} q5,-4 10,0 q5,4 10,0`}
            fill="none"
            stroke="#60A5FA"
            strokeWidth={1}
            opacity={0.6}
          />
          <text
            x={pX - 50}
            y={pY + pH / 2 - 14}
            fill="#60A5FA"
            fontSize={9}
          >
            Ruzgar
          </text>
        </g>

        {/* === OLCU CIZGILERI === */}

        {/* Panel yuksekligi (sol taraf) */}
        {(() => {
          const ox = pX - 25;
          return (
            <g>
              <line
                x1={ox}
                y1={pY}
                x2={ox}
                y2={pY + pH}
                stroke="#9CA3AF"
                strokeWidth={1}
                markerStart="url(#arrowU)"
                markerEnd="url(#arrowD)"
              />
              <text
                x={ox - 4}
                y={pY + pH / 2}
                textAnchor="end"
                fill="#D1D5DB"
                fontSize={9}
              >
                {config.panelYukseklik}m
              </text>
            </g>
          );
        })()}

        {/* Direk boyu (sol taraf) */}
        {(() => {
          const ox = pX - 25;
          return (
            <g>
              <line
                x1={ox}
                y1={dY}
                x2={ox}
                y2={dY + dH}
                stroke="#9CA3AF"
                strokeWidth={1}
                markerStart="url(#arrowU)"
                markerEnd="url(#arrowD)"
              />
              <text
                x={ox - 4}
                y={dY + dH / 2}
                textAnchor="end"
                fill="#D1D5DB"
                fontSize={9}
              >
                {config.direkBoyu}m
              </text>
            </g>
          );
        })()}

        {/* Temel derinligi (sol taraf) */}
        {(() => {
          const ox = tX - 15;
          return (
            <g>
              <line
                x1={ox}
                y1={tY}
                x2={ox}
                y2={tY + tH}
                stroke="#9CA3AF"
                strokeWidth={1}
                markerStart="url(#arrowU)"
                markerEnd="url(#arrowD)"
              />
              <text
                x={ox - 4}
                y={tY + tH / 2}
                textAnchor="end"
                fill="#D1D5DB"
                fontSize={9}
              >
                {sonuc.temelDerinlik}cm
              </text>
            </g>
          );
        })()}

        {/* Panel genisligi (ust) */}
        {(() => {
          const oy = pY - 10;
          return (
            <g>
              <line
                x1={pX}
                y1={oy}
                x2={pX + pW}
                y2={oy}
                stroke="#9CA3AF"
                strokeWidth={1}
                markerStart="url(#arrowL)"
                markerEnd="url(#arrowR)"
              />
              <text
                x={centerX}
                y={oy - 4}
                textAnchor="middle"
                fill="#D1D5DB"
                fontSize={9}
              >
                {config.panelGenislik}m
              </text>
            </g>
          );
        })()}

        {/* Temel genisligi (alt) */}
        {(() => {
          const oy = tY + tH + 15;
          return (
            <g>
              <line
                x1={tX}
                y1={oy}
                x2={tX + tW}
                y2={oy}
                stroke="#9CA3AF"
                strokeWidth={1}
                markerStart="url(#arrowL)"
                markerEnd="url(#arrowR)"
              />
              <text
                x={centerX}
                y={oy + 14}
                textAnchor="middle"
                fill="#D1D5DB"
                fontSize={9}
              >
                {sonuc.temelGenislik}cm × {sonuc.temelUzunluk}cm
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
