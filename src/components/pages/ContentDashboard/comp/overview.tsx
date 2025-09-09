"use client"

import { BarChartProps } from "@/lib/types"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { numFormatter } from "../../../../../helper"

interface BarCompI {
  data: BarChartProps
}
export function Overview({ data }:BarCompI) {
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data.data}>
        <XAxis
          dataKey="category"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (!value)return ''
            const valueStr = value.toString()

            if (valueStr.startsWith('-')){
              return `- Rp. ${numFormatter(valueStr.replace('-',''))}`
            }
            return `Rp. ${numFormatter(value)}`
          }}
        />
        <Bar
          dataKey="value"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}