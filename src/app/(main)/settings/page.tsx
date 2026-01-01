
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type LoginEvent = {
    id: string;
    ip: string;
    userAgent: string;
    timestamp: { seconds: number };
}

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const loginEventsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
        collection(db, `users/${user.uid}/login_events`), 
        orderBy('timestamp', 'desc'), 
        limit(5)
    );
  }, [user, db]);

  const { data: loginEvents, isLoading: isEventsLoading } = useCollection<LoginEvent>(loginEventsQuery);

  const isLoading = isUserLoading || isEventsLoading;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, security, and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is your public display name and email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={user?.displayName || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password here. After saving, you'll be logged out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Password</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Login History</CardTitle>
            <CardDescription>A record of recent sign-in activity on your account.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Device / Browser</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loginEvents && loginEvents.length > 0 ? (
                        loginEvents.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell>{format(new Date(event.timestamp.seconds * 1000), 'PPP p')}</TableCell>
                                <TableCell className="font-mono text-xs">{event.ip || 'N/A'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{event.userAgent || 'N/A'}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">No login events recorded yet.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    