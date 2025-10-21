// components/GaugeChart.tsx
import React from "react";
import { GaugeChartProps } from "@/lib/types";

interface GaugeI {
  data: GaugeChartProps & {
    thickness?: number;          // ketebalan arc (px)
    trackColor?: string;         // warna background
    progressColor?: string;      // warna progress
    showLabel?: boolean;         // tampilkan teks di tengah
    label?: string;              // teks bawah (opsional)
    className?: string;
  };
}

const GaugeChart: React.FC<GaugeI> = ({ data }) => {
  const {
    value = 0,
    min = 0,
    max = 100,
    thickness = 12,
    trackColor = "#6E8CFB",      // biru 10% (rgba hex)
    progressColor = "#3C467B",     // biru muda
    showLabel = true,
    className = "",
  } = data;

  const safe = Math.max(min, Math.min(value, max));
  const pct = (safe - min) / (max - min); // 0..1

  // Ukuran SVG (100x100), kita clip jadi setengah atas
  const r = 42; // radius
  const C = 2 * Math.PI * r;
  const halfC = C / 2;
  const dashArray = halfC;
  const dashOffset = halfC - halfC * pct;

  return (
    <div className={`relative w-64 h-32 ${className}`}>
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full block"
        aria-label={`Gauge ${Math.round(pct * 100)}%`}
      >
        {/* tampilkan hanya setengah atas */}
        <defs>
          <clipPath id="half">
            <rect x="0" y="0" width="100" height="50" />
          </clipPath>
        </defs>

        <g clipPath="url(#half)" transform="translate(0,0)">
          {/* Track (background) */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={dashArray + " " + C}
            strokeDashoffset={0}
            transform="rotate(180 50 50)" // mulai dari kiri
          />

          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="transparent"
            stroke={progressColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={dashArray + " " + C}
            strokeDashoffset={dashOffset}
            transform="rotate(180 50 50)"
            style={{
              transition: "stroke-dashoffset 600ms ease-in-out",
            }}
          />
        </g>
      </svg>

      {/* Value + label di tengah */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        {showLabel && (
          <>
            <div className="text-3xl font-semibold tabular-nums">
              {value}%
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;
