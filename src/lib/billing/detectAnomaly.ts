
'use server';

import 'server-only';
import { adminDb } from '@/lib/firebase/admin';

type DetectAnomalyParams = {
  orgId: string;
  departmentId?: string;
  cost: number; // in cents
};

type AnomalyResult = {
  type: 'burst' | 'severe';
  message: string;
} | null;

export async function detectAnomaly({
  orgId,
  departmentId,
  cost,
}: DetectAnomalyParams): Promise<AnomalyResult> {
  // Anomaly detection is department-specific if a departmentId is provided
  const targetId = departmentId || orgId;
  const statsRef = adminDb.collection('deptSpendStats').doc(targetId);
  const statsSnap = await statsRef.get();

  if (!statsSnap.exists) {
    // No baseline to compare against yet.
    return null;
  }

  const stats = statsSnap.data();
  const avgHourlySpend = stats?.avgHourlySpend ?? 0;

  // Rule: Burst is 5x the normal hourly spend for that department/org.
  if (avgHourlySpend > 0 && cost > avgHourlySpend * 5) {
    const type = cost > avgHourlySpend * 10 ? 'severe' : 'burst';
    return {
      type,
      message: `Detected a ${type} spend of $${(cost / 100).toFixed(2)}, which is over 5x the hourly average of $${(avgHourlySpend / 100).toFixed(2)}.`,
    };
  }

  return null;
}

    