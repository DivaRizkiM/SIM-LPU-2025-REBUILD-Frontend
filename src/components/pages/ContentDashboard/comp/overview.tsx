"use client";

import { BarChartProps } from "@/lib/types";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { numFormatter } from "../../../../../helper";

interface BarCompI {
  data: BarChartProps;
}

export function Overview({ data }: BarCompI) {
  return (
    <ResponsiveContainer width="100%" height={350} className="overflow-visible">
      <BarChart
        data={data.data}
        margin={{
          top: 10,
          right: 20,
          left: 80,
          bottom: 20,
        }}
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
          width={70} // 👈 pastikan ada ruang cukup untuk angka besar
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (!value) return "";
            const valueStr = value.toString();
            if (valueStr.startsWith("-")) {
              return `- Rp. ${numFormatter(valueStr.replace("-", ""))}`;
            }
            return `Rp. ${numFormatter(value)}`;
          }}
        />

        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(value)
          }
        />

        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          style={{ fill: "#FB8500" }} // inline style > CSS
          fillOpacity={0.9}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
