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
} from "recharts";
import { numFormatter } from "../../../../../helper";

interface BarCompI {
  // shape: { data: Array<{ category: string; subsidi?: number; biaya?: number; pendapatan?: number }> }
  data: BarChartProps;
}

export function Overview({ data }: BarCompI) {
  // amanin null/undefined
  const rows = Array.isArray(data?.data) ? data.data : [];

  // true jika semua seri = 0
  const isEmptyAll = useMemo(
    () =>
      rows.length > 0
        ? rows.every(
            (d: any) =>
              ((d.subsidi ?? 0) + (d.biaya ?? 0) + (d.pendapatan ?? 0)) === 0
          )
        : true,
    [rows]
  );

  // warna batang — abu-abu kalau kosong
  const COLOR_SUBSIDI = isEmptyAll ? "#D1D5DB" : "#3C467B";
  const COLOR_BIAYA = isEmptyAll ? "#E5E7EB" : "#5B8DEF";
  const COLOR_PENDAPATAN = isEmptyAll ? "#9CA3AF" : "#22A06B";

  return (
    <div className="relative"> {/* wrapper utk overlay */}
      <ResponsiveContainer width="100%" height={350} className="overflow-visible">
        <BarChart
          data={rows}
          margin={{ top: 10, right: 20, left: 80, bottom: 20 }}
          barCategoryGap="20%" // jarak antar kategori (bulan/triwulan)
          barGap={4}           // jarak antar bar di dalam kategori
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

          {/* 3 batang per kategori */}
          <Bar
            dataKey="subsidi"
            name="Subsidi Operasional"
            radius={[4, 4, 0, 0]}
            fill={COLOR_SUBSIDI}
            fillOpacity={isEmptyAll ? 0.8 : 1}
          />
          <Bar
            dataKey="biaya"
            name="Biaya"
            radius={[4, 4, 0, 0]}
            fill={COLOR_BIAYA}
            fillOpacity={isEmptyAll ? 0.8 : 1}
          />
          <Bar
            dataKey="pendapatan"
            name="Pendapatan"
            radius={[4, 4, 0, 0]}
            fill={COLOR_PENDAPATAN}
            fillOpacity={isEmptyAll ? 0.9 : 1}
          />
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
