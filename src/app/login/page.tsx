'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HardDrive } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoginForm } from './components/login-form';

function LoginPageComponent() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-splash');

  return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[400px] gap-6">
                <div className="grid gap-2 text-center">
                    <HardDrive className="h-8 w-8 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold font-headline">JusHostIt</h1>
                    <p className="text-balance text-muted-foreground">
                    Enter your email to sign in to your account.
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


export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageComponent />
        </Suspense>
    )
}
