import { ResourceMetrics } from '../components/resource-metrics';

export default function AdminMetricsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight mb-8">
                Resource Metrics
            </h1>
            <p className="text-muted-foreground mb-4">
                Live and historical data on platform-wide resource consumption.
            </p>
            <ResourceMetrics />
        </div>
    )
}
