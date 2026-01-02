
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
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';

type Metrics = {
  mrr: number;
  activeSubs: number;
  churnRate: number;
};

export function ResourceMetrics() {
  const db = useFirestore();
  const metricsRef = useMemoFirebase(
    () => db ? doc(db, 'metrics', 'current') : null,
    [db]
  );
  const { data: metrics, isLoading } = useDoc<Metrics>(metricsRef);

  const chartData = useMemo(() => {
    // In a real app, this would come from a historical metrics collection
    if (!metrics) return [];
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      data.push({
        date: format(date, 'MMM'),
        mrr: (metrics.mrr * (1 - i * (Math.random() * 0.05 + 0.01))).toFixed(0),
      });
    }
    return data;
  }, [metrics]);


  return (
    <div className='space-y-8'>
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold tracking-tight">Revenue Metrics</h3>
                <p className="text-muted-foreground">
                    Key performance indicators for your SaaS business.
                </p>
            </div>
        </div>
        <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            <div className="col-span-full flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <>
            <Card>
                <CardHeader>
                <CardTitle>Monthly Recurring Revenue (MRR)</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-4xl font-bold">${metrics?.mrr.toLocaleString() || '0'}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-4xl font-bold">{metrics?.activeSubs.toLocaleString() || '0'}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Churn Rate (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-4xl font-bold">{metrics?.churnRate || '0'}%</div>
                </CardContent>
            </Card>
            </>
        )}
        </div>
        <Card className="lg:col-span-3">
            <CardHeader>
            <CardTitle>MRR History (6 months)</CardTitle>
            <CardDescription>
                A chart showing the trend of your monthly recurring revenue.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <AreaChart
                data={chartData}
                margin={{ left: -20, right: 20, top: 5, bottom: 5 }}
                >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis unit="$" />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <Area
                    dataKey="mrr"
                    type="natural"
                    fill="var(--color-primary)"
                    fillOpacity={0.4}
                    stroke="var(--color-primary)"
                />
                </AreaChart>
            </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
