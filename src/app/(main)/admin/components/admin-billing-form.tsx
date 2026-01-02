
'use client';

import { useUser } from '@/firebase';

export function AdminBillingForm({ user, adminId }: { user: any; adminId: string }) {
    
  const currentPlan = user.subscription?.plan || user.role;

  return (
    <form action={`/api/admin/upgrade`} method="POST" className="flex gap-2 items-center">
        <input type="hidden" name="uid" value={user.id} />
        <input type="hidden" name="adminId" value={adminId} />
        <select name="plan" defaultValue={currentPlan} className="border rounded px-2 py-1 text-sm bg-background">
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
        </select>
        <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90">
            Change Plan
        </button>
    </form>
  );
}
