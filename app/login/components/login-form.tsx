'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
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
});


export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: 'onTouched'
  });

  // Handle the email link sign-in on page load
  useEffect(() => {
    if (auth && isSignInWithEmailLink(auth, window.location.href)) {
      let emailFromStorage = window.localStorage.getItem('emailForSignIn');
      if (!emailFromStorage) {
        // This can happen if the user opens the link on a different device.
        // We can ask them for their email again.
        emailFromStorage = window.prompt('Please provide your email for confirmation');
      }
      
      if (emailFromStorage) {
        setLoading(true);
        signInWithEmailLink(auth, emailFromStorage, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            const idToken = await result.user.getIdToken();
            await createSession(idToken);
            router.push('/dashboard');
          })
          .catch((err) => {
            setError(mapAuthError(err.code));
            setLoading(false);
          });
      }
    }
  }, [auth, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      await sendSignInLinkToEmail(auth, values.email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem('emailForSignIn', values.email);
      toast({
        title: 'Check your email',
        description: `A sign-in link has been sent to ${values.email}.`,
      });
      form.reset();
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
  
  const handleGoogleLogin = async () => {
    if (!auth) return;
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await createSession(idToken);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
         const email = err.customData.email;
         if (!email) {
            setError("Could not determine email. Please try signing in with your original method.");
            return;
         }
         const methods = await fetchSignInMethodsForEmail(auth, email);
         const message = `An account already exists with this email using the ${methods[0]} provider. Please sign in with that method.`;
         setError(message);
         toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: message,
        });

      } else {
        const friendlyError = mapAuthError(err.code);
        setError(friendlyError);
        toast({
          variant: 'destructive',
          title: 'Google Login Failed',
          description: friendlyError,
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Email
            </Button>
        </form>
        </Form>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>
        <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        >
        {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
            >
            <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 279.2 88 248 88c-73.2 0-132.3 59.2-132.3 132.3s59.1 132.3 132.3 132.3c76.9 0 111.2-52.8 114.7-81.8h-114.7v-92.7h216.5c1.1 10.4 1.7 21.4 1.7 32.8z"
            ></path>
            </svg>
        )}
        Sign in with Google
        </Button>
    </>
  )
}