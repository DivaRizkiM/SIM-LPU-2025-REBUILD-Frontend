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

  // tentukan index bar yang active (jika ada)
  const activeIndex = useMemo(() => {
    if (!selectedView || !selectedValue) return -1;
    if (selectedView === "bulan") {
      const monthIdx = parseInt(selectedValue, 10) - 1;
      if (monthIdx >= 0 && monthIdx < MONTH_NAMES.length) {
        const target = MONTH_NAMES[monthIdx].toLowerCase();
        return rows.findIndex((r: any) =>
          String(r.category || "")
            .toLowerCase()
            .includes(target)
        );
      }
    } else {
      // triwulan: cocokkan "Triwulan X" atau "TW X"
      const t = String(selectedValue);
      return rows.findIndex(
        (r: any) =>
          String(r.category || "")
            .toLowerCase()
            .includes(`triwulan ${t}`) ||
          String(r.category || "")
            .toLowerCase()
            .includes(`tw ${t}`) ||
          String(r.category || "")
            .toLowerCase()
            .includes(`tw${t}`)
      );
    }
    return -1;
  }, [rows, selectedView, selectedValue]);

  // jika ada active, buat non-active menjadi pudar agar terlihat kontras
  const hasActive = activeIndex >= 0;

  return (
    <div className="relative">
      {" "}
      {/* wrapper utk overlay */}
      <ResponsiveContainer
        width="100%"
        height={350}
        className="overflow-visible"
      >
        <BarChart
          data={rows}
          margin={{ top: 10, right: 20, left: 80, bottom: 20 }}
          barCategoryGap="20%" // jarak antar kategori (bulan/triwulan)
          barGap={4} // jarak antar bar di dalam kategori
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

          {/* 3 batang per kategori dengan Cell untuk mewarnai per-item */}
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
                fill={i === activeIndex ? ACTIVE_COLOR_SUBSIDI : COLOR_SUBSIDI}
                fillOpacity={
                  hasActive
                    ? i === activeIndex
                      ? 1
                      : 0.35
                    : isEmptyAll
                    ? 0.8
                    : 1
                }
                stroke={i === activeIndex ? "#00000022" : undefined}
                strokeWidth={i === activeIndex ? 1 : 0}
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
                fill={i === activeIndex ? ACTIVE_COLOR_BIAYA : COLOR_BIAYA}
                fillOpacity={
                  hasActive
                    ? i === activeIndex
                      ? 1
                      : 0.35
                    : isEmptyAll
                    ? 0.8
                    : 1
                }
                stroke={i === activeIndex ? "#00000022" : undefined}
                strokeWidth={i === activeIndex ? 1 : 0}
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
                  i === activeIndex ? ACTIVE_COLOR_PENDAPATAN : COLOR_PENDAPATAN
                }
                fillOpacity={
                  hasActive
                    ? i === activeIndex
                      ? 1
                      : 0.35
                    : isEmptyAll
                    ? 0.9
                    : 1
                }
                stroke={i === activeIndex ? "#00000022" : undefined}
                strokeWidth={i === activeIndex ? 1 : 0}
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
