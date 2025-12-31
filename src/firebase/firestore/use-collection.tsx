'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useCollection<T>(path: string) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const collectionRef = collection(db, path);
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}
