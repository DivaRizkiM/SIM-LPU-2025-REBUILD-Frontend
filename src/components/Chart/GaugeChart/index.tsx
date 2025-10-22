import React from "react";
import { GaugeChartProps } from "@/lib/types";

interface GaugeI {
  data: GaugeChartProps & {
    thickness?: number;
    trackColor?: string;
    progressColor?: string;
    showLabel?: boolean;
    className?: string;
    emptyText?: string;      
  };
}

const GaugeChart: React.FC<GaugeI> = ({ data }) => {
  const {
    value = 0,
    min = 0,
    max = 100,
    thickness = 12,
    trackColor = "#E5E7EB",   // default track abu-abu
    progressColor = "#3C467B",
    showLabel = true,
    className = "",
    emptyText = "Data kosong",
  } = data;

  const safe = Math.max(min, Math.min(value, max));
  const pct = (safe - min) / (max - min); // 0..1
  const isEmpty = safe === 0;

  // warna saat kosong
  const _track = isEmpty ? "#E5E7EB" : trackColor;
  const _progress = isEmpty ? "#9CA3AF" : progressColor;

  const r = 42, C = 2 * Math.PI * r, halfC = C / 2;
  const dashArray = halfC;
  const dashOffset = halfC - halfC * pct;

  return (
    <div className={`relative w-64 h-32 ${className}`}>
      <svg viewBox="0 0 100 60" className="w-full h-full block" aria-label={`Gauge ${Math.round(pct*100)}%`}>
        <defs><clipPath id="half"><rect x="0" y="0" width="100" height="50" /></clipPath></defs>
        <g clipPath="url(#half)">
          <circle cx="50" cy="50" r={r} fill="transparent"
            stroke={_track} strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={dashArray + " " + C} transform="rotate(180 50 50)"/>
          <circle cx="50" cy="50" r={r} fill="transparent"
            stroke={_progress} strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={dashArray + " " + C} strokeDashoffset={dashOffset}
            transform="rotate(180 50 50)" style={{transition:"stroke-dashoffset 600ms ease-in-out"}}/>
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        {showLabel && (
          <>
            <div className={`text-3xl font-semibold tabular-nums ${isEmpty ? "text-gray-400" : ""}`}>
              {Math.round(safe)}%
            </div>
            {isEmpty && <div className="text-xs text-gray-400 mt-1">{emptyText}</div>}
          </>
        )}
      </div>
    </div>
  );
};
export default GaugeChart;
