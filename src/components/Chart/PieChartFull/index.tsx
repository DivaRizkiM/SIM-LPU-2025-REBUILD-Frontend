"use client";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import {
  ChartConfig, ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChartProps } from "@/lib/types";

const GRAY = "#D1D5DB";

const chartConfig = {
  value: { label: "Realisasi Biaya" },
  "BIAYA ADMINISTRASI":  { label: "Biaya Administrasi",  color: "#1d4ed8" },
  "BIAYA OPERASI":       { label: "Biaya Operasi",       color: "#6d28d9" },
  "BIAYA PEGAWAI":       { label: "Biaya Pegawai",       color: "#15803d" },
  "BIAYA PEMELIHARAAN":  { label: "Biaya Pemeliharaan",  color: "#a16207" },
  "BIAYA PENYUSUTAN":    { label: "Biaya Penyusutan",    color: "#b91c1c" },
  other:                 { label: "Other",               color: "#1d4ed8" },
} satisfies ChartConfig;

interface PieChartComponentI { data: PieChartProps; }

export function PieChartComponent({ data }: PieChartComponentI) {
  const isEmpty = (data?.data ?? []).every(d => (d.total ?? d.value ?? 0) === 0);

  const pieData = isEmpty
    ? [{ category: "Tidak ada data", value: 100, fill: GRAY }]
    : data.data;

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] w-full">
      <PieChart>
        {isEmpty ? (
          <Tooltip formatter={() => "0%"} />
        ) : (
          <ChartTooltip content={<ChartTooltipContent hideLabel className="w-48" unit="%" />} />
        )}

        <Pie data={pieData} dataKey="value" nameKey="category">
          {isEmpty && <Cell fill={GRAY} />}
        </Pie>

        <ChartLegend
          content={<ChartLegendContent nameKey="category" />}
          className="-translate-y-2 text-black text-[10px] dark:text-white flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
