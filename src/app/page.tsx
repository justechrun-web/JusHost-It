
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Check, ChevronRight, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: Zap,
    title: 'Instant Deployments',
    description: 'Go from Git push to live in seconds. Our automated build and deploy pipeline handles the rest.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-Grade Security',
    description: 'Built with a security-first mindset, including org isolation, audit logs, and SOC 2 readiness.',
  },
  {
    icon: HardDrive,
    title: 'Transparent Usage-Based Pricing',
    description: 'No hidden fees. Pay only for the resources you use, with real-time monitoring and cost forecasting.',
  },
];

const howItWorks = [
    {
        step: 1,
        title: "Connect Your Repository",
        description: "Sign up and connect your GitHub or GitLab account with a single click."
    },
    {
        step: 2,
        title: "Configure Your Site",
        description: "Choose your plan and let our platform provision your containerized environment instantly."
    },
    {
        step: 3,
        title: "Deploy & Scale",
        description: "Push your code and watch it go live. Scale your resources as you grow."
    }
]

export default function LandingPage() {
    const splashImage = PlaceHolderImages.find((img) => img.id === 'login-splash');

  return (
    <div className="bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline">JusHostIt</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/pricing" className="transition-colors hover:text-primary">
            Pricing
          </Link>
          <Link href="/trust" className="transition-colors hover:text-primary">
            Trust Center
          </Link>
           <Link href="/sla" className="transition-colors hover:text-primary">
            SLA
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px]">
          {splashImage && (
             <Image
                src={splashImage.imageUrl}
                alt={splashImage.description}
                data-ai-hint={splashImage.imageHint}
                fill
                className="object-cover object-center"
                priority
             />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              Hosting, Simplified.
            </h1>
            <p className="mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              JusHostIt provides transparent, usage-based hosting with the security and controls enterprises demand.
              Focus on your code, not your infrastructure.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started for Free <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-base font-semibold leading-7 text-primary">The Platform</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for Developers, Ready for Enterprise
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Everything you need to ship fast and scale with confidence.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="bg-muted py-16 sm:py-24 lg:py-32">
            <div className="container mx-auto px-4">
                 <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    From Zero to Deployed in 3 Steps
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Our onboarding flow is designed for speed. Get your site live in under 5 minutes.
                  </p>
                </div>

                <div className="relative mt-16">
                    <div className="absolute left-1/2 top-4 hidden h-full w-px bg-border md:block" />
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        {howItWorks.map((item, index) => (
                            <div key={item.step} className="flex flex-col items-center text-center">
                                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    {item.step}
                                </div>
                                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                                <p className="mt-2 text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 sm:py-24 lg:py-32">
             <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Ready to build your next big thing?
                 </h2>
                 <p className="mt-4 text-lg text-muted-foreground">
                    Start for free. Upgrade when you're ready.
                 </p>
                 <div className="mt-8">
                     <Button size="lg" asChild>
                        <Link href="/signup">
                            Sign Up Now <ChevronRight className="ml-2 h-5 w-5" />
                        </Link>
                     </Button>
                 </div>
             </div>
        </section>
      </main>

      <footer className="border-t bg-muted">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-semibold">JusHostIt</span>
                </div>
                <nav className="mt-4 md:mt-0 flex gap-4 text-sm text-muted-foreground">
                    <Link href="/pricing" className="hover:text-primary">Pricing</Link>
                    <Link href="/trust" className="hover:text-primary">Trust Center</Link>
                    <Link href="/sla" className="hover:text-primary">SLA</Link>
                </nav>
            </div>
            <div className="mt-4 text-center text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} JusTechRun Systems Inc. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
}
