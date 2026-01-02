
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

/**
 * A client-side hook to gate access based on authentication status.
 * It primarily checks if a user is logged in. The primary authorization
 * (i.e., checking for an active subscription) is handled by server-side middleware.
 * This hook acts as a secondary check on the client to provide a responsive UI
 * and prevent rendering components for logged-out users.
 */
export function useAuthGate() {
  const { user, isUserLoading } = useUser();
  const [allowed, setAllowed] = useState(false);
  
  useEffect(() => {
    // While the initial user authentication state is loading, we are not "allowed".
    if (isUserLoading) {
      setAllowed(false);
      return;
    }
    
    // Once loading is complete, access is allowed if a user object exists.
    if (user) {
        setAllowed(true);
    } else {
        setAllowed(false);
    }
    
  }, [user, isUserLoading]);

  // The overall loading state is determined by the user loading state.
  return { allowed, loading: isUserLoading };
}
