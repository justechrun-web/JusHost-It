'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function BillingRequiredPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Subscription Required</CardTitle>
          <CardDescription>
            Your account does not have an active subscription or your trial has ended. Please choose a plan to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/pricing">Choose a Plan</Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            If you've just completed payment, it may take a moment to update.
            Try refreshing in a minute.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
