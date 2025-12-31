import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Globe } from 'lucide-react';

const sites = [
    { domain: "example.com", plan: "Basic" },
    { domain: "my-startup.dev", plan: "Pro" },
    { domain: "nonprofit-cares.org", plan: "Basic" },
];

export function RecentSites() {
  return (
    <div className="space-y-6">
      {sites.map((site) => (
        <div key={site.domain} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted">
                <Globe className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{site.domain}</p>
            <p className="text-sm text-muted-foreground">{site.plan} Plan</p>
          </div>
        </div>
      ))}
    </div>
  );
}
