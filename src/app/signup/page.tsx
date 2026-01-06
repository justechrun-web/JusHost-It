'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
    case 'auth/email-already-in-use':
      return 'This email address is already in use. Please log in.';
    case 'auth/popup-closed-by-user':
      return 'Sign-up process was cancelled.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
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
  email: z.string().email({ message: "Please enter a valid email." }),
});

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Handle email link sign-in on component mount
  useEffect(() => {
    if (!auth) return;
    const email = window.localStorage.getItem('emailForSignIn');
    if (isSignInWithEmailLink(auth, window.location.href) && email) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(async (result) => {
          window.localStorage.removeItem('emailForSignIn');
          const idToken = await result.user.getIdToken();
          await createSession(idToken);
          
          const plan = searchParams.get('plan');
          const priceId = searchParams.get('priceId');
          if (plan && priceId) {
            router.push(`/pricing?plan=${plan}`);
          } else {
            router.push('/dashboard');
          }
        })
        .catch((err) => {
          setError(mapAuthError(err.code));
        });
    }
  }, [auth, router, searchParams]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setLoading(true);
    setError(null);
    const plan = searchParams.get('plan');
    const priceId = searchParams.get('priceId');
    let redirectUrl = `${window.location.origin}/signup`;
    if (plan && priceId) {
        redirectUrl += `?plan=${plan}&priceId=${priceId}`;
    }


    try {
      await sendSignInLinkToEmail(auth, values.email, {
        url: redirectUrl,
        handleCodeInApp: true,
      });
      window.localStorage.setItem('emailForSignIn', values.email);
      
      toast({
        title: 'Check your email',
        description: `A sign-in link has been sent to ${values.email}. Click it to complete your registration.`,
      });
      form.reset();

    } catch (err: any) {
      const friendlyError = err.code ? mapAuthError(err.code) : (err.message || 'An unexpected error occurred.');
      setError(friendlyError);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: friendlyError,
      });
    } finally {
      setLoading(false);
    }
  }

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
      const friendlyError = mapAuthError(err.code);
      setError(friendlyError);
      toast({
        variant: 'destructive',
        title: 'Google Sign-up Failed',
        description: friendlyError,
      });
    } finally {
      setGoogleLoading(false);
    }
  };
  
    return (
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <GraduationCap className="h-8 w-8 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline">
              Create an Account
            </h1>
            <p className="text-balance text-muted-foreground">
              Enter your email to get started with Learnsphere.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
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
              Sign up with Google
            </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </div>
    );
}

function SignupPageComponent() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-splash');

  return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
            <SignupForm />
        </div>
        <div className="hidden bg-muted lg:block relative">
          {loginImage && (
            <Image
              src={loginImage.imageUrl}
              alt={loginImage.description}
              data-ai-hint={loginImage.imageHint}
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>
  );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupPageComponent />
        </Suspense>
    )
}
