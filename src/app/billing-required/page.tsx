'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function BillingRequiredPage() {
  const auth = useAuth();
  
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Subscription Required</CardTitle>
          <CardDescription>
            Your account does not have an active subscription, your trial has ended, or your payment is past due. Please choose a plan to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/pricing">Choose a Plan</Link>
          </Button>
           <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            If you've just completed payment, it may take a moment to update.
            Try refreshing in a minute.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
