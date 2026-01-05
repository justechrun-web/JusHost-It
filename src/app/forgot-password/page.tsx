
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HardDrive, Loader2, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with that email address.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);
    setSubmitted(false);
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for a link to reset your password.',
      });
    } catch (err: any) {
      const friendlyError = mapAuthError(err.code);
      setError(friendlyError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: friendlyError,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <HardDrive className="h-8 w-8 mx-auto text-primary" />
          <h1 className="text-3xl font-bold font-headline">
            Forgot Password
          </h1>
          <p className="text-balance text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
        {submitted ? (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 !text-green-600" />
            <AlertTitle className="text-green-800">Email Sent</AlertTitle>
            <AlertDescription className="text-green-700">
              A password reset link has been sent to your email address.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleReset} className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm">
          Remember your password?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
