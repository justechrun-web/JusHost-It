'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginForm } from './components/login-form';
import { AuthVisual } from './components/auth-visual';

function LoginPageComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AuthVisual />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <LoginPageComponent />
    </Suspense>
  );
}
