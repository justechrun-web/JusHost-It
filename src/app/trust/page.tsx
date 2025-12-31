
import { ShieldCheck, Database, Lock, CreditCard, GanttChartSquare, Users } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    name: 'Security-First Architecture',
    description: 'JusHostIt is built with a security-first architecture designed to protect customer applications, data, and operations from the ground up.',
    icon: ShieldCheck,
  },
  {
    name: 'Platform Security',
    description: 'We leverage Firebase Authentication with mandatory MFA for administrators, strong role-based access control (RBAC), and server-side authorization for all sensitive actions. All privileged activities are recorded in immutable audit logs.',
    icon: Lock,
  },
  {
    name: 'Infrastructure Security',
    description: 'Our platform is built on cloud-native services, ensuring high availability and scalability. All customer data is encrypted at rest and in transit using industry-standard protocols. Workloads are containerized for strict isolation.',
    icon: Database,
  },
  {
    name: 'Billing & Payments',
    description: 'All payment processing is handled by Stripe, a PCI DSS Level 1 certified provider. We do not store or process any cardholder data on our systems, completely removing PCI compliance scope from our platform.',
    icon: CreditCard,
  },
  {
    name: 'Compliance Readiness',
    description: 'JusHostIt is designed to meet the rigorous standards of SOC 2. Our controls for security, availability, and processing integrity are continuously monitored and prepared for third-party audits.',
    icon: GanttChartSquare,
  },
  {
    name: 'Shared Responsibility Model',
    description: 'We follow a clear shared responsibility model. JusHostIt secures the underlying platform, infrastructure, and authentication systems, while customers are responsible for the security of their own application code and content.',
    icon: Users,
  },
]

export default function TrustCenterPage() {
  return (
    <div className="bg-background text-foreground">
       <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                    <span className="font-bold text-lg font-headline">JusHostIt Trust Center</span>
                </Link>
                <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
      </header>
      
      <main className="py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl lg:text-6xl">
                    Security You Can Trust
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    At JusHostIt, we are committed to the highest standards of security, compliance, and transparency. Our platform is built on a foundation of trust to protect your data and applications.
                </p>
            </div>

            <div className="mt-20 max-w-lg sm:mx-auto md:max-w-none">
                <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16 lg:grid-cols-3">
                    {features.map((feature) => (
                    <div key={feature.name} className="flex flex-col gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold leading-8">{feature.name}</h3>
                            <p className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                    ))}
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
