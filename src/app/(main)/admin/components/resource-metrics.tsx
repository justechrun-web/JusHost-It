'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useCollection } from '@/firebase';
import { format } from 'date-fns';

type SiteMetric = {
  id: string;
  cpu: string;
  memory: string;
  disk: string;
  timestamp: { seconds: number; nanoseconds: number } | string;
};

export function ResourceMetrics() {
  // In a real app, you'd query for a specific site's metrics.
  // For this demo, we'll grab the first metric document we find.
  const { data: metrics, loading } = useCollection<SiteMetric>('site_metrics');

  // Let's create some fake historical data for charting purposes
  const generateChartData = (metric: SiteMetric | undefined) => {
    if (!metric) return [];
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        data.push({
            date: format(date, 'MMM d'),
            cpu: (parseFloat(metric.cpu) * (Math.random() * 0.4 + 0.8)).toFixed(2),
            memory: (parseInt(metric.memory) * (Math.random() * 0.3 + 0.85)).toFixed(0),
        });
    }
    return data;
  }
  
  const metricData = metrics.length > 0 ? metrics[0] : undefined;
  const chartData = generateChartData(metricData);
  const siteId = metricData?.id || "default_site";


  return (
    <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
             <div className="col-span-full flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{siteId}</CardTitle>
                    <CardDescription>Current resource usage</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4">
                    <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">CPU</span>
                        <span className="text-2xl font-bold">{metricData?.cpu || 'N/A'}%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">Memory</span>
                        <span className="text-2xl font-bold">{metricData?.memory || 'N/A'} MB</span>
                    </div>
                     <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">Disk</span>
                        <span className="text-2xl font-bold">{metricData?.disk || 'N/A'} GB</span>
                    </div>
                </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle>Usage History (CPU %)</CardTitle>
                <CardDescription>CPU usage over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={{}} className="h-[200px] w-full">
                    <AreaChart data={chartData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis unit="%" />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area dataKey="cpu" type="natural" fill="var(--color-primary)" fillOpacity={0.4} stroke="var(--color-primary)" />
                    </AreaChart>
                </ChartContainer>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle>Usage History (Memory MB)</CardTitle>
                <CardDescription>Memory usage over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={{}} className="h-[200px] w-full">
                    <AreaChart data={chartData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis unit="MB"/>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area dataKey="memory" type="natural" fill="var(--color-accent)" fillOpacity={0.4} stroke="var(--color-accent)" />
                    </AreaChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </>
        )}
    </div>
  );
}
