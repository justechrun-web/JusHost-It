'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Server,
  HardDrive,
  Globe,
  Signal,
  Loader2,
  CheckCircle,
  BookOpen,
  AlertTriangle,
  Folder,
} from 'lucide-react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { ActiveAlerts } from '../components/active-alerts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";

export const dynamic = 'force-dynamic';

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value: string, icon: React.ElementType, loading: boolean }) => (
    <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
         <div className="pt-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
         </div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
)

const pieChartData = [
  { name: 'Module Completed', value: 43, color: 'hsl(var(--primary))' },
  { name: 'Lesson Achieved', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Not Started', value: 32, color: 'hsl(var(--secondary))' },
];

export default function DashboardPage() {
  const { user } = useUser();
  
  const statCards = [
    { title: 'Completed Lessons', value: '42', icon: CheckCircle, loading: false },
    { title: 'Ongoing Modules', value: '23', icon: BookOpen, loading: false },
    { title: 'Pending Assignments', value: '19', icon: AlertTriangle, loading: false },
    { title: 'Total Certificate', value: '24', icon: Folder, loading: false },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Welcome back, {user?.displayName || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress, assignments, and modules for this week.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm"><span>Introduction to UI Design</span><span className='text-muted-foreground'>10m</span></div>
            <div className="flex justify-between items-center text-sm"><span>Introduction Design System</span><span className='text-muted-foreground'>15m</span></div>
            <div className="flex justify-between items-center text-sm"><span>Pre-Quiz</span><span className='text-muted-foreground'>7m</span></div>
            <p className='text-xs text-muted-foreground pt-2'>Task completed in the last 30 days</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm"><span>Finish Framer Template</span><span className='text-muted-foreground'>1.30h</span></div>
            <div className="flex justify-between items-center text-sm"><span>Design UI Design</span><span className='text-muted-foreground'>45m</span></div>
            <div className="flex justify-between items-center text-sm"><span>Pre-Quiz UI Design</span><span className='text-muted-foreground'>45m</span></div>
            <p className='text-xs text-muted-foreground pt-2'>Task completed in the last 30 days</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="relative w-40 h-40">
                 <PieChart width={160} height={160}>
                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2}>
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">43%</span>
                </div>
            </div>
             <div className="ml-4 space-y-2 text-xs">
                {pieChartData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{backgroundColor: item.color}}></div>
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
