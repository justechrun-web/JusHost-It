import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { CreateSiteDialog } from "./components/create-site-dialog";

const sites = [
  { domain: "example.com", status: "Active", plan: "Basic", added: "2023-10-01" },
  { domain: "my-startup.dev", status: "Active", plan: "Pro", added: "2023-09-15" },
  { domain: "nonprofit-cares.org", status: "Inactive", plan: "Basic", added: "2023-08-22" },
  { domain: "dev-portfolio.io", status: "Active", plan: "Pro", added: "2023-07-30" },
];

export default function SitesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline tracking-tight">My Sites</h1>
          <p className="text-muted-foreground">
            Manage your websites, domains, and hosting plans.
          </p>
        </div>
        <CreateSiteDialog />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.domain}>
                <TableCell className="font-medium">{site.domain}</TableCell>
                <TableCell>
                  <Badge variant={site.status === "Active" ? "success" : "secondary"}>{site.status}</Badge>
                </TableCell>
                <TableCell>{site.plan}</TableCell>
                <TableCell>{site.added}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Manage</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
