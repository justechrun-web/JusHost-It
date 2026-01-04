'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is now a redirect to the profile settings page.
export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/profile');
  }, [router]);

  return null;
}
