'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { SignupForm } from './components/login-form';
import { AuthVisual } from './components/auth-visual';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginPageComponent() {

  return (
      <div className="relative flex min-h-screen items-center justify-center p-4 lg:grid lg:grid-cols-2">
        <AuthVisual />
        <div className="relative z-10 flex items-center justify-center lg:h-full">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
                <p className="text-muted-foreground mt-2">Enter your credentials to access your account.</p>
                </div>
                <SignupForm />
                <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>
                </div>
            </div>
        </div>
      </div>
  );
}


export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <LoginPageComponent />
        </Suspense>
    )
}
