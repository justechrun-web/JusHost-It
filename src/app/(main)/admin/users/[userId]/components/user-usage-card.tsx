
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, MemoryStick, Globe } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { date: 'Apr', usage: 120 },
  { date: 'May', usage: 180 },
  { date: 'Jun', usage: 150 },
  { date: 'Jul', usage: 220 },
  { date: 'Aug', usage: 250 },
  { date: 'Sep', usage: 210 },
];


export function UserUsageCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Live and historical resource consumption for this organization.
            </CardDescription>
          </div>
           <Button variant="outline" size="sm">Force Recalculate</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
            <div className="border rounded-lg p-4">
                <div className="flex justify-center items-center gap-2 text-muted-foreground"><Cpu className="h-4 w-4" /><span>CPU</span></div>
                <p className="text-2xl font-bold mt-2">1,203</p>
                <p className="text-xs text-muted-foreground">seconds</p>
            </div>
             <div className="border rounded-lg p-4">
                <div className="flex justify-center items-center gap-2 text-muted-foreground"><MemoryStick className="h-4 w-4" /><span>Memory</span></div>
                <p className="text-2xl font-bold mt-2">45.2</p>
                <p className="text-xs text-muted-foreground">GB-hours</p>
            </div>
             <div className="border rounded-lg p-4">
                <div className="flex justify-center items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" /><span>Bandwidth</span></div>
                <p className="text-2xl font-bold mt-2">178.4</p>
                <p className="text-xs text-muted-foreground">GB</p>
            </div>
        </div>
         <ChartContainer config={{}} className="h-[200px] w-full">
            <AreaChart
                data={chartData}
                margin={{ left: -20, right: 20, top: 5, bottom: 5 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis unit=" GB" />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <Area
                    dataKey="usage"
                    type="natural"
                    fill="var(--color-primary)"
                    fillOpacity={0.4}
                    stroke="var(--color-primary)"
                    name="Bandwidth"
                />
            </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
