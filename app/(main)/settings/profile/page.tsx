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
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { useState } from "react";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


type LoginEvent = {
    id: string;
    ip: string;
    userAgent: string;
    timestamp: { seconds: number };
}

export default function ProfileSettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);


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
  
  const handleProfileSave = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateProfile(user, { displayName });
      toast({ title: "Success", description: "Your profile has been updated." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setIsSavingProfile(false);
    }
  }

  const handlePasswordSave = async () => {
    if (!user || !user.email) return;
    setIsSavingPassword(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      toast({ title: "Success", description: "Your password has been changed. You will be logged out." });
      // signOut(auth) - The user should handle this or we can force it.
      // For now, just notify.
      setCurrentPassword('');
      setNewPassword('');

    } catch (error: any) {
      toast({ variant: 'destructive', title: "Error changing password", description: "Please check your current password and try again." });
    } finally {
      setIsSavingPassword(false);
    }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
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
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleProfileSave} disabled={isSavingProfile}>
              {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you may be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <PasswordStrengthMeter password={newPassword} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePasswordSave} disabled={isSavingPassword || !currentPassword || !newPassword}>
              {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Password
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="md:col-span-1">
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
                                <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{event.userAgent || 'N/A'}</TableCell>
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
