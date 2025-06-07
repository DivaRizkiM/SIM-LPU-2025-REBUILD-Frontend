"use client"

import { Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DonutChartProps } from "@/lib/types"

const chartConfig = {
  visitors: {
    label: "Realisasi Biaya",
  },
  'LAYANAN BERBASIS FEE': {
    label: "Layanan Berbasis Fee",
    color: "#374151",
  },
  'LAYANAN POS KOMERSIAL': {
    label: "Layanan Pos Komersial",
    color: "#374151",
  },
  'LAYANAN POS UNIVERSAL': {
    label: "Layanan Pos Universal",
    color: "#374151",
  },
} satisfies ChartConfig


interface PieChartDonutI {
    data: DonutChartProps
}

export function PieChartDonut({data}:PieChartDonutI) {
    const labelFormatter = (value:any) => {
        return (value.category as string).toLowerCase().replace('layanan','')
    };
    return (
            <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] w-full"
            >
            <PieChart>
                <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent className="w-56" unit="%"/>}
                />
                <Pie
                    data={data.data}
                    dataKey="value"
                    nameKey="category"
                    label={labelFormatter}
                    innerRadius={60}
                >
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="category"/>}
                    className="-translate-y-2 text-[10px] text-black dark:text-white flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
                <Label value={'asdasdas'}/>
            </PieChart>
            </ChartContainer>
    )
}
