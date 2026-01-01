import { UsersTable } from '../components/users-table';

export default function AdminUsersPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight mb-8">
                User Management
            </h1>
            <p className="text-muted-foreground mb-4">
                Promote or demote users to administrators.
            </p>
            <UsersTable />
        </div>
    )
}
