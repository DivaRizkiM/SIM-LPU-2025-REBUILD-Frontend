"use client";

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
  data: BarChartProps; // pastikan shape: { data: Array<{category, subsidi, biaya, pendapatan}> }
}

export function Overview({ data }: BarCompI) {
  return (
    <ResponsiveContainer width="100%" height={350} className="overflow-visible">
      <BarChart
        data={data.data}
        margin={{ top: 10, right: 20, left: 80, bottom: 20 }}
        barCategoryGap="20%"   // jarak antar kategori (bulan)
        barGap={4}             // jarak antar bar di dalam kategori
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

        {/* 3 batang per bulan */}
        <Bar dataKey="subsidi" name="Subsidi Operasional" radius={[4, 4, 0, 0]} fill="#3C467B" />
        <Bar dataKey="biaya" name="Biaya" radius={[4, 4, 0, 0]} fill="#5B8DEF" />
        <Bar dataKey="pendapatan" name="Pendapatan" radius={[4, 4, 0, 0]} fill="#22A06B" />
      </BarChart>
    </ResponsiveContainer>
  );
}
