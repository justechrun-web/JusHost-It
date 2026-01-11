
'use server';

import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import { resetIfNewDay } from './resetDailyCaps'
import type { UsageKey } from './costs'

/**
 * Enforces layered budgets (org-feature, department, etc.) before allowing
 * a billable action to proceed. Throws an error if any cap is reached.
 * Atomically reserves the spend if all checks pass.
 *
 * @param orgId - The organization ID.
 * @param departmentId - The user's department ID (optional).
 * @param feature - The specific feature being used.
 * @param cost - The cost of the action in cents.
 */
export async function enforceBudgets({
  orgId,
  departmentId,
  feature,
  cost,
}: {
  orgId: string
  departmentId?: string
  feature: UsageKey
  cost: number // cents
}) {
  const orgRef = adminDb.collection('orgs').doc(orgId)
  const orgSnap = await orgRef.get()
  if (!orgSnap.exists) {
    throw new Error('Organization not found.')
  }
  const org = orgSnap.data()!

  // 1. Reset org-level daily caps if needed
  await resetIfNewDay(orgRef, 'autoTopUp.dayStart', [
    'autoTopUp.spentToday',
    `autoTopUp.featureSpentToday.apiCalls`,
    `autoTopUp.featureSpentToday.aiTokens`,
    `autoTopUp.featureSpentToday.exports`,
  ]);

  // Re-fetch org data after potential reset
  const updatedOrgSnap = await orgRef.get();
  const updatedOrg = updatedOrgSnap.data()!;

  // 2. Check Org-level feature cap
  const orgFeatureLimit = updatedOrg.autoTopUp?.featureDailyCaps?.[feature];
  if (orgFeatureLimit !== undefined && (updatedOrg.autoTopUp?.featureSpentToday?.[feature] ?? 0) + cost > orgFeatureLimit) {
    throw new Error(`Organization daily budget for ${feature} reached.`);
  }

  // 3. Department-level caps (if applicable)
  if (departmentId) {
    const deptRef = adminDb.collection('departments').doc(departmentId);
    
    // Reset department daily caps if needed
    await resetIfNewDay(deptRef, 'dayStart', [
        'spentToday',
        `featureSpentToday.apiCalls`,
        `featureSpentToday.aiTokens`,
        `featureSpentToday.exports`,
    ]);

    // Re-fetch department data after potential reset
    const deptSnap = await deptRef.get();
    if (!deptSnap.exists) {
        throw new Error('Department not found.');
    }
    const dept = deptSnap.data()!;

    // Check department total daily cap
    if (dept.dailyCap !== undefined && (dept.spentToday ?? 0) + cost > dept.dailyCap) {
      throw new Error('Department daily budget reached.');
    }

    // Check department feature-specific cap
    const deptFeatureCap = dept.featureDailyCaps?.[feature];
    if (deptFeatureCap !== undefined && (dept.featureSpentToday?.[feature] ?? 0) + cost > deptFeatureCap) {
      throw new Error(`Department daily budget for ${feature} reached.`);
    }

    // Atomically reserve spend at the department level
    await deptRef.update({
      spentToday: adminDb.FieldValue.increment(cost),
      [`featureSpentToday.${feature}`]: adminDb.FieldValue.increment(cost),
    });
  }

  // 4. Atomically reserve spend at the organization level
  await orgRef.update({
    'autoTopUp.spentToday': adminDb.FieldValue.increment(cost),
    [`autoTopUp.featureSpentToday.${feature}`]: adminDb.FieldValue.increment(cost),
  });
}
