"use client";
import { Label, Pie, PieChart, Cell, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DonutChartProps } from "@/lib/types";

const GRAY = "#D1D5DB";

const chartConfig = {
  visitors: { label: "Realisasi Biaya" },
  "LAYANAN BERBASIS FEE":   { label: "Layanan Berbasis Fee",   color: "#374151" },
  "LAYANAN POS KOMERSIL":   { label: "Layanan Pos Komersil",   color: "#374151" },
  "LAYANAN POS UNIVERSAL":  { label: "Layanan Pos Universal",  color: "#374151" },
} satisfies ChartConfig;

interface PieChartDonutI { data: DonutChartProps; }

export function PieChartDonut({ data }: PieChartDonutI) {
  const isEmpty = (data?.data ?? []).every(d => (d.total ?? d.value ?? 0) === 0);

  // saat kosong: gambar cincin penuh biar visualnya ada, tapi tooltip dipaksa 0%
  const donutData = isEmpty
    ? [{ category: "Tidak ada data", value: 100, fill: GRAY }]
    : data.data;

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] w-full">
      <PieChart>
        {isEmpty ? (
          <Tooltip formatter={() => "0%"} />
        ) : (
          <ChartTooltip cursor content={<ChartTooltipContent className="w-56" unit="%" />} />
        )}

        <Pie data={donutData} dataKey="value" nameKey="category" innerRadius={60}>
          {isEmpty && <Cell fill={GRAY} />}
        </Pie>

        <ChartLegend
          content={<ChartLegendContent nameKey="category" />}
          className="-translate-y-2 text-[10px] text-black dark:text-white flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />

        {isEmpty && <Label value="Data kosong" position="center" />}
      </PieChart>
    </ChartContainer>
  );
}
