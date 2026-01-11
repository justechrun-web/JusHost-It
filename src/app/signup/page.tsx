"use client";

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '../login/components/login-form';
import { AuthVisual } from '../login/components/auth-visual';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function SignupPageComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 lg:grid lg:grid-cols-2">
       <AuthVisual />
       <div className="relative z-10 flex items-center justify-center lg:h-full">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg">
           <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription>Enter your email to get started with JusHostIt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SignupPageComponent />
        </Suspense>
    );
}
