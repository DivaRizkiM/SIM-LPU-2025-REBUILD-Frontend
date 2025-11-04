"use client";

import { useMemo } from "react";
import { BarChartProps } from "@/lib/types";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { numFormatter } from "../../../../../helper";

interface BarCompI {
  // shape: { data: Array<{ category: string; subsidi?: number; biaya?: number; pendapatan?: number }> }
  data: BarChartProps;
  selectedView?: "bulan" | "triwulan";
  selectedValue?: string; // bulan = "1"-"12" or triwulan = "1"-"4"
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function Overview({ data, selectedView, selectedValue }: BarCompI) {
  // amanin null/undefined
  const rows = Array.isArray(data?.data) ? data.data : [];

  // true jika semua seri = 0
  const isEmptyAll = useMemo(
    () =>
      rows.length > 0
        ? rows.every(
            (d: any) =>
              (d.subsidi ?? 0) + (d.biaya ?? 0) + (d.pendapatan ?? 0) === 0
          )
        : true,
    [rows]
  );

  // warna batang — abu-abu kalau kosong
  const COLOR_SUBSIDI = isEmptyAll ? "#D1D5DB" : "#3C467B";
  const COLOR_BIAYA = isEmptyAll ? "#E5E7EB" : "#5B8DEF";
  const COLOR_PENDAPATAN = isEmptyAll ? "#9CA3AF" : "#22A06B";

  // warna aktif (kontras)
  const ACTIVE_COLOR_SUBSIDI = "#1f2a5d";
  const ACTIVE_COLOR_BIAYA = "#1e5fe8";
  const ACTIVE_COLOR_PENDAPATAN = "#047857";

  const activeSet = useMemo(() => {
    const set = new Set<number>();
    if (!selectedView || !selectedValue) return set;

    const romanMap: Record<string, number> = {
      i: 1,
      ii: 2,
      iii: 3,
      iv: 4,
    };

    if (selectedView === "bulan") {
      const monthIdx = parseInt(selectedValue, 10) - 1;
      if (monthIdx >= 0 && monthIdx < MONTH_NAMES.length) {
        const target = MONTH_NAMES[monthIdx].toLowerCase();
        rows.forEach((r: any, i: number) => {
          if (
            String(r.category || "")
              .toLowerCase()
              .includes(target)
          )
            set.add(i);
        });
      }
    } else {
      // triwulan: highlight semua bulan dalam triwulan, dan juga kategori bertuliskan
      // "Triwulan X" / "TW X" / "Triwulan I" etc — tapi lakukan exact match pada token hasil ekstraksi
      const t = parseInt(String(selectedValue), 10);
      if (t >= 1 && t <= 4) {
        const start = (t - 1) * 3;
        const triMonths = MONTH_NAMES.slice(start, start + 3).map((m) =>
          m.toLowerCase()
        );

        rows.forEach((r: any, i: number) => {
          const rawCat = String(r.category || "");
          const cat = rawCat.toLowerCase().replace(/\s+/g, " ").trim();

          // match month names (for monthly-chart shaped data)
          const matchesMonth = triMonths.some((m) => cat.includes(m));

          // try extract explicit triwulan number from variations:
          // e.g. "triwulan 2", "triwulan ii", "tw 2", "tw ii", "triwulan-ii", "triwulan: ii"
          let matchesTw = false;
          const triMatch = cat.match(/triwulan[\s\-:]*([ivx]+|\d+)/i);
          const twMatch = cat.match(/\btw[\s\-:]*([ivx]+|\d+)/i);
          const token =
            (triMatch && triMatch[1]) || (twMatch && twMatch[1]) || null;

          if (token) {
            const low = token.toLowerCase();
            let val: number | null = null;
            if (/^\d+$/.test(low)) {
              val = parseInt(low, 10);
            } else if (romanMap[low]) {
              val = romanMap[low];
            }
            if (val === t) matchesTw = true;
          }

          if (matchesMonth || matchesTw) set.add(i);
        });
      }
    }
    return set;
  }, [rows, selectedView, selectedValue]);

  const hasActive = activeSet.size > 0;

  return (
    <div className="relative">
      {/* wrapper utk overlay */}
      <ResponsiveContainer
        width="100%"
        height={350}
        className="overflow-visible"
      >
        <BarChart
          data={rows}
          margin={{ top: 10, right: 20, left: 80, bottom: 20 }}
          barCategoryGap="20%"
          barGap={4}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />

          <XAxis
            dataKey="category"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            width={80}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => {
              if (value === 0) return "Rp. 0";
              const s = value.toString();
              if (s.startsWith("-")) {
                return `- Rp. ${numFormatter(s.replace("-", ""))}`;
              }
              return `Rp. ${numFormatter(value)}`;
            }}
          />

          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(value)
            }
          />

          <Legend wrapperStyle={{ fontSize: 12 }} />

          <Bar
            dataKey="subsidi"
            name="Subsidi Operasional"
            radius={[4, 4, 0, 0]}
            fill={COLOR_SUBSIDI}
            fillOpacity={isEmptyAll ? 0.8 : 1}
          >
            {rows.map((_, i) => (
              <Cell
                key={`subsidi-${i}`}
                fill={activeSet.has(i) ? ACTIVE_COLOR_SUBSIDI : COLOR_SUBSIDI}
                fillOpacity={
                  hasActive
                    ? activeSet.has(i)
                      ? 1
                      : 0.35
                    : isEmptyAll
                    ? 0.8
                    : 1
                }
                stroke={activeSet.has(i) ? "#00000022" : undefined}
                strokeWidth={activeSet.has(i) ? 1 : 0}
              />
            ))}
          </Bar>

          <Bar
            dataKey="biaya"
            name="Biaya"
            radius={[4, 4, 0, 0]}
            fill={COLOR_BIAYA}
            fillOpacity={isEmptyAll ? 0.8 : 1}
          >
            {rows.map((_, i) => (
              <Cell
                key={`biaya-${i}`}
                fill={activeSet.has(i) ? ACTIVE_COLOR_BIAYA : COLOR_BIAYA}
                fillOpacity={
                  hasActive
                    ? activeSet.has(i)
                      ? 1
                      : 0.35
                    : isEmptyAll
                    ? 0.8
                    : 1
                }
                stroke={activeSet.has(i) ? "#00000022" : undefined}
                strokeWidth={activeSet.has(i) ? 1 : 0}
              />
            ))}
          </Bar>

          <Bar
            dataKey="pendapatan"
            name="Pendapatan"
            radius={[4, 4, 0, 0]}
            fill={COLOR_PENDAPATAN}
            fillOpacity={isEmptyAll ? 0.9 : 1}
          >
            {rows.map((_, i) => (
              <Cell
                key={`pendapatan-${i}`}
                fill={
                  activeSet.has(i) ? ACTIVE_COLOR_PENDAPATAN : COLOR_PENDAPATAN
                }
                fillOpacity={
                  hasActive
                    ? activeSet.has(i)
                      ? 1
                      : 0.35
                    : isEmptyAll
                    ? 0.9
                    : 1
                }
                stroke={activeSet.has(i) ? "#00000022" : undefined}
                strokeWidth={activeSet.has(i) ? 1 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Overlay info saat kosong */}
      {isEmptyAll && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="px-3 py-1 rounded-md text-xs text-gray-600 bg-gray-100/90 border border-gray-200 shadow-sm">
            Data kosong untuk filter saat ini
          </div>
        </div>
      )}
    </div>
  );
}
