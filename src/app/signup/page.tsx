"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HardDrive, Loader2, AlertCircle } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use. Please log in.';
    case 'auth/popup-closed-by-user':
      return 'Sign-up process was cancelled.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    default:
      return 'An unexpected error occurred during signup. Please try again.';
  }
}

async function createSession(idToken: string) {
    const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
        throw new Error("Failed to create session.");
    }
}

function SignupFormComponent() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const handleAuthSuccess = async (user: any) => {
     const idToken = await user.getIdToken();
     await createSession(idToken);
     
     if (plan) {
        router.push(`/pricing?plan=${plan}`);
     } else {
        router.push('/dashboard');
     }
  }

  const signupEmail = async () => {
    if (!auth) return;
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(userCredential.user);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const signupWithProvider = async (provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider) => {
    if (!auth) return;
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    }
  };

  return (
    <div className="mx-auto grid w-[400px] gap-6">
        <div className="grid gap-2 text-center">
            <HardDrive className="h-8 w-8 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline">
                Create an Account
            </h1>
            <p className="text-balance text-muted-foreground">
                Enter your details to get started.
            </p>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Signup Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <Button onClick={signupEmail} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign up with Email"}
            </Button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => signupWithProvider(new GoogleAuthProvider())}>
                Google
            </Button>
            <Button variant="outline" onClick={() => signupWithProvider(new OAuthProvider('apple.com'))}>
                Apple
            </Button>
            <Button variant="outline" onClick={() => signupWithProvider(new FacebookAuthProvider())}>
                Facebook
            </Button>
        </div>
        
        <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
                Sign in
            </Link>
        </div>
    </div>
  );
}

export default function SignupPage() {
    return (
        <div className="w-full flex items-center justify-center min-h-screen">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <SignupFormComponent />
            </Suspense>
        </div>
    );
}
