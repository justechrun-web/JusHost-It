
'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';

export function AdminBillingForm({ user, adminId }: { user: any; adminId: string }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      plan: user.plan || 'starter',
    },
  });

  // This is a client component, but the form action targets a server-side route.
  // We use a traditional form element to achieve this.
  return (
    <form action={`/api/admin/upgrade`} method="POST" className="flex gap-2 items-center">
        <input type="hidden" name="uid" value={user.id} />
        <input type="hidden" name="adminId" value={adminId} />

        <Controller
            name="plan"
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                </Select>
            )}
        />
        
        <Button type="submit" size="sm">
            Change Plan
        </Button>
    </form>
  );
}
