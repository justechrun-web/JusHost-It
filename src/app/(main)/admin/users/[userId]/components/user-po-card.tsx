
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type PurchaseOrder = {
  id: string;
  poNumber: string;
  maxAmount: number;
  remainingAmount: number;
  status: 'active' | 'depleted' | 'expired';
  createdAt: { seconds: number };
};

export function UserPurchaseOrderCard({ orgId }: { orgId: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [poNumber, setPoNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const poQuery = useMemoFirebase(
    () => (db && orgId ? query(collection(db, 'purchaseOrders'), where('orgId', '==', orgId)) : null),
    [db, orgId]
  );
  const { data: pos, isLoading } = useCollection<PurchaseOrder>(poQuery);

  const handleAddPo = async () => {
    if (!poNumber || !amount) {
        toast({ variant: 'destructive', title: 'Please fill out all fields.'});
        return;
    }
    setIsAdding(true);
    try {
        const poCollection = collection(db, 'purchaseOrders');
        await addDoc(poCollection, {
            orgId,
            poNumber,
            maxAmount: parseInt(amount) * 100, // store in cents
            remainingAmount: parseInt(amount) * 100,
            status: 'active',
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Purchase Order added successfully.'});
        setPoNumber('');
        setAmount('');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error adding PO', description: error.message });
    } finally {
        setIsAdding(false);
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'depleted':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
        <CardDescription>
          Manage enterprise purchase orders for invoiced billing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pos && pos.length > 0 ? pos.map(po => (
                        <TableRow key={po.id}>
                            <TableCell className="font-mono text-xs">{po.poNumber}</TableCell>
                            <TableCell>${(po.maxAmount / 100).toFixed(2)}</TableCell>
                            <TableCell>${(po.remainingAmount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(po.status)}>{po.status}</Badge>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                No purchase orders found for this organization.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 border-t pt-6">
        <h4 className="font-semibold text-sm">Add New Purchase Order</h4>
        <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
                <Label htmlFor="po-number">PO Number</Label>
                <Input id="po-number" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="po-amount">Amount ($)</Label>
                <Input id="po-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-32" />
            </div>
            <Button onClick={handleAddPo} disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Add PO
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

    