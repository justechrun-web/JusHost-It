'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from './components/login-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';


function LoginPageComponent() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'ai-head-login');

  return (
      <div className="flex items-stretch justify-center min-h-screen bg-background text-foreground">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <LoginForm />
        </div>
         <div className="hidden lg:flex w-1/2 items-center justify-center bg-muted/20 p-8 relative overflow-hidden">
            {loginImage && (
                 <Image
                    src={loginImage.imageUrl}
                    alt={loginImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={loginImage.imageHint}
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
