import { SitesTable } from '../components/sites-table';

export default function AdminSitesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight mb-8">
                Site Management
            </h1>
            <p className="text-muted-foreground mb-4">
                View and manage all customer sites on the platform.
            </p>
            <SitesTable />
        </div>
    )
}
