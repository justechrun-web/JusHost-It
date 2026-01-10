'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseClientProvider>
        <FirebaseErrorListener />
        {children}
        <Toaster />
      </FirebaseClientProvider>
    </NextThemesProvider>
  );
}
