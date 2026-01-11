'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type UserAlert = {
  id: string;
  alerts: string[];
  acknowledged: boolean;
  createdAt: { seconds: number };
};

export function ActiveAlerts() {
  const { user } = useUser();
  const db = useFirestore();

  const alertsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, `users/${user.uid}/alerts`));
  }, [user, db]);

  const { data: alerts, isLoading } = useCollection<UserAlert>(alertsQuery);

  const activeAlert = alerts?.find(alert => !alert.acknowledged);

  const handleAcknowledge = () => {
    // In a real app, this would call a Cloud Function to update the alert's 'acknowledged' status.
    console.log("Acknowledging alert:", activeAlert?.id);
  };
  
  if (isLoading || !activeAlert) {
    return null;
  }

  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
      <AlertTriangle className="h-4 w-4 !text-destructive" />
      <AlertTitle>Action Required: Usage Warning</AlertTitle>
      <AlertDescription>
        <div className="flex justify-between items-center">
            <div>
            {activeAlert.alerts.map((alertMsg, index) => (
                <p key={index}>{alertMsg}</p>
            ))}
            <p className="text-xs mt-1">
                Your services may be throttled or suspended if action is not taken. 
                Please review your usage or upgrade your plan.
            </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAcknowledge}>
                Acknowledge
            </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
