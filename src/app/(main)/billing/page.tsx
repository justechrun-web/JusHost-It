import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const billingHistory = [
  { invoice: "INV-2024-005", date: "2024-05-01", amount: "$15.00", status: "Paid" },
  { invoice: "INV-2024-004", date: "2024-04-01", amount: "$15.00", status: "Paid" },
  { invoice: "INV-2024-003", date: "2024-03-01", amount: "$15.00", status: "Paid" },
  { invoice: "INV-2024-002", date: "2024-02-01", amount: "$15.00", status: "Paid" },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view your payment history.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-2xl font-semibold">Basic</p>
                <p className="text-muted-foreground">$15 / month</p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground">Manage Subscription</Button>
              <Button variant="outline" className="w-full">Upgrade Plan</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
            <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>A record of your past payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {billingHistory.map((item) => (
                        <TableRow key={item.invoice}>
                        <TableCell className="font-medium">{item.invoice}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={item.status === 'Paid' ? 'success' : 'destructive'}>{item.status}</Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
