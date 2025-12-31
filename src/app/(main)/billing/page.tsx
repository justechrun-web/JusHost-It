
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

const billingInfo = {
  plan: "Pro",
  status: "active",
  nextInvoice: "2025-01-15",
  amount: "$29.00",
  invoices: [
    { date: "2024-12-15", amount: "$29.00", url: "#" },
    { date: "2024-11-15", amount: "$29.00", url: "#" },
    { date: "2024-10-15", amount: "$29.00", url: "#" },
    { date: "2024-09-15", amount: "$29.00", url: "#" },
  ]
};

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
              <div className="space-y-2">
                 <p className="text-2xl font-semibold capitalize">{billingInfo.plan} Plan</p>
                <div className="flex items-center gap-2">
                    <Badge variant={billingInfo.status === 'active' ? 'success' : 'destructive'} className="capitalize">
                        {billingInfo.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Renews on {billingInfo.nextInvoice}</span>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground">Manage in Stripe Portal</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
            <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>A record of your past payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {billingInfo.invoices.map((invoice, index) => (
                        <TableRow key={index}>
                        <TableCell className="font-medium">{invoice.date}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm" asChild>
                             <a href={invoice.url} target="_blank" rel="noopener noreferrer">View Invoice</a>
                           </Button>
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
