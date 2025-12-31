import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const adminData = [
    { user: 'customer@jushostit.com', domain: 'example.com', status: 'Active'},
    { user: 'startup-ceo@gmail.com', domain: 'my-startup.dev', status: 'Active'},
    { user: 'sally@nonprofit.org', domain: 'nonprofit-cares.org', status: 'Inactive'},
    { user: 'dev@portfolio.com', domain: 'dev-portfolio.io', status: 'Active'},
]

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
         <Button variant="outline" size="icon" asChild>
            <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Panel</h1>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminData.map((row) => (
                <TableRow key={row.domain}>
                    <TableCell className="font-medium">{row.user}</TableCell>
                    <TableCell>{row.domain}</TableCell>
                    <TableCell>
                        <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="destructive" size="sm">Suspend</Button>
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
