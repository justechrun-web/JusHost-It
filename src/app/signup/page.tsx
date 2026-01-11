'use client';

import React, { Suspense } from 'react';
import { Loader2, Circle } from 'lucide-react';
import { SignupForm } from '../login/components/login-form';
import Link from 'next/link';

function SignupPageComponent() {
  const steps = [
    { number: 1, text: 'Sign up your account', active: true },
    { number: 2, text: 'Set up your workspace', active: false },
    { number: 3, text: 'Set up your profile', active: false },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center h-full bg-black p-10 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-black"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="relative z-10 flex flex-col items-start max-w-md w-full">
            <div className="flex items-center gap-2 mb-6">
                <Circle className="w-6 h-6 text-white fill-white" />
                <span className="text-xl font-bold">JusHostIt</span>
            </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white mb-4">
            Get Started with Us
          </h1>
          <p className="mt-2 text-lg text-slate-300 mb-8">
            Complete these easy steps to register your account.
          </p>

          <div className="space-y-4 w-full">
            {steps.map(step => (
                <div key={step.number} className={`p-4 rounded-lg border ${step.active ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step.active ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                            {step.number}
                        </div>
                        <span className="font-medium">{step.text}</span>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center lg:h-full w-full">
        <div className="w-full max-w-md space-y-6">
           <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Sign Up Account</h1>
            <p className="text-muted-foreground mt-2">Enter your personal data to create your account.</p>
          </div>
            <SignupForm />
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Log In
              </Link>
            </div>
        </div>
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
