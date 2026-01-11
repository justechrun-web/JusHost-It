'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <div className="bg-slate-950 text-white overflow-x-hidden">
            {/* This page will redirect. Content can be minimal or a spinner. */}
        </div>
    );
}
