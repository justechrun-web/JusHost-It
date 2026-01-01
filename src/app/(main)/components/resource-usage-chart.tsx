
"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "January", bandwidth: 186, storage: 80 },
  { month: "February", bandwidth: 305, storage: 200 },
  { month: "March", bandwidth: 237, storage: 120 },
  { month: "April", bandwidth: 73, storage: 190 },
  { month: "May", bandwidth: 209, storage: 130 },
  { month: "June", bandwidth: 214, storage: 140 },
];

const chartConfig = {
  bandwidth: {
    label: "Bandwidth (GB)",
    color: "hsl(var(--accent))",
  },
  storage: {
    label: "Storage (GB)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ResourceUsageChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="bandwidth" fill="var(--color-bandwidth)" radius={4} />
        <Bar dataKey="storage" fill="var(--color-storage)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
