import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Server,
  HardDrive,
  Globe,
  Signal,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { RecentSites } from './components/recent-sites';

const statCards = [
  { title: "Active Sites", value: "3", icon: Server },
  { title: "Storage Used", value: "4.2 GB", icon: HardDrive },
  { title: "Bandwidth", value: "120 GB", icon: Globe },
  { title: "Uptime", value: "99.98%", icon: Signal },
];

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a quick overview of your account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              A summary of your bandwidth and storage usage for the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sites</CardTitle>
            <CardDescription>
              A list of your most recently managed sites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSites />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
