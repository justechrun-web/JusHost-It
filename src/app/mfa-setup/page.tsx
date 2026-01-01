
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MfaSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Additional Security Required</CardTitle>
          <CardDescription>
            As an administrator, you must enable Multi-Factor Authentication
            (MFA) to protect your account and access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Please go to your account settings to enable MFA. This is a mandatory security policy for all administrators.
            </AlertDescription>
          </Alert>
           <Button asChild className='w-full'>
              <Link href="/settings">Go to Settings</Link>
           </Button>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Once enabled, you will be able to access the admin panel.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
