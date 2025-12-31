
import { ShieldCheck, Server, Clock, Headset } from 'lucide-react';
import Link from 'next/link';

const slaSections = [
  {
    icon: ShieldCheck,
    title: 'Uptime Commitment: 99.9%',
    content:
      'JusHostIt commits to a 99.9% monthly uptime for all customer-facing services and core platform infrastructure. This availability target applies to our control plane, site hosting environments, and database services.',
  },
  {
    icon: Server,
    title: 'Covered Services',
    content:
      'This SLA applies to the JusHostIt Dashboard, hosted customer websites and applications, and the core provisioning and management APIs. It does not cover scheduled maintenance or downtime caused by customer application code, third-party services not under our direct control, or force majeure events.',
  },
    {
    icon: Clock,
    title: 'Downtime & Service Credits',
    content:
      'Downtime is defined as any period during which the Covered Services are not available. If we fall below our 99.9% uptime commitment in a given month, customers are eligible for service credits as follows: 99.0% to 99.89% uptime: 10% credit. 95.0% to 98.99% uptime: 25% credit. Below 95.0% uptime: 50% credit. Credits are applied to the next billing cycle.',
  },
  {
    icon: Headset,
    title: 'Incident Response & Communication',
    content:
      'We monitor our platform 24/7. In the event of a service-impacting incident, we will provide updates on our public status page. We commit to prompt communication and a postmortem for any significant downtime to ensure continuous improvement.',
  },
];


export default function SlaPage() {
  return (
    <div className="bg-background text-foreground">
       <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                    <span className="font-bold text-lg font-headline">JusHostIt Service Level Agreement</span>
                </Link>
                <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
      </header>
      
      <main className="py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl lg:text-6xl">
                    Built for Reliability
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    We are committed to providing a highly available and reliable platform. This Service Level Agreement (SLA) details our uptime promises and your recourse if we fall short.
                </p>
            </div>

            <div className="mt-20 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    {slaSections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <section.icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-semibold leading-8">{section.title}</h3>
                        </div>
                        <p className="text-base leading-7 text-muted-foreground">{section.content}</p>
                    </div>
                    ))}
                </div>
                 <div className="mt-20 text-center">
                    <p className="text-muted-foreground">For real-time system status, please visit our <a href="#" className="font-medium text-primary hover:underline">Status Page</a>.</p>
                </div>
            </div>
        </div>
      </main>

       <footer className="bg-muted border-t">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} JusTechRun Systems Inc. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  )
}
