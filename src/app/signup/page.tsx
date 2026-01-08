"use client";

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '../login/components/login-form';
import { AuthVisual } from '../login/components/auth-visual';

// Re-using the login form component but configured for sign-up
function SignupPageComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AuthVisual />
      <div className="relative z-10 w-full max-w-md">
        {/* The LoginForm component will now handle both login and signup */}
        <LoginForm />
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
