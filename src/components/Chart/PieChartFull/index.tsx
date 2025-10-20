"use client"

import { Cell, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChartProps } from "@/lib/types"

const chartConfig = {
  value: {
    label: "Realisasi Biaya",
  },
  'BIAYA ADMINISTRASI': {
    label: "Biaya Administrasi",
    color: "#1d4ed8",
  },
  'BIAYA OPERASI': {
    label: "Biaya Operasi",
    color: "#6d28d9",
  },
  'BIAYA PEGAWAI': {
    label: "Biaya Pegawai",
    color: "#15803d",
  },
  'BIAYA PEMELIHARAAN': {
    label: "Biaya Pemeliharaan",
    color: "#a16207",
  },
  'BIAYA PENYUSUTAN': {
    label: "Biaya Penyusutan",
    color: "#b91c1c",
  },
  other: {
    label: "Other",
    color: "#1d4ed8",
  },
} satisfies ChartConfig

interface PieChartComponentI {
  data: PieChartProps
}
export function PieChartComponent({data}:PieChartComponentI) {
  const labelFormatter = (value:any) => {
    return (value.category as string).toLowerCase()
};
  return (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  hideLabel 
                  className="w-48"
                  unit="%"
                />
              }
            />
            <Pie 
              data={data.data} 
              dataKey="value" 
              nameKey="category" 
            />
            <ChartLegend
                content={<ChartLegendContent nameKey="category"/>}
                className="-translate-y-2 text-black text-[10px] dark:text-white flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
  )
}
