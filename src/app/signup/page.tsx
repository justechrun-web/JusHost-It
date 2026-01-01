
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardDrive, Loader2, AlertCircle } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  linkWithCredential,
  updateProfile,
} from 'firebase/auth';
import { useAuth, useFunctions } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { httpsCallable } from 'firebase/functions';


function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use. Please log in.';
    case 'auth/weak-password':
      return 'The password is too weak. Please choose a stronger password.';
    case 'auth/popup-closed-by-user':
      return 'Sign-up process was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in using your original method to link your accounts.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'An unexpected error occurred during signup. Please try again.';
  }
}

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  plan: z.string({ required_error: "Please select a plan." }),
});


export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const functions = useFunctions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-splash');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      plan: "basic",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);

    // This simulates the full production-grade flow:
    // 1. Create Firebase Auth User
    // 2. Call a Cloud Function to:
    //    a. Create a user document in Firestore
    //    b. Create a customer in Stripe
    //    c. Return a Stripe Checkout URL
    // 3. Redirect user to Stripe Checkout

    try {
      // Step 1: Create Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.fullName });
      
      // Concept for Step 2: Call Cloud Function
      // In a real app, this function would handle backend tasks.
      const initializeUserAndBilling = httpsCallable(functions, 'initializeUserAndBilling');
      
      // const { data } = await initializeUserAndBilling({ 
      //   fullName: values.fullName,
      //   plan: values.plan 
      // });
      // const { checkoutUrl } = data as { checkoutUrl: string };

      // Concept for Step 3: Redirect to Stripe
      // window.location.href = checkoutUrl;
      
      // For this demo, we'll just show a success message and redirect to login.
      await sendEmailVerification(userCredential.user);
      toast({
        title: 'Verification Email Sent',
        description:
          'Please check your inbox to verify your email. The next step would be payment.',
      });
      router.push('/login');

    } catch (err: any) {
      const friendlyError = mapAuthError(err.code);
      setError(friendlyError);
      form.reset();
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
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: 'company.com' });

    try {
      await signInWithPopup(auth, provider);
      // In a real flow, you might redirect to a plan selection page if they are a new user.
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
          title: 'Google Sign-up Failed',
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
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <HardDrive className="h-8 w-8 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline">
              Create an Account
            </h1>
            <p className="text-balance text-muted-foreground">
              Enter your details to get started with JusHostIt.
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Must be at least 6 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hosting Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic Plan ($15/mo)</SelectItem>
                        <SelectItem value="pro">Pro Plan ($30/mo)</SelectItem>
                        <SelectItem value="business">Business Plan ($50/mo)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account & Proceed to Payment
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

    