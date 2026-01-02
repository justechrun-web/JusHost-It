'use client';

import { Check, Server, Shield, BarChart3 } from "lucide-react";

// =====================
// app/page.tsx (Landing Page ONLY)
// =====================
// IMPORTANT:
// This page must be completely STATIC and must NOT depend on Next.js routing
// helpers or external UI libraries in sandboxed environments.
// Using plain <a> and <button> elements avoids runtime null-reference errors.

export default function JusHostItLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="px-6 py-24 text-center bg-gradient-to-b from-gray-50 to-white">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Hosting you can actually trust
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Transparent usage-based hosting with enterprise-grade security,
          real-time visibility, and automated cost controls.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/signup" className="inline-block">
            <button className="px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800">
              Get Started
            </button>
          </a>
          <a href="/pricing" className="inline-block">
            <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-100">
              View Pricing
            </button>
          </a>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        <Feature icon={<Server />} title="Instant Provisioning" desc="Deploy sites, containers, and workloads in seconds." />
        <Feature icon={<BarChart3 />} title="Usage Transparency" desc="See CPU, memory, and bandwidth in real time." />
        <Feature icon={<Shield />} title="Enterprise Security" desc="SSO, audit logs, isolation, and compliance readiness." />
        <Feature icon={<Check />} title="No Surprises" desc="Forecasting, alerts, and automated enforcement." />
      </section>

      {/* How it Works */}
      <section className="px-6 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            'Create your organization',
            'Choose a plan',
            'Deploy instantly',
            'Track usage & billing',
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-lg font-semibold">{i + 1}</p>
              <p className="text-gray-600 mt-2">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-gray-900 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to launch with confidence?</h2>
        <p className="text-lg text-gray-300 mb-8">Get started with JusHostIt in minutes.</p>
        <a href="/signup">
          <button className="px-6 py-3 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100">
            Create Your Account
          </button>
        </a>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} JusHostIt. All rights reserved.
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: JSX.Element; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

/*
IMPORTANT:
This file is intentionally STATIC and framework-agnostic.

No Next.js Link, no external UI components, no Firebase, no auth.
This eliminates the runtime error:
TypeError: Cannot read properties of null (reading '_')
*/