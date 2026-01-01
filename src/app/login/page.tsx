'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardDrive, Loader2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in process was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in using your original method to link your accounts.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'An unexpected error occurred during authentication. Please try again.';
  }
}


export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-splash');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
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
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        const email = err.customData.email;
        const pendingCred = GoogleAuthProvider.credentialFromError(err);
        
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (methods.includes('password')) {
            const password = prompt('You already have an account with this email. Please enter your password to link your Google Account.');
            if (password) {
              const userCred = await signInWithEmailAndPassword(auth, email, password);
              await linkWithCredential(userCred.user, pendingCred!);
              router.push('/');
            } else {
               toast({
                variant: 'destructive',
                title: 'Login Cancelled',
                description: 'Password was not provided. Account linking cancelled.',
              });
            }
          }
        } catch (linkError: any) {
            const friendlyError = mapAuthError(linkError.code);
            setError(friendlyError);
            toast({
                variant: 'destructive',
                title: 'Account Linking Failed',
                description: friendlyError,
            });
        }
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <HardDrive className="h-8 w-8 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline">JusHostIt</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
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
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
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
