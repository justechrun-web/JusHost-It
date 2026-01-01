
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function useAuthGate() {
  const { user, isUserLoading } = useUser();
  const { userDoc, loading: isUserDocLoading } = useUserDoc();
  
  const [allowed, setAllowed] = useState(false);
  
  useEffect(() => {
    if (isUserDocLoading || isUserLoading) {
      return;
    }
    
    if (!user) {
        setAllowed(false);
        return;
    }

    if (userDoc) {
      const { subscriptionStatus } = userDoc;
      // Allow access if subscription is active or in trial
      setAllowed(subscriptionStatus === 'active' || subscriptionStatus === 'trialing');
    } else {
      // If there's no user document, they shouldn't have access
      setAllowed(false);
    }
    
  }, [user, userDoc, isUserLoading, isUserDocLoading]);

  return { allowed, loading: isUserLoading || isUserDocLoading };
}

function useUserDoc() {
    const { user } = useUser();
    const db = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(db, 'users', user.uid);
    }, [user, db]);

    const [userDoc, setUserDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userDocRef) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserDoc(snapshot.data());
            } else {
                setUserDoc(null);
            }
            setLoading(false);
        }, () => {
            setUserDoc(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userDocRef]);

    return { userDoc, loading };
}

    
