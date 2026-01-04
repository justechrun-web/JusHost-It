
'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Building, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateEnterprisePitch } from '@/ai/flows/enterprise-pitch-flow';
import Link from 'next/link';
import { HardDrive } from 'lucide-react';

const GEMINI_SYSTEM_PROMPT = `You are an expert enterprise sales consultant for "JusHostIt", a platform that provides Spend Governance for Usage-Based Products.

Your audience is sophisticated enterprise buyers: CFOs, VPs of Engineering, and Heads of Security. Your tone must be conservative, professional, and audit-ready.

**Your Core Task:**
Based on the user-provided customer context, generate a concise, tailored pitch. Focus exclusively on the three pillars of Spend Governance:

1.  **Predictability:** Forecasting, budget simulations, cost optimization insights.
2.  **Prevention:** Hard caps (daily/monthly/feature), role-based approval policies, and automated, graceful degradation (read-only mode) on breach.
3.  **Proof:** Immutable audit trails for all billing and governance events (SOC2-ready), exportable finance reports, and a customer-facing Trust Center.

**CRITICAL RULES:**
- **DO NOT** make claims you cannot verify from the pillars above.
- **DO NOT** use marketing hype, jargon, or exclamation points.
- **DO NOT** invent features.
- If the user's request is vague or unrelated, you **MUST** state: "I can only provide a pitch based on your company's spend governance needs. Please describe your company's size, industry, and primary challenges with usage-based costs."
- Frame everything in terms of risk reduction, financial control, and compliance.
`;

const features = [
  {
    icon: Building,
    title: 'Enterprise-Grade Governance',
    description: 'Implement hard caps, role-based approval workflows, and automated safeguards that satisfy procurement and security teams.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit-Ready Compliance',
    description: 'Generate immutable, exportable audit logs for every spend-related action, providing the proof needed for SOC2 and internal compliance.',
  },
  {
    icon: FileText,
    title: 'Predictable Financial Planning',
    description: 'Utilize spend forecasting, anomaly detection, and budget simulations to eliminate surprise invoices and align engineering with finance.',
  },
];

export default function EnterpriseSalesPage() {
  const [context, setContext] = useState(
    'Our customer is a 2,000-employee fintech with SOC2 requirements and unpredictable AI spend. Tailor the enterprise pitch. Be conservative. Avoid claims you cannot verify.'
  );
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePitch = async () => {
    setLoading(true);
    setError(null);
    setPitch('');

    try {
      const result = await generateEnterprisePitch({ customerContext: context });
      setPitch(result.pitch);
    } catch (err: any) {
      setError('An error occurred while generating the pitch. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground">
       <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline">JusHostIt</span>
        </Link>
        <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Get Started</Link>
            </Button>
        </div>
      </header>

      <main className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">
              Spend Governance for the Enterprise
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              JusHostIt provides the financial controls, auditability, and predictability required to scale usage-based products safely in an enterprise environment. Move beyond simple billing—implement true spend governance.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature) => (
                  <div key={feature.title} className="text-center p-6 border rounded-lg">
                      <feature.icon className="mx-auto h-8 w-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
              ))}
          </div>

          <Card className="mt-20 max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight">Generate a Tailored Pitch</h2>
                  <p className="text-muted-foreground">
                    Describe your company’s context, challenges, or compliance needs. Our AI, trained on enterprise governance principles, will generate a pitch for your internal stakeholders (CFO, Security, Eng).
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="customer-context">Your Company Context</Label>
                    <Textarea
                      id="customer-context"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={6}
                      placeholder="e.g., We are a healthcare AI startup with HIPAA requirements and concerns about runaway model inference costs..."
                    />
                  </div>
                  <Button onClick={handleGeneratePitch} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Pitch
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">Your Generated Pitch</h3>
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : pitch ? (
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap flex-1 overflow-auto">
                        {pitch}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                      Your pitch will appear here.
                    </div>
                  )}
                  {error && <p className="text-sm text-destructive mt-4">{error}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
