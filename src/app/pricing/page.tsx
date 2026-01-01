'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, HardDrive, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const tiers = [
  {
    name: 'Starter',
    id: 'starter',
    price: '$15',
    priceSuffix: '/ month',
    description: 'For personal projects and small sites.',
    features: [
      '1 Active Site',
      'Soft usage caps',
      'Community support',
      'Overage allowed'
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    id: 'pro',
    price: '$30',
    priceSuffix: '/ month',
    description: 'For growing businesses and professional developers.',
    features: [
      '5 Active Sites',
      'Higher usage quotas',
      'Usage alerts',
      'Priority email support'
    ],
    cta: 'Choose Pro',
    featured: true
  },
  {
    name: 'Business',
    id: 'business',
    price: '$50',
    priceSuffix: '/ month',
    description: 'For teams and applications with high-traffic.',
    features: [
      'Unlimited Sites',
      'Custom usage limits',
      'SSO (SAML/SCIM) ready',
      'Invoice billing'
    ],
    cta: 'Contact Sales',
    href: '/sales'
  }
];


export default function PricingPage() {
    const { user, isUserLoading } = useUser();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const { toast } = useToast();

    async function handleSelect(planId: string) {
        setLoadingPlan(planId);
        
        if (!user) {
            toast({
                title: 'Please sign in',
                description: 'You need to be signed in to select a plan.',
                variant: 'destructive',
            });
            window.location.href = `/login?redirect=/pricing`;
            return;
        }

        try {
            const idToken = await user.getIdToken();

            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId, idToken }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create checkout session.');
            }

            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            console.error("Checkout failed", error);
            toast({
                title: 'Checkout Error',
                description: error.message,
                variant: 'destructive',
            });
            setLoadingPlan(null);
        }
    }


  return (
    <div className="bg-background text-foreground">
       <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline">JusHostIt</span>
        </Link>
        <div className="flex items-center gap-4">
            {isUserLoading ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
            ) : user ? (
                 <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            ) : (
                <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Get Started</Link>
                </Button>
                </>
            )}
        </div>
      </header>

      <main className="py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">
                    Simple, Honest Pricing
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Pay for what you use. No hidden fees, no complex tiers. Scale with confidence.
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tiers.map((tier) => (
                    <Card key={tier.name} className={`flex flex-col ${tier.featured ? 'border-primary ring-2 ring-primary' : ''}`}>
                        <CardHeader>
                            <CardTitle>{tier.name}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">{tier.price}</span>
                                <span className="text-muted-foreground">{tier.priceSuffix}</span>
                            </div>
                            <ul className="space-y-3 text-sm">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {tier.href ? (
                                <Button asChild className="w-full" variant={tier.featured ? 'default' : 'outline'}>
                                    <Link href={tier.href}>{tier.cta}</Link>
                                </Button>
                            ) : (
                                <Button 
                                    className="w-full" 
                                    variant={tier.featured ? 'default' : 'outline'}
                                    onClick={() => handleSelect(tier.id)}
                                    disabled={loadingPlan === tier.id || isUserLoading}
                                >
                                    {loadingPlan === tier.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {tier.cta}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card className="mt-16 text-center">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Need custom solutions? We offer contract pricing, dedicated clusters, and premium SLAs for large-scale deployments.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                 <Button asChild>
                    <Link href="mailto:enterprise@jushostit.com">Contact Enterprise Sales</Link>
                 </Button>
              </CardFooter>
            </Card>
        </div>
      </main>
    </div>
  )
}