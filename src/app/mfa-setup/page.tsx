import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MfaSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Additional Security Required</CardTitle>
          <CardDescription>
            As an administrator, you must enable Multi-Factor Authentication
            (MFA) to protect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Please enable MFA for your account in your Firebase console or
              through your account settings page. This page is a placeholder to
              enforce the security policy.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Once enabled, you will be able to access the admin panel.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
