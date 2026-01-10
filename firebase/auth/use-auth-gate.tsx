'use client';

import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from "firebase/firestore";

type UserProfile = {
    billing?: {
        status: 'active' | 'trialing' | 'past_due' | 'canceled';
    }
}

/**
 * A client-side hook to gate access based on billing status.
 * It checks if the user's Firestore document indicates an active subscription.
 * This is primarily for UI responsiveness; server-side middleware is the source of truth for enforcement.
 */
export function useAuthGate() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const [allowed, setAllowed] = useState(false);
  const isLoading = isAuthLoading || isProfileLoading;
  
  useEffect(() => {
    if (isLoading) {
      setAllowed(false);
      return;
    }
    
    if (user && userProfile) {
        const status = userProfile.billing?.status;
        if (status === 'active' || status === 'trialing') {
            setAllowed(true);
        } else {
            setAllowed(false);
        }
    } else {
        setAllowed(false);
    }
    
  }, [user, userProfile, isLoading]);

  return { allowed, loading: isLoading };
}
