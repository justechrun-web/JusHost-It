'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  OAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in process was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in using your original method.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'An unexpected error occurred. Please try again.';
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
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});


export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    },
    mode: 'onTouched'
  });
  
  const handleAuthSuccess = async (user: any) => {
     const idToken = await user.getIdToken();
     await createSession(idToken);
     router.push('/dashboard');
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await handleAuthSuccess(userCredential.user);
    } catch (err: any) {
      const friendlyError = mapAuthError(err.code);
      setError(friendlyError);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: friendlyError,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const signupWithProvider = async (providerName: 'google' | 'apple' | 'facebook') => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    
    let provider;
    switch (providerName) {
        case 'google':
            provider = new GoogleAuthProvider();
            break;
        case 'apple':
            provider = new OAuthProvider('apple.com');
            break;
        case 'facebook':
            provider = new FacebookAuthProvider();
            break;
        default:
            setLoading(false);
            return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      const friendlyError = mapAuthError(err.code);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
        <div className="space-y-4">
            <div className="text-sm font-semibold tracking-wider opacity-70">⚡ JustHostIt</div>
            <h1 className="text-4xl font-light tracking-tight">Log in to your account 👋</h1>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        {...field} 
                        className="h-12 bg-zinc-800/50 border-zinc-700 focus:border-primary"
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
                     <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" passHref className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-12 bg-zinc-800/50 border-zinc-700 focus:border-primary"
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Remember Me
                </label>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Log In
            </Button>
        </form>
        </Form>
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1c1f26] px-2 text-muted-foreground">or</span>
            </div>
        </div>


        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full h-12 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:text-foreground" onClick={() => signupWithProvider('google')}>
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 279.2 88 248 88c-73.2 0-132.3 59.2-132.3 132.3s59.1 132.3 132.3 132.3c76.9 0 111.2-52.8 114.7-81.8h-114.7v-92.7h216.5c1.1 10.4 1.7 21.4 1.7 32.8z"></path>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full h-12 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:text-foreground" onClick={() => signupWithProvider('facebook')}>
             <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.991 22 12Z"></path>
            </svg>
            Facebook
          </Button>
           <Button variant="outline" className="w-full h-12 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:text-foreground" onClick={() => signupWithProvider('apple')}>
             <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.226 1.455C14.072.772 12.753 0 11.291 0c-2.33 0-4.328 1.25-5.522 3.125-.395.62-.647 1.378-.62 2.227.025.86.38 1.637.95 2.296.533.619 1.264 1.01 2.085 1.033.22.004.44-.025.658-.08.647-.17 1.344-.55 2.05-1.127-1.196 1.05-2.07 2.454-2.07 4.098 0 2.62 1.67 4.394 4.037 4.394 1.134 0 2.19-.395 3.013-1.176a.35.35 0 0 1 .15-.07c.07-.03.14-.04.2-.04.07 0 .14.01.2.04.05.03.1.07.15.11a11.17 11.17 0 0 1-1.39 2.03c-.64.84-1.28 1.68-1.28 2.82 0 2.25 1.79 3.32 3.56 3.32 1.74 0 2.76-1.13 3.56-2.22.8-.93 1.2-1.89 1.2-2.85 0-2.05-1.18-3.16-2.58-4.04-.5-.31-1.03-.53-1.6-.66.86-.09 1.8-.46 2.5-1.2.98-1.02 1.5-2.37 1.5-3.8 0-2.3-1.3-3.9-3.3-3.9-1.34 0-2.5.54-3.3 1.34Zm-2.73 6.32c.31-.38.56-.8.75-1.25.13-.3.2-.6.2-.92 0-.6-.31-1.22-.84-1.63-.5-.38-1.07-.6-1.7-.6s-1.2.22-1.7.6c-.53.4-.84 1.02-.84 1.63 0 .32.07.62.2.92.2.45.45.87.75 1.25.32.4.68.65.99.75.31.09.7.09.99-.02.43-.16.85-.46 1.28-.73Z"></path>
            </svg>
            Apple
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up for free
          </Link>
        </p>
    </div>
  )
}
