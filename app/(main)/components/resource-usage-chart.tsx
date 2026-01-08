"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Loader2 } from 'lucide-react';

type Metric = {
    id: string;
    timestamp: { toDate: () => Date };
    cpu: number;
    memory: number;
}

export function ResourceUsageChart({ orgId, siteId }: { orgId: string, siteId: string }) {
  const db = useFirestore();
  
  const metricsQuery = useMemoFirebase(() => {
    if (!orgId || !siteId) return null;
    return query(
      collection(db, `orgs/${orgId}/sites/${siteId}/metrics`),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db, orgId, siteId]);

  const { data: metrics, isLoading } = useCollection<Metric>(metricsQuery);

  const chartData = useMemo(() => {
    if (!metrics) return [];
    // Recharts expects chronological order (left to right)
    return [...metrics].reverse().map(m => ({
      time: m.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A',
      cpu: m.cpu,
      memory: m.memory
    }));
  }, [metrics]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
            <Tooltip 
              contentStyle={{ 
                  borderRadius: '0.5rem', 
                  border: '1px solid hsl(var(--border))', 
                  background: 'hsl(var(--background))' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="cpu" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorCpu)" 
              strokeWidth={2}
              name="CPU Usage"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
  );
}
