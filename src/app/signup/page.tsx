"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthVisual } from '../login/components/auth-visual';

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


const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

function SignupFormComponent() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: 'onTouched'
  });

  const handleAuthSuccess = async (user: any, displayName?: string | null) => {
     if (displayName && !user.displayName) {
        await updateProfile(user, { displayName });
     }
     const idToken = await user.getIdToken();
     await createSession(idToken);
     
     if (plan) {
        router.push(`/pricing?plan=${plan}`);
     } else {
        router.push('/dashboard');
     }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await handleAuthSuccess(userCredential.user, values.name);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const signupWithProvider = async (providerName: 'google' | 'github') => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    let provider;
    switch (providerName) {
        case 'google': provider = new GoogleAuthProvider(); break;
        case 'github': provider = new OAuthProvider('github.com'); break;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
        <AuthVisual />
        <div className="relative z-10 w-full max-w-lg">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold tracking-wider opacity-90">
                    <span className="text-primary text-2xl">⚡</span>
                    JustHostIt
                </div>
                <h1 className="text-4xl font-light tracking-tight mt-4">We're watching the darkness so you don't have to</h1>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Signup Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium text-foreground/90">Full Name</FormLabel>
                        <FormControl>
                        <Input 
                            placeholder="Your name" 
                            {...field} 
                            className="h-12 text-base bg-white/5 border-white/15 focus:border-primary/50"
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium text-foreground/90">Email</FormLabel>
                        <FormControl>
                        <Input 
                            placeholder="Your email" 
                            {...field} 
                            className="h-12 text-base bg-white/5 border-white/15 focus:border-primary/50"
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium text-foreground/90">Password</FormLabel>
                        <FormControl>
                        <Input 
                            type="password"
                            placeholder="••••••••"
                            {...field} 
                            className="h-12 text-base bg-white/5 border-white/15 focus:border-primary/50"
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="text-xs text-muted-foreground pt-2">
                    By clicking continue, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">Terms of Service</Link> and{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">Privacy Policy</Link>.
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue with Email
                </Button>
            </form>
            </Form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/15" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 text-base bg-white/5 border-white/15 hover:bg-white/10" onClick={() => signupWithProvider('google')}>
                    <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 279.2 88 248 88c-73.2 0-132.3 59.2-132.3 132.3s59.1 132.3 132.3 132.3c76.9 0 111.2-52.8 114.7-81.8h-114.7v-92.7h216.5c1.1 10.4 1.7 21.4 1.7 32.8z"></path>
                    </svg>
                    Google
                </Button>
                 <Button variant="outline" className="h-12 text-base bg-white/5 border-white/15 hover:bg-white/10" onClick={() => signupWithProvider('github')}>
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 18 18">
                        <path d="M9 0C4.025 0 0 4.025 0 9c0 3.975 2.575 7.35 6.15 8.55.45.075.6-.195.6-.435v-1.53c-2.505.54-3.03-1.065-3.03-1.065-.405-1.05-.99-1.32-.99-1.32-.81-.555.06-.54.06-.54.9.06 1.365.915 1.365.915.795 1.365 2.085.975 2.595.75.075-.585.315-.975.57-1.2-1.98-.225-4.065-.99-4.065-4.41 0-.975.345-1.77.915-2.4-.09-.225-.405-1.14.09-2.37 0 0 .75-.24 2.46.915A8.36 8.36 0 019 4.365c.765.015 1.53.105 2.25.3 1.71-1.155 2.46-.915 2.46-.915.495 1.23.18 2.145.09 2.37.57.63.915 1.425.915 2.4 0 3.435-2.085 4.185-4.08 4.395.33.285.615.84.615 1.695v2.52c0 .24.15.525.615.435C15.425 16.35 18 12.975 18 9c0-4.975-4.025-9-9-9z"/>
                    </svg>
                    GitHub
                </Button>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Log In
              </Link>
            </p>
        </div>
      </div>
  );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SignupFormComponent />
        </Suspense>
    );
}
