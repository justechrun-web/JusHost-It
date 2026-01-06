// app/login/page.tsx
'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { HardDrive } from 'lucide-react';
import { LoginForm } from './components/login-form';

function LoginPageComponent() {

  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="mx-auto grid w-[400px] gap-6">
            <div className="grid gap-2 text-center">
                <HardDrive className="h-8 w-8 mx-auto text-primary" />
                <h1 className="text-3xl font-bold font-headline">
                    Sign in to JusHostIt
                </h1>
                <p className="text-balance text-muted-foreground">
                Enter your email below to sign in to your account.
                </p>
            </div>
            
            <LoginForm />

            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                Sign up
                </Link>
            </div>
        </div>
      </div>
  );
}


export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageComponent />
        </Suspense>
    )
}
