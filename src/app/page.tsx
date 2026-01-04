'use client';

import { Check, Server, Shield, BarChart3, Zap, CreditCard, Lock } from "lucide-react";

// =====================
// app/page.tsx — High‑quality marketing landing page
// =====================
// Tailwind-only, no external UI libs, production-safe

export default function JusHostItLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-xl font-bold">JusHost It</div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="/pricing" className="hover:text-black text-gray-600">Pricing</a>
          <a href="/security" className="hover:text-black text-gray-600">Security</a>
          <a href="/login" className="hover:text-black text-gray-600">Login</a>
          <a href="/signup" className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800">Get Started</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        <div className="relative max-w-7xl mx-auto px-8 py-32 text-center">
          <h1 className="text-6xl font-extrabold tracking-tight mb-8">
            Hosting without surprises
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Transparent usage‑based hosting with built‑in cost controls,
            enterprise‑grade security, and instant provisioning.
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <a href="/signup" className="px-8 py-4 rounded-xl bg-black text-white font-semibold hover:bg-gray-800">
              Start Free Trial
            </a>
            <a href="/pricing" className="px-8 py-4 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100">
              View Pricing
            </a>
          </div>
          <p className="text-sm text-gray-500">7‑day free trial · No credit card required</p>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm font-medium text-gray-700">
          <div className="flex items-center justify-center gap-2"><Shield size={16}/> SOC‑2 Ready</div>
          <div className="flex items-center justify-center gap-2"><CreditCard size={16}/> Stripe Billing</div>
          <div className="flex items-center justify-center gap-2"><Lock size={16}/> Google SSO</div>
          <div className="flex items-center justify-center gap-2"><Server size={16}/> Kubernetes‑Backed</div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-3 gap-10">
          <Feature icon={<Zap />} title="Instant Provisioning" desc="Deploy apps, sites, and containers globally in seconds." />
          <Feature icon={<BarChart3 />} title="Usage Transparency" desc="Real‑time visibility into CPU, memory, bandwidth, and spend." />
          <Feature icon={<Shield />} title="Enterprise Security" desc="SSO, audit logs, isolation, and compliance‑ready architecture." />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-4xl font-bold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              'Create your organization',
              'Start your free trial',
              'Deploy instantly',
              'Pay only for what you use',
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                <div className="text-2xl font-bold mb-4">{i + 1}</div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-8 py-28 text-center">
          <h2 className="text-5xl font-bold mb-6">Launch with confidence</h2>
          <p className="text-xl text-gray-300 mb-10">
            Full control, transparent pricing, and serious infrastructure — without the enterprise friction.
          </p>
          <a href="/signup" className="inline-block px-10 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100">
            Start Your Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div>© {new Date().getFullYear()} JusHost It</div>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/privacy" className="hover:text-white">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: JSX.Element; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-4 text-black">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
