import { AuditLogsTable } from '../components/audit-logs-table';

export default function AdminAuditPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight mb-8">
                Audit Logs
            </h1>
            <p className="text-muted-foreground mb-4">
                A record of all administrative actions performed on the platform.
            </p>
            <AuditLogsTable />
        </div>
    )
}
