'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

type CollectionSource<T> = string | Query<T>;

export function useCollection<T>(source: CollectionSource<T>) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      return;
    }

    let unsubscribe: () => void;

    try {
      const collectionRef =
        typeof source === 'string' ? collection(db, source) : source;

      unsubscribe = onSnapshot(
        collectionRef as Query<DocumentData>,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const result: T[] = [];
          snapshot.forEach((doc) => {
            result.push({ id: doc.id, ...doc.data() } as T);
          });
          setData(result);
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching collection: `, err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (err: any) {
        console.error(`Error setting up collection listener: `, err);
        setError(err);
        setLoading(false);
    }


    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [db, source]);

  return { data, loading, error };
}
