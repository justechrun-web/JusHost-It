'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from './components/login-form';
import { AuthVisual } from './components/auth-visual';

function LoginPageComponent() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12 bg-[#1c1f26]">
        <LoginForm />
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <AuthVisual />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageComponent />
    </Suspense>
  );
}
