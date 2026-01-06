'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SupportTicket = {
    id: string;
    subject: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Closed';
    createdAt: { seconds: number };
    lastUpdate: { seconds: number };
}

export default function SupportPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/supportTickets`), orderBy('createdAt', 'desc'));
  }, [user, db]);

  const { data: supportTickets, isLoading: isTicketsLoading } = useCollection<SupportTicket>(ticketsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject || !description) {
        toast({
            variant: 'destructive',
            title: 'Missing information',
            description: 'Please fill out both the subject and description.',
        });
        return;
    }
    setIsSubmitting(true);
    try {
        const ticketsCollection = collection(db, `users/${user.uid}/supportTickets`);
        await addDoc(ticketsCollection, {
            userId: user.uid,
            subject,
            description,
            status: 'Open',
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp(),
        });

        toast({
            title: 'Ticket Submitted',
            description: 'Our team will get back to you shortly.',
        });
        setSubject('');
        setDescription('');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error submitting ticket',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const isLoading = isUserLoading || isTicketsLoading;

  const getStatusBadgeVariant = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open':
        return 'accent';
      case 'In Progress':
        return 'secondary';
      default:
        return 'default';
    }
  };


  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Get help with your account or report an issue.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create a New Ticket</CardTitle>
                <CardDescription>Our team will get back to you shortly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Website is down" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Please describe your issue in detail." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                    <CardDescription>A list of your support requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Last Update</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : supportTickets && supportTickets.length > 0 ? (
                                supportTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                                        <TableCell>
                                          {ticket.lastUpdate ? `${formatDistanceToNow(new Date(ticket.lastUpdate.seconds * 1000))} ago` : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        You have no support tickets.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
