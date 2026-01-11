'use client';

import { Sparkles } from 'lucide-react';

export function AuthVisual() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full bg-slate-900/50 p-10 text-white relative border-r border-border">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>
      
      <div className="relative z-10 flex flex-col items-start max-w-md">
        <div className="mb-6 rounded-full bg-primary/20 p-3 text-primary">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
          AI-Powered Security
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Our new login process uses AI to create a unique visual for you based on the time of day and your recent activity, adding an intuitive layer of security.
        </p>
      </div>

       <div className="absolute bottom-10 left-10 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} JusHostIt. All rights reserved.
        </div>
    </div>
  );
}
